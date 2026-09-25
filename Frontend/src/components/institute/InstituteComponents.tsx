import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  PageHeader,
  StatBlock,
  Tag,
  ProgressBar,
  Modal,
  SearchInput,
  EmptyState,
  VerifiedBadge
} from '../common/UIComponents';
import { Icon } from '../common/Icon';
import { instituteApi } from '../../api/institute';
import { useAuth } from '../../context/AuthContext';
import {
  InstituteScheduleItem,
  InstituteQueryItem,
  StudentAcademicMark
} from '../../types';

// =========================================================================
// 1. OVERVIEW DASHBOARD
// =========================================================================

export const InstituteOverview: React.FC<{
  onTabChange: (tab: string) => void;
  onOpenStudent: (studentId: number) => void;
}> = ({ onTabChange, onOpenStudent }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await instituteApi.getDashboard();
        if (res && res.institute_stats) {
          setStats(res.institute_stats);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute Academic Dashboard"
        desc="Real-time academic monitoring, syllabus progress, marks management, and student mentoring."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onTabChange('schedule')}>
              + Publish Schedule
            </Button>
            <Button variant="primary" onClick={() => onTabChange('marks')}>
              + Enter Marks
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatBlock label="Enrolled Students" value={stats?.enrolled_students ?? 5} />
        <StatBlock label="Avg Academic Score" value={`${stats?.average_academic_score ?? 72.0}%`} />
        <StatBlock label="Avg Syllabus Progress" value={`${stats?.average_syllabus_progress ?? 65.0}%`} />
        <StatBlock label="Avg Exam Readiness (Fit Score)" value={`${stats?.average_exam_readiness_fit_score ?? 70.0}%`} />
      </div>

      <div className="grid md:grid-cols-3 gap-3.5">
        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)]">Students Needing Attention</div>
            <div className="text-2xl font-bold font-display text-amber-700 mt-1">
              {stats?.students_needing_attention ?? 2}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Weak subject alerts active</div>
          </div>
          <Button variant="outline" className="text-xs py-1 px-2.5" onClick={() => onTabChange('students')}>
            Review List →
          </Button>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)]">Pending Student Queries</div>
            <div className="text-2xl font-bold font-display text-blue-700 mt-1">
              {stats?.pending_student_queries ?? 1}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Academic doubts & guidance</div>
          </div>
          <Button variant="outline" className="text-xs py-1 px-2.5" onClick={() => onTabChange('mentoring')}>
            Answer Queries →
          </Button>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)]">Officially Verified Students</div>
            <div className="text-2xl font-bold font-display text-emerald-700 mt-1">
              {stats?.verified_students ?? 4}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Institutional roll confirmed</div>
          </div>
          <Button variant="outline" className="text-xs py-1 px-2.5" onClick={() => onTabChange('verifications')}>
            Verifications →
          </Button>
        </Card>
      </div>

      {/* Upcoming Examinations */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[#2C3524]">Upcoming Scheduled Examinations</h3>
            <p className="text-xs text-[var(--text-muted)]">Official institutional tests synchronized with student timetables</p>
          </div>
          <Button variant="ghost" className="text-xs" onClick={() => onTabChange('schedule')}>
            View All Schedules →
          </Button>
        </div>

        {stats?.upcoming_examinations?.length ? (
          <div className="grid md:grid-cols-2 gap-3">
            {stats.upcoming_examinations.map((ex: any) => (
              <div key={ex.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-pcream/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#2C3524]">{ex.title}</span>
                  <Tag tone="amber">Exam</Tag>
                </div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
                  <span>📅 {ex.date}</span>
                  <span>⏰ {ex.start_time}</span>
                </div>
                <div className="text-xs text-[#2C3524]/80">📍 {ex.venue_or_link}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No upcoming examinations scheduled. Click '+ Publish Schedule' to create one." />
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 2. STUDENT MONITORING & FILTERING
// =========================================================================

export const InstituteStudentMonitoring: React.FC<{
  onSelectStudent: (studentId: number) => void;
  onOpenMarksModal: (studentId: number, studentName: string) => void;
  onOpenMentorModal: (studentId: number, studentName: string) => void;
}> = ({ onSelectStudent, onOpenMarksModal, onOpenMentorModal }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [classYear, setClassYear] = useState('');
  const [subject, setSubject] = useState('');
  const [weakOnly, setWeakOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await instituteApi.getStudentsMonitoring({
        search: search || undefined,
        class_year: classYear || undefined,
        subject: subject || undefined,
        weak_only: weakOnly,
      });
      if (res && res.students) {
        setStudents(res.students);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classYear, subject, weakOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic Monitoring"
        desc="Monitor academic marks, syllabus completion, exam readiness (fit score), and identified weak subjects."
      />

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)]">Search Student</label>
            <input
              type="text"
              placeholder="Name, Roll No, Email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
              className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)]">Class / Year</label>
            <select
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
            >
              <option value="">All Classes</option>
              <option value="1st Year B.Tech">1st Year B.Tech</option>
              <option value="2nd Year B.Tech">2nd Year B.Tech</option>
              <option value="3rd Year B.Tech">3rd Year B.Tech</option>
              <option value="4th Year B.Tech">4th Year B.Tech</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)]">Filter Subject</label>
            <input
              type="text"
              placeholder="e.g. Physics, Math..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => setWeakOnly((v) => !v)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                weakOnly
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-white border-[var(--border)] text-[#2C3524] hover:bg-pcream/60'
              }`}
            >
              {weakOnly ? '⚠️ Weak Subjects Only' : 'Filter Weak Subjects'}
            </button>
            <Button variant="outline" className="text-xs py-2 px-3" onClick={fetchStudents}>
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Student List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">Loading student records…</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState text="No student records match the selected filters." />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {students.map((st) => (
              <div key={st.id} className="p-4 sm:p-5 hover:bg-pcream/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold text-base text-[#2C3524]">{st.name}</span>
                    {st.university_roll_no && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-black/5 text-[#556248]">
                        Roll: {st.university_roll_no}
                      </span>
                    )}
                    {st.verification_status === 'verified' && <VerifiedBadge small />}
                    {st.weak_subject_count > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                        ⚠️ Weak Subject Identified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {st.class_year} • {st.curriculum}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-[#2C3524]/80">
                    <span>Academic: <strong>{st.academic_subjects}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 flex-wrap sm:flex-nowrap">
                  <div className="text-center px-2">
                    <div className="text-[11px] text-[var(--text-muted)] font-medium">Exam Avg</div>
                    <div className="text-sm font-bold text-[#2C3524]">{st.avg_marks}%</div>
                  </div>
                  <div className="text-center px-2 border-x border-[var(--border)]">
                    <div className="text-[11px] text-[var(--text-muted)] font-medium">Syllabus</div>
                    <div className="text-sm font-bold text-sagedeep">{st.avg_syllabus_progress}%</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-[11px] text-[var(--text-muted)] font-medium">Fit Score</div>
                    <div className="text-sm font-bold text-blue-700">{st.avg_fit_score}%</div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <Button variant="outline" className="text-xs py-1.5 px-2.5" onClick={() => onSelectStudent(st.id)}>
                      View Details
                    </Button>
                    <Button variant="outline" className="text-xs py-1.5 px-2.5" onClick={() => onOpenMarksModal(st.id, st.name)}>
                      + Marks
                    </Button>
                    <Button variant="primary" className="text-xs py-1.5 px-2.5" onClick={() => onOpenMentorModal(st.id, st.name)}>
                      Mentor
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 3. STUDENT DETAIL MODAL
// =========================================================================

export const InstituteStudentDetailModal: React.FC<{
  studentId: number | null;
  onClose: () => void;
  onOpenMarks: (studentId: number, studentName: string) => void;
  onOpenMentor: (studentId: number, studentName: string) => void;
}> = ({ studentId, onClose, onOpenMarks, onOpenMentor }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      instituteApi.getStudentDetail(studentId)
        .then((res) => setStudent(res.student))
        .catch(() => setStudent(null))
        .finally(() => setLoading(false));
    } else {
      setStudent(null);
    }
  }, [studentId]);

  return (
    <Modal open={!!studentId} onClose={onClose} title={student ? student.name : 'Student Details'} wide>
      {loading ? (
        <div className="p-8 text-center text-xs animate-pulse text-[var(--text-muted)]">Loading full student profile…</div>
      ) : student ? (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-pcream/40 border border-[var(--border)]">
            <div>
              <div className="text-base font-bold font-display text-[#2C3524] flex items-center gap-2">
                <span>{student.name}</span>
                {student.verification_status === 'verified' && <VerifiedBadge small />}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                Roll No: {student.university_roll_no || 'Unassigned'} • {student.class_year} • {student.curriculum}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-xs py-1.5 px-3" onClick={() => onOpenMarks(student.id, student.name)}>
                + Record Marks
              </Button>
              <Button variant="primary" className="text-xs py-1.5 px-3" onClick={() => onOpenMentor(student.id, student.name)}>
                Give Guidance
              </Button>
            </div>
          </div>

          {/* Syllabus Progress & Fit Score Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
              Syllabus Progress & Exam Readiness (Fit Scores)
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {student.syllabus_progress?.map((sp: any) => (
                <div
                  key={sp.subject_name}
                  className={`p-3.5 rounded-xl border ${
                    sp.is_weak_subject ? 'border-amber-300 bg-amber-50/60' : 'border-[var(--border)] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-[#2C3524]">{sp.subject_name}</span>
                    {sp.is_weak_subject ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                        Weak Subject
                      </span>
                    ) : (
                      <Tag tone="sage">On Track</Tag>
                    )}
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Syllabus Complete</span>
                        <span className="font-semibold text-[#2C3524]">{sp.completed_percentage}%</span>
                      </div>
                      <ProgressBar value={sp.completed_percentage} colorClass="bg-sagedeep" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Exam Readiness (Fit Score)</span>
                        <span className="font-semibold text-blue-700">{sp.exam_readiness_score}%</span>
                      </div>
                      <ProgressBar value={sp.exam_readiness_score} colorClass="bg-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Marks Table */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
              Recorded Examination Marks History
            </h4>
            {student.marks_history?.length ? (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-pcream/60 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold">
                    <tr>
                      <th className="p-2.5">Examination</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Percentage</th>
                      <th className="p-2.5">Remarks</th>
                      <th className="p-2.5">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {student.marks_history.map((m: any) => (
                      <tr key={m.id} className="hover:bg-pcream/20">
                        <td className="p-2.5 font-medium">{m.exam_title}</td>
                        <td className="p-2.5">{m.subject_name}</td>
                        <td className="p-2.5 font-bold">{m.marks_obtained} / {m.max_marks}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            m.percentage < 60 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {m.percentage}%
                          </span>
                        </td>
                        <td className="p-2.5 text-[var(--text-muted)]">{m.remarks || '—'}</td>
                        <td className="p-2.5 text-[var(--text-muted)]">{m.recorded_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState text="No examination marks recorded yet for this student." />
            )}
          </div>

          {/* Practice Test Performance */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
              Recent Practice Tests & Weak Area Drills
            </h4>
            {student.practice_tests?.length ? (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {student.practice_tests.map((pt: any) => (
                  <div key={pt.id} className="p-3 rounded-xl border border-[var(--border)] bg-white text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#2C3524]">{pt.subject_name}: {pt.topic_name}</span>
                      <span className="font-bold text-sagedeep">{pt.score}%</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Accuracy: {pt.accuracy}% • Taken: {pt.taken_at?.slice(0, 10)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No practice tests recorded yet." />
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

// =========================================================================
// 4. MARKS MANAGEMENT (ADD & AUDIT)
// =========================================================================

export const InstituteMarksManagement: React.FC<{
  initialStudentId?: number;
  initialStudentName?: string;
}> = ({ initialStudentId, initialStudentName }) => {
  const [marks, setMarks] = useState<StudentAcademicMark[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentId, setStudentId] = useState<string>(initialStudentId ? String(initialStudentId) : '');
  const [examTitle, setExamTitle] = useState('Midterm Examination');
  const [examType, setExamType] = useState('midterm');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [marksObtained, setMarksObtained] = useState('75');
  const [maxMarks, setMaxMarks] = useState('100');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        instituteApi.getMarks(),
        instituteApi.getStudentsMonitoring()
      ]);
      if (mRes?.marks) setMarks(mRes.marks);
      if (sRes?.students) {
        setStudents(sRes.students);
        if (!studentId && sRes.students.length > 0) {
          setStudentId(String(sRes.students[0].id));
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectName || !examTitle) return;
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await instituteApi.addMarks({
        student_id: parseInt(studentId, 10),
        subject_name: subjectName,
        exam_title: examTitle,
        exam_type: examType,
        marks_obtained: parseFloat(marksObtained),
        max_marks: parseFloat(maxMarks),
        remarks: remarks || undefined
      });
      setSuccessMsg(`Marks recorded successfully! ${res.is_weak_subject ? '⚠️ Flagged as Weak Subject (<60%).' : 'Exam readiness updated.'}`);
      setRemarks('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record marks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Marks Management"
        desc="Record and audit official student examination marks. Maintain historical tracking and automated weak-subject detection."
      />

      {/* Record Marks Card */}
      <Card className="p-5 border-l-4 border-l-sagedeep">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">Record Student Examination Marks</h3>
        <form onSubmit={handleAddMarks} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Select Student *</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.university_roll_no || `ID: ${st.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Subject Name *</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Digital Electronics">Digital Electronics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Examination Type *</label>
              <select
                value={examType}
                onChange={(e) => {
                  setExamType(e.target.value);
                  if (e.target.value === 'unit_test') setExamTitle('Unit Test 2');
                  else if (e.target.value === 'midterm') setExamTitle('Midterm Examination');
                  else if (e.target.value === 'final') setExamTitle('Final Semester Examination');
                  else if (e.target.value === 'practical_exam') setExamTitle('Laboratory Practical Examination');
                }}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="midterm">Midterm Examination</option>
                <option value="unit_test">Class Unit Test</option>
                <option value="final">Final Semester Examination</option>
                <option value="practical_exam">Practical / Lab Exam</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Examination Title *</label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Midterm Exam 1 (Semester 5)"
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)]">Marks Obtained *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)]">Max Marks *</label>
                <input
                  type="number"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Faculty Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Strong in calculus, revise circuit laws"
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[var(--text-muted)]">
              Calculated Score: <strong>{maxMarks ? ((parseFloat(marksObtained || '0') / parseFloat(maxMarks)) * 100).toFixed(1) : 0}%</strong>
            </span>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Recording…' : 'Record Marks & Update Fit Score'}
            </Button>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium">
              {successMsg}
            </div>
          )}
        </form>
      </Card>

      {/* Historical Marks Audit Table */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">Historical Marks Log</h3>
        {loading ? (
          <div className="p-8 text-center text-xs animate-pulse text-[var(--text-muted)]">Loading marks entries…</div>
        ) : marks.length === 0 ? (
          <EmptyState text="No examination marks recorded yet." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-xs text-left">
              <thead className="bg-pcream/60 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold">
                <tr>
                  <th className="p-2.5">Student</th>
                  <th className="p-2.5">Exam Title</th>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5">Percentage</th>
                  <th className="p-2.5">Remarks</th>
                  <th className="p-2.5">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {marks.map((m) => (
                  <tr key={m.id} className="hover:bg-pcream/20">
                    <td className="p-2.5 font-semibold text-[#2C3524]">
                      {m.student_name || `Student #${m.student_id}`}
                      {m.university_roll_no && <span className="block text-[10px] text-[var(--text-muted)] font-mono">{m.university_roll_no}</span>}
                    </td>
                    <td className="p-2.5 font-medium">{m.exam_title}</td>
                    <td className="p-2.5">{m.subject_name}</td>
                    <td className="p-2.5 font-bold">{m.marks_obtained} / {m.max_marks}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        m.percentage < 60 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {m.percentage}%
                      </span>
                    </td>
                    <td className="p-2.5 text-[var(--text-muted)]">{m.remarks || '—'}</td>
                    <td className="p-2.5 text-[var(--text-muted)]">{m.recorded_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 5. ACADEMIC SCHEDULE MANAGEMENT
// =========================================================================

export const InstituteScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<InstituteScheduleItem[]>([]);
  const [scheduleType, setScheduleType] = useState('class');
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [venue, setVenue] = useState('Auditorium Hall B');
  const [targetClass, setTargetClass] = useState('All 3rd Year Batches');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      const res = await instituteApi.getSchedules();
      if (res?.schedules) setSchedules(res.schedules);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectName || !date || !startTime) return;
    setSaving(true);
    setSuccess(null);

    try {
      await instituteApi.createSchedule({
        schedule_type: scheduleType,
        title,
        subject_name: subjectName,
        date,
        start_time: startTime,
        end_time: endTime,
        venue_or_link: venue,
        target_class: targetClass,
        notes: notes || undefined
      });
      setSuccess(`Schedule '${title}' published! Synced to student timetables.`);
      setTitle('');
      setNotes('');
      await loadSchedules();
    } catch (err: any) {
      alert(err.message || 'Failed to create schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule item?')) return;
    try {
      await instituteApi.deleteSchedule(id);
      await loadSchedules();
    } catch (err: any) {
      alert(err.message || 'Failed to delete.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Schedule Management"
        desc="Publish official classes, examinations, practical tests, and assignments. Automatically synchronizes with Student timetables and broadcasts notifications."
      />

      {/* Schedule Publisher */}
      <Card className="p-5 border-l-4 border-l-amber-500">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">Publish Academic Schedule Item</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Schedule Type *</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="class">Regular Class Lecture</option>
                <option value="examination">Major Examination</option>
                <option value="test">Unit Test</option>
                <option value="practical">Laboratory Practical Exam</option>
                <option value="assignment">Assignment Deadline</option>
                <option value="event">Academic Seminar / Event</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Midterm Examination"
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Subject *</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)]">Start Time *</label>
                <input
                  type="text"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)]">End Time *</label>
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="01:00 PM"
                  className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Venue / Link *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Auditorium Hall B"
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-[var(--text-muted)]">Notes / Syllabus Scope</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Covers Unit 1 (Electrostatics) and Unit 2 (Current Electricity). Bring ID cards."
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish & Broadcast Schedule'}
            </Button>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium">
              {success}
            </div>
          )}
        </form>
      </Card>

      {/* Published Schedules List */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">Published Institutional Schedules</h3>
        {loading ? (
          <div className="p-8 text-center text-xs animate-pulse text-[var(--text-muted)]">Loading schedules…</div>
        ) : schedules.length === 0 ? (
          <EmptyState text="No schedules published yet." />
        ) : (
          <div className="space-y-3">
            {schedules.map((sch) => (
              <div key={sch.id} className="p-4 rounded-xl border border-[var(--border)] bg-pcream/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2C3524]">{sch.title}</span>
                    <Tag tone={sch.schedule_type === 'examination' ? 'amber' : 'blue'}>
                      {sch.schedule_type.toUpperCase()}
                    </Tag>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
                    <span>📅 {sch.date}</span>
                    <span>⏰ {sch.start_time} – {sch.end_time}</span>
                    <span>📍 {sch.venue_or_link}</span>
                  </div>
                  {sch.notes && <div className="text-xs text-[#2C3524]/80 italic">"{sch.notes}"</div>}
                </div>
                <Button variant="ghost" className="text-xs text-rose-700 hover:bg-rose-50 self-end sm:self-center" onClick={() => handleDelete(sch.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 6. MENTORING & STUDENT QUERY RESOLUTION
// =========================================================================

export const InstituteMentoringAndQueries: React.FC<{
  initialMentorStudentId?: number;
  initialMentorStudentName?: string;
}> = ({ initialMentorStudentId, initialMentorStudentName }) => {
  const [queries, setQueries] = useState<InstituteQueryItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Query Response Modal State
  const [selectedQuery, setSelectedQuery] = useState<InstituteQueryItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  // Proactive Mentor Form State
  const [mentorStudentId, setMentorStudentId] = useState<string>(initialMentorStudentId ? String(initialMentorStudentId) : '');
  const [guidanceType, setGuidanceType] = useState('study_priority');
  const [guidanceSubject, setGuidanceSubject] = useState('Physics');
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [sendingGuidance, setSendingGuidance] = useState(false);
  const [guidanceSuccess, setGuidanceSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        instituteApi.getQueries(),
        instituteApi.getStudentsMonitoring()
      ]);
      if (qRes?.queries) setQueries(qRes.queries);
      if (sRes?.students) {
        setStudents(sRes.students);
        if (!mentorStudentId && sRes.students.length > 0) {
          setMentorStudentId(String(sRes.students[0].id));
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRespond = async () => {
    if (!selectedQuery || !responseText) return;
    setResponding(true);
    try {
      await instituteApi.respondToQuery(selectedQuery.id, responseText, 'resolved');
      setSelectedQuery(null);
      setResponseText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit response.');
    } finally {
      setResponding(false);
    }
  };

  const handleSendMentoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorStudentId || !guidanceMessage) return;
    setSendingGuidance(true);
    setGuidanceSuccess(null);

    try {
      await instituteApi.sendMentoring({
        student_id: parseInt(mentorStudentId, 10),
        guidance_type: guidanceType,
        subject_name: guidanceSubject,
        message: guidanceMessage,
      });
      setGuidanceSuccess('Mentoring suggestion dispatched to student dashboard!');
      setGuidanceMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send mentoring guidance.');
    } finally {
      setSendingGuidance(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Mentoring & Query Resolution"
        desc="Answer student academic doubts, examination inquiries, and dispatch proactive study priorities."
      />

      {/* Proactive Mentoring Dispatch */}
      <Card className="p-5 border-l-4 border-l-blue-600">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-2">Send Academic Guidance & Mentoring Suggestions</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Guide students directly on weak subjects, recommend targeted practice, or set study priorities.
        </p>

        <form onSubmit={handleSendMentoring} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Select Student *</label>
              <select
                value={mentorStudentId}
                onChange={(e) => setMentorStudentId(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.university_roll_no || `ID: ${st.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Guidance Type *</label>
              <select
                value={guidanceType}
                onChange={(e) => setGuidanceType(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="study_priority">Study Priorities & Exam Focus</option>
                <option value="weak_subject_practice">Weak-Subject Practice Recommendation</option>
                <option value="resource_suggestion">Curated Resource / Simulation</option>
                <option value="academic_feedback">General Academic Feedback</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Subject *</label>
              <select
                value={guidanceSubject}
                onChange={(e) => setGuidanceSubject(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs focus-ring bg-white font-medium"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="General">General / All Subjects</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)]">Mentoring Guidance Message *</label>
            <textarea
              required
              rows={3}
              value={guidanceMessage}
              onChange={(e) => setGuidanceMessage(e.target.value)}
              placeholder="e.g. Focus on Kirchhoff's multi-loop laws before Monday's lecture. Complete Today's Targeted Practice test on Current Electricity."
              className="w-full mt-1 rounded-xl border border-[var(--border)] p-3 text-xs focus-ring bg-white"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" type="submit" disabled={sendingGuidance}>
              {sendingGuidance ? 'Dispatching…' : 'Send Guidance to Student'}
            </Button>
          </div>

          {guidanceSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium">
              {guidanceSuccess}
            </div>
          )}
        </form>
      </Card>

      {/* Student Queries List */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">Incoming Student Inquiries & Doubts</h3>
        {loading ? (
          <div className="p-8 text-center text-xs animate-pulse text-[var(--text-muted)]">Loading student queries…</div>
        ) : queries.length === 0 ? (
          <EmptyState text="No student queries submitted yet." />
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-[var(--border)] bg-pcream/20 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2C3524]">{q.title}</span>
                    <Tag tone={q.status === 'pending' ? 'amber' : 'sage'}>
                      {q.status.toUpperCase()}
                    </Tag>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/5 text-[#556248] font-medium">
                      {q.subject_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">{q.created_at?.slice(0, 16)}</span>
                </div>

                <div className="text-xs text-[var(--text-muted)]">
                  Raised by: <strong>{q.student_name}</strong> {q.university_roll_no && `(${q.university_roll_no})`}
                </div>

                <p className="text-xs text-[#2C3524] leading-relaxed bg-white/70 p-3 rounded-xl border border-[var(--border)]">
                  "{q.question_text}"
                </p>

                {q.response_text ? (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Icon name="checkc" className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Faculty Response ({q.answered_at?.slice(0, 10)}):</span>
                    </div>
                    <p className="text-emerald-950 leading-relaxed">{q.response_text}</p>
                  </div>
                ) : (
                  <div className="pt-1 flex justify-end">
                    <Button variant="outline" className="text-xs py-1 px-3" onClick={() => setSelectedQuery(q)}>
                      Write Faculty Response →
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Response Modal */}
      <Modal open={!!selectedQuery} onClose={() => setSelectedQuery(null)} title="Respond to Student Query">
        {selectedQuery && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-pcream/40 border border-[var(--border)] text-xs space-y-1">
              <div className="font-bold text-[#2C3524]">{selectedQuery.title}</div>
              <div className="text-[var(--text-muted)]">From: {selectedQuery.student_name} • Subject: {selectedQuery.subject_name}</div>
              <p className="text-[#2C3524] mt-2 italic">"{selectedQuery.question_text}"</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)]">Faculty Answer / Clarification *</label>
              <textarea
                rows={5}
                required
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide a clear academic explanation or schedule resolution..."
                className="w-full mt-1 rounded-xl border border-[var(--border)] p-3 text-xs focus-ring bg-white"
              />
            </div>

            <Button variant="primary" className="w-full" onClick={handleRespond} disabled={responding}>
              {responding ? 'Publishing…' : 'Submit Response & Mark Resolved'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =========================================================================
// 7. ANALYTICS & KNOWLEDGE-GAP INSIGHTS
// =========================================================================

export const InstituteAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      instituteApi.getAcademicTrends(),
      instituteApi.getKnowledgeGapAnalytics()
    ]).then(([tRes, gRes]) => {
      setTrends(tRes);
      setGaps(gRes);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Performance & Knowledge-Gap Analytics"
        desc="Correlate targeted practice with examination mark improvements and examine student-reported missing concepts."
      />

      {/* Practice vs Exam Performance Correlation */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-1">
          Practice vs. Examination Performance Correlation
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Analysis of academic mark improvements after regular weak-subject practice intervention.
        </p>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-pcream/60 border-b border-[var(--border)] text-[var(--text-muted)] font-semibold">
              <tr>
                <th className="p-3">Subject</th>
                <th className="p-3">Practice Avg</th>
                <th className="p-3">Prior Exam Score</th>
                <th className="p-3">Latest Exam Score</th>
                <th className="p-3">Observed Delta</th>
                <th className="p-3">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {trends?.correlation_data?.map((c: any) => (
                <tr key={c.subject} className="hover:bg-pcream/20">
                  <td className="p-3 font-semibold text-[#2C3524]">{c.subject}</td>
                  <td className="p-3 font-bold text-blue-700">{c.practice_avg}%</td>
                  <td className="p-3 text-[var(--text-muted)]">{c.prior_exam_avg}%</td>
                  <td className="p-3 font-bold text-[#2C3524]">{c.exam_avg}%</td>
                  <td className="p-3 font-bold text-emerald-700">{c.gain}</td>
                  <td className="p-3 text-[var(--text-muted)]">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Knowledge-Gap Reports */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-1">
          Student Knowledge-Gap & Missing Concept Reports
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Concepts, missing prerequisites, or real-world applications students reported needing deeper explanation.
        </p>

        {gaps?.feedbacks?.length ? (
          <div className="space-y-3">
            {gaps.feedbacks.map((f: any) => (
              <div key={f.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-pcream/20 text-xs space-y-1">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2C3524]">{f.subject_name}: {f.topic_name}</span>
                    <Tag tone="amber">{f.feedback_type.replace(/_/g, ' ')}</Tag>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">Reported by: {f.student_name} ({f.class_year})</span>
                </div>
                <p className="text-[#2C3524] italic mt-1 bg-white/60 p-2.5 rounded-lg border border-[var(--border)]">
                  "{f.description}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No student knowledge-gap feedback submitted yet." />
        )}
      </Card>
    </div>
  );
};

// =========================================================================
// 8. STUDENT VERIFICATIONS
// =========================================================================

export const InstituteVerifications: React.FC = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    try {
      const res = await instituteApi.getPendingVerifications();
      if (res?.students) setPending(res.students);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleVerify = async (studentId: number, status: 'verified' | 'rejected') => {
    try {
      await instituteApi.verifyStudent(studentId, status);
      await loadPending();
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollment Verification"
        desc="Review student institutional roll numbers and uploaded documents to verify their official student status."
      />

      <Card className="p-5">
        {loading ? (
          <div className="p-8 text-center text-xs animate-pulse text-[var(--text-muted)]">Loading verification requests…</div>
        ) : pending.length === 0 ? (
          <EmptyState text="No pending verification requests right now. All student roll numbers are up to date." />
        ) : (
          <div className="space-y-3">
            {pending.map((st) => (
              <div key={st.id} className="p-4 rounded-xl border border-[var(--border)] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-[#2C3524]">{st.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Roll No: <strong>{st.university_roll_no || 'Not supplied'}</strong> • {st.class_year} • {st.curriculum}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Email: {st.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" className="text-xs py-1.5 px-3" onClick={() => handleVerify(st.id, 'verified')}>
                    Approve Verification
                  </Button>
                  <Button variant="ghost" className="text-xs text-rose-700 py-1.5 px-3" onClick={() => handleVerify(st.id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
