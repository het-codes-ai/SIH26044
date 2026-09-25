from flask import Blueprint, request, jsonify, session
from models import get_db
from auth_utils import role_required

academician_bp = Blueprint('academician', __name__, url_prefix='/api/academician')

ALLOWED_ACADEMIC_POSTING_TYPES = {
    'research_collaboration', 'fdp', 'project', 'mentorship',
    'internship', 'opportunity', 'research', 'fellowship', 'research_assistantship'
}

def row_to_dict(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}

# =========================================================================
# 1. ACADEMIC OPPORTUNITIES & POSTINGS (PRESERVED)
# =========================================================================

@academician_bp.route('/postings', methods=['POST'])
@role_required('academician')
def create_posting():
    academician_id = session['user_id']
    data = request.get_json() or {}

    title = data.get('title', '').strip() or data.get('opportunity_title', '').strip()
    description = data.get('description', '').strip() or 'Research and academic project opportunity for students.'
    required_skills = data.get('required_skills', '').strip() or data.get('skills', '').strip() or 'Research, Problem Solving'
    posting_type = data.get('posting_type', '').strip().lower()

    if not title:
        return jsonify({'error': 'Opportunity title is required.'}), 400

    if not posting_type or posting_type not in ALLOWED_ACADEMIC_POSTING_TYPES:
        posting_type = 'project'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO postings (academician_id, title, description, required_skills, posting_type)
        VALUES (?, ?, ?, ?, ?)
        """,
        (academician_id, title, description, required_skills, posting_type)
    )
    posting_id = cursor.lastrowid

    # Also record into research_papers table if it is research
    if posting_type in ('research', 'research_collaboration', 'project'):
        cursor.execute(
            """
            INSERT INTO research_papers (academician_id, title, field, abstract)
            VALUES (?, ?, ?, ?)
            """,
            (academician_id, title, required_skills, description)
        )

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Academic opportunity posted successfully!',
        'posting': {'id': posting_id, 'title': title, 'posting_type': posting_type}
    }), 201

@academician_bp.route('/postings', methods=['GET'])
@role_required('academician')
def list_my_postings():
    academician_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT p.id, p.title, p.description, p.required_skills, p.posting_type, p.created_at,
               COUNT(a.id) AS total_applicants
        FROM postings p
        LEFT JOIN applications a ON p.id = a.posting_id
        WHERE p.academician_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
        """,
        (academician_id,)
    )
    postings = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'postings': postings}), 200

# =========================================================================
# 2. RESEARCH PAPERS & STUDENT DISCUSSIONS (EXPANDED TO PERSISTENT DB)
# =========================================================================

@academician_bp.route('/papers', methods=['GET'])
@role_required('academician')
def list_my_papers():
    """List academician's research papers with real student discussions."""
    academician_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, field, abstract, pdf_url, created_at
        FROM research_papers
        WHERE academician_id = ?
        ORDER BY created_at DESC
        """,
        (academician_id,)
    )
    papers = [row_to_dict(r) for r in cursor.fetchall()]

    for p in papers:
        cursor.execute(
            """
            SELECT rd.id, rd.question, rd.response, rd.status, rd.created_at, rd.answered_at,
                   s.name as student_name
            FROM research_discussions rd
            JOIN students s ON rd.student_id = s.id
            WHERE rd.paper_id = ?
            ORDER BY rd.created_at DESC
            """,
            (p['id'],)
        )
        p['discussions'] = [
            {"id": d['id'], "student": d['student_name'], "q": d['question'], "response": d['response'], "status": d['status']}
            for d in cursor.fetchall()
        ]

    conn.close()
    return jsonify({'papers': papers}), 200

@academician_bp.route('/papers', methods=['POST'])
@role_required('academician')
def publish_paper():
    """Publish a new research paper into the ecosystem."""
    academician_id = session['user_id']
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    field = data.get('field', 'Computer Science').strip()
    abstract = data.get('abstract', '').strip() or data.get('desc', '').strip()
    pdf_url = data.get('pdf_url', '').strip()

    if not title:
        return jsonify({'error': 'Paper title is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO research_papers (academician_id, title, field, abstract, pdf_url)
        VALUES (?, ?, ?, ?, ?)
        """,
        (academician_id, title, field, abstract, pdf_url)
    )
    paper_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'message': f"Research paper '{title}' published successfully!",
        'paper_id': paper_id
    }), 201

@academician_bp.route('/discussions', methods=['GET'])
@role_required('academician')
def list_all_discussions():
    """Returns all questions asked by students across all papers of this academician."""
    academician_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT rd.id, rd.paper_id, rd.question, rd.response, rd.status, rd.created_at, rd.answered_at,
               s.name as student_name, s.email as student_email, rp.title as paper_title
        FROM research_discussions rd
        JOIN students s ON rd.student_id = s.id
        JOIN research_papers rp ON rd.paper_id = rp.id
        WHERE rd.academician_id = ?
        ORDER BY CASE WHEN rd.status = 'open' THEN 0 ELSE 1 END, rd.created_at DESC
        """,
        (academician_id,)
    )
    discussions = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'discussions': discussions}), 200

@academician_bp.route('/discussions/<int:disc_id>/respond', methods=['POST'])
@role_required('academician')
def respond_to_discussion(disc_id):
    """Academician replies to student question and notifies the student."""
    academician_id = session['user_id']
    data = request.get_json() or {}
    response = data.get('response', '').strip()

    if not response:
        return jsonify({'error': 'Response text cannot be empty.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT rd.student_id, rp.title
        FROM research_discussions rd
        JOIN research_papers rp ON rd.paper_id = rp.id
        WHERE rd.id = ? AND rd.academician_id = ?
        """,
        (disc_id, academician_id)
    )
    disc = cursor.fetchone()
    if not disc:
        conn.close()
        return jsonify({'error': 'Discussion not found or unauthorized.'}), 404

    cursor.execute(
        """
        UPDATE research_discussions
        SET response = ?, status = 'answered', answered_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (response, disc_id)
    )

    # Notify student
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'student', 'Academician Answered Your Research Question', ?, 'success', 'research')
        """,
        (disc['student_id'], f"Academician responded to your question on '{disc['title']}': \"{response[:80]}...\"")
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Discussion response published successfully!'}), 200

# =========================================================================
# 3. MENTORSHIP FEEDBACKS (PRESERVED)
# =========================================================================

@academician_bp.route('/students/<int:student_id>/feedback', methods=['POST'])
@role_required('academician')
def give_mentorship_feedback(student_id):
    academician_id = session['user_id']
    data = request.get_json() or {}
    feedback_text = data.get('feedback_text', '').strip()

    if not feedback_text:
        return jsonify({'error': 'feedback_text is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name FROM students WHERE id = ?", (student_id,))
    student = row_to_dict(cursor.fetchone())
    if not student:
        conn.close()
        return jsonify({'error': 'Student not found.'}), 404

    cursor.execute(
        """
        INSERT INTO mentorship_feedbacks (student_id, academician_id, feedback_text)
        VALUES (?, ?, ?)
        """,
        (student_id, academician_id, feedback_text)
    )
    conn.commit()
    feedback_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': f"Mentorship feedback sent to {student['name']}!",
        'feedback_id': feedback_id
    }), 201

@academician_bp.route('/feedbacks', methods=['GET'])
@role_required('academician')
def list_my_feedbacks():
    academician_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT mf.id, mf.feedback_text, mf.created_at,
               s.id AS student_id, s.name AS student_name, s.email AS student_email, s.college
        FROM mentorship_feedbacks mf
        JOIN students s ON mf.student_id = s.id
        WHERE mf.academician_id = ?
        ORDER BY mf.created_at DESC
        """,
        (academician_id,)
    )
    feedbacks = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'feedbacks': feedbacks}), 200