import json
from config import Config
from models import init_db, get_db
from auth_utils import hash_password

def seed():
    print("[Seed] Initializing educational ecosystem database...")
    init_db()

    conn = get_db()
    cursor = conn.cursor()
    default_pw = hash_password("Password123!")

    # 1. Institutes
    cursor.execute(
        """
        INSERT OR IGNORE INTO institutes (name, email, password_hash, admin_tpo_contact, city)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("The Maharaja Sayajirao University of Baroda", "tnp@msu.edu", default_pw, "+91-9876543210 (Dean Academics)", "Vadodara")
    )
    cursor.execute("SELECT id FROM institutes WHERE email = 'tnp@msu.edu'")
    inst_id = cursor.fetchone()["id"]

    cursor.execute(
        """
        INSERT OR IGNORE INTO institutes (name, email, password_hash, admin_tpo_contact, city)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("National Institute of Technology", "academic@nit.edu", default_pw, "+91-9876500000 (Academic Director)", "Surat")
    )

    # 2. Academicians
    cursor.execute(
        """
        INSERT OR IGNORE INTO academicians (name, email, password_hash, institute_id, expertise_domain)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("Dr. Naveen Bhatt", "xyz@msu.edu", default_pw, inst_id, "Artificial Intelligence & Distributed Systems")
    )
    cursor.execute("SELECT id FROM academicians WHERE email = 'xyz@msu.edu'")
    acad_id = cursor.fetchone()["id"]

    cursor.execute(
        """
        INSERT OR IGNORE INTO academicians (name, email, password_hash, institute_id, expertise_domain)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("Dr. Shalini Raman", "shalini@msu.edu", default_pw, inst_id, "Quantum Computing & Quantum Algorithms")
    )
    cursor.execute("SELECT id FROM academicians WHERE email = 'shalini@msu.edu'")
    acad_2_id = cursor.fetchone()["id"]

    # 3. Research Papers
    cursor.execute(
        """
        INSERT OR IGNORE INTO research_papers (id, academician_id, title, field, abstract, pdf_url)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            1, acad_id,
            "Edge Consensus Protocols in High-Latency Distributed Wireless Mesh",
            "Distributed Systems & Networks",
            "This paper explores Byzantine Fault Tolerant consensus algorithms optimized for resource-constrained edge computing clusters in intermittent wireless environments.",
            "https://arxiv.org/abs/2301.00001"
        )
    )
    cursor.execute(
        """
        INSERT OR IGNORE INTO research_papers (id, academician_id, title, field, abstract, pdf_url)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            2, acad_id,
            "Neural Symbolic Reasoning for Multi-Hop Knowledge Graph Traversal",
            "Artificial Intelligence",
            "We propose a hybrid neuro-symbolic inference pipeline combining GNNs with first-order predicate logic for interpretable multi-hop fact verification.",
            "https://arxiv.org/abs/2302.00002"
        )
    )
    cursor.execute(
        """
        INSERT OR IGNORE INTO research_papers (id, academician_id, title, field, abstract, pdf_url)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            3, acad_2_id,
            "Variational Quantum Eigensolver Optimization for Molecular Simulation",
            "Quantum Computing",
            "Investigating error mitigation and shallow-circuit ansatz design for simulating diatomic molecular ground states on noisy intermediate-scale quantum devices.",
            "https://arxiv.org/abs/2303.00003"
        )
    )

    # 4. Students
    students_data = [
        (
            "Kareena", "kareena@college.edu", default_pw,
            "The Maharaja Sayajirao University of Baroda", "Python, React, Data Structures, SQL",
            "MSU-2026-CS-001", "3rd Year B.Tech", "Computer Science & Engineering",
            "Mathematics, Physics, Data Structures, Operating Systems",
            "Python Programming, Artificial Intelligence, Web Development",
            "FastAPI, React.js, Docker", "English", "Intermediate", 84.5, 8.2, inst_id
        ),
        (
            "Dhyana", "dhyana.mayur7e@gmail.com", default_pw,
            "The Maharaja Sayajirao University of Baroda", "Python, Full Stack, React, SQL, Calculus",
            "MSU-2026-CS-042", "3rd Year B.Tech", "Computer Science & Engineering",
            "Mathematics, Physics, Data Structures, Database Systems",
            "Artificial Intelligence, Robotics, Machine Learning",
            "Web Development, Data Analysis", "English", "Intermediate", 89.0, 9.5, inst_id
        ),
        (
            "Aditi", "aditi.talwar3@gmail.com", default_pw,
            "The Maharaja Sayajirao University of Baroda", "Python, Machine Learning, Calculus, Physics",
            "MSU-2026-CS-007", "3rd Year B.Tech", "Computer Science & Engineering",
            "Mathematics, Physics, Algorithms, Operating Systems",
            "Data Science, Quantum Computing, Deep Learning",
            "Algorithms, Cloud Systems", "Hindi", "Advanced", 92.0, 10.2, inst_id
        ),
        (
            "Rohan Verma", "rohan@college.edu", default_pw,
            "The Maharaja Sayajirao University of Baroda", "Basics of C++, Physics, Algebra",
            "MSU-2026-CS-019", "2nd Year B.Tech", "Computer Science & Engineering",
            "Mathematics, Physics, Digital Electronics, C++ Programming",
            "Robotics, Electronics and Embedded Systems, Game Development",
            "Hardware Interfacing, Git", "English", "Beginner", 68.0, 4.5, inst_id
        ),
        (
            "Priya Sharma", "priya@college.edu", default_pw,
            "The Maharaja Sayajirao University of Baroda", "Statistics, Economics, Python, Linear Algebra",
            "MSU-2026-CS-031", "3rd Year B.Tech", "Data Science & Economics",
            "Applied Statistics, Economics, Mathematics, Database Systems",
            "Finance, Artificial Intelligence, Environmental Science",
            "Financial Modeling, Python Pandas", "English", "Intermediate", 78.0, 6.8, inst_id
        )
    ]

    for s in students_data:
        cursor.execute(
            """
            INSERT INTO students (
                name, email, password_hash, college, skills, university_roll_no,
                class_year, curriculum, academic_subjects, interested_subjects,
                additional_skills, preferred_language, knowledge_level,
                potential_score, syllabus_progress_rate, institute_id,
                verification_status, verified_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', CURRENT_TIMESTAMP)
            ON CONFLICT(email) DO UPDATE SET
                class_year=excluded.class_year,
                curriculum=excluded.curriculum,
                academic_subjects=excluded.academic_subjects,
                interested_subjects=excluded.interested_subjects,
                additional_skills=excluded.additional_skills,
                preferred_language=excluded.preferred_language,
                knowledge_level=excluded.knowledge_level,
                potential_score=excluded.potential_score,
                syllabus_progress_rate=excluded.syllabus_progress_rate,
                institute_id=excluded.institute_id
            """,
            s
        )

    # Fetch primary student IDs
    cursor.execute("SELECT id FROM students WHERE email = 'kareena@college.edu'")
    kareena_id = cursor.fetchone()["id"]
    cursor.execute("SELECT id FROM students WHERE email = 'dhyana.mayur7e@gmail.com'")
    dhyana_id = cursor.fetchone()["id"]

    for sid in [kareena_id, dhyana_id]:
        # 5. Diagnostic Tests
        cursor.execute(
            """
            INSERT OR IGNORE INTO diagnostic_tests (
                student_id, subject_name, level, score, total_questions,
                topics_understood, topics_partially_understood, topics_needs_improvement,
                estimated_knowledge_level, recommended_focus
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sid, "Python Programming", "Comprehensive", 80.0, 10,
                json.dumps(["Variables & Control Flow", "Functions & Scope", "List Comprehensions", "Dictionaries & Sets"]),
                json.dumps(["Object-Oriented Programming", "Error Handling & Custom Exceptions"]),
                json.dumps(["Generators & Iterators", "Concurrency & AsyncIO"]),
                "Intermediate",
                "Deepen knowledge in Python Generators, Memory Management, and asynchronous event loops."
            )
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO diagnostic_tests (
                student_id, subject_name, level, score, total_questions,
                topics_understood, topics_partially_understood, topics_needs_improvement,
                estimated_knowledge_level, recommended_focus
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sid, "Physics (Current Electricity & Optics)", "Comprehensive", 52.0, 10,
                json.dumps(["Ohm's Law", "Series and Parallel Resistances"]),
                json.dumps(["Kirchhoff's Laws", "Potentiometer Working"]),
                json.dumps(["Electromagnetic Induction", "Wave Optics & Interference", "Maxwell Equations"]),
                "Beginner",
                "Weak subject identified: Daily targeted practice test recommended on Kirchhoff's Laws and Induction."
            )
        )

        # 6. Learning Pathways (Adaptive topics & subtopics)
        python_topics = [
            {"id": "t1", "title": "Programming Fundamentals & Syntax", "status": "mastered", "difficulty": "Basic", "est_hours": 4, "type": "code"},
            {"id": "t2", "title": "Data Structures: Lists, Tuples, Dictionaries", "status": "mastered", "difficulty": "Basic", "est_hours": 6, "type": "interactive"},
            {"id": "t3", "title": "Functions, Closures & Decorators", "status": "in_progress", "difficulty": "Intermediate", "est_hours": 8, "type": "code"},
            {"id": "t4", "title": "Object-Oriented Python & Inheritance", "status": "in_progress", "difficulty": "Intermediate", "est_hours": 8, "type": "practical"},
            {"id": "t5", "title": "Algorithms & Complexity with Python", "status": "next", "difficulty": "Intermediate", "est_hours": 10, "type": "visual"},
            {"id": "t6", "title": "REST APIs with FastAPI & Flask", "status": "next", "difficulty": "Intermediate", "est_hours": 10, "type": "project"},
            {"id": "t7", "title": "Database Interfacing (SQLAlchemy/SQLite)", "status": "next", "difficulty": "Advanced", "est_hours": 8, "type": "practical"},
            {"id": "t8", "title": "Full-Stack Capstone Project", "status": "next", "difficulty": "Advanced", "est_hours": 16, "type": "project"}
        ]
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sid, "Python Programming", "additional", "Intermediate", 70, "Intermediate",
                json.dumps(python_topics),
                "Fundamentals → Data Structures → OOP → APIs → Capstone Project"
            )
        )

        math_topics = [
            {"id": "m1", "title": "Limits, Continuity & Differentiability", "status": "mastered", "difficulty": "Basic", "est_hours": 8, "type": "visual"},
            {"id": "m2", "title": "Differentiation & Chain Rule", "status": "mastered", "difficulty": "Intermediate", "est_hours": 10, "type": "practice"},
            {"id": "m3", "title": "Integral Calculus & Definite Integrals", "status": "in_progress", "difficulty": "Intermediate", "est_hours": 14, "type": "visual"},
            {"id": "m4", "title": "Differential Equations & Applications", "status": "needs_revision", "difficulty": "Intermediate", "est_hours": 12, "type": "interactive"},
            {"id": "m5", "title": "Linear Algebra: Matrices & Eigenvalues", "status": "next", "difficulty": "Advanced", "est_hours": 16, "type": "visual"},
            {"id": "m6", "title": "Vector Calculus & Coordinate Geometry", "status": "next", "difficulty": "Advanced", "est_hours": 12, "type": "practice"}
        ]
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sid, "Mathematics", "academic", "Intermediate", 72, "Intermediate",
                json.dumps(math_topics),
                "Limits → Differentiation → Integration → Differential Equations → Linear Algebra"
            )
        )

        # 7. Syllabus Progress & Fit Score (Exam Readiness Score)
        # Mathematics: 72% fit score
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sid, "Mathematics", 10, 7, 2, 70.0, 72.0, 74.0, 76.0, 75.0, 65.0, 0)
        )
        # Physics: 54% fit score (WEAK SUBJECT -> flagged!)
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sid, "Physics", 10, 4, 3, 40.0, 54.0, 48.0, 52.0, 50.0, 45.0, 1)
        )
        # Data Structures: 86% fit score
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sid, "Data Structures", 8, 7, 1, 87.5, 86.0, 88.0, 85.0, 90.0, 80.0, 0)
        )
        # Operating Systems: 68% fit score
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sid, "Operating Systems", 8, 5, 2, 62.5, 68.0, 70.0, 66.0, 70.0, 60.0, 0)
        )

        # 8. Daily Syllabus Updates (History of daily updates)
        daily_entries = [
            (sid, "Mathematics", "Definite Integrals (Substitution Method)", "Limits and Chain Rule", 20, 90, "Mastered definite integral substitution; need 5 more practice problems on parts.", "2026-09-24"),
            (sid, "Physics", "Kirchhoff's Voltage Law (KVL) in Multi-loop Circuits", "Ohm's Law & Resistance Combinations", 15, 60, "Clarified sign convention for loop equations with professor's diagram.", "2026-09-24"),
            (sid, "Data Structures", "Binary Search Trees: Inorder & Postorder Traversal", "Recursion Basics", 12, 75, "Implemented recursive traversal in Python and analyzed O(h) space.", "2026-09-25"),
            (sid, "Physics", "Current Electricity: Wheatstone Bridge Principle", "Series-Parallel Equivalent", 18, 60, "Completed today's weak subject practice test.", "2026-09-25")
        ]
        for d in daily_entries:
            cursor.execute(
                """
                INSERT INTO daily_syllabus_updates (
                    student_id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                d
            )

        # 9. Practice Tests History (Tracking weak subject and general practice)
        practice_tests_sample = [
            (sid, "Physics", "Ohm's Law & Drift Velocity", 45.0, 10, 45.0, "Basic", 1, "Confused electron drift velocity with electric field sign.", "2026-09-10 10:30:00"),
            (sid, "Physics", "Kirchhoff's Rules (KCL & KVL)", 55.0, 10, 55.0, "Intermediate", 1, "Loop sign convention error in loop 2.", "2026-09-14 11:00:00"),
            (sid, "Physics", "Potentiometer & Internal Resistance", 62.0, 10, 62.0, "Intermediate", 1, "Calculation slip in balance length formula.", "2026-09-18 09:30:00"),
            (sid, "Physics", "Current Electricity Comprehensive", 72.0, 10, 72.0, "Intermediate", 1, "Significant improvement in circuit reductions!", "2026-09-23 15:45:00"),
            (sid, "Mathematics", "Integration by Substitution", 80.0, 10, 80.0, "Intermediate", 0, "Well answered trigonometric substitutions.", "2026-09-21 14:00:00"),
            (sid, "Data Structures", "Binary Trees & BST Search", 90.0, 10, 90.0, "Intermediate", 0, "Clean solution for BST node insertion and lookup.", "2026-09-24 16:20:00")
        ]
        for pt in practice_tests_sample:
            cursor.execute(
                """
                INSERT INTO practice_tests (
                    student_id, subject_name, topic_name, score, total_questions, accuracy, difficulty, is_weak_subject_test, mistakes_summary, taken_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                pt
            )

        # 10. Student Personal Timetable (Balanced schedule combining Institute + Extra Learning + Personal Free Time)
        personal_schedule_items = [
            (sid, "Institute Class: Mathematics", "institute_class", "Mathematics", "Monday", "09:00 AM", "10:30 AM", 1, "Lecture Hall 204: Integration techniques"),
            (sid, "Institute Class: Data Structures", "institute_class", "Data Structures", "Monday", "11:00 AM", "12:30 PM", 1, "CS Lab: Tree Traversal implementations"),
            (sid, "Personal Free Time: Cricket & Sports", "free_time", "Personal", "Monday", "04:30 PM", "05:30 PM", 1, "College sports ground - active wellness"),
            (sid, "Extra Learning: Python AI / ML", "extra_learning", "Python Programming", "Monday", "06:00 PM", "07:30 PM", 0, "FastAPI backend integration practice"),
            (sid, "Targeted Revision: Physics Weak Topics", "revision", "Physics", "Monday", "08:30 PM", "09:30 PM", 0, "Daily weak subject practice test review"),

            (sid, "Institute Class: Physics Theory", "institute_class", "Physics", "Tuesday", "09:00 AM", "10:30 AM", 0, "Physics Hall 101: Electromagnetic Induction"),
            (sid, "Institute Lab: Data Structures Lab", "institute_class", "Data Structures", "Tuesday", "01:30 PM", "03:30 PM", 0, "System Lab 3: AVL Trees"),
            (sid, "Personal Free Time: Exercise / Rest", "free_time", "Personal", "Tuesday", "04:30 PM", "05:30 PM", 0, "Free time preserved by student preference"),
            (sid, "Extra Learning: Web Development", "extra_learning", "Web Development", "Tuesday", "06:00 PM", "07:30 PM", 0, "Building REST API frontend interfaces"),
            (sid, "Self Study: Mathematics Problems", "practice", "Mathematics", "Tuesday", "08:30 PM", "09:30 PM", 0, "Solve 20 integration textbook exercises")
        ]
        for psi in personal_schedule_items:
            cursor.execute(
                """
                INSERT INTO student_personal_schedules (
                    student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                psi
            )

        # 11. Extra Learning Logs (Time tracking)
        cursor.execute(
            """
            INSERT INTO extra_learning_logs (student_id, skill_or_subject, duration_minutes, log_date, adherence, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (sid, "Python Programming", 90, "2026-09-24", 1, "Constructed REST endpoint with Flask and verified test payloads.")
        )
        cursor.execute(
            """
            INSERT INTO extra_learning_logs (student_id, skill_or_subject, duration_minutes, log_date, adherence, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (sid, "Web Development", 60, "2026-09-25", 1, "Created responsive dashboard component cards.")
        )

        # 12. Institute Queries raised by student
        cursor.execute(
            """
            INSERT OR IGNORE INTO institute_queries (
                id, student_id, institute_id, subject_name, query_type, title, question_text, response_text, status, created_at, answered_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                100 + sid, sid, inst_id, "Physics", "academic_doubt",
                "Clarification on sign convention in Kirchhoff's Voltage Loop",
                "In a multi-loop circuit with opposing EMF sources, how do we determine whether current direction assumption reverses the potential change across the internal resistance?",
                "Assume loop direction clockwise. When traversing a cell from negative to positive terminal, EMF is positive. When traversing in the assumed current direction through resistance, potential drop is -IR. If result is negative, actual current is counter-clockwise. See attached reference diagram.",
                "resolved", "2026-09-22 14:10:00", "2026-09-22 16:30:00"
            )
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO institute_queries (
                id, student_id, institute_id, subject_name, query_type, title, question_text, response_text, status, created_at, answered_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                200 + sid, sid, inst_id, "Examinations", "examination",
                "Midterm Examination Room Allocation & Formula Sheet Allowed?",
                "Will students be provided a standard trigonometric and integration formula sheet during the upcoming Mathematics Midterm on Oct 12?",
                "Standard mathematical integral tables will be provided on Page 4 of the question booklet. Non-programmable calculators are allowed.",
                "answered", "2026-09-24 10:00:00", "2026-09-24 12:15:00"
            )
        )

        # 13. Institute Mentoring Suggestions
        cursor.execute(
            """
            INSERT INTO institute_guidance (institute_id, student_id, guidance_type, subject_name, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                inst_id, sid, "study_priority", "Physics",
                "Academic Review Note: Your Physics unit test score was 52%. Focus on Current Electricity circuits and complete the daily practice tests. Your Mathematics progress is excellent (+12% this week)."
            )
        )

        # 14. Research Discussions (Student interacting with Academician research)
        cursor.execute(
            """
            INSERT OR IGNORE INTO research_discussions (
                id, paper_id, student_id, academician_id, question, response, status, created_at, answered_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                10 + sid, 1, sid, acad_id,
                "In Section 3.2 of your Edge Consensus paper, how does the leader election timeout scale when wireless packet drop exceeds 20% in mobile nodes?",
                "Great question! We use a geometric backoff algorithm tuned to the network diameter: T = T_base * (1.5)^k. Beyond 20% packet drop, nodes dynamically cluster into 3-hop sub-quorums to prevent split-brain states.",
                "answered", "2026-09-23 11:20:00", "2026-09-23 14:40:00"
            )
        )

        # 15. Student Knowledge-Gap Feedback
        cursor.execute(
            """
            INSERT OR IGNORE INTO knowledge_gap_feedbacks (
                id, student_id, subject_name, topic_name, feedback_type, description, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                50 + sid, sid, "Physics", "Current Electricity", "needs_practical_example",
                "I understand Kirchhoff's loop laws theoretically, but the platform needs interactive circuit simulations or real-world schematic examples to make intuition clear.",
                "reviewed"
            )
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO knowledge_gap_feedbacks (
                id, student_id, subject_name, topic_name, feedback_type, description, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                60 + sid, sid, "Data Structures", "B-Trees", "missing_prerequisite",
                "The lecture transitions directly from Binary Trees to Disk-backed B+ Trees without explaining block I/O caching prerequisites.",
                "reported"
            )
        )

    # 16. Institute Academic Schedules (Published by Institute -> synced to students)
    schedules_sample = [
        (inst_id, "examination", "Midterm Examination: Physics", "Physics", "2026-10-15", "10:00 AM", "01:00 PM", "Auditorium Hall B", "All 3rd Year CS & EE", "Covers Unit 1 (Electrostatics) and Unit 2 (Current Electricity). Bring ID card."),
        (inst_id, "examination", "Midterm Examination: Mathematics", "Mathematics", "2026-10-18", "10:00 AM", "01:00 PM", "Auditorium Hall B", "All 3rd Year CS", "Calculus, Differential Equations, and Matrices."),
        (inst_id, "class", "Advanced Operating Systems Lecture", "Operating Systems", "2026-09-28", "09:00 AM", "10:30 AM", "Room 203", "3rd Year CS", "Memory Management: Paging & Virtual Memory"),
        (inst_id, "class", "Data Structures Tutorial", "Data Structures", "2026-09-29", "11:00 AM", "12:30 PM", "Seminar Room 1", "3rd Year CS", "Graph Algorithms: Dijkstra & Prim"),
        (inst_id, "practical", "Physics Laboratory Practical Exam", "Physics", "2026-10-22", "02:00 PM", "05:00 PM", "Physics Lab 2", "Batches A & B", "Potentiometer and Optical Bench experiments."),
        (inst_id, "assignment", "Mathematics Problem Set 4 Submission", "Mathematics", "2026-10-05", "11:59 PM", "11:59 PM", "Online Portal", "All Students", "Upload handwritten PDF solutions for Definite Integrals.")
    ]
    for sch in schedules_sample:
        cursor.execute(
            """
            INSERT OR IGNORE INTO institute_schedules (
                institute_id, schedule_type, title, subject_name, date, start_time, end_time, venue_or_link, target_class, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            sch
        )

    # 17. Examinations and Student Academic Marks (Historical Marks Management)
    exams_sample = [
        (inst_id, "Midterm Exam 1 (Semester 5)", "midterm", "Mathematics", 100.0, "2026-08-20"),
        (inst_id, "Unit Test 1: Calculus", "unit_test", "Mathematics", 50.0, "2026-09-05"),
        (inst_id, "Midterm Exam 1: Physics", "midterm", "Physics", 100.0, "2026-08-22"),
        (inst_id, "Unit Test 1: Electricity", "unit_test", "Physics", 50.0, "2026-09-12"),
        (inst_id, "Midterm Exam 1: Data Structures", "midterm", "Data Structures", 100.0, "2026-08-25"),
        (inst_id, "Unit Test 1: Trees & Graphs", "unit_test", "Data Structures", 50.0, "2026-09-15")
    ]
    for ex in exams_sample:
        cursor.execute(
            """
            INSERT OR IGNORE INTO examinations (institute_id, title, exam_type, subject_name, max_marks, exam_date)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            ex
        )

    cursor.execute("SELECT id, title, subject_name, max_marks FROM examinations")
    all_exams = cursor.fetchall()
    exam_map = {f"{e['title']}": e for e in all_exams}

    # Student Marks entries (Demonstrating Exam vs Practice Improvement!)
    for sid in [kareena_id, dhyana_id]:
        marks_entries = [
            (sid, exam_map["Midterm Exam 1 (Semester 5)"]["id"], "Mathematics", "Midterm Exam 1 (Semester 5)", "midterm", 74.0, 100.0, 74.0, "Good analytical step derivation."),
            (sid, exam_map["Unit Test 1: Calculus"]["id"], "Mathematics", "Unit Test 1: Calculus", "unit_test", 41.0, 50.0, 82.0, "Strong progress in definite integrals (+8% improvement)."),
            (sid, exam_map["Midterm Exam 1: Physics"]["id"], "Physics", "Midterm Exam 1: Physics", "midterm", 52.0, 100.0, 52.0, "Weak performance in circuit theory. Needs targeted practice."),
            (sid, exam_map["Unit Test 1: Electricity"]["id"], "Physics", "Unit Test 1: Electricity", "unit_test", 34.0, 50.0, 68.0, "Noticeable progress after 2 weeks of daily practice (+16 percentage points!)."),
            (sid, exam_map["Midterm Exam 1: Data Structures"]["id"], "Data Structures", "Midterm Exam 1: Data Structures", "midterm", 85.0, 100.0, 85.0, "Excellent grasp of pointer manipulations and recursion."),
            (sid, exam_map["Unit Test 1: Trees & Graphs"]["id"], "Data Structures", "Unit Test 1: Trees & Graphs", "unit_test", 45.0, 50.0, 90.0, "Flawless code complexity analysis.")
        ]
        for m in marks_entries:
            cursor.execute(
                """
                INSERT OR IGNORE INTO student_marks (
                    student_id, exam_id, subject_name, exam_title, exam_type, marks_obtained, max_marks, percentage, remarks
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                m
            )

    # 18. Educational & Developmental Opportunities
    opportunities_sample = [
        (
            "National Student Robotics & Autonomous Systems Challenge 2026",
            "competition", "Robotics & AI", "Intermediate",
            "Build autonomous wheeled rovers capable of maze navigation and obstacle avoidance using ROS2 and Computer Vision. Hardware kits provided to finalists.",
            "IIT Bombay TechFest & Ministry of Education", "2026-11-15", "https://robotics-challenge.edu", "Enrolled engineering students with Python/Robotics background"
        ),
        (
            "Undergraduate Summer Research Fellowship in Quantum Algorithms",
            "research", "Quantum Computing & Physics", "Intermediate",
            "8-week funded residential research fellowship working under top university academicians on Quantum simulation and error mitigation algorithms.",
            "Indian Institute of Science (IISc)", "2026-12-01", "https://iisc.ac.in/fellowship", "Students with Linear Algebra and Quantum Physics foundation"
        ),
        (
            "Open Source AI Developer Workshop: Building Local LLM Agents",
            "workshop", "Artificial Intelligence & Python", "All Levels",
            "Interactive hands-on masterclass on LangChain, retrieval augmented generation (RAG), and deploying quantized open models with ONNX and FastAPI.",
            "National Educational Technology Forum", "2026-10-20", "https://netf.gov.in/workshops", "Open to all students interested in Python and Machine Learning"
        ),
        (
            "Young Scientist Merit Scholarship in Mathematical Sciences",
            "scholarship", "Mathematics & Statistics", "All Levels",
            "Merit-based financial stipend and academic mentorship granted to students demonstrating consistent syllabus progress and high exam readiness in pure mathematics.",
            "Department of Science & Technology (DST)", "2026-11-30", "https://dst.gov.in/scholarships", "Undergraduate students with >70% exam readiness score"
        ),
        (
            "Practical Embedded Systems & IoT Sensor Prototyping Mini-Project",
            "project", "Electronics and Embedded Systems", "Beginner",
            "Guided practical project series: Interface ESP32 microcontrollers with real-time temperature, ultrasonic, and accelerometer sensors via I2C and SPI.",
            "IEEE Student Chapter & MSU Faculty", "2026-10-30", "https://ieee-student.org/iot-project", "Open to all students exploring hardware interfacing"
        )
    ]
    for opp in opportunities_sample:
        cursor.execute(
            """
            INSERT OR IGNORE INTO educational_opportunities (
                title, opportunity_type, subject_field, required_level, description, provider, deadline, action_link, eligibility
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            opp
        )

    # 19. Notifications (Pre-seeding realistic notifications)
    notifs_sample = [
        (kareena_id, "student", "Upcoming Physics Midterm Examination", "Institute schedule update: Physics Midterm scheduled for Oct 15, 10:00 AM in Auditorium Hall B.", "warning", "schedule"),
        (kareena_id, "student", "Daily Weak Subject Practice Ready", "Physics is identified as needing additional practice. Take today's 10-question practice test on Kirchhoff's Laws.", "info", "practice"),
        (kareena_id, "student", "Academic Marks Updated: Physics Unit Test", "Prof. Bhatt recorded your Physics Unit Test score: 68% (+16 percentage points improvement!).", "success", "syllabus"),
        (kareena_id, "student", "Institute Query Resolved", "Dean Academics replied to your doubt on Kirchhoff's Voltage Loop sign conventions.", "info", "queries"),
        (kareena_id, "student", "Dr. Naveen Bhatt Responded to Research Question", "Dr. Bhatt answered your question on 'Edge Consensus Protocols in High-Latency Networks'.", "info", "research"),
        (kareena_id, "student", "New Matched Opportunity: AI Agent Workshop", "An educational workshop matching your Python & AI interests was announced by NETF.", "success", "opportunities"),

        (inst_id, "institute", "New Student Academic Query", "Kareena submitted a query regarding Midterm Examination formula sheets.", "info", "queries"),
        (inst_id, "institute", "Weak Subject Alert: Physics", "3 students in 3rd Year CS have Physics exam readiness below 60%. Automated daily practice tests deployed.", "warning", "students"),

        (acad_id, "academician", "Student Question on Published Paper", "Kareena asked a question on your research paper: 'Edge Consensus Protocols in Distributed Mesh'.", "info", "discuss")
    ]
    for n in notifs_sample:
        cursor.execute(
            """
            INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            n
        )

    conn.commit()
    conn.close()
    print("[Seed] Successfully seeded educational ecosystem with comprehensive live data!")

if __name__ == '__main__':
    seed()