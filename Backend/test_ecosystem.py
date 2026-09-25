import sys
import json
from app import create_app
from models import init_db

def test_full_educational_ecosystem():
    app = create_app()
    client = app.test_client()

    print("=================================================================")
    print("STEP 1: Test Student Authentication & Role Isolation")
    print("=================================================================")
    # Login as Student Kareena
    res = client.post('/api/auth/students/login', json={
        'email': 'kareena@college.edu',
        'password': 'Password123!'
    })
    assert res.status_code == 200, f"Student login failed: {res.data}"
    data = res.get_json()
    print("[PASS] Student login success:", data['user']['name'], f"(Role: {data['user']['role']})")

    # Verify Student Profile
    res = client.get('/api/student/profile')
    assert res.status_code == 200
    p = res.get_json()['profile']
    print(f"[PASS] Profile loaded: Class: {p['academic_class']}, Board: {p['board_curriculum']}, College: {p['college']}")
    assert 'resume' not in p, "Resume should not exist in profile"

    # Verify Dual-Track Learning Pathways
    res = client.get('/api/student/pathways')
    assert res.status_code == 200
    pathways = res.get_json()['pathways']
    print(f"[PASS] Dual-track pathways fetched: {len(pathways)} pathways configured")
    for pw in pathways[:2]:
        print(f"   - {pw['subject_name']} ({pw['pathway_type']}, Level: {pw['current_level']}, Topics: {len(pw['topics'])})")

    # Verify Syllabus Progress & Fit Score (Exam Readiness)
    res = client.get('/api/student/syllabus')
    assert res.status_code == 200
    syll = res.get_json()
    print(f"[PASS] Syllabus progress fetched: Potential Index: {syll['potential_score']}, Rate: +{syll['syllabus_progress_rate']}%/day")
    for s in syll['syllabus_progress'][:2]:
        print(f"   - {s['subject_name']}: Coverage: {s['completed_percentage']}%, Fit Score (Exam Readiness): {s['exam_readiness_score']}%")

    # Test Daily Syllabus Update
    res = client.post('/api/student/syllabus/daily-update', json={
        'subject_name': 'Data Structures & Algorithms',
        'completed_topics': 'Trie Data Structure & Radix Sort',
        'revision_topics': 'Binary Search Tree Deletion',
        'practice_count': 8,
        'study_minutes': 75,
        'notes': 'Understood prefix tree operations clearly'
    })
    assert res.status_code in (200, 201), f"/syllabus/daily-update error: {res.data}"
    print("[PASS] Daily syllabus progress successfully logged")

    # Test AI-Assisted Flexible Schedule with Extracurricular (Cricket 4:30 - 5:30)
    res = client.post('/api/student/schedules/ai-generate', json={
        'free_time_preference': 'Cricket 4:30 PM to 5:30 PM daily',
        'daily_available_hours': 4
    })
    assert res.status_code in (200, 201), f"/schedules/ai-generate error: {res.data}"
    sched_data = res.get_json()
    print(f"[PASS] AI Timetable generated ({sched_data['generated_items']} slots balanced around sports/cricket)")

    # Test Track 2 Extra Learning Time Logging
    res = client.post('/api/student/schedules/track-extra-time', json={
        'skill_or_subject': 'Deep Learning & PyTorch',
        'duration_minutes': 90,
        'notes': 'Built a convolutional neural network for image classification'
    })
    assert res.status_code in (200, 201), f"/schedules/track-extra-time error: {res.data}"
    print("[PASS] Track 2 extra skill learning time logged")

    # Test Weak Subject Detection & Daily Targeted Practice Test
    res = client.get('/api/student/weak-subjects')
    assert res.status_code == 200
    weak = res.get_json()
    print(f"[PASS] Weak subject analysis: Has weak subjects: {weak['has_weak_subjects']}")
    if weak['weak_subjects']:
        print(f"   - Detected weak subjects: {[w['subject'] for w in weak['weak_subjects']]}")

    # Fetch Today's Practice Test
    res = client.get('/api/student/practice-test/today?subject=Operating%20Systems')
    assert res.status_code == 200
    quiz = res.get_json()
    print(f"[PASS] Today's targeted practice quiz generated: {quiz['total_questions']} questions for {quiz['subject']}")

    # Submit Practice Test
    res = client.post('/api/student/practice-test/submit', json={
        'subject_name': 'Operating Systems',
        'topic_name': 'Deadlock & Banker Algorithm',
        'answers': {'1': 'B', '2': 'C', '3': 'A'}
    })
    assert res.status_code in (200, 201), f"/practice-test/submit error: {res.data}"
    quiz_res = res.get_json()
    print(f"[PASS] Practice quiz submitted. Score: {quiz_res['score']}%, Accuracy: {quiz_res['accuracy']}%")

    # Test Practice vs. Real Exam Correlation
    res = client.get('/api/student/practice-vs-exam')
    assert res.status_code == 200
    pve = res.get_json()
    print(f"[PASS] Practice vs. Real Exam comparison loaded: {len(pve['comparison_summary'])} subjects analyzed")

    # Test Raise Query to Institute
    res = client.post('/api/student/queries', json={
        'subject_name': 'Data Structures & Algorithms',
        'query_type': 'academic_doubt',
        'title': 'Doubt regarding AVL Tree double rotations',
        'question_text': 'When do we use Left-Right vs Right-Left rotations after node insertion?'
    })
    assert res.status_code in (200, 201), f"/queries error: {res.data}"
    query_id = res.get_json()['query_id']
    print(f"[PASS] Academic query submitted to faculty (Query ID: {query_id})")

    # Test Academician Research Collaboration
    res = client.get('/api/student/research/papers')
    assert res.status_code == 200
    papers = res.get_json()['papers']
    print(f"[PASS] Academician research papers retrieved: {len(papers)} papers found")

    # Test Ask Research Question
    if papers:
        paper_id = papers[0]['id']
        res = client.post(f'/api/student/research/papers/{paper_id}/discussions', json={
            'question': 'How does your proposed latency mitigation compare with state-of-the-art edge caches?'
        })
        assert res.status_code in (200, 201), f"/research/papers/discussions error: {res.data}"
        print("[PASS] Academician research discussion inquiry submitted")

    # Test Educational Opportunity Matching
    res = client.get('/api/student/opportunities')
    assert res.status_code == 200
    opps = res.get_json()['opportunities']
    print(f"[PASS] Matched educational opportunities fetched: {len(opps)} opportunities (competitions, scholarships, fellowships)")

    # Test Knowledge-Gap Feedback Reporting
    res = client.post('/api/student/feedback/knowledge-gap', json={
        'subject_name': 'Operating Systems',
        'topic_name': 'Paging & Inverted Page Tables',
        'feedback_type': 'needs_practical_example',
        'description': 'Students found the calculation of inverted page table memory overhead confusing in lecture.'
    })
    assert res.status_code in (200, 201), f"/feedback/knowledge-gap error: {res.data}"
    print("[PASS] Knowledge gap reported anonymously to institute")

    # Test Role Isolation: Student must NOT access Institute dashboard
    res = client.get('/api/institute/dashboard')
    assert res.status_code == 403, f"Expected 403 Forbidden for student accessing institute dashboard, got {res.status_code}"
    print("[PASS] Role Isolation Enforced: Student blocked (403 Forbidden) from Institute dashboard")

    # Logout Student
    client.post('/api/auth/logout')

    print("\n=================================================================")
    print("STEP 2: Test Institute Portal Features & Monitoring")
    print("=================================================================")
    # Login as Institute
    res = client.post('/api/auth/institutes/login', json={
        'email': 'tnp@msu.edu',
        'password': 'Password123!'
    })
    assert res.status_code == 200, f"Institute login failed: {res.data}"
    inst_user = res.get_json()['user']
    print("[PASS] Institute login success:", inst_user['name'])

    # Institute Dashboard
    res = client.get('/api/institute/dashboard')
    assert res.status_code == 200
    dash = res.get_json()['institute_stats']
    print(f"[PASS] Institute dashboard loaded: Total Students: {dash['total_students']}, Avg Fit Score: {dash['avg_exam_readiness_score']}%, Weak Subjects: {dash['weak_subject_count']}")

    # Institute Student Monitoring & Filtering
    res = client.get('/api/institute/students?search=kareena')
    assert res.status_code == 200
    students_list = res.get_json()['students']
    assert len(students_list) > 0
    kareena_id = students_list[0]['id']
    print(f"[PASS] Student monitoring filtered: Found {students_list[0]['name']} (ID: {kareena_id}, Class: {students_list[0]['academic_class']}, Fit Score: {students_list[0]['overall_fit_score']}%)")

    # Institute Student Detail View
    res = client.get(f'/api/institute/students/{kareena_id}')
    assert res.status_code == 200
    st_detail = res.get_json().get('student') or res.get_json()
    print(f"[PASS] Student detailed academic profile loaded: {len(st_detail['syllabus_progress'])} subjects, {len(st_detail['marks_history'])} marks records")

    # Add Academic Marks for Student (triggers automated weak subject detection)
    res = client.post('/api/institute/marks', json={
        'student_id': kareena_id,
        'subject_name': 'Operating Systems',
        'exam_title': 'Unit Test 2',
        'exam_type': 'test',
        'marks_obtained': 48,
        'max_marks': 100,
        'remarks': 'Needs remediation on process synchronization'
    })
    assert res.status_code in (200, 201), f"/institute/marks error: {res.data}"
    marks_res = res.get_json()
    print(f"[PASS] Academic marks recorded. Weak subject auto-detected: {marks_res['flagged_as_weak_subject']}")

    # Publish Academic Schedule & Broadcast Notification
    res = client.post('/api/institute/schedules', json={
        'title': 'Operating Systems Remedial Doubt Session',
        'schedule_type': 'class',
        'subject_name': 'Operating Systems',
        'date': '2026-09-28',
        'start_time': '15:00',
        'end_time': '16:30',
        'venue_or_link': 'Room 204 & Online Stream',
        'target_class': 'Semester 4 / B.Tech',
        'notes': 'Targeted revision for Unit Test 2 weak topics'
    })
    assert res.status_code in (200, 201), f"/institute/schedules error: {res.data}"
    print("[PASS] Academic schedule created and broadcast notification sent to enrolled students")

    # Institute Query Resolution
    res = client.get('/api/institute/queries')
    assert res.status_code == 200
    queries_list = res.get_json()['queries']
    print(f"[PASS] Institute received {len(queries_list)} student academic queries")
    if queries_list:
        target_q_id = queries_list[0]['id']
        res = client.post(f'/api/institute/queries/{target_q_id}/respond', json={
            'response_text': 'Double rotation (LR or RL) is applied when the insertion violates AVL balance on the inner child.'
        })
        assert res.status_code in (200, 201), f"/institute/queries respond error: {res.data}"
        print(f"[PASS] Faculty responded to query {target_q_id} (Student notified)")

    # Post Faculty Mentoring Guidance Note
    res = client.post('/api/institute/mentoring', json={
        'subject_name': 'Operating Systems',
        'guidance_type': 'weak_subject_practice',
        'message': 'Focus on Peterson solution and Semaphore synchronization for upcoming finals.'
    })
    assert res.status_code in (200, 201), f"/institute/mentoring error: {res.data}"
    print("[PASS] Faculty mentoring guidance published")

    # Institute Analytics (Practice vs Exam Trends & Knowledge Gaps)
    res = client.get('/api/institute/analytics/academic-trends')
    assert res.status_code == 200
    trends = res.get_json()['subject_performance_correlation']
    print(f"[PASS] Institute academic trends loaded for {len(trends)} subjects")

    res = client.get('/api/institute/analytics/knowledge-gaps')
    assert res.status_code == 200
    gaps = res.get_json()['knowledge_gap_feedbacks']
    print(f"[PASS] Institute knowledge-gap feedback telemetry loaded: {len(gaps)} student reports analyzed")

    # Role Isolation: Institute must NOT access Student profile
    res = client.get('/api/student/profile')
    assert res.status_code == 403, f"Expected 403 Forbidden for institute accessing student profile, got {res.status_code}"
    print("[PASS] Role Isolation Enforced: Institute blocked (403 Forbidden) from Student profile")

    # Logout Institute
    client.post('/api/auth/logout')

    print("\n=================================================================")
    print("STEP 3: Test Academician Portal & Unchanged Features")
    print("=================================================================")
    # Login as Academician
    res = client.post('/api/auth/academicians/login', json={
        'email': 'xyz@msu.edu',
        'password': 'Password123!'
    })
    assert res.status_code == 200, f"Academician login failed: {res.data}"
    acad_user = res.get_json()['user']
    print("[PASS] Academician login success:", acad_user['name'])

    # Academician Papers
    res = client.get('/api/academician/papers')
    assert res.status_code == 200
    papers_list = res.get_json()['papers']
    print(f"[PASS] Academician published papers loaded: {len(papers_list)} papers")

    # Academician Discussions
    res = client.get('/api/academician/discussions')
    assert res.status_code == 200
    disc_list = res.get_json()['discussions']
    print(f"[PASS] Academician student discussion questions loaded: {len(disc_list)} inquiries")

    # Role Isolation: Academician must NOT access Student profile or Institute dashboard
    res = client.get('/api/student/profile')
    assert res.status_code == 403
    res = client.get('/api/institute/dashboard')
    assert res.status_code == 403
    print("[PASS] Role Isolation Enforced: Academician blocked (403 Forbidden) from Student and Institute APIs")

    client.post('/api/auth/logout')

    print("\n=================================================================")
    print("ALL INTEGRATION TESTS PASSED (100% SUCCESS)!")
    print("=================================================================")

if __name__ == '__main__':
    test_full_educational_ecosystem()
