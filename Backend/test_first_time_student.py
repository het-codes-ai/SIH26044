from app import create_app
from models import get_db

app = create_app()

def test_first_time_flow():
    client = app.test_client()
    unique_email = "new_student_test_123@college.edu"

    # Clean up any existing test student
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE email = ?", (unique_email,))
    conn.commit()
    conn.close()

    print("\n--- TEST: First-Time Student Signup & Initial Intake Verification ---")

    # 1. Sign up a new student
    signup_payload = {
        "name": "Ananya Sharma",
        "email": unique_email,
        "password": "Password123!",
        "role": "student",
        "college": "MSU Baroda",
        "skills": "Python, Problem Solving",
        "university_roll_no": "2026CS999",
        "selected_institute_id": "1"
    }

    resp = client.post('/api/auth/students/signup', json=signup_payload)
    assert resp.status_code == 201, f"Signup failed: {resp.data}"
    signup_data = resp.get_json()
    student_id = signup_data['user']['id']
    print(f"[PASS] Student signed up successfully: ID={student_id}")

    # 2. Check profile immediately after signup
    prof_resp = client.get('/api/student/profile')
    assert prof_resp.status_code == 200, f"Profile failed: {prof_resp.data}"
    profile = prof_resp.get_json()['profile']

    print(f"Profile class_year: {profile.get('class_year')}")
    print(f"Profile curriculum: {profile.get('curriculum')}")
    print(f"Profile potential_score: {profile.get('potential_score')}")

    assert profile.get('academic_class') is None, "New student should NOT have academic_class pre-filled!"
    assert profile.get('board_curriculum') is None, "New student should NOT have board_curriculum pre-filled!"
    assert profile.get('potential_score') == 0.0, "New student should have potential_score == 0.0!"
    print("[PASS] Fresh student profile has NO pre-filled class, curriculum, or fake mock stats!")

    # 3. Check syllabus progress immediately after signup
    syll_resp = client.get('/api/student/syllabus')
    assert syll_resp.status_code == 200
    syll_data = syll_resp.get_json()
    assert len(syll_data.get('syllabus_progress', [])) == 0, "New student should have 0 syllabus progress rows before intake!"
    assert syll_data.get('potential_score') == 0.0, "Potential score should be 0.0 before intake!"
    print("[PASS] Fresh student syllabus progress is clean (0 enrolled subjects, 0.0 potential score)")

    # 4. Perform Curriculum Intake Onboarding
    intake_payload = {
        "class_year": "Class 12",
        "college": "MSU Baroda",
        "curriculum": "CBSE",
        "academic_subjects": "Mathematics, Physics, Chemistry",
        "interested_subjects": "Artificial Intelligence & Machine Learning, Web Development",
        "additional_skills": "Python Programming",
        "preferred_language": "English",
        "knowledge_level": "Intermediate",
        "sports_preference": "Cricket practice 4:30 PM - 5:30 PM daily"
    }

    onboard_resp = client.post('/api/student/onboarding', json=intake_payload)
    assert onboard_resp.status_code == 200, f"Onboarding failed: {onboard_resp.data}"
    print("[PASS] Curriculum Intake successfully saved via /onboarding")

    # 5. Verify syllabus progress populated for chosen subjects
    syll_after = client.get('/api/student/syllabus').get_json()
    progress_items = syll_after.get('syllabus_progress', [])
    assert len(progress_items) >= 3, f"Expected at least 3 subjects, got {len(progress_items)}"
    subj_names = [p['subject_name'] for p in progress_items]
    print(f"[PASS] Enrolled syllabus subjects: {subj_names}")
    assert "Mathematics" in subj_names
    assert "Physics" in subj_names

    # 6. Verify Dual-Track Pathways generated with rich mathematical topics
    pw_resp = client.get('/api/student/pathways')
    assert pw_resp.status_code == 200
    pathways = pw_resp.get_json().get('pathways', [])
    assert len(pathways) >= 2, "Expected both Track 1 (Academic) and Track 2 (Additional) pathways"
    math_pw = next((p for p in pathways if "mathematics" in p['subject_name'].lower()), None)
    assert math_pw is not None, "Mathematics pathway should exist"
    print(f"[PASS] Mathematics Pathway found with {len(math_pw['topics'])} rich topics!")
    # Check that first topic has formula and real-world application
    first_topic = math_pw['topics'][0]
    print(f"   Topic 1: {first_topic['title']}")
    print(f"   Formula: {first_topic.get('key_concept')}")
    print(f"   App: {first_topic.get('real_world_app')}")
    assert first_topic.get('key_concept') is not None
    assert first_topic.get('real_world_app') is not None

    # 7. Check Timetable has personal sports slot
    sched_resp = client.get('/api/student/schedules').get_json()
    personal_sched = sched_resp.get('personal_schedules', [])
    sports_slot = next((s for s in personal_sched if 'cricket' in s['title'].lower() or 'free_time' == s.get('activity_type')), None)
    assert sports_slot is not None, "Personal sports slot should be scheduled without conflict!"
    print(f"[PASS] Personal schedule contains sports slot: {sports_slot['title']} ({sports_slot['start_time']} - {sports_slot['end_time']})")

    # 8. Submit Diagnostic Test for Mathematics
    diag_q = client.get('/api/student/diagnostic/Mathematics/questions').get_json()
    assert len(diag_q.get('questions', [])) > 0, "Mathematics diagnostic questions should be available"

    diag_submit = client.post('/api/student/diagnostic/Mathematics/submit', json={
        "answers": {"1": "B", "2": "B", "3": "A"}
    }).get_json()
    assert diag_submit.get('subject') == "Mathematics"
    assert diag_submit.get('pathway_type') == "academic"
    assert len(diag_submit.get('topics_mastered', [])) > 0 or len(diag_submit.get('topics_needs_improvement', [])) > 0
    print(f"[PASS] Diagnostic test evaluated successfully: Level={diag_submit.get('knowledge_level')}, Score={diag_submit.get('score')}%")

    print("\n========================================================")
    print("ALL FIRST-TIME INTAKE & DIAGNOSTIC TESTS PASSED (100%)!")
    print("========================================================\n")

if __name__ == '__main__':
    test_first_time_flow()
