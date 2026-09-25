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
import { studentApi } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import {
  StudentLearningProfile,
  LearningPathway,
  PathwayTopic,
  SyllabusProgressItem,
  DailySyllabusUpdate,
  InstituteScheduleItem,
  PersonalScheduleItem,
  PracticeTestQuestion,
  PracticeTestRecord,
  InstituteQueryItem,
  InstituteGuidanceItem,
  ResearchPaper,
  EducationalOpportunity
} from '../../types';

// =========================================================================
// 0. STUDENT CURRICULUM INTAKE MODAL
// =========================================================================

export const StudentIntakeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProfile?: StudentLearningProfile | null;
}> = ({ isOpen, onClose, onSuccess, initialProfile }) => {
  const [classYear, setClassYear] = useState(initialProfile?.academic_class || '3rd Year B.Tech');
  const [curriculum, setCurriculum] = useState(initialProfile?.board_curriculum || 'Computer Science & Engineering');
  const [selectedAcademic, setSelectedAcademic] = useState<string[]>([
    'Mathematics', 'Data Structures & Algorithms', 'Operating Systems'
  ]);
  const [customAcademic, setCustomAcademic] = useState('');
  const [selectedExtra, setSelectedExtra] = useState<string[]>([
    'Artificial Intelligence & Machine Learning', 'Web Development'
  ]);
  const [customExtra, setCustomExtra] = useState('');
  const [sportsPreference, setSportsPreference] = useState('Cricket practice 4:30 PM - 5:30 PM daily');
  const [preferredLanguage, setPreferredLanguage] = useState(initialProfile?.preferred_language || 'English');
  const [knowledgeLevel, setKnowledgeLevel] = useState(initialProfile?.knowledge_level || 'Intermediate');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const ACADEMIC_PRESETS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Data Structures & Algorithms', 'Operating Systems',
    'Database Management Systems', 'Economics', 'Financial Accounting'
  ];

  const EXTRA_PRESETS = [
    'Artificial Intelligence & Machine Learning', 'Web Development',
    'Cybersecurity', 'Python Programming', 'Robotics & IoT',
    'Cloud Computing', 'UI/UX Design', 'Quantitative Finance'
  ];

  const CLASS_OPTIONS = [
    'Class 9', 'Class 10', 'Class 11', 'Class 12',
    '1st Year B.Tech / B.E.', '2nd Year B.Tech / B.E.', '3rd Year B.Tech / B.E.', '4th Year B.Tech / B.E.',
    '1st Year B.Sc / B.Com / BCA', '2nd Year B.Sc / B.Com / BCA', '3rd Year B.Sc / B.Com / BCA',
    'Postgraduate / Masters', 'Other'
  ];

  const CURRICULUM_OPTIONS = [
    'CBSE', 'ICSE / ISC', 'Gujarat State Board (GSEB)', 'Maharashtra State Board (HSC)',
    'Computer Science & Engineering (University Syllabus)',
    'Electronics & Communication Engineering',
    'Mechanical / Civil Engineering',
    'Commerce & Business Administration (University Syllabus)',
    'Medical & Health Sciences (NEET / University Syllabus)',
    'Other / Autonomous Curriculum'
  ];

  const toggleAcademic = (sub: string) => {
    setSelectedAcademic((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleExtra = (sub: string) => {
    setSelectedExtra((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomAcademic = () => {
    if (customAcademic.trim() && !selectedAcademic.includes(customAcademic.trim())) {
      setSelectedAcademic([...selectedAcademic, customAcademic.trim()]);
      setCustomAcademic('');
    }
  };

  const handleAddCustomExtra = () => {
    if (customExtra.trim() && !selectedExtra.includes(customExtra.trim())) {
      setSelectedExtra([...selectedExtra, customExtra.trim()]);
      setCustomExtra('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAcademic.length === 0) {
      alert('Please select at least one core academic subject.');
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.completeOnboarding({
        class_year: classYear,
        college: initialProfile?.college || 'Institute',
        curriculum,
        academic_subjects: selectedAcademic.join(', '),
        interested_subjects: selectedExtra.join(', '),
        additional_skills: selectedExtra.join(', '),
        preferred_language: preferredLanguage,
        knowledge_level: knowledgeLevel,
        sports_preference: sportsPreference
      });
      onSuccess();
      onClose();
    } catch {
      alert('Failed to save curriculum intake. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Curriculum & Learning Routine Intake" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
          <strong>Personalize Your VidyaSarthi Learning Plan:</strong> Tell us your academic grade, core subjects, extra emerging skills, and sports routine. Our system will generate your calibrated dual-track roadmaps, conflict-free timetable, and diagnostic tests.
        </div>

        {/* 1. Grade and Curriculum */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Academic Class / Year</label>
            <select
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Board / Curriculum</label>
            <select
              value={curriculum}
              onChange={(e) => setCurriculum(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              {CURRICULUM_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Track 1: Core Academic Subjects */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Track 1: Enrolled College / School Academic Subjects (Select All That Apply)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {ACADEMIC_PRESETS.map((sub) => {
              const active = selectedAcademic.includes(sub);
              return (
                <button
                  type="button"
                  key={sub}
                  onClick={() => toggleAcademic(sub)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    active
                      ? 'bg-sagedeep text-pcream border-sagedeep font-bold'
                      : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
                  }`}
                >
                  {active ? '✓ ' : '+ '}{sub}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAcademic}
              onChange={(e) => setCustomAcademic(e.target.value)}
              placeholder="Add other academic subject..."
              className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
            />
            <Button variant="outline" size="sm" type="button" onClick={handleAddCustomAcademic}>
              Add
            </Button>
          </div>
        </div>

        {/* 3. Track 2: Extra Skills / Electives */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Track 2: Extra Skills & Emerging Technologies (Personal Growth)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EXTRA_PRESETS.map((sub) => {
              const active = selectedExtra.includes(sub);
              return (
                <button
                  type="button"
                  key={sub}
                  onClick={() => toggleExtra(sub)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                    active
                      ? 'bg-purple-700 text-white border-purple-700 font-bold'
                      : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-purple-50'
                  }`}
                >
                  {active ? '✓ ' : '+ '}{sub}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customExtra}
              onChange={(e) => setCustomExtra(e.target.value)}
              placeholder="Add other skill or interest..."
              className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
            />
            <Button variant="outline" size="sm" type="button" onClick={handleAddCustomExtra}>
              Add
            </Button>
          </div>
        </div>

        {/* 4. Sports & Extracurriculars Routine */}
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Daily Sports, Fitness & Free-Time Schedule
          </label>
          <input
            type="text"
            required
            value={sportsPreference}
            onChange={(e) => setSportsPreference(e.target.value)}
            placeholder="e.g. Cricket practice 4:30 PM - 5:30 PM daily, Gym 6:00 AM - 7:00 AM"
            className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            The AI timetable scheduler automatically reserves this block exclusively for your sports/hobbies without scheduling study or revision conflicts.
          </p>
        </div>

        {/* 5. Language & Starting Knowledge Level */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Preferred Learning Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Self-Assessed Knowledge Level</label>
            <select
              value={knowledgeLevel}
              onChange={(e) => setKnowledgeLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E1D6AE] bg-white text-xs text-[#2C3524] font-medium"
            >
              <option value="Beginner">Beginner (Foundations First)</option>
              <option value="Intermediate">Intermediate (Core & Application)</option>
              <option value="Advanced">Advanced (Deep Dive & Research)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Calibrating Plan...' : '⚡ Save & Generate Dual-Track Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 1. STUDENT OVERVIEW DASHBOARD
// =========================================================================

export const StudentOverview: React.FC<{
  onTabChange: (tab: string) => void;
  onOpenPractice: (subject?: string) => void;
  onOpenDailyUpdate: () => void;
  onOpenDiagnostic: (subject: string) => void;
  onSelectPathway?: (subject: string) => void;
}> = ({ onTabChange, onOpenPractice, onOpenDailyUpdate, onOpenDiagnostic, onSelectPathway }) => {
  const [profile, setProfile] = useState<StudentLearningProfile | null>(null);
  const [syllabusList, setSyllabusList] = useState<SyllabusProgressItem[]>([]);
  const [weakInfo, setWeakInfo] = useState<{ weak_subjects: any[]; recommendation: string } | null>(null);
  const [schedules, setSchedules] = useState<{ personal: PersonalScheduleItem[]; institute: InstituteScheduleItem[] }>({
    personal: [],
    institute: []
  });
  const [potentialScore, setPotentialScore] = useState<number>(0);
  const [progressRate, setProgressRate] = useState<number>(0.0);
  const [metricsBreakdown, setMetricsBreakdown] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeDismissed, setIntakeDismissed] = useState(false);

  const loadOverview = async () => {
    try {
      const [profRes, syllRes, weakRes, schedRes] = await Promise.allSettled([
        studentApi.getProfile(),
        studentApi.getSyllabus(),
        studentApi.getWeakSubjects(),
        studentApi.getSchedules()
      ]);

      let profData: StudentLearningProfile | null = null;
      if (profRes.status === 'fulfilled' && profRes.value?.profile) {
        profData = profRes.value.profile;
        setProfile(profData);
      }
      let syllData: SyllabusProgressItem[] = [];
      if (syllRes.status === 'fulfilled' && syllRes.value) {
        syllData = syllRes.value.syllabus_progress || [];
        setSyllabusList(syllData);
        if (syllRes.value.potential_score !== undefined) setPotentialScore(syllRes.value.potential_score);
        if (syllRes.value.syllabus_progress_rate !== undefined) setProgressRate(syllRes.value.syllabus_progress_rate);
        if ((syllRes.value as any).metrics_breakdown) setMetricsBreakdown((syllRes.value as any).metrics_breakdown);
      }
      if (weakRes.status === 'fulfilled' && weakRes.value) {
        setWeakInfo({
          weak_subjects: weakRes.value.weak_subjects || [],
          recommendation: weakRes.value.recommendation || ''
        });
      }
      if (schedRes.status === 'fulfilled' && schedRes.value) {
        setSchedules({
          personal: schedRes.value.personal_schedules || [],
          institute: schedRes.value.institute_schedules || []
        });
      }

      // Check if user is first-time (intake required)
      const isFirst = !profData?.academic_class || !profData?.board_curriculum || syllData.length === 0;
      if (isFirst && !intakeDismissed) {
        setShowIntakeModal(true);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const isFirstTime = !profile?.academic_class || !profile?.board_curriculum || syllabusList.length === 0;

  const avgFitScore = syllabusList.length
    ? Math.round(syllabusList.reduce((acc, s) => acc + (s.exam_readiness_score || 0), 0) / syllabusList.length)
    : 0;

  const avgSyllabusProgress = syllabusList.length
    ? Math.round(syllabusList.reduce((acc, s) => acc + (s.completed_percentage || 0), 0) / syllabusList.length)
    : 0;

  const getFitBadge = (score: number) => {
    if (score >= 90) return { label: 'High Mastery', tone: 'sage' as const };
    if (score >= 75) return { label: 'Exam Ready', tone: 'sage' as const };
    if (score >= 50) return { label: 'Moderate Prep', tone: 'amber' as const };
    return { label: 'At Risk', tone: 'rose' as const };
  };

  const fitBadge = getFitBadge(avgFitScore);

  return (
    <div className="space-y-6">
      {/* First-Time Student Intake Banner */}
      {isFirstTime && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> Action Required • Initial Profile Intake
            </div>
            <h2 className="font-display text-lg font-bold text-amber-950">
              Welcome to VidyaSarthi, {profile?.name || 'Student'}!
            </h2>
            <p className="text-xs text-amber-900/80 max-w-2xl leading-relaxed">
              Your profile currently has no curriculum subjects enrolled. Complete your initial intake to select your grade/class, academic subjects, extra skills, and sports routine.
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 shadow-sm"
            onClick={() => setShowIntakeModal(true)}
          >
            Start Curriculum Intake →
          </Button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E1D6AE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-sagedeep px-2.5 py-0.5 rounded-full bg-sagedeep/10">
              {profile?.academic_class || 'Intake Pending'} • {profile?.college || 'Institute of Technology'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Board: {profile?.board_curriculum || 'Pending Intake'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2C3524]">
            {isFirstTime ? `Welcome to VidyaSarthi, ${profile?.name || 'Student'}!` : `Welcome back, ${profile?.name || 'Student'}!`}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isFirstTime
              ? 'Complete your initial curriculum intake below to calibrate your dual-track syllabus, AI timetable, and diagnostic tests.'
              : 'Dual-track academic & skill dashboard. You are on track for upcoming mid-terms.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isFirstTime ? (
            <Button variant="primary" onClick={() => setShowIntakeModal(true)}>
              <Icon name="pencil" className="w-4 h-4 mr-1.5" />
              Complete Intake
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onOpenDailyUpdate}>
                <Icon name="pencil" className="w-4 h-4 mr-1.5" />
                Log Today's Topics
              </Button>
              <Button variant="primary" onClick={() => onOpenPractice()}>
                <Icon name="target" className="w-4 h-4 mr-1.5" />
                Today's Practice Test
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          label="Overall Fit Score (Exam Readiness)"
          value={isFirstTime ? '0%' : `${avgFitScore}%`}
          change={isFirstTime ? 'Intake Pending' : fitBadge.label}
          tone={isFirstTime ? 'amber' : fitBadge.tone}
        />
        <StatBlock
          label="Syllabus Completed"
          value={isFirstTime ? '0%' : `${avgSyllabusProgress}%`}
          change={isFirstTime ? 'No subjects enrolled' : 'Across all enrolled subjects'}
          tone={isFirstTime ? 'amber' : 'default'}
        />
        <StatBlock
          label="Educational Potential Index"
          value={isFirstTime ? '0 / 100' : `${potentialScore} / 100`}
          change={isFirstTime ? 'Pending Assessment' : 'Consistency & remediation effort'}
          tone={isFirstTime ? 'amber' : 'sage'}
        />
        <StatBlock
          label="Daily Progress Rate"
          value={isFirstTime ? '+0.0%/day' : `+${progressRate}%/day`}
          change={isFirstTime ? 'Pending Activity' : 'Target: +1.5%/day'}
          tone={isFirstTime ? 'amber' : 'sage'}
        />
      </div>

      {/* Student Intake Modal */}
      <StudentIntakeModal
        isOpen={showIntakeModal}
        onClose={() => {
          setShowIntakeModal(false);
          setIntakeDismissed(true);
        }}
        onSuccess={() => loadOverview()}
        initialProfile={profile}
      />

      {/* Weak Subject Remediation Alert */}
      {weakInfo && weakInfo.weak_subjects && weakInfo.weak_subjects.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Icon name="alert-triangle" className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-rose-900 text-base">
                    Weak Subject Alert: Focus Required
                  </h3>
                  <Tag tone="rose">{weakInfo.weak_subjects.length} Subjects Identified</Tag>
                </div>
                <p className="text-xs text-rose-800 mt-1 max-w-2xl">
                  {weakInfo.recommendation ||
                    'Based on recent examinations and practice scores, the following subjects need targeted remediation before the next exam.'}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weakInfo.weak_subjects.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200"
                    >
                      {s.subject || s.subject_name || s}: Avg {Math.round(s.score || s.exam_avg || 45)}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-rose-700 hover:bg-rose-800 border-rose-700 text-white shrink-0"
              onClick={() => onOpenPractice(weakInfo.weak_subjects[0]?.subject || weakInfo.weak_subjects[0])}
            >
              Start Weak-Topic Practice Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Dual Column Layout: Today's Plan & Academic Subject Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Integrated Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#2C3524]">
                  Today's Balanced Schedule
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Blended college classes, focused revision, extra learning, and leisure/sports.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onTabChange('schedule')}>
                View Full Timetable →
              </Button>
            </div>

            <div className="space-y-3">
              {schedules.personal.length === 0 && schedules.institute.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                  No schedule items for today. Click "AI Generate Timetable" or add your daily slots.
                </div>
              ) : (
                <>
                  {/* College classes */}
                  {schedules.institute.slice(0, 3).map((item) => (
                    <div
                      key={`inst-${item.id}`}
                      className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {item.start_time || '09:00'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-blue-950">{item.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-bold">
                              {item.schedule_type}
                            </span>
                          </div>
                          <div className="text-xs text-blue-800/80">
                            {item.subject_name} • Venue: {item.venue_or_link || 'Room 102'}
                          </div>
                        </div>
                      </div>
                      <Tag tone="blue">Institute</Tag>
                    </div>
                  ))}

                  {/* Personal and Extracurricular items */}
                  {schedules.personal.slice(0, 4).map((p) => {
                    const isSport =
                      p.activity_type === 'free_time' ||
                      p.title.toLowerCase().includes('cricket') ||
                      p.title.toLowerCase().includes('sport') ||
                      p.title.toLowerCase().includes('gym');
                    const isExtra = p.activity_type === 'extra_learning';
                    const isRevision = p.activity_type === 'revision' || p.activity_type === 'practice';

                    return (
                      <div
                        key={`pers-${p.id}`}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          isSport
                            ? 'border-emerald-200 bg-emerald-50/60'
                            : isExtra
                            ? 'border-purple-200 bg-purple-50/60'
                            : isRevision
                            ? 'border-amber-200 bg-amber-50/60'
                            : 'border-[#E1D6AE] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSport
                                ? 'bg-emerald-100 text-emerald-800'
                                : isExtra
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-[#F2E8CF] text-[#2C3524]'
                            }`}
                          >
                            {p.start_time}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#2C3524]">{p.title}</span>
                              {isSport && <Tag tone="sage">Sports / Free Time</Tag>}
                              {isExtra && <Tag tone="purple">Track 2: Extra Skill</Tag>}
                              {isRevision && <Tag tone="amber">Revision</Tag>}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {p.start_time} - {p.end_time} {p.subject_name ? `• ${p.subject_name}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-sagedeep">Active</div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </Card>

          {/* Quick Learning Pathways Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#2C3524]">
                  Dual-Track Progress Breakdown
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Balancing college requirements with extra personal skills.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onTabChange('pathways')}>
                Explore Roadmaps →
              </Button>
            </div>

            <div className="space-y-4">
              {syllabusList.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-[#E1D6AE] bg-white">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5">
                    <Icon name="compass" className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#2C3524]">No Subjects Enrolled Yet</h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
                    Complete your curriculum intake to populate your core academic subjects, dual-track roadmaps, and diagnostic tests.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setShowIntakeModal(true)}>
                    Start Curriculum Intake →
                  </Button>
                </div>
              ) : (
                syllabusList.slice(0, 4).map((s) => {
                  const badge = getFitBadge(s.exam_readiness_score || 0);
                  return (
                    <div key={s.id} className="p-3.5 rounded-xl border border-[#E1D6AE] bg-[#F2E8CF]/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-semibold text-sm text-[#2C3524]">{s.subject_name}</div>
                        <div className="flex items-center gap-2">
                          <Tag tone={badge.tone}>Fit: {s.exam_readiness_score}%</Tag>
                          <span className="text-xs font-semibold text-[#2C3524]">
                            {s.completed_percentage}% Covered
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={s.completed_percentage} max={100} />
                      <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-muted)]">
                        <span>Practice Avg: {s.practice_avg_score || 0}%</span>
                        <span>College Exam Avg: {s.exam_avg_score || 0}%</span>
                        <button
                          onClick={() => onOpenDiagnostic(s.subject_name)}
                          className="text-sagedeep font-semibold hover:underline"
                        >
                          Recalibrate Pathway →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Quick Access & Mentoring */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-5">
            <h4 className="font-display font-semibold text-base mb-3 text-[#2C3524]">
              Study Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenDailyUpdate}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Daily Syllabus Update</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Log topics finished today</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">+</span>
              </button>

              <button
                onClick={() => onTabChange('schedule')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Icon name="calendar" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">AI Timetable Adjuster</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Add sports/hobbies without conflict</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>

              <button
                onClick={() => onTabChange('mentoring')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Icon name="message" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Ask College Faculty</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Clear academic doubts</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>

              <button
                onClick={() => onTabChange('research')}
                className="w-full text-left p-3 rounded-xl border border-[#E1D6AE] bg-white hover:bg-black/5 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Icon name="book" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3524]">Research Papers</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Engage with university researchers</div>
                  </div>
                </div>
                <span className="text-xs text-sagedeep font-bold">→</span>
              </button>
            </div>
          </Card>

          {/* Educational Potential Index Card */}
          <Card className="p-5 bg-gradient-to-br from-white to-[#F2E8CF]/40 border border-[#E1D6AE]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase text-sagedeep tracking-wider">
                Potential & Effort Index
              </span>
              <span className="text-xl font-bold font-display text-sagedeep">{potentialScore}/100</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-3 leading-relaxed">
              Deterministically calculated: <strong>30%</strong> Syllabus Completion + <strong>35%</strong> Quiz/Diagnostic Accuracy + <strong>20%</strong> Study Consistency + <strong>15%</strong> Track 2 Skill Effort.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#2C3524]">
                <span>Avg Assessment Accuracy</span>
                <span className="font-semibold text-sagedeep">
                  {metricsBreakdown?.avg_assessment_score ?? 0}%
                </span>
              </div>
              <div className="flex justify-between text-[#2C3524]">
                <span>Active Study Log Days</span>
                <span className="font-semibold text-emerald-700">
                  {metricsBreakdown?.streak_days ?? 0} {metricsBreakdown?.streak_days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div className="flex justify-between text-[#2C3524]">
                <span>Daily Syllabus Pace</span>
                <span className="font-semibold text-sagedeep">+{progressRate}%/day</span>
              </div>
              <div className="flex justify-between text-[#2C3524]">
                <span>Track 2 Extra Hours Logged</span>
                <span className="font-semibold text-purple-700">
                  {metricsBreakdown?.extra_hours_logged ?? 0} hrs
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. DUAL-TRACK LEARNING & ADAPTIVE PATHWAYS
// =========================================================================

const TopicDeepDiveModal: React.FC<{
  topic: PathwayTopic | null;
  subjectName: string;
  onClose: () => void;
  onStatusChange: (status: 'mastered' | 'needs_revision' | 'in_progress') => void;
}> = ({ topic, subjectName, onClose, onStatusChange }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (!topic) return null;

  const sampleQuiz = [
    {
      q: `What is the core significance of ${topic.title} in engineering and scientific computation?`,
      options: {
        A: 'It establishes mathematical convergence, boundary conditions, and continuous modeling',
        B: 'It replaces all algorithmic computation with hardcoded heuristics',
        C: 'It only operates on static data formats',
        D: 'It prevents any numerical optimization'
      },
      ans: 'A',
      explanation: 'Foundational principles provide the rigorous boundary conditions and derivatives required for reliable computer simulations, AI models, and real-world engineering.'
    },
    {
      q: `How does "${topic.key_concept || 'the governing equation'}" translate to practical implementation?`,
      options: {
        A: 'It maps rates of change, spatial coordinate transformation, or state transitions into computable steps',
        B: 'It can only be solved manually on paper without computers',
        C: 'It has no connection to modern software systems',
        D: 'It ignores energy and resource conservation laws'
      },
      ans: 'A',
      explanation: 'The analytical mathematical formulation directly translates into GPU shaders, gradient backpropagation, RLC circuit transient analysis, or database query trees.'
    }
  ];

  const handleSelect = (qIdx: number, optKey: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optKey }));
  };

  return (
    <Modal title={`Milestone Laboratory: ${topic.title}`} onClose={onClose}>
      <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sagedeep/10 text-sagedeep font-bold uppercase text-[10px]">
              {subjectName}
            </span>
            <Tag tone="blue">Level: {topic.difficulty || 'Core'}</Tag>
            <Tag tone="purple">{topic.est_hours || 4} Hours</Tag>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)] font-medium">Status:</span>
            <span className="font-bold text-[#2C3524] capitalize">{topic.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* 1. Key Concept & Formula Box */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
            <span>∑</span> Core Mathematical Law & Governing Equation
          </div>
          <div className="p-3 rounded-lg bg-white border border-emerald-200 font-mono text-xs text-emerald-900 overflow-x-auto shadow-inner">
            {topic.key_concept || 'f(x) = lim_{h->0} [f(x+h) - f(x)] / h'}
          </div>
          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
            {topic.summary || 'Fundamental analytical formulation governing rates of change, spatial transformation, and cumulative convergence.'}
          </p>
        </div>

        {/* 2. Real-World Engineering & Computer Science Application */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-950 font-bold text-xs uppercase tracking-wider">
            <span>🚀</span> Practical Industry Application
          </div>
          <p className="text-xs text-blue-900 font-medium">
            {topic.real_world_app || 'Used in Machine Learning loss optimization, 3D graphics rendering, and embedded control systems.'}
          </p>
        </div>

        {/* 3. Interactive Self-Assessment Mini-Quiz */}
        <div className="p-4 rounded-xl bg-[#F2E8CF]/40 border border-[#E1D6AE] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2C3524] text-xs uppercase tracking-wider">
              Interactive Milestone Verification Quiz
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">2 Questions</span>
          </div>

          <div className="space-y-3">
            {sampleQuiz.map((qItem, qIdx) => (
              <div key={qIdx} className="p-3 rounded-xl bg-white border border-[#E1D6AE] space-y-2">
                <div className="font-semibold text-[#2C3524]">{qIdx + 1}. {qItem.q}</div>
                <div className="space-y-1.5">
                  {Object.entries(qItem.options).map(([k, val]) => {
                    const isSelected = selectedAnswers[qIdx] === k;
                    const isCorrect = k === qItem.ans;
                    let btnStyle = 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5';
                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      else if (isSelected && !isCorrect) btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                    } else if (isSelected) {
                      btnStyle = 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold';
                    }

                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelect(qIdx, k)}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center gap-2 ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-black/5">
                          {k}
                        </span>
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-[var(--text-muted)]">
                    💡 <strong>Explanation:</strong> {qItem.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            {!quizSubmitted ? (
              <Button
                size="sm"
                variant="primary"
                disabled={Object.keys(selectedAnswers).length < sampleQuiz.length}
                onClick={() => setQuizSubmitted(true)}
              >
                Verify Answers
              </Button>
            ) : (
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                ✓ Quiz Completed! Great job practicing this milestone.
              </span>
            )}
          </div>
        </div>

        {/* 4. Mastery Action Buttons */}
        <div className="pt-3 border-t border-[#E1D6AE] flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)]">Update Milestone Progress:</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onStatusChange('needs_revision');
                onClose();
              }}
            >
              ⚠️ Needs Revision
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onStatusChange('in_progress');
                onClose();
              }}
            >
              ⏳ In Progress
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onStatusChange('mastered');
                onClose();
              }}
            >
              ✓ Mark Mastered
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const StudentPathwaysView: React.FC<{
  initialSubject?: string | null;
  onOpenDiagnostic: (subject: string) => void;
}> = ({ initialSubject, onOpenDiagnostic }) => {
  const [activeTrack, setActiveTrack] = useState<'academic' | 'additional'>('academic');
  const [pathways, setPathways] = useState<LearningPathway[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTopicModal, setActiveTopicModal] = useState<PathwayTopic | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPathways = async () => {
      try {
        const res = await studentApi.getPathways();
        if (isMounted && res?.pathways) {
          setPathways(res.pathways);
          if (res.pathways.length > 0) {
            if (initialSubject) {
              const match = res.pathways.find(
                (p) =>
                  p.subject_name.toLowerCase().includes(initialSubject.toLowerCase()) ||
                  initialSubject.toLowerCase().includes(p.subject_name.toLowerCase())
              );
              if (match) {
                setActiveTrack(match.pathway_type || 'academic');
                setSelectedSubject(match.subject_name);
                return;
              }
            }
            setSelectedSubject(res.pathways[0].subject_name);
          }
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPathways();
    return () => { isMounted = false; };
  }, [initialSubject]);

  useEffect(() => {
    if (!initialSubject || pathways.length === 0) return;
    const match = pathways.find(
      (p) =>
        p.subject_name.toLowerCase().includes(initialSubject.toLowerCase()) ||
        initialSubject.toLowerCase().includes(p.subject_name.toLowerCase())
    );
    if (match) {
      setActiveTrack(match.pathway_type || 'academic');
      setSelectedSubject(match.subject_name);
    }
  }, [initialSubject, pathways]);

  const filteredPathways = pathways.filter((p) => p.pathway_type === activeTrack);
  const currentPathway = filteredPathways.find((p) => p.subject_name === selectedSubject) || filteredPathways[0];

  const handleTopicStatusChange = async (topicId: string, currentStatus: string) => {
    if (!currentPathway) return;
    const newStatus =
      currentStatus === 'mastered'
        ? 'needs_revision'
        : currentStatus === 'needs_revision'
        ? 'in_progress'
        : 'mastered';

    try {
      await studentApi.updateTopicStatus(currentPathway.subject_name, topicId, newStatus);
      setPathways((prev) =>
        prev.map((p) => {
          if (p.subject_name === currentPathway.subject_name) {
            return {
              ...p,
              topics: p.topics.map((t) => (t.id === topicId ? { ...t, status: newStatus as any } : t))
            };
          }
          return p;
        })
      );
    } catch {
      alert('Could not update topic status.');
    }
  };

  const handleModalStatusChange = async (newStatus: 'mastered' | 'needs_revision' | 'in_progress') => {
    if (!currentPathway || !activeTopicModal) return;
    try {
      await studentApi.updateTopicStatus(currentPathway.subject_name, activeTopicModal.id, newStatus);
      setPathways((prev) =>
        prev.map((p) => {
          if (p.subject_name === currentPathway.subject_name) {
            return {
              ...p,
              topics: p.topics.map((t) => (t.id === activeTopicModal.id ? { ...t, status: newStatus } : t))
            };
          }
          return p;
        })
      );
    } catch {
      alert('Could not update topic status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mastered':
        return <Tag tone="sage">Mastered ✓</Tag>;
      case 'in_progress':
        return <Tag tone="amber">In Progress</Tag>;
      case 'needs_revision':
        return <Tag tone="rose">Needs Revision ⚠️</Tag>;
      case 'next':
        return <Tag tone="blue">Recommended Next</Tag>;
      default:
        return <Tag tone="default">Pending</Tag>;
    }
  };

  // Progression metrics
  const totalTopics = currentPathway?.topics?.length || 0;
  const masteredCount = currentPathway?.topics?.filter((t) => t.status === 'mastered').length || 0;
  const inProgressCount = currentPathway?.topics?.filter((t) => t.status === 'in_progress').length || 0;
  const revisionCount = currentPathway?.topics?.filter((t) => t.status === 'needs_revision').length || 0;
  const progressPct = totalTopics ? Math.round((masteredCount / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dual-Track Adaptive Learning Pathways"
        desc="Dynamically sequenced curricula calibrated through diagnostic tests, formula breakdowns, and real-world applications."
        action={
          <div className="flex gap-2">
            {currentPathway && (
              <Button variant="outline" onClick={() => onOpenDiagnostic(currentPathway.subject_name)}>
                <Icon name="target" className="w-4 h-4 mr-1.5" />
                Retake Diagnostic Test
              </Button>
            )}
          </div>
        }
      />

      {/* Track Selection Switcher */}
      <div className="flex border-b border-[#E1D6AE] gap-4">
        <button
          onClick={() => {
            setActiveTrack('academic');
            const match = pathways.find((p) => p.pathway_type === 'academic');
            if (match) setSelectedSubject(match.subject_name);
          }}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTrack === 'academic'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          Track 1: College / School Syllabus
        </button>

        <button
          onClick={() => {
            setActiveTrack('additional');
            const match = pathways.find((p) => p.pathway_type === 'additional');
            if (match) setSelectedSubject(match.subject_name);
          }}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTrack === 'additional'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          Track 2: Extra Subjects & Emerging Skills
        </button>
      </div>

      {/* Subject Pills */}
      <div className="flex flex-wrap gap-2">
        {filteredPathways.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedSubject(p.subject_name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              selectedSubject === p.subject_name
                ? 'bg-sagedeep text-pcream border-sagedeep shadow-sm'
                : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/50'
            }`}
          >
            {p.subject_name} ({p.current_level || 'Intermediate'})
          </button>
        ))}
      </div>

      {currentPathway ? (
        <div className="space-y-6">
          {/* Pathway Header Info */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-xl text-[#2C3524]">
                    {currentPathway.subject_name}
                  </h3>
                  <Tag tone={activeTrack === 'academic' ? 'sage' : 'purple'}>
                    {activeTrack === 'academic' ? 'Core Curriculum' : 'Extra Elective'}
                  </Tag>
                  <Tag tone="blue">Level: {currentPathway.current_level}</Tag>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Estimated Total Hours: {currentPathway.estimated_hours} hrs • Recommended Sequence: {currentPathway.recommended_sequence}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenDiagnostic(currentPathway.subject_name)}
                >
                  Diagnostic Assessment
                </Button>
              </div>
            </div>

            {/* Pathway Progress Bar & Stats */}
            <div className="mt-4 pt-4 border-t border-[#E1D6AE]/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2C3524]">
                  Pathway Competency: {progressPct}% Mastered ({masteredCount} of {totalTopics} Milestones)
                </span>
                <div className="flex items-center gap-2">
                  {inProgressCount > 0 && <span className="text-amber-700 font-semibold">{inProgressCount} In Progress</span>}
                  {revisionCount > 0 && <span className="text-rose-700 font-semibold">{revisionCount} Needs Revision</span>}
                </div>
              </div>
              <ProgressBar value={progressPct} max={100} />
            </div>
          </Card>

          {/* Interactive Topic Roadmap Nodes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-base text-[#2C3524]">
                Calibrated Milestones & Competency Nodes
              </h4>
              <span className="text-xs text-[var(--text-muted)]">
                Click any milestone to launch formula proofs, deep-dive intuition & mini-quizzes
              </span>
            </div>

            <div className="grid gap-3">
              {currentPathway.topics.map((t, index) => (
                <div
                  key={t.id || index}
                  className="bg-white rounded-xl border border-[#E1D6AE] p-4 space-y-3 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          t.status === 'mastered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'needs_revision'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-[#F2E8CF] text-sagedeep'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#2C3524]">{t.title}</span>
                          {getStatusBadge(t.status)}
                          <Tag tone="blue">{t.difficulty || 'Core'}</Tag>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {t.est_hours || 3} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setActiveTopicModal(t)}
                      >
                        🔬 Deep-Dive & Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleTopicStatusChange(t.id, t.status)}
                      >
                        {t.status === 'mastered'
                          ? 'Flag Revision ⚠️'
                          : t.status === 'needs_revision'
                          ? 'Set In Progress'
                          : 'Mark Mastered ✓'}
                      </Button>
                    </div>
                  </div>

                  {/* Key Concept / Mathematical Law Box */}
                  {t.key_concept && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex items-start gap-2">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 font-bold shrink-0 mt-0.5">
                        Formula / Law
                      </span>
                      <span className="font-mono text-emerald-900 font-medium overflow-x-auto">{t.key_concept}</span>
                    </div>
                  )}

                  {/* Real World Application Box */}
                  {t.real_world_app && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-2">
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-200 text-blue-950 font-bold shrink-0 mt-0.5">
                        Industry App
                      </span>
                      <span className="text-blue-900">{t.real_world_app}</span>
                    </div>
                  )}

                  {/* Summary */}
                  {t.summary && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-1">
                      {t.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deep-Dive Modal */}
          {activeTopicModal && (
            <TopicDeepDiveModal
              topic={activeTopicModal}
              subjectName={currentPathway.subject_name}
              onClose={() => setActiveTopicModal(null)}
              onStatusChange={(newStatus) => handleModalStatusChange(newStatus)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          title="No Pathways Available"
          desc="Complete your profile onboarding to generate your customized dual-track learning pathways."
        />
      )}
    </div>
  );
};

// =========================================================================
// 3. DIAGNOSTIC ASSESSMENT MODAL
// =========================================================================

export const DiagnosticModal: React.FC<{
  subject: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}> = ({ subject, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchQ = async () => {
      try {
        const res = await studentApi.getDiagnosticQuestions(subject);
        if (isMounted && res?.questions) {
          setQuestions(res.questions);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQ();
    return () => { isMounted = false; };
  }, [subject]);

  const handleSelectOption = (key: string) => {
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id || currentIdx]: key }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.submitDiagnosticTest(subject, answers);
      setResult(res);
      onSuccess(res);
    } catch {
      alert('Error submitting diagnostic test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal title={`Diagnostic Test: ${subject}`} onClose={onClose}>
        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
          Generating personalized diagnostic questions...
        </div>
      </Modal>
    );
  }

  if (result) {
    return (
      <Modal title={`Diagnostic Assessment Result: ${subject}`} onClose={onClose}>
        <div className="space-y-5 p-2">
          <div className="p-4 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-center">
            <span className="text-xs uppercase font-bold text-sagedeep tracking-wider">Assessed Knowledge Level</span>
            <div className="text-2xl font-bold font-display text-sagedeep mt-1">
              {result.knowledge_level} ({result.score}%)
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Your adaptive pathway for {subject} has been re-indexed.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase">Mastered Topics</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(result.topics_mastered || []).map((t: string, idx: number) => (
                  <Tag key={idx} tone="sage">{t}</Tag>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-rose-800 uppercase">Topics Requiring Revision</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(result.topics_needs_improvement || []).map((t: string, idx: number) => (
                  <Tag key={idx} tone="rose">{t}</Tag>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#E1D6AE]">
            <Button
              variant="primary"
              className="bg-sagedeep text-pcream hover:bg-sagedeep/90 font-bold"
              onClick={() => {
                onSuccess({ subject, ...result });
                onClose();
              }}
            >
              Suggest Roadmaps & View Pathway →
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIdx];
  const selectedKey = answers[q?.id || currentIdx];

  return (
    <Modal title={`Diagnostic Assessment: ${subject}`} onClose={onClose}>
      <div className="space-y-5 p-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <Tag tone="blue">Level: {q?.level || 'Intermediate'}</Tag>
        </div>

        <ProgressBar value={currentIdx + 1} max={questions.length} />

        {q && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#2C3524] leading-relaxed">
              {q.question_text}
            </div>

            <div className="space-y-2">
              {Object.entries(q.options || {}).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                    selectedKey === key
                      ? 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold'
                      : 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selectedKey === key ? 'bg-sagedeep text-pcream' : 'bg-black/5 text-[#2C3524]'
                  }`}>
                    {key}
                  </span>
                  <span>{String(text)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              disabled={!selectedKey}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!selectedKey || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit Diagnostic'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// =========================================================================
// 4. SYLLABUS PROGRESS & FIT SCORE (EXAM READINESS)
// =========================================================================

export const StudentSyllabusView: React.FC<{
  onOpenDailyUpdate: () => void;
  onOpenDiagnostic: (subject: string) => void;
  onOpenReportGap: () => void;
}> = ({ onOpenDailyUpdate, onOpenDiagnostic, onOpenReportGap }) => {
  const [syllabusList, setSyllabusList] = useState<SyllabusProgressItem[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailySyllabusUpdate[]>([]);
  const [potentialScore, setPotentialScore] = useState<number>(0);
  const [progressRate, setProgressRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSyllabus = async () => {
      try {
        const res = await studentApi.getSyllabus();
        if (isMounted && res) {
          setSyllabusList(res.syllabus_progress || []);
          setDailyUpdates(res.daily_updates || []);
          if (res.potential_score !== undefined) setPotentialScore(res.potential_score);
          if (res.syllabus_progress_rate !== undefined) setProgressRate(res.syllabus_progress_rate);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSyllabus();
    return () => { isMounted = false; };
  }, []);

  const getFitBadge = (score: number) => {
    if (score >= 90) return { label: 'High Mastery', tone: 'sage' as const };
    if (score >= 75) return { label: 'Exam Ready', tone: 'sage' as const };
    if (score >= 50) return { label: 'Moderate Prep', tone: 'amber' as const };
    return { label: 'At Risk', tone: 'rose' as const };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus Progress & Fit Score (Exam Readiness)"
        desc="Transparent calculation of exam preparedness: syllabus coverage, historical performance, practice accuracy, and revision pace."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onOpenReportGap}>
              Report Knowledge Gap
            </Button>
            <Button variant="primary" onClick={onOpenDailyUpdate}>
              + Log Daily Syllabus Update
            </Button>
          </div>
        }
      />

      {/* Fit Score & Potential Index Formula Explainer Banner */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E1D6AE] text-xs text-[var(--text-muted)] space-y-1">
          <div className="font-semibold text-[#2C3524] text-sm">
            How is your Fit Score (Exam Readiness) calculated?
          </div>
          <p>
            Fit Score = <strong>35%</strong> Syllabus Coverage + <strong>25%</strong> Exam Average + <strong>20%</strong> Practice Test Score + <strong>20%</strong> Study & Revision Consistency.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E1D6AE] text-xs text-[var(--text-muted)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#2C3524] text-sm">
              Potential Index ({potentialScore}/100) & Daily Rate (+{progressRate}%/day)
            </span>
          </div>
          <p>
            Potential = <strong>30%</strong> Avg Syllabus Covered + <strong>35%</strong> Quiz/Diagnostic Accuracy + <strong>20%</strong> Active Log Days + <strong>15%</strong> Track 2 Skill Hours.
          </p>
        </div>
      </div>

      {/* Subject by Subject Fit Score & Progress Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#E1D6AE] flex items-center justify-between">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Enrolled Academic Subjects
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Daily updates automatically recalibrate your readiness
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2E8CF]/50 text-[#2C3524] border-b border-[#E1D6AE] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Syllabus Covered</th>
                <th className="py-3 px-4">Fit Score (Readiness)</th>
                <th className="py-3 px-4">Practice Avg</th>
                <th className="py-3 px-4">Exam Avg</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1D6AE]">
              {syllabusList.map((s) => {
                const badge = getFitBadge(s.exam_readiness_score);
                return (
                  <tr key={s.id} className="hover:bg-white/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#2C3524]">
                      {s.subject_name}
                      {s.is_weak_subject ? (
                        <span className="ml-2 text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                          Weak Subject
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{s.completed_topics}/{s.total_topics} topics</span>
                          <span className="font-bold">{s.completed_percentage}%</span>
                        </div>
                        <ProgressBar value={s.completed_percentage} max={100} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-sagedeep">{s.exam_readiness_score}%</span>
                        <Tag tone={badge.tone}>{badge.label}</Tag>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{s.practice_avg_score || 0}%</td>
                    <td className="py-3.5 px-4 font-medium">{s.exam_avg_score || 0}%</td>
                    <td className="py-3.5 px-4">
                      {s.exam_readiness_score >= 75 ? (
                        <span className="text-emerald-700 font-semibold">Ready for Exam</span>
                      ) : (
                        <span className="text-amber-800 font-semibold">Needs Revision</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenDiagnostic(s.subject_name)}
                        className="text-sagedeep font-semibold hover:underline"
                      >
                        Recalibrate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily Progress Updates History */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">
          Recent Daily Syllabus Log History
        </h3>
        {dailyUpdates.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] py-4 text-center">
            No daily updates logged yet. Use the "Log Daily Syllabus Update" button to record today's study.
          </div>
        ) : (
          <div className="space-y-3">
            {dailyUpdates.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl border border-[#E1D6AE] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C3524]">{u.subject_name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Logged: {u.log_date}</span>
                  </div>
                  <div className="text-[var(--text-muted)] mt-1">
                    <strong>Topics completed:</strong> {u.completed_topics || 'None'}
                    {u.revision_topics && (
                      <span className="ml-2">
                        • <strong>Revision:</strong> {u.revision_topics}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-1 rounded bg-black/5 font-semibold text-[#2C3524]">
                    ⏱️ {u.study_minutes} mins
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold">
                    🎯 {u.practice_count} questions
                  </span>
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
// 5. DAILY SYLLABUS UPDATE MODAL
// =========================================================================

export const DailySyllabusModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subjectOptions, setSubjectOptions] = useState<string[]>([
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Mathematics',
    'Physics',
    'Python Programming',
    'Artificial Intelligence',
    'Web Development'
  ]);
  const [subjectName, setSubjectName] = useState('Data Structures & Algorithms');
  const [completedTopics, setCompletedTopics] = useState('');
  const [revisionTopics, setRevisionTopics] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [practiceCount, setPracticeCount] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentApi.getSyllabus().then((res) => {
      if (res?.syllabus_progress && res.syllabus_progress.length > 0) {
        const enrolled = res.syllabus_progress.map((s: any) => s.subject_name);
        const merged = Array.from(new Set([...enrolled, ...subjectOptions]));
        setSubjectOptions(merged);
        setSubjectName(enrolled[0]);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.addDailyUpdate({
        subject_name: subjectName,
        completed_topics: completedTopics,
        revision_topics: revisionTopics,
        study_minutes: Number(studyMinutes),
        practice_count: Number(practiceCount),
        notes
      });
      onSuccess();
      onClose();
    } catch {
      alert('Could not submit daily update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Log Today's Syllabus Progress" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          >
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Topics Completed Today (comma-separated)
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Red-Black Trees, Binary Search Tree Deletion"
            value={completedTopics}
            onChange={(e) => setCompletedTopics(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Topics Revised Today (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Linked List Reversal, Stack Applications"
            value={revisionTopics}
            onChange={(e) => setRevisionTopics(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Study Duration (Minutes)</label>
            <input
              type="number"
              min={10}
              max={600}
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Practice Questions Solved</label>
            <input
              type="number"
              min={0}
              max={100}
              value={practiceCount}
              onChange={(e) => setPracticeCount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Notes / Insights</label>
          <textarea
            rows={2}
            placeholder="Any specific doubts or concepts that were challenging?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Syllabus Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 6. AI-ASSISTED FLEXIBLE SCHEDULE & TIME TRACKING
// =========================================================================

export const StudentScheduleView: React.FC = () => {
  const [personalItems, setPersonalItems] = useState<PersonalScheduleItem[]>([]);
  const [instituteItems, setInstituteItems] = useState<InstituteScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showExtraTimeModal, setShowExtraTimeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const res = await studentApi.getSchedules();
      if (res) {
        setPersonalItems(res.personal_schedules || []);
        setInstituteItems(res.institute_schedules || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredPersonal = personalItems.filter((p) => p.day_of_week === selectedDay);

  const handleDeleteItem = async (id: number) => {
    try {
      await studentApi.deletePersonalScheduleItem(id);
      setPersonalItems((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Could not delete schedule item.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI-Assisted Flexible Schedule"
        desc="Integrate college schedule with personal learning. Dynamically adjusts study slots when you add hobbies or sports (e.g. Cricket 4:30 - 5:30 PM)."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowExtraTimeModal(true)}>
              ⏱️ Log Track 2 Skill Time
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              + Add Custom Routine Slot
            </Button>
            <Button variant="primary" onClick={() => setShowAIModal(true)}>
              ⚡ AI Auto-Balance Routine
            </Button>
          </div>
        }
      />

      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition border ${
              selectedDay === d
                ? 'bg-sagedeep text-pcream border-sagedeep'
                : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: College Scheduled Classes & Exams */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-base text-[#2C3524]">
                Institute Official Schedule
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Synced directly from faculty</p>
            </div>
            <Tag tone="blue">Institute Synchronized</Tag>
          </div>

          <div className="space-y-3">
            {instituteItems.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-6 text-center">
                No official classes scheduled for this period.
              </div>
            ) : (
              instituteItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                      {item.start_time}
                    </div>
                    <div>
                      <div className="font-bold text-blue-950 text-sm">{item.title}</div>
                      <div className="text-[var(--text-muted)]">
                        {item.subject_name} • {item.venue_or_link}
                      </div>
                    </div>
                  </div>
                  <Tag tone="blue">{item.schedule_type}</Tag>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Personal Routine & Extracurriculars */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-base text-[#2C3524]">
                Personal Learning & Leisure Slots ({selectedDay})
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Your personalized routine</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
              + Add Slot
            </Button>
          </div>

          <div className="space-y-3">
            {filteredPersonal.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-6 text-center">
                No personal slots set for {selectedDay}. Click "+ Add Slot" or "AI Auto-Balance Routine".
              </div>
            ) : (
              filteredPersonal.map((p) => {
                const isSport =
                  p.activity_type === 'free_time' ||
                  p.title.toLowerCase().includes('cricket') ||
                  p.title.toLowerCase().includes('sport') ||
                  p.title.toLowerCase().includes('gym');
                const isExtra = p.activity_type === 'extra_learning';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                      isSport
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : isExtra
                        ? 'border-purple-200 bg-purple-50/50'
                        : 'border-[#E1D6AE] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          isSport
                            ? 'bg-emerald-100 text-emerald-800'
                            : isExtra
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-[#F2E8CF] text-sagedeep'
                        }`}
                      >
                        {p.start_time}
                      </div>
                      <div>
                        <div className="font-bold text-[#2C3524] text-sm">{p.title}</div>
                        <div className="text-[var(--text-muted)]">
                          {p.start_time} - {p.end_time} {p.subject_name ? `• ${p.subject_name}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSport && <Tag tone="sage">Sports / Leisure</Tag>}
                      {isExtra && <Tag tone="purple">Extra Skill</Tag>}
                      <button
                        onClick={() => handleDeleteItem(p.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold p-1 text-xs"
                        title="Remove slot"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Add Custom Slot Modal */}
      {showAddModal && (
        <AddScheduleSlotModal
          dayOfWeek={selectedDay}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowAddModal(false);
          }}
        />
      )}

      {/* AI Timetable Generator Modal */}
      {showAIModal && (
        <AITimetableModal
          onClose={() => setShowAIModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowAIModal(false);
          }}
        />
      )}

      {/* Track Extra Learning Time Modal */}
      {showExtraTimeModal && (
        <TrackExtraTimeModal
          onClose={() => setShowExtraTimeModal(false)}
          onSuccess={() => {
            fetchSchedule();
            setShowExtraTimeModal(false);
          }}
        />
      )}
    </div>
  );
};

// Modal to Add Custom Routine Slot (including sports like cricket)
const AddScheduleSlotModal: React.FC<{
  dayOfWeek: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ dayOfWeek, onClose, onSuccess }) => {
  const [title, setTitle] = useState('Cricket Practice & Fitness');
  const [activityType, setActivityType] = useState('free_time');
  const [subjectName, setSubjectName] = useState('');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('17:30');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.addPersonalScheduleItem({
        title,
        activity_type: activityType as any,
        subject_name: subjectName,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime
      });
      onSuccess();
    } catch {
      alert('Could not add schedule slot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Add Routine Slot for ${dayOfWeek}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Activity Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Cricket 4:30 - 5:30 PM / Web Development"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            >
              <option value="free_time">Sports / Extracurricular / Free Time</option>
              <option value="extra_learning">Track 2: Extra Skill Learning</option>
              <option value="revision">Subject Revision</option>
              <option value="practice">Targeted Practice Test</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Subject (optional)</label>
            <input
              type="text"
              placeholder="e.g. Algorithms or AI"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C3524] mb-1">End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Slot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal for AI Auto-Balancing Routine
const AITimetableModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [freeTimePreference, setFreeTimePreference] = useState('Cricket practice 4:30 PM to 5:30 PM daily');
  const [dailyHours, setDailyHours] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = async () => {
    setSubmitting(true);
    try {
      await studentApi.aiGenerateTimetable({
        free_time_preference: freeTimePreference,
        daily_available_hours: dailyHours
      });
      alert('AI Timetable generated and synchronized around your extracurricular preferences!');
      onSuccess();
    } catch {
      alert('Could not generate timetable.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="AI-Assisted Timetable Generator" onClose={onClose}>
      <div className="space-y-4 text-xs p-2">
        <p className="text-[var(--text-muted)]">
          The AI will schedule revision for your weak subjects, syllabus completion, and extra skill learning <strong>without conflicting with your college classes or your personal sports and free time</strong>.
        </p>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Specify Your Sports / Personal Free Time
          </label>
          <input
            type="text"
            value={freeTimePreference}
            onChange={(e) => setFreeTimePreference(e.target.value)}
            placeholder="e.g., Cricket 4:30 PM - 5:30 PM, Gym 6:00 AM - 7:00 AM"
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">
            Daily Available Study Hours
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={dailyHours}
            onChange={(e) => setDailyHours(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate} disabled={submitting}>
            {submitting ? 'Generating...' : '⚡ Generate Balanced Schedule'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Modal for Tracking Extra Learning Time (Track 2)
const TrackExtraTimeModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [skill, setSkill] = useState('Full Stack Web Dev (React & Node)');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.trackExtraTime({
        skill_or_subject: skill,
        duration_minutes: Number(duration),
        notes
      });
      alert('Track 2 Extra Learning session logged!');
      onSuccess();
    } catch {
      alert('Could not log extra learning time.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Log Track 2 Extra Skill Learning" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <p className="text-[var(--text-muted)]">
          Record time spent developing skills beyond your college syllabus. This boosts your Educational Potential Index without causing academic burnout.
        </p>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Skill / Elective</label>
          <input
            type="text"
            required
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g., Deep Learning, UI/UX Design, Cloud Architecture"
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Duration (Minutes)</label>
          <input
            type="number"
            min={15}
            max={360}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Progress Notes / Milestones</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Built authentication flow, solved 2 algorithmic challenges, etc."
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Record Extra Learning Time'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 7. WEAK-SUBJECT DETECTION & TARGETED PRACTICE TESTS
// =========================================================================

export const StudentPracticeView: React.FC<{
  onStartQuiz: (subject?: string) => void;
}> = ({ onStartQuiz }) => {
  const [weakInfo, setWeakInfo] = useState<{ weak_subjects: any[]; recommendation: string } | null>(null);
  const [practiceVsExam, setPracticeVsExam] = useState<{
    practice_history: PracticeTestRecord[];
    exam_history: any[];
    comparison_summary: any[];
  }>({
    practice_history: [],
    exam_history: [],
    comparison_summary: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPracticeData = async () => {
      try {
        const [wRes, pveRes] = await Promise.allSettled([
          studentApi.getWeakSubjects(),
          studentApi.getPracticeVsExam()
        ]);

        if (!isMounted) return;
        if (wRes.status === 'fulfilled' && wRes.value) {
          setWeakInfo(wRes.value);
        }
        if (pveRes.status === 'fulfilled' && pveRes.value) {
          setPracticeVsExam({
            practice_history: pveRes.value.practice_history || [],
            exam_history: pveRes.value.exam_history || [],
            comparison_summary: pveRes.value.comparison_summary || []
          });
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPracticeData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weak-Subject Remediation & Practice Tests"
        desc="Daily diagnostic practice tests automatically targeted at topics with low exam scores to lift academic readiness."
        action={
          <Button variant="primary" onClick={() => onStartQuiz()}>
            <Icon name="target" className="w-4 h-4 mr-1.5" />
            Take Today's Practice Test
          </Button>
        }
      />

      {/* Weak Subject Detection Banner */}
      {weakInfo && weakInfo.weak_subjects && weakInfo.weak_subjects.length > 0 && (
        <Card className="p-6 bg-rose-50/70 border-rose-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <h3 className="font-display font-bold text-rose-950 text-base">
                  Active Weak-Subject Alerts
                </h3>
              </div>
              <p className="text-xs text-rose-900 mt-1 max-w-2xl">
                {weakInfo.recommendation || 'Remediation is recommended in the following subjects before next examination.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {weakInfo.weak_subjects.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-xs"
                  >
                    {s.subject || s.subject_name || s}: Avg {Math.round(s.score || s.exam_avg || 45)}%
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-rose-700 hover:bg-rose-800 border-rose-700 text-white shrink-0"
              onClick={() => onStartQuiz(weakInfo.weak_subjects[0]?.subject || weakInfo.weak_subjects[0])}
            >
              Start 10-Question Targeted Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* Practice vs. Real Exam Performance Correlation */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#E1D6AE] flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-[#2C3524]">
              Practice vs. Real Exam Performance Correlation
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Verifies if daily practice tests are successfully translating into higher college exam marks.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2E8CF]/50 text-[#2C3524] border-b border-[#E1D6AE] uppercase font-semibold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Practice Average</th>
                <th className="py-3 px-4">Official Exam Marks</th>
                <th className="py-3 px-4">Variance / Gain</th>
                <th className="py-3 px-4">Readiness Verdict</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1D6AE]">
              {practiceVsExam.comparison_summary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                    No comparison data available yet. Complete a practice quiz to view correlation.
                  </td>
                </tr>
              ) : (
                practiceVsExam.comparison_summary.map((row, idx) => {
                  const gain = Math.round(row.practice_avg - row.exam_avg);
                  return (
                    <tr key={idx} className="hover:bg-white/60 transition">
                      <td className="py-3 px-4 font-bold text-[#2C3524]">{row.subject}</td>
                      <td className="py-3 px-4 font-semibold text-sagedeep">{Math.round(row.practice_avg)}%</td>
                      <td className="py-3 px-4 font-semibold text-[#2C3524]">{Math.round(row.exam_avg)}%</td>
                      <td className="py-3 px-4 font-bold">
                        {gain >= 0 ? (
                          <span className="text-emerald-700">+{gain}% Improvement</span>
                        ) : (
                          <span className="text-rose-700">{gain}% Deficit</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {row.practice_avg >= 75 ? (
                          <Tag tone="sage">High Confidence</Tag>
                        ) : (
                          <Tag tone="rose">Needs Practice</Tag>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => onStartQuiz(row.subject)}>
                          Practice Topic
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Practice Test History */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-base text-[#2C3524] mb-3">
          Completed Practice Tests History
        </h3>
        <div className="space-y-3">
          {practiceVsExam.practice_history.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-4 text-center">
              No practice tests logged yet.
            </div>
          ) : (
            practiceVsExam.practice_history.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl border border-[#E1D6AE] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2C3524]">{record.subject_name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {record.topic_name || 'General Practice'} • {record.taken_at}
                    </span>
                  </div>
                  {record.mistakes_summary && (
                    <div className="text-rose-700 mt-1 text-[11px]">
                      Mistakes analyzed: {record.mistakes_summary}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-sagedeep/10 text-sagedeep font-bold">
                    Score: {record.score}%
                  </span>
                  <Tag tone={record.accuracy >= 75 ? 'sage' : 'amber'}>
                    Accuracy: {record.accuracy}%
                  </Tag>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// =========================================================================
// 8. INTERACTIVE PRACTICE TEST MODAL (MCQ QUIZ)
// =========================================================================

export const PracticeTestModal: React.FC<{
  initialSubject?: string;
  onClose: () => void;
  onComplete: () => void;
}> = ({ initialSubject, onClose, onComplete }) => {
  const [subjectOptions, setSubjectOptions] = useState<string[]>([
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Python Programming',
    'Artificial Intelligence',
    'Web Development',
    'Cybersecurity',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Robotics & Electronics'
  ]);
  const [subject, setSubject] = useState(initialSubject || 'Data Structures & Algorithms');
  const [questions, setQuestions] = useState<PracticeTestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    studentApi.getSyllabus().then((res) => {
      if (res?.syllabus_progress && res.syllabus_progress.length > 0) {
        const enrolled = res.syllabus_progress.map((s: any) => s.subject_name);
        setSubjectOptions((prev) => Array.from(new Set([...enrolled, ...prev])));
        if (!initialSubject && enrolled[0]) {
          setSubject(enrolled[0]);
        }
      }
    }).catch(() => {});
  }, [initialSubject]);

  useEffect(() => {
    let isMounted = true;
    const fetchQ = async () => {
      setLoading(true);
      setCurrentIdx(0);
      setAnswers({});
      setResult(null);
      try {
        const res = await studentApi.getTodayPracticeTest(subject);
        if (isMounted && res?.questions) {
          setQuestions(res.questions);
        }
      } catch {
        // fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQ();
    return () => { isMounted = false; };
  }, [subject]);

  const handleSelectOption = (key: string) => {
    const q = questions[currentIdx];
    setAnswers((prev) => ({ ...prev, [q.id || currentIdx + 1]: key }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.submitPracticeTest({
        subject_name: subject,
        topic_name: questions[0]?.topic || 'Targeted Practice',
        answers
      });
      setResult(res);
      onComplete();
    } catch {
      alert('Could not submit practice test.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal title={`Targeted Practice Quiz: ${subject}`} onClose={onClose}>
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          Generating subject-specific questions for <strong>{subject}</strong>...
        </div>
      </Modal>
    );
  }

  if (result) {
    const accStr = String(result.accuracy ?? result.score ?? 0).replace('%', '');
    const avgStr = String(result.new_practice_average ?? result.score ?? 0).replace('%', '');
    return (
      <Modal title={`Quiz Results: ${subject}`} onClose={onClose}>
        <div className="space-y-4 p-2 text-xs">
          <div className="p-4 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-center">
            <span className="text-xs uppercase font-bold text-sagedeep tracking-wider">Your Practice Score ({subject})</span>
            <div className="text-3xl font-bold font-display text-sagedeep mt-1">
              {result.score}%
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Accuracy: {accStr}% • Updated Subject Practice Average: {avgStr}%
            </p>
          </div>

          {result.mistakes && result.mistakes.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              <div className="font-bold text-rose-800 uppercase">Topics to Review & Answer Key</div>
              {result.mistakes.map((m: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                  {typeof m === 'string' ? m : `${m.question}: ${m.explanation || m.correction}`}
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 flex justify-between items-center border-t border-[#E1D6AE]">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setCurrentIdx(0);
                setAnswers({});
              }}
            >
              Retake Quiz
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done & Return to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[currentIdx];
  const selectedKey = answers[q?.id || currentIdx + 1];

  return (
    <Modal title={`Targeted Practice: ${subject}`} onClose={onClose}>
      <div className="space-y-4 p-2">
        {/* Subject Switcher inside Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F2E8CF]/40 border border-[#E1D6AE] text-xs">
          <span className="font-semibold text-[#2C3524]">Selected Subject:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E1D6AE] bg-white text-xs font-bold text-sagedeep"
          >
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <div className="flex items-center gap-1.5">
            {q?.level && <Tag tone="blue">{q.level}</Tag>}
            <Tag tone="sage">{q?.topic || 'Core Concept'}</Tag>
          </div>
        </div>

        <ProgressBar value={currentIdx + 1} max={questions.length} />

        {q && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#2C3524] leading-relaxed">
              {q.question_text}
            </div>

            <div className="space-y-2">
              {Object.entries(q.options || {}).map(([key, text]) => (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                    selectedKey === key
                      ? 'border-sagedeep bg-sagedeep/10 text-sagedeep font-bold'
                      : 'border-[#E1D6AE] bg-white text-[#2C3524] hover:bg-black/5'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    selectedKey === key ? 'bg-sagedeep text-pcream' : 'bg-black/5 text-[#2C3524]'
                  }`}>
                    {key}
                  </span>
                  <span>{String(text)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="primary"
              disabled={!selectedKey}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!selectedKey || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting Quiz...' : 'Submit & View Score'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// =========================================================================
// 9. MULTILINGUAL & VISUAL / PRACTICAL LEARNING
// =========================================================================

interface BstTreeNode {
  val: number;
  x: number;
  y: number;
  left?: BstTreeNode;
  right?: BstTreeNode;
}

function buildBstWithLayout(values: number[]): { root?: BstTreeNode; nodes: BstTreeNode[]; edges: { x1: number; y1: number; x2: number; y2: number }[] } {
  if (values.length === 0) return { nodes: [], edges: [] };

  const insert = (node: BstTreeNode | undefined, val: number, depth: number, minX: number, maxX: number): BstTreeNode => {
    const x = (minX + maxX) / 2;
    const y = 28 + depth * 46;
    if (!node) {
      return { val, x, y };
    }
    if (val < node.val) {
      node.left = insert(node.left, val, depth + 1, minX, x);
    } else if (val > node.val) {
      node.right = insert(node.right, val, depth + 1, x, maxX);
    }
    return node;
  };

  let root: BstTreeNode | undefined;
  for (const v of values) {
    root = insert(root, v, 0, 20, 320);
  }

  const nodes: BstTreeNode[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const collect = (n?: BstTreeNode) => {
    if (!n) return;
    nodes.push(n);
    if (n.left) {
      edges.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y });
      collect(n.left);
    }
    if (n.right) {
      edges.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y });
      collect(n.right);
    }
  };
  collect(root);
  return { root, nodes, edges };
}

const LEARNING_UI_I18N: Record<string, {
  pageTitle: string;
  pageDesc: string;
  langLabel: string;
  tabCalculus: string;
  tabMatrix: string;
  tabAlgorithms: string;
  tabGlossary: string;
  calcTitle: string;
  calcDesc: string;
  matrixTitle: string;
  matrixDesc: string;
  bstTitle: string;
  bstDesc: string;
  lruTitle: string;
  lruDesc: string;
  sortTitle: string;
  sortDesc: string;
  glossaryTitle: string;
  glossaryDesc: string;
  liveCalcHeading: string;
  aiLinkTitle: string;
  aiLinkBody: string;
  graphicsLinkTitle: string;
  graphicsLinkBody: string;
}> = {
  English: {
    pageTitle: 'Interactive Multilingual & Visual/Practical Learning',
    pageDesc: 'Clipped, interactive calculus & Riemann visualizers, 2D matrix transformation sandboxes, dynamic BST & sorting labs, and regional mother-tongue breakdowns.',
    langLabel: 'Language:',
    tabCalculus: '📈 Calculus & Riemann Explorer',
    tabMatrix: '🔄 2D Matrix Transformation Lab',
    tabAlgorithms: '⚡ DSA: Dynamic BST, Sorting & LRU',
    tabGlossary: '🌐 Multilingual Concept Glossary',
    calcTitle: 'Interactive Calculus, Riemann Sum & Secant-to-Tangent Visualizer',
    calcDesc: 'Click or drag directly on the graph, toggle Riemann sum rectangles, or animate x₀ to see derivatives and integrals converge in real time.',
    matrixTitle: '2D Linear Transformation, Determinant & Vector Mapping Lab',
    matrixDesc: 'Click on the coordinate grid to place test vector v, or animate the matrix morph from Identity to see how basis vectors î and ĵ scale space.',
    bstTitle: 'Dynamic Binary Search Tree (BST) & Traversal Animator',
    bstDesc: 'Insert, delete, or search integers and run animated In-Order, Pre-Order, Post-Order, or BFS traversals in O(log n) time.',
    lruTitle: 'Interactive LRU Cache Simulator (Hash Map + Doubly Linked List)',
    lruDesc: 'Click any cached item to trigger a GET hit (promoting it to MRU) or PUT new keys to observe O(1) LRU eviction.',
    sortTitle: 'Step-by-Step Array Sorting & Binary Search Visualizer',
    sortDesc: 'Step through Bubble Sort, Selection Sort, or Binary Search comparisons on live array bars.',
    glossaryTitle: 'Multilingual Technical & Mathematical Dictionary',
    glossaryDesc: 'Master advanced engineering, mathematical, and algorithmic principles in your regional language.',
    liveCalcHeading: 'Live Analytical Calculations',
    aiLinkTitle: 'Gradient Descent & Backpropagation',
    aiLinkBody: 'In neural networks, loss L(w) is minimized by stepping opposite to the derivative: w_new = w_old - η·f\'(w_old). When f\'(x) = 0, the tangent is horizontal at local optima!',
    graphicsLinkTitle: '3D Camera Viewports & GPU Shaders',
    graphicsLinkBody: 'Every 3D engine and computer vision pipeline transforms polygon vertices into 2D screen coordinates by multiplying vectors with transformation matrices.'
  },
  Hindi: {
    pageTitle: 'इंटरएक्टिव बहुभाषी और दृश्य/व्यावहारिक शिक्षण प्रयोगशाला',
    pageDesc: 'इंटरएक्टिव कैलकुलस (अवकलन और रीमान समाकलन), 2D आव्यूह रूपांतरण, डायनेमिक बाइनरी सर्च ट्री (BST), सॉर्टिंग और मातृभाषा तकनीकी शब्दकोश।',
    langLabel: 'भाषा (Language):',
    tabCalculus: '📈 कैलकुलस और स्पर्शरेखा प्रयोगशाला',
    tabMatrix: '🔄 2D आव्यूह (Matrix) रूपांतरण',
    tabAlgorithms: '⚡ DSA: डायनेमिक BST, सॉर्टिंग और कैश',
    tabGlossary: '🌐 बहुभाषी तकनीकी शब्दकोश',
    calcTitle: 'इंटरएक्टिव अवकलन (Derivative) और रीमान समाकलन (Integral) विज़ुअलाइज़र',
    calcDesc: 'ग्राफ़ पर सीधे क्लिक/ड्रैग करें, रीमान आयतों (Riemann Rectangles) को चालू करें या ऑटो-स्वीप चलाकर तात्कालिक ढलान और क्षेत्रफल देखें।',
    matrixTitle: '2D रैखिक रूपांतरण और सारणिक (Determinant) ज्यामिति',
    matrixDesc: 'आधार सदिश î और ĵ का रूपांतरण देखें। सारणिक det(A) क्षेत्रफल के विस्तार या संकुचन अनुपात को दर्शाता है।',
    bstTitle: 'डायनेमिक बाइनरी सर्च ट्री (BST) और ट्रैवर्सल एनिमेटर',
    bstDesc: 'O(log n) समय में नोड जोड़ें, खोजें या हटाएं और इन-ऑर्डर, प्री-ऑर्डर व BFS ट्रैवर्सल का लाइव एनिमेशन देखें।',
    lruTitle: 'इंटरएक्टिव LRU कैश सिम्युलेटर (O(1) मेमोरी प्रबंधन)',
    lruDesc: 'किसी भी कैश स्लॉट पर क्लिक करके GET हिट करें या नया डेटा PUT करके सबसे पुराने (LRU) डेटा का निष्कासन देखें।',
    sortTitle: 'चरण-दर-चरण ऐरे सॉर्टिंग और बाइनरी सर्च विज़ुअलाइज़र',
    sortDesc: 'बबल सॉर्ट, सिलेक्शन सॉर्ट और बाइनरी सर्च एल्गोरिदम के प्रत्येक तुलना चरण को लाइव देखें।',
    glossaryTitle: 'बहुभाषी तकनीकी और गणितीय शब्दकोश (हिन्दी)',
    glossaryDesc: 'जटिल इंजीनियरिंग, गणित और कंप्यूटर विज्ञान के सिद्धांतों को सरल हिंदी में समझें।',
    liveCalcHeading: 'लाइव गणितीय गणना (Live Calculations)',
    aiLinkTitle: 'ग्रेडिएंट डिसेंट और न्यूरल नेटवर्क (AI/ML)',
    aiLinkBody: 'न्यूरल नेटवर्क में त्रुटि (Loss) को कम करने के लिए अवकलज (Derivative) की विपरीत दिशा में कदम बढ़ाया जाता है: w_new = w_old - η·f\'(w_old)।',
    graphicsLinkTitle: '3D कंप्यूटर ग्राफिक्स और GPU शेडर्स',
    graphicsLinkBody: 'वीडियो गेम और कंप्यूटर विज़न मॉडल प्रत्येक फ्रेम में लाखों 3D बिंदुओं को 2D स्क्रीन पर दिखाने के लिए आव्यूह (Matrix) गुणन का उपयोग करते हैं।'
  },
  Gujarati: {
    pageTitle: 'ઇન્ટરેક્ટિવ બહુભાષી અને વિઝ્યુઅલ/પ્રાયોગિક શિક્ષણ પ્રયોગશાળા',
    pageDesc: 'ઇન્ટરેક્ટિવ કલનશાસ્ત્ર (વિકલન અને સંકલન), 2D શ્રેણિક રૂપાંતરણ, ડાયનેમિક BST, સોર્ટિંગ અને માતૃભાષામાં તકનીકી શબ્દકોશ.',
    langLabel: 'ભાષા (Language):',
    tabCalculus: '📈 કલનશાસ્ત્ર અને સ્પર્શક લેબ',
    tabMatrix: '🔄 2D શ્રેણિક (Matrix) રૂપાંતરણ',
    tabAlgorithms: '⚡ DSA: ડાયનેમિક BST, સોર્ટિંગ અને કેશ',
    tabGlossary: '🌐 બહુભાષી તકનીકી શબ્દકોશ',
    calcTitle: 'ઇન્ટરેક્ટિવ વિકલન (Derivative) અને રીમાન સંકલન (Integral) વિઝ્યુઅલાઇઝર',
    calcDesc: 'ગ્રાફ પર સીધા ક્લિક કરો અથવા સ્લાઇડર ખસેડીને સ્પર્શકનો ઢોળાવ અને વક્ર નીચેનું ક્ષેત્રફળ વાસ્તવિક સમયમાં જુઓ.',
    matrixTitle: '2D સુરેખ રૂપાંતરણ અને નિશ્ચાયક (Determinant) ભૂમિતિ',
    matrixDesc: 'એકમ સદિશો î અને ĵ નું રૂપાંતરણ જુઓ. નિશ્ચાયક det(A) એ ક્ષેત્રફળના માપન ગુણાંકને દર્શાવે છે.',
    bstTitle: 'ડાયનેમિક બાઇનરી સર્ચ ટ્રી (BST) અને ટ્રાવર્સલ એનિમેટર',
    bstDesc: 'નવાં નોડ ઉમેરો, શોધો અથવા દૂર કરો અને O(log n) સમયમાં In-Order, Pre-Order તથા BFS ટ્રાવર્સલ જુઓ.',
    lruTitle: 'ઇન્ટરેક્ટિવ LRU કેશ સિમ્યુલેટર',
    lruDesc: 'ડબલી લિંક્ડ લિસ્ટ અને હેશ મેપ દ્વારા O(1) સમયમાં કેશ રીડ અને રાઇટ ઓપરેશનનો અભ્યાસ કરો.',
    sortTitle: 'સ્ટેપ-બાય-સ્ટેપ એરે સોર્ટિંગ અને બાઇનરી સર્ચ',
    sortDesc: 'બબલ સોર્ટ, સિલેક્શન સોર્ટ અને બાઇનરી સર્ચના દરેક સ્ટેપનું લાઇવ વિઝ્યુઅલાઇઝેશન.',
    glossaryTitle: 'બહુભાષી તકનીકી અને ગાણિતિક શબ્દકોશ (ગુજરાતી)',
    glossaryDesc: 'એન્જિનિયરિંગ, ગણિત અને અલ્ગોરિધમના સિદ્ધાંતોને સરળ ગુજરાતી ભાષામાં સમજો.',
    liveCalcHeading: 'લાઇવ ગાણિતિક ગણતરીઓ',
    aiLinkTitle: 'ગ્રેડિયન્ટ ડિસેન્ટ અને મશીન લર્નિંગ',
    aiLinkBody: 'આર્ટિફિશિયલ ઇન્ટેલિજન્સમાં લોસ ફંક્શન ઘટાડવા માટે વિકલિત (Derivative) ની વિરુદ્ધ દિશામાં વજન અપડેટ થાય છે.',
    graphicsLinkTitle: '3D કમ્પ્યુટર ગ્રાફિક્સ અને GPU શેડર્સ',
    graphicsLinkBody: 'કમ્પ્યુટર ગ્રાફિક્સમાં 3D મોડેલને 2D સ્ક્રીન પર દર્શાવવા માટે શ્રેણિક (Matrix) ગુણાકારનો ઉપયોગ થાય છે.'
  },
  Marathi: {
    pageTitle: 'इंटरएक्टिव्ह बहुभाषिक आणि दृश्य/प्रात्यक्षिक शिक्षण प्रयोगशाळा',
    pageDesc: 'इंटरएक्टिव्ह कॅल्युलस (अवकलन आणि समाकलन), 2D मॅट्रिक्स रूपांतरण, डायनॅमिक BST, सॉर्टिंग आणि मराठी तांत्रिक शब्दकोश.',
    langLabel: 'भाषा (Language):',
    tabCalculus: '📈 कॅल्युलस आणि स्पर्शिका एक्सप्लोरर',
    tabMatrix: '🔄 2D मॅट्रिक्स रूपांतरण लॅब',
    tabAlgorithms: '⚡ DSA: डायनॅमिक BST, सॉर्टिंग आणि कॅश',
    tabGlossary: '🌐 बहुभाषिक तांत्रिक शब्दकोश',
    calcTitle: 'इंटरएक्टिव्ह अवकलन (Derivative) आणि रीमान समाकलन (Integral) व्हिज्युअलायझर',
    calcDesc: 'आलेखावर थेट क्लिक करा किंवा स्लायडर हलवून तात्कालिक उतार (Slope) आणि वक्राखालील क्षेत्रफळ रिअल टाइममध्ये पहा.',
    matrixTitle: '2D रेषीय रूपांतरण आणि निश्चयक (Determinant) भूमिती',
    matrixDesc: 'पायाभूत सदिश î आणि ĵ चे रूपांतरण पहा. निश्चयक det(A) क्षेत्रफळाचे प्रमाण दर्शवतो.',
    bstTitle: 'डायनॅमिक बायनरी सर्च ट्री (BST) आणि ट्रॅव्हर्सल अॅनिमेटर',
    bstDesc: 'O(log n) वेळेत संख्या जोडा, शोधा किंवा काढा आणि In-Order, Pre-Order व BFS ट्रॅव्हर्सल पहा.',
    lruTitle: 'इंटरएक्टिव्ह LRU कॅश सिम्युलेटर',
    lruDesc: 'हॅश मॅप आणि डबली लिंक्ड लिस्ट वापरून O(1) वेळेत कॅश मेमरी व्यवस्थापन समजून घ्या.',
    sortTitle: 'स्टेप-बाय-स्टेप अॅरे सॉर्टिंग आणि बायनरी सर्च',
    sortDesc: 'बबल सॉर्ट, सिलेक्शन सॉर्ट आणि बायनरी सर्च अल्गोरिदमचे थेट प्रात्यक्षिक.',
    glossaryTitle: 'बहुभाषिक तांत्रिक आणि गणितीय शब्दकोश (मराठी)',
    glossaryDesc: 'अभियांत्रिकी, गणित आणि अल्गोरिदमच्या संकल्पना आपल्या मातृभाषेत समजून घ्या.',
    liveCalcHeading: 'थेट गणितीय गणना',
    aiLinkTitle: 'ग्रेडियंट डिसेंट आणि मशीन लर्निंग',
    aiLinkBody: 'न्यूरल नेटवर्कमध्ये त्रुटी कमी करण्यासाठी डेरिव्हेटिव्हच्या विरुद्ध दिशेने वेट्स अपडेट केले जातात.',
    graphicsLinkTitle: '3D कॉम्प्युटर ग्राफिक्स आणि GPU शेडर्स',
    graphicsLinkBody: '3D गेम आणि कॉम्प्युटर व्हिजनमध्ये मॅट्रिक्स गुणाकाराने 3D बिंदू 2D स्क्रीनवर रूपांतरित केले जातात.'
  },
  Tamil: {
    pageTitle: 'ஊடாடும் பன்மொழி மற்றும் காட்சி/செயல்முறை கல்வி ஆய்வகம்',
    pageDesc: 'நுண்கணிதம் (வகைக்கெழு மற்றும் தொகையீடு), 2D அணி உருமாற்றம், இயங்கும் BST, வரிசைப்படுத்தல் மற்றும் தமிழ் தொழில்நுட்ப அகராதி.',
    langLabel: 'மொழி (Language):',
    tabCalculus: '📈 நுண்கணிதம் & தொடுகோடு ஆய்வகம்',
    tabMatrix: '🔄 2D அணி (Matrix) உருமாற்றம்',
    tabAlgorithms: '⚡ DSA: BST, வரிசைப்படுத்தல் & LRU',
    tabGlossary: '🌐 பன்மொழி தொழில்நுட்ப அகராதி',
    calcTitle: 'ஊடாடும் நுண்கணிதம் (Derivative) மற்றும் ரீமான் தொகையீடு (Integral) காட்சிப்படுத்தி',
    calcDesc: 'வரைபடத்தில் கிளிக் செய்து அல்லது நகர்த்தி தொடுகோட்டின் சாய்வு மற்றும் வளைவின் கீழ் பரப்பளவை நேரலையில் காண்க.',
    matrixTitle: '2D நேரியல் உருமாற்றம் மற்றும் அணிக்கோவை (Determinant) வடிவியல்',
    matrixDesc: 'அடிப்படை வெக்டார்கள் î மற்றும் ĵ உருமாறுவதைக் காண்க. அணிக்கோவை det(A) பரப்பளவு மாற்ற விகிதத்தைக் குறிக்கிறது.',
    bstTitle: 'இயங்கும் இருமத் தேடல் மரம் (BST) மற்றும் பயணம் (Traversal)',
    bstDesc: 'O(log n) நேரத்தில் எண்களைச் சேர்க்கவும், தேடவும் மற்றும் In-Order, Pre-Order, BFS பயணங்களை இயக்கவும்.',
    lruTitle: 'ஊடாடும் LRU கேச் (Cache) உருவகப்படுத்தி',
    lruDesc: 'O(1) நேரத்தில் தரவைப் படிக்க மற்றும் எழுத இரட்டை இணைப்புப் பட்டியல் மற்றும் ஹேஷ் மேப் எவ்வாறு செயல்படுகிறது என்பதைக் காண்க.',
    sortTitle: 'படிப்படியான அணி வரிசைப்படுத்தல் & இருமத் தேடல்',
    sortDesc: 'Bubble Sort, Selection Sort மற்றும் Binary Search வழிமுறைகளை நேரலையில் இயக்கவும்.',
    glossaryTitle: 'பன்மொழி தொழில்நுட்ப மற்றும் கணித அகராதி (தமிழ்)',
    glossaryDesc: 'பொறியியல், கணிதம் மற்றும் கணினி அறிவியல் கோட்பாடுகளைத் தமிழில் எளிதாகப் புரிந்து கொள்ளுங்கள்.',
    liveCalcHeading: 'நேரலை கணிதக் கணக்கீடுகள்',
    aiLinkTitle: 'கிரேடியன்ட் டிசென்ட் & செயற்கை நுண்ணறிவு (AI/ML)',
    aiLinkBody: 'நியூரல் நெட்வொர்க்கில் பிழையைக் குறைக்க வகைக்கெழுவின் (Derivative) எதிர் திசையில் எடைகள் புதுப்பிக்கப்படுகின்றன.',
    graphicsLinkTitle: '3D கணினி வரைகலை & GPU ஷேடர்கள்',
    graphicsLinkBody: 'வீடியோ கேம்கள் மற்றும் கணினி பார்வை மாதிரிகள் 3D புள்ளிகளை 2D திரையில் காட்ட அணி (Matrix) பெருக்கலைப் பயன்படுத்துகின்றன.'
  },
  Telugu: {
    pageTitle: 'ఇంటరాక్టివ్ బహుభాషా మరియు దృశ్య/ఆచరణాత్మక అభ్యాస ప్రయోగశాల',
    pageDesc: 'కలనగణితం (అవకలనం మరియు సమాకలనం), 2D మాత్రిక రూపాంతరం, డైనమిక్ BST, సార్టింగ్ మరియు తెలుగు సాంకేతిక పదకోశం.',
    langLabel: 'భాష (Language):',
    tabCalculus: '📈 కలనగణితం & స్పర్శరేఖ ల్యాబ్',
    tabMatrix: '🔄 2D మాత్రిక (Matrix) రూపాంతరం',
    tabAlgorithms: '⚡ DSA: డైనమిక్ BST, సార్టింగ్ & LRU',
    tabGlossary: '🌐 బహుభాషా సాంకేతిక పదకోశం',
    calcTitle: 'ఇంటరాక్టివ్ అవకలనం (Derivative) & రీమాన్ సమాకలనం (Integral) విజువలైజర్',
    calcDesc: 'గ్రాఫ్‌పై క్లిక్ చేయండి లేదా స్లైడర్‌ను జరిపి తక్షణ వాలు (Slope) మరియు వక్రరేఖ కింద వైశాల్యాన్ని ప్రత్యక్షంగా చూడండి.',
    matrixTitle: '2D రేఖీయ రూపాంతరం మరియు నిర్ధారకం (Determinant) జ్యామితి',
    matrixDesc: 'ప్రాథమిక సదిశలు î మరియు ĵ ఎలా మారుతాయో చూడండి. నిర్ధారకం det(A) వైశాల్య స్కేలింగ్ కారకాన్ని సూచిస్తుంది.',
    bstTitle: 'డైనమిక్ బైనరీ సెర్చ్ ట్రీ (BST) & ట్రావర్సల్ యానిమేటర్',
    bstDesc: 'O(log n) సమయంలో నోడ్‌లను జోడించండి, శోధించండి మరియు In-Order, Pre-Order, BFS ట్రావర్సల్స్ చూడండి.',
    lruTitle: 'ఇంటరాక్టివ్ LRU క్యాష్ సిమ్యులేటర్',
    lruDesc: 'హ్యాష్ మ్యాప్ మరియు డబ్లీ లింక్డ్ లిస్ట్ ఉపయోగించి O(1) క్యాష్ మెమరీ నిర్వహణను అర్థం చేసుకోండి.',
    sortTitle: 'స్టెప్-బై-స్టెప్ అరే సార్టింగ్ & బైనరీ సెర్చ్',
    sortDesc: 'బబుల్ సార్ట్, సెలెక్షన్ సార్ట్ మరియు బైనరీ సెర్చ్ అల్గారిథమ్‌లను దశలవారీగా చూడండి.',
    glossaryTitle: 'బహుభాషా సాంకేతిక మరియు గణిత పదకోశం (తెలుగు)',
    glossaryDesc: 'ఇంజనీరింగ్, గణితం మరియు కంప్యూటర్ సైన్స్ సూత్రాలను తెలుగులో సులభంగా నేర్చుకోండి.',
    liveCalcHeading: 'ప్రత్యక్ష గణిత గణనలు',
    aiLinkTitle: 'గ్రేడియంట్ డిసెంట్ & మెషిన్ లెర్నింగ్',
    aiLinkBody: 'న్యూరల్ నెట్‌వర్క్‌లలో లాస్ ఫంక్షన్‌ను తగ్గించడానికి డెరివేటివ్‌కు వ్యతిరేక దిశలో వెయిట్స్ అప్‌డేట్ చేయబడతాయి.',
    graphicsLinkTitle: '3D కంప్యూటర్ గ్రాఫిక్స్ & GPU షేడర్స్',
    graphicsLinkBody: '3D గేమ్‌లు మరియు కంప్యూటర్ విజన్ మోడల్స్ 3D కోఆర్డినేట్‌లను 2D స్క్రీన్ పిక్సెల్‌లుగా మార్చడానికి మ్యాట్రిక్స్ గుణకారాన్ని ఉపయోగిస్తాయి.'
  },
  Bengali: {
    pageTitle: 'ইন্টারঅ্যাক্টিভ বহুভাষিক এবং ভিজ্যুয়াল/ব্যবহারিক শিক্ষা পরীক্ষাগার',
    pageDesc: 'ক্যালকুলাস (অন্তরীকরণ ও সমাকলন), 2D ম্যাট্রিক্স রূপান্তর, ডায়নামিক BST, সর্টিং এবং বাংলা প্রযুক্তিগত শব্দকোষ।',
    langLabel: 'ভাষা (Language):',
    tabCalculus: '📈 ক্যালকুলাস ও স্পর্শক এক্সপ্লোরার',
    tabMatrix: '🔄 2D ম্যাট্রিক্স রূপান্তর ল্যাব',
    tabAlgorithms: '⚡ DSA: ডায়নামিক BST, সর্টিং ও LRU',
    tabGlossary: '🌐 বহুভাষিক প্রযুক্তিগত শব্দকোষ',
    calcTitle: 'ইন্টারঅ্যাক্টিভ অন্তরীকরণ (Derivative) ও রিমান সমাকলন (Integral) ভিজ্যুয়ালাইজার',
    calcDesc: 'গ্রাফে সরাসরি ক্লিক করুন বা স্লাইডার সরিয়ে স্পর্শকের ঢাল এবং বক্ররেখার নিচের ক্ষেত্রফল রিয়েল টাইমে দেখুন।',
    matrixTitle: '2D রৈখিক রূপান্তর এবং নির্ণায়ক (Determinant) জ্যামিতি',
    matrixDesc: 'ভিত্তি ভেক্টর î এবং ĵ-এর রূপান্তর দেখুন। নির্ণায়ক det(A) ক্ষেত্রফলের স্কেলিং ফ্যাক্টর নির্দেশ করে।',
    bstTitle: 'ডায়নামিক বাইনারি সার্চ ট্রি (BST) ও ট্রাভার্সাল অ্যানিমেটর',
    bstDesc: 'O(log n) সময়ে সংখ্যা যোগ বা অনুসন্ধান করুন এবং In-Order, Pre-Order ও BFS ট্রাভার্সাল দেখুন।',
    lruTitle: 'ইন্টারঅ্যাক্টিভ LRU ক্যাশ সিমুলেটর',
    lruDesc: 'হ্যাশ ম্যাপ এবং ডাবলি লিঙ্কড লিস্টের মাধ্যমে O(1) সময়ে ক্যাশ মেমরি অপারেশন পরীক্ষা করুন।',
    sortTitle: 'ধাপে ধাপে অ্যারে সর্টিং এবং বাইনারি সার্চ ভিজ্যুয়ালাইজার',
    sortDesc: 'বাবল সর্ট, সিলেকশন সর্ট এবং বাইনারি সার্চ অ্যালগরিদমের প্রতিটি ধাপ লাইভ দেখুন।',
    glossaryTitle: 'বহুভাষিক প্রযুক্তিগত ও গাণিতিক শব্দকোষ (বাংলা)',
    glossaryDesc: 'প্রকৌশল, গণিত এবং অ্যালগরিদমের জটিল ধারণাগুলো নিজের মাতৃভাষায় সহজভাবে বুঝুন।',
    liveCalcHeading: 'লাইভ গাণিতিক গণনা',
    aiLinkTitle: 'গ্রেডিয়েন্ট ডিসেন্ট ও মেশিন লার্নিং (AI/ML)',
    aiLinkBody: 'নিউরাল নেটওয়ার্কে লস কমানোর জন্য অন্তরজের (Derivative) বিপরীত দিকে ওয়েট আপডেট করা হয়।',
    graphicsLinkTitle: '3D কম্পিউটার গ্রাফিক্স ও GPU শেডার',
    graphicsLinkBody: 'ভিডিও গেম এবং কম্পিউটার ভিশনে 3D স্থানাঙ্ককে 2D স্ক্রিনে রূপান্তর করতে ম্যাট্রিক্স গুণন ব্যবহৃত হয়।'
  }
};

export const StudentLearningView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    return localStorage.getItem('vs_preferred_lang') || 'English';
  });
  const [activeTab, setActiveTab] = useState<'calculus' | 'matrix' | 'algorithms' | 'multilingual'>('calculus');

  // Sync preferred language from student profile on mount
  useEffect(() => {
    studentApi.getProfile().then((res) => {
      const profLang = res?.profile?.preferred_language;
      if (profLang && LEARNING_UI_I18N[profLang] && !localStorage.getItem('vs_preferred_lang')) {
        setSelectedLang(profLang);
      }
    }).catch(() => {});
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    localStorage.setItem('vs_preferred_lang', lang);
    studentApi.updateProfile({ preferred_language: lang }).catch(() => {});
  };

  const t = LEARNING_UI_I18N[selectedLang] || LEARNING_UI_I18N.English;

  // 1. Calculus State & Interactive Controls
  const [calcFunc, setCalcFunc] = useState<'poly' | 'trig' | 'cubic'>('poly');
  const [x0, setX0] = useState<number>(1.0);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [showRiemann, setShowRiemann] = useState<boolean>(true);
  const [riemannN, setRiemannN] = useState<number>(12);
  const [showSecant, setShowSecant] = useState<boolean>(false);
  const [deltaX, setDeltaX] = useState<number>(1.0);

  useEffect(() => {
    if (!isSweeping) return;
    const timer = setInterval(() => {
      setX0((prev) => {
        const next = prev + 0.08;
        return next > 2.5 ? -2.5 : Number(next.toFixed(2));
      });
    }, 60);
    return () => clearInterval(timer);
  }, [isSweeping]);

  // 2. Matrix State & Interactive Controls
  const [matA, setMatA] = useState<number>(1.0);
  const [matB, setMatB] = useState<number>(0.5);
  const [matC, setMatC] = useState<number>(0.0);
  const [matD, setMatD] = useState<number>(1.0);
  const [vecX, setVecX] = useState<number>(1.2);
  const [vecY, setVecY] = useState<number>(0.8);
  const [morphT, setMorphT] = useState<number>(1.0);
  const [isMorphing, setIsMorphing] = useState<boolean>(false);

  useEffect(() => {
    if (!isMorphing) return;
    const timer = setInterval(() => {
      setMorphT((prev) => {
        if (prev >= 1.0) {
          setIsMorphing(false);
          return 1.0;
        }
        return Number(Math.min(1.0, prev + 0.05).toFixed(2));
      });
    }, 40);
    return () => clearInterval(timer);
  }, [isMorphing]);

  // 3. Dynamic BST State (insertion order preserved for genuine tree structure!)
  const [bstNodes, setBstNodes] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [newBstVal, setNewBstVal] = useState<string>('');
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);
  const [traversalType, setTraversalType] = useState<string>('In-Order');
  const [bstStatusMsg, setBstStatusMsg] = useState<string>('Ready — Insert, search, or animate a tree traversal.');

  // 4. LRU Cache State
  const [lruCache, setLruCache] = useState<{ key: string; val: string }[]>([
    { key: 'user:1', val: 'Alice' },
    { key: 'user:2', val: 'Bob' },
    { key: 'user:3', val: 'Charlie' }
  ]);
  const [cacheLog, setCacheLog] = useState<string[]>(['Cache initialized with capacity 3']);
  const [cacheKeyInput, setCacheKeyInput] = useState('');
  const [cacheValInput, setCacheValInput] = useState('');

  // 5. Interactive Sorting & Binary Search State
  const [sortArr, setSortArr] = useState<number[]>([42, 18, 75, 29, 64, 11, 88, 35]);
  const [compareIndices, setCompareIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [sortMsg, setSortMsg] = useState<string>('Click "Next Step" or "Auto Sort" to trace comparisons.');
  const [sortStepIdx, setSortStepIdx] = useState<number>(0);

  // Calculus Evaluation Helper
  const evalFunc = (x: number): number => {
    if (calcFunc === 'poly') return x * x - 4 * x + 3;
    if (calcFunc === 'trig') return 2.5 * Math.sin(x);
    return 0.5 * (Math.pow(x, 3) - 3 * x);
  };

  const evalDeriv = (x: number): number => {
    if (calcFunc === 'poly') return 2 * x - 4;
    if (calcFunc === 'trig') return 2.5 * Math.cos(x);
    return 0.5 * (3 * Math.pow(x, 2) - 3);
  };

  const evalIntegral = (x: number): number => {
    if (calcFunc === 'poly') return (Math.pow(x, 3) / 3) - 2 * Math.pow(x, 2) + 3 * x;
    if (calcFunc === 'trig') return 2.5 * (1 - Math.cos(x));
    return 0.5 * ((Math.pow(x, 4) / 4) - (3 * Math.pow(x, 2) / 2));
  };

  const funcLabel =
    calcFunc === 'poly'
      ? 'f(x) = x² - 4x + 3'
      : calcFunc === 'trig'
      ? 'f(x) = 2.5·sin(x)'
      : 'f(x) = 0.5·(x³ - 3x)';

  const derivLabel =
    calcFunc === 'poly'
      ? "f'(x) = 2x - 4"
      : calcFunc === 'trig'
      ? "f'(x) = 2.5·cos(x)"
      : "f'(x) = 1.5x² - 1.5";

  const fx = evalFunc(x0);
  const dfx = evalDeriv(x0);
  const integral = evalIntegral(x0);

  // SVG viewport & coordinate mapping (strictly clipped!)
  const width = 420;
  const height = 240;
  const xMin = -3.0;
  const xMax = 3.0;
  const yMin = -6.0;
  const yMax = 8.0;

  const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toSvgY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
  const fromSvgX = (px: number) => {
    const raw = xMin + (px / width) * (xMax - xMin);
    return Math.max(-2.5, Math.min(2.5, Number(raw.toFixed(2))));
  };

  let curvePoints = '';
  for (let x = xMin; x <= xMax; x += 0.06) {
    const y = evalFunc(x);
    const sx = toSvgX(x);
    const sy = toSvgY(y);
    curvePoints += `${x === xMin ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)} `;
  }

  // Tangent line segment around x0
  const tanX1 = x0 - 1.4;
  const tanY1 = dfx * (tanX1 - x0) + fx;
  const tanX2 = x0 + 1.4;
  const tanY2 = dfx * (tanX2 - x0) + fx;

  // Secant line between x0 and x0 + deltaX
  const xSec = Math.min(2.8, x0 + deltaX);
  const ySec = evalFunc(xSec);
  const secSlope = (ySec - fx) / (xSec - x0 || 0.001);

  // Shaded exact integral area polygon from 0 to x0
  let areaPoly = `M ${toSvgX(0).toFixed(1)} ${toSvgY(0).toFixed(1)} `;
  const step = x0 >= 0 ? 0.05 : -0.05;
  if (Math.abs(x0) > 0.01) {
    for (let x = 0; Math.abs(x) <= Math.abs(x0); x += step) {
      areaPoly += `L ${toSvgX(x).toFixed(1)} ${toSvgY(evalFunc(x)).toFixed(1)} `;
    }
  }
  areaPoly += `L ${toSvgX(x0).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`;

  // Discrete Riemann Sum rectangles from 0 to x0
  const riemannRects: { x: number; y: number; w: number; h: number; positive: boolean }[] = [];
  let riemannSum = 0;
  if (showRiemann && Math.abs(x0) > 0.05) {
    const a = Math.min(0, x0);
    const b = Math.max(0, x0);
    const dx = (b - a) / riemannN;
    for (let i = 0; i < riemannN; i++) {
      const xm = a + (i + 0.5) * dx;
      const ym = evalFunc(xm);
      riemannSum += ym * (x0 >= 0 ? dx : -dx);
      const sx1 = toSvgX(a + i * dx);
      const sx2 = toSvgX(a + (i + 1) * dx);
      const sy0 = toSvgY(0);
      const sym = toSvgY(ym);
      riemannRects.push({
        x: Math.min(sx1, sx2),
        y: Math.min(sy0, sym),
        w: Math.max(1, Math.abs(sx2 - sx1) - 1),
        h: Math.abs(sym - sy0),
        positive: ym >= 0
      });
    }
  }

  // Matrix Effective Values (with smooth morph interpolation t in [0, 1])
  const effA = 1 + (matA - 1) * morphT;
  const effB = 0 + (matB - 0) * morphT;
  const effC = 0 + (matC - 0) * morphT;
  const effD = 1 + (matD - 1) * morphT;

  const det = effA * effD - effB * effC;
  const originX = 170;
  const originY = 130;
  const scale = 46;

  const iX = originX + effA * scale;
  const iY = originY - effC * scale;
  const jX = originX + effB * scale;
  const jY = originY - effD * scale;
  const cornerX = originX + (effA + effB) * scale;
  const cornerY = originY - (effC + effD) * scale;

  // Test vector v and transformed A*v
  const outVecX = effA * vecX + effB * vecY;
  const outVecY = effC * vecX + effD * vecY;
  const vSvgX = originX + vecX * scale;
  const vSvgY = originY - vecY * scale;
  const avSvgX = originX + outVecX * scale;
  const avSvgY = originY - outVecY * scale;

  const applyMatrixPreset = (name: string) => {
    if (name === 'identity') { setMatA(1); setMatB(0); setMatC(0); setMatD(1); }
    else if (name === 'rot45') { setMatA(0.71); setMatB(-0.71); setMatC(0.71); setMatD(0.71); }
    else if (name === 'rot90') { setMatA(0); setMatB(-1); setMatC(1); setMatD(0); }
    else if (name === 'shearX') { setMatA(1); setMatB(1); setMatC(0); setMatD(1); }
    else if (name === 'shearY') { setMatA(1); setMatB(0); setMatC(1); setMatD(1); }
    else if (name === 'reflect') { setMatA(-1); setMatB(0); setMatC(0); setMatD(1); }
    else if (name === 'singular') { setMatA(1); setMatB(1); setMatC(0.5); setMatD(0.5); }
    setMorphT(0.1);
    setIsMorphing(true);
  };

  // BST Handlers & Animated Traversals
  const bstLayout = buildBstWithLayout(bstNodes);

  const handleAddBstNode = () => {
    const num = parseInt(newBstVal.trim(), 10);
    if (isNaN(num)) return;
    if (bstNodes.includes(num)) {
      setBstStatusMsg(`Value ${num} is already in the BST.`);
      setHighlightedNode(num);
      return;
    }
    if (bstNodes.length >= 15) {
      setBstStatusMsg('Maximum 15 nodes reached for clear visualization. Remove a node or reset.');
      return;
    }
    setBstNodes([...bstNodes, num]);
    setHighlightedNode(num);
    setBstStatusMsg(`Inserted ${num} into BST following binary search property.`);
    setNewBstVal('');
  };

  const handleSearchBstNode = () => {
    const num = parseInt(newBstVal.trim(), 10);
    if (isNaN(num)) return;
    const path: number[] = [];
    let curr = bstLayout.root;
    while (curr) {
      path.push(curr.val);
      if (num === curr.val) break;
      curr = num < curr.val ? curr.left : curr.right;
    }
    setTraversalOrder(path);
    path.forEach((val, idx) => {
      setTimeout(() => {
        setHighlightedNode(val);
        if (idx === path.length - 1) {
          const found = val === num;
          setBstStatusMsg(
            found
              ? `Found ${num} in ${path.length} comparisons! Path: ${path.join(' → ')}`
              : `Value ${num} not found after ${path.length} steps. Path: ${path.join(' → ')}`
          );
        }
      }, idx * 350);
    });
  };

  const runBstTraversal = (mode: 'In-Order' | 'Pre-Order' | 'Post-Order' | 'Level-Order BFS') => {
    setTraversalType(mode);
    const seq: number[] = [];
    const root = bstLayout.root;
    if (!root) return;

    if (mode === 'In-Order') {
      const dfs = (n?: BstTreeNode) => { if (!n) return; dfs(n.left); seq.push(n.val); dfs(n.right); };
      dfs(root);
    } else if (mode === 'Pre-Order') {
      const dfs = (n?: BstTreeNode) => { if (!n) return; seq.push(n.val); dfs(n.left); dfs(n.right); };
      dfs(root);
    } else if (mode === 'Post-Order') {
      const dfs = (n?: BstTreeNode) => { if (!n) return; dfs(n.left); dfs(n.right); seq.push(n.val); };
      dfs(root);
    } else {
      const q: BstTreeNode[] = [root];
      while (q.length > 0) {
        const cur = q.shift()!;
        seq.push(cur.val);
        if (cur.left) q.push(cur.left);
        if (cur.right) q.push(cur.right);
      }
    }

    setTraversalOrder(seq);
    setBstStatusMsg(`Animating ${mode} Traversal: [${seq.join(' → ')}]`);
    seq.forEach((val, idx) => {
      setTimeout(() => {
        setHighlightedNode(val);
      }, idx * 320);
    });
  };

  // Sorting Step Handler
  const handleSortStep = () => {
    const arr = [...sortArr];
    const n = arr.length;
    let swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        const tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        setSortArr(arr);
        setCompareIndices([i, i + 1]);
        setSortStepIdx((s) => s + 1);
        setSortMsg(`Step ${sortStepIdx + 1}: Swapped ${arr[i + 1]} and ${arr[i]} because ${arr[i + 1]} > ${arr[i]}`);
        swapped = true;
        break;
      }
    }
    if (!swapped) {
      setCompareIndices([]);
      setSortedIndices(arr.map((_, idx) => idx));
      setSortMsg('Array is 100% sorted in ascending order! Time Complexity: O(N log N) / O(N²).');
    }
  };

  const handleShuffleSort = () => {
    const next = Array.from({ length: 8 }, () => Math.floor(Math.random() * 82) + 12);
    setSortArr(next);
    setCompareIndices([]);
    setSortedIndices([]);
    setSortStepIdx(0);
    setSortMsg('Generated new unsorted array. Click "Next Swap Step" to trace.');
  };

  // LRU Handlers
  const handleLruPut = () => {
    if (!cacheKeyInput.trim()) return;
    const key = cacheKeyInput.trim();
    const val = cacheValInput.trim() || 'Data';
    const nextCache = lruCache.filter((c) => c.key !== key);
    let evictedMsg = '';
    if (nextCache.length >= 3) {
      const evicted = nextCache.shift();
      evictedMsg = ` → Evicted LRU '${evicted?.key}'`;
    }
    nextCache.push({ key, val });
    setLruCache(nextCache);
    setCacheLog((prev) => [`PUT (${key}=${val})${evictedMsg}`, ...prev.slice(0, 4)]);
    setCacheKeyInput('');
    setCacheValInput('');
  };

  const handleLruGet = (key: string) => {
    const item = lruCache.find((c) => c.key === key);
    if (item) {
      const nextCache = [...lruCache.filter((c) => c.key !== key), item];
      setLruCache(nextCache);
      setCacheLog((prev) => [`GET (${key}) → HIT "${item.val}" (Promoted to MRU)`, ...prev.slice(0, 4)]);
    } else {
      setCacheLog((prev) => [`GET (${key}) → MISS`, ...prev.slice(0, 4)]);
    }
  };

  // Multilingual Concept Glossary (All 7 Languages!)
  const DICTIONARY: Record<string, { term: string; native: string; translit: string; formula: string; desc: string }[]> = {
    English: [
      { term: 'Differential Calculus', native: 'Instantaneous Derivative', translit: 'dy / dx', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'Measures the exact instantaneous rate of change of a function and the slope of its tangent line.' },
      { term: 'Riemann Integration', native: 'Definite Integral & Area', translit: '∫ f(x) dx', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'Accumulates continuous quantities by summing infinitely many thin rectangular slices under a curve.' },
      { term: 'Matrix Transformation', native: 'Linear Basis Mapping', translit: 'det(A) = ad - bc', formula: 'A·v = [a·x + b·y, c·x + d·y]ᵀ', desc: 'Maps coordinate space via linear combinations of basis vectors; determinant measures area scaling.' },
      { term: 'Binary Search Tree', native: 'Hierarchical Search Tree', translit: 'O(log n) Lookup', formula: 'Left(u) < Key(u) < Right(u)', desc: 'Ordered binary tree where every left descendant is smaller and right descendant is larger.' },
      { term: 'Dynamic Programming', native: 'Memoization & Tabulation', translit: 'Optimal Substructure', formula: 'dp[i] = min/max(dp[i-k] + cost)', desc: 'Solves complex recursive problems by caching overlapping subproblem results to avoid exponential recomputation.' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'Charge & Energy Conservation', translit: 'KCL & KVL', formula: '∑ I_in = ∑ I_out,  ∑ ΔV_loop = 0', desc: 'Governs current distribution at nodes and voltage drops across closed electrical meshes.' }
    ],
    Hindi: [
      { term: 'Differential Calculus', native: 'अवकलन (Differentiation)', translit: 'Avakalan', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'किसी फलन में तात्कालिक परिवर्तन की दर और वक्र की स्पर्शरेखा के ढलान (Slope) का सटीक गणितीय मापन।' },
      { term: 'Riemann Integration', native: 'समाकलन (Integration)', translit: 'Samakalan', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'वक्र के नीचे अनंत सूक्ष्म आयतों का योग करके कुल संचयी क्षेत्रफल और मात्रा की गणना करना।' },
      { term: 'Matrix Transformation', native: 'आव्यूह रूपांतरण (Matrix Transform)', translit: 'Aavyooh Roopantaran', formula: 'det(A) = a·d - b·c', desc: 'रैखिक संयोजनों के माध्यम से निर्देशांक अक्षों को घुमाना, खींचना या बदलना; सारणिक क्षेत्रफल के अनुपात को दर्शाता है।' },
      { term: 'Binary Search Tree', native: 'द्वि-आधारी खोज वृक्ष (BST)', translit: 'Dvi-Aadhari Khoj Vriksh', formula: 'Left(u) < Key(u) < Right(u)', desc: 'पदानुक्रमित डेटा संरचना जहाँ बायाँ उप-वृक्ष मूल से छोटा और दायाँ उप-वृक्ष बड़ा होता है, जिससे O(log n) में खोज होती है।' },
      { term: 'Dynamic Programming', native: 'गतिशील प्रोग्रामिंग (DP)', translit: 'Gatishil Programming', formula: 'dp[i] = opt(dp[i-1], dp[i-2])', desc: 'दोहराई जाने वाली उप-समस्याओं के उत्तर मेमोरी में सहेज कर जटिल एल्गोरिदम को तेज करने की विधि।' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'किरचॉफ के परिपथ नियम', translit: 'KCL & KVL Niyam', formula: '∑ I = 0,  ∑ V = 0', desc: 'विद्युत परिपथ में आवेश और ऊर्जा संरक्षण के सिद्धांत जिनसे जटिल नेटवर्क की धारा और वोल्टेज निकाली जाती है।' }
    ],
    Gujarati: [
      { term: 'Differential Calculus', native: 'વિકલન (Differentiation)', translit: 'Vikalan', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'વિધેયમાં થતા ક્ષણિક પરિવર્તનનો દર અને સ્પર્શક રેખાના ઢોળાવનો ગણિતીય અભ્યાસ.' },
      { term: 'Riemann Integration', native: 'સંકલન (Integration)', translit: 'Sankalan', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'વક્ર નીચેના સૂક્ષ્મ લંબચોરસના સરવાળા દ્વારા કુલ ક્ષેત્રફળ અને સંચિત મૂલ્યની ગણતરી.' },
      { term: 'Matrix Transformation', native: 'શ્રેણિક રૂપાંતરણ (Matrix)', translit: 'Shrenik Roopantaran', formula: 'det(A) = a·d - b·c', desc: 'સુરેખ સંયોજનો દ્વારા યામ સમતલનું પરિભ્રમણ અને વિસ્તરણ; નિશ્ચાયક ક્ષેત્રફળનો ગુણાંક દર્શાવે છે.' },
      { term: 'Binary Search Tree', native: 'દ્વિ-અંકી શોધ વૃક્ષ (BST)', translit: 'Dvi-Anki Shodh Vriksh', formula: 'Left < Root < Right', desc: 'એક વૃક્ષ સંરચના જ્યાં ડાબું નોડ મૂળ કરતાં નાનું અને જમણું નોડ મોટું હોય છે, જે O(log n) શોધ આપે છે.' },
      { term: 'Dynamic Programming', native: 'ડાયનેમિક પ્રોગ્રામિંગ (DP)', translit: 'Kosthakikaran', formula: 'dp[i] = min/max(dp[i-k] + c)', desc: 'વારંવાર આવતી પેટા-સમસ્યાઓના પરિણામો સંગ્રહિત કરીને ગણતરીનો સમય ઘટાડવાની પદ્ધતિ.' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'કિર્ચોફના વિદ્યુત નિયમો', translit: 'KCL ane KVL', formula: '∑ I = 0,  ∑ V = 0', desc: 'વિદ્યુત પરિપથમાં જંક્શન પાસે પ્રવાહ અને બંધ ગાળામાં સ્થિતિમાનના તફાવતનો સંરક્ષણ નિયમ.' }
    ],
    Marathi: [
      { term: 'Differential Calculus', native: 'अवकलन (Differentiation)', translit: 'Avakalan', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'तात्कालिक बदलाचा दर आणि वक्राच्या स्पर्शिकेचा उतार (Slope) मोजणारी गणितीय पद्धत.' },
      { term: 'Riemann Integration', native: 'समाकलन (Integration)', translit: 'Samakalan', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'वक्राखालील एकूण क्षेत्रफळ आणि सलग बदलणाऱ्या राशींची बेरीज करण्याची पद्धत.' },
      { term: 'Matrix Transformation', native: 'मॅट्रिक्स रूपांतरण (Matrix)', translit: 'Matrix Roopantaran', formula: 'det(A) = a·d - b·c', desc: 'रेषीय समीकरणांनी निर्देशक पद्धतीचे रूपांतरण; निश्चयक (Determinant) क्षेत्रफळाचे प्रमाण दर्शवतो.' },
      { term: 'Binary Search Tree', native: 'बायनरी शोध ट्री (BST)', translit: 'Binary Shodh Tree', formula: 'Left < Root < Right', desc: 'डावा घटक मुळापेक्षा लहान आणि उजवा घटक मोठा असलेली O(log n) वेळेत शोध घेणारी डेटा रचना.' },
      { term: 'Dynamic Programming', native: 'डायनॅमिक प्रोग्रामिंग (DP)', translit: 'Smruti Sanchay', formula: 'dp[i] = opt(dp[i-1], dp[i-2])', desc: 'उप-समस्यांची उत्तरे साठवून ठेवून पुन्हा पुन्हा होणारी गणना टाळण्याचे तंत्र.' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'किरचॉफचे परिपथ नियम', translit: 'KCL va KVL', formula: '∑ I = 0,  ∑ V = 0', desc: 'विद्युत मंडलातील विद्युतधारा आणि विभवांतराचे संतुलन स्पष्ट करणारे मूलभूत नियम.' }
    ],
    Tamil: [
      { term: 'Differential Calculus', native: 'வகை நுண்கணிதம் (Differentiation)', translit: 'Vagai Nunkanitham', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'ஒரு சார்பின் கணநேர மாறுபாட்டு வீதம் மற்றும் தொடுகோட்டின் சாய்வைக் கண்டறியும் கணித முறை.' },
      { term: 'Riemann Integration', native: 'தொகை நுண்கணிதம் (Integration)', translit: 'Thogai Nunkanitham', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'வளைகோட்டின் கீழ் உள்ள நுண்ணிய செவ்வகங்களின் கூட்டுத்தொகையால் மொத்தப் பரப்பளவைக் கணக்கிடுதல்.' },
      { term: 'Matrix Transformation', native: 'அணி உருமாற்றம் (Matrix)', translit: 'Ani Urumaatram', formula: 'det(A) = a·d - b·c', desc: 'நேரியல் சேர்க்கைகள் மூலம் ஆய அச்சுகளை உருமாற்றுதல்; அணிக்கோவை பரப்பளவு மாற்றத்தைக் குறிக்கும்.' },
      { term: 'Binary Search Tree', native: 'இருமத் தேடல் மரம் (BST)', translit: 'Iruma Thedal Maram', formula: 'Left < Root < Right', desc: 'இடது கிளை சிறியதாகவும் வலது கிளை பெரியதாகவும் அமைந்து O(log n) நேரத்தில் தேட உதவும் தரவு அமைப்பு.' },
      { term: 'Dynamic Programming', native: 'இயங்கு நிரலாக்கம் (DP)', translit: 'Iyangu Niralaakkam', formula: 'dp[i] = min/max(dp[i-k] + c)', desc: 'துணைச் சிக்கல்களின் விடைகளைச் சேமித்து வைத்து மீண்டும் கணக்கிடுவதைத் தவிர்க்கும் வழிமுறை.' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'கிர்ச்சாஃப் மின்சுற்று விதிகள்', translit: 'KCL & KVL Vithigal', formula: '∑ I = 0,  ∑ V = 0', desc: 'மின்சுற்று சந்திப்புகளில் மின்னோட்டம் மற்றும் மூடிய சுற்றுகளில் மின்னழுத்தப்conservation விதிகள்.' }
    ],
    Telugu: [
      { term: 'Differential Calculus', native: 'అవకలన గణితం (Differentiation)', translit: 'Avakalana Ganitham', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'ప్రమేయంలో తక్షణ మార్పు రేటును మరియు వక్రరేఖ యొక్క స్పర్శరేఖ వాలును కొలిచే గణిత పద్ధతి.' },
      { term: 'Riemann Integration', native: 'సమాకలన గణితం (Integration)', translit: 'Samakalana Ganitham', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'వక్రరేఖ కింద ఉన్న సూక్ష్మ దీర్ఘచతురస్రాల మొత్తంతో నికర వైశాల్యాన్ని లెక్కించే పద్ధతి.' },
      { term: 'Matrix Transformation', native: 'మాత్రిక రూపాంతరం (Matrix)', translit: 'Matrika Roopantaram', formula: 'det(A) = a·d - b·c', desc: 'రేఖీయ సంయోగాల ద్వారా నిరూపక తలాన్ని మార్చడం; నిర్ధారకం వైశాల్య నిష్పత్తిని తెలుపుతుంది.' },
      { term: 'Binary Search Tree', native: 'బైనరీ సెర్చ్ ట్రీ (BST)', translit: 'Dvi-Adhara Vruksham', formula: 'Left < Root < Right', desc: 'ఎడమ నోడ్ చిన్నదిగా, కుడి నోడ్ పెద్దదిగా ఉండి O(log n) సమయంలో శోధించే డేటా నిర్మాణం.' },
      { term: 'Dynamic Programming', native: 'డైనమిక్ ప్రోగ్రామింగ్ (DP)', translit: 'Dynamic Programming', formula: 'dp[i] = opt(dp[i-1], dp[i-2])', desc: 'ఉప-సమస్యల ఫలితాలను నిల్వ చేసి పునరావృత గణనలను నివారించే అల్గారిథమిక్ పద్ధతి.' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'కిర్కాఫ్ వలయ నియమాలు', translit: 'KCL & KVL Niyamalu', formula: '∑ I = 0,  ∑ V = 0', desc: 'విద్యుత్ వలయాల్లో విద్యుత్ ప్రవాహం మరియు పొటెన్షియల్ భేదాల నిత్యత్వ నియమాలు.' }
    ],
    Bengali: [
      { term: 'Differential Calculus', native: 'অন্তরীকরণ (Differentiation)', translit: 'Ontorikoron', formula: "f'(x) = lim_{h→0} [f(x+h) - f(x)] / h", desc: 'কোনো ফাংশনের তাৎক্ষণিক পরিবর্তনের হার এবং স্পর্শকের ঢাল নির্ণয়ের গাণিতিক পদ্ধতি।' },
      { term: 'Riemann Integration', native: 'সমাকলন (Integration)', translit: 'Somakolon', formula: '∫_a^b f(x) dx = F(b) - F(a)', desc: 'বক্ররেখার নিচে অসংখ্য ক্ষুদ্র আয়তক্ষেত্রের সমষ্টি দ্বারা মোট ক্ষেত্রফল নির্ণয়।' },
      { term: 'Matrix Transformation', native: 'ম্যাট্রিক্স রূপান্তর (Matrix)', translit: 'Matrix Roopantor', formula: 'det(A) = a·d - b·c', desc: 'রৈখিক সমন্বয়ের মাধ্যমে স্থানাঙ্ক জগতের রূপান্তর; নির্ণায়ক ক্ষেত্রফলের পরিবর্তন নির্দেশ করে।' },
      { term: 'Binary Search Tree', native: 'বাইনারি সার্চ ট্রি (BST)', translit: 'Binary Search Tree', formula: 'Left < Root < Right', desc: 'বাম দিকের মান ছোট এবং ডান দিকের মান বড় রেখে O(log n) সময়ে অনুসন্ধানের ডেটা স্ট্রাকচার।' },
      { term: 'Dynamic Programming', native: 'ডায়নামিক প্রোগ্রামিং (DP)', translit: 'Dynamic Programming', formula: 'dp[i] = min/max(dp[i-k] + c)', desc: 'উপ-সমস্যার সমাধান সংরক্ষণ করে পুনরায় গণনা এড়ানোর মাধ্যমে দ্রুত সমাধানের কৌশল।' },
      { term: 'Kirchhoff\'s Circuit Laws', native: 'কার্শফের বর্তনী সূত্র', translit: 'KCL o KVL Sutro', formula: '∑ I = 0,  ∑ V = 0', desc: 'বৈদ্যুতিক বর্তনীর সংযোগস্থলে তড়িৎ প্রবাহ এবং বদ্ধ লুপে বিভব পার্থক্যের সংরক্ষণ সূত্র।' }
    ]
  };

  const activeDict = DICTIONARY[selectedLang] || DICTIONARY.English;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pageTitle}
        desc={t.pageDesc}
        action={
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E1D6AE] shadow-xs">
            <span className="text-xs font-semibold text-[#2C3524]">{t.langLabel}</span>
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="p-1 rounded-lg bg-[#F2E8CF]/50 text-xs font-bold text-sagedeep focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
            </select>
          </div>
        }
      />

      {/* Active Language Quick Concept Strip (visible on all tabs when non-English or English is selected) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F2E8CF]/70 to-white border border-[#E1D6AE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-sagedeep text-pcream font-bold uppercase text-[10px]">
            {selectedLang} Mode
          </span>
          <span className="text-[#2C3524] font-medium">
            {activeDict[0]?.native} ({activeDict[0]?.term}) • {activeDict[1]?.native} • {activeDict[2]?.native} • {activeDict[3]?.native}
          </span>
        </div>
        <button
          onClick={() => setActiveTab('multilingual')}
          className="text-sagedeep font-bold hover:underline shrink-0 text-left sm:text-right"
        >
          {t.tabGlossary} →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E1D6AE] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculus')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'calculus'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {t.tabCalculus}
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'matrix'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {t.tabMatrix}
        </button>
        <button
          onClick={() => setActiveTab('algorithms')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'algorithms'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {t.tabAlgorithms}
        </button>
        <button
          onClick={() => setActiveTab('multilingual')}
          className={`pb-3 text-sm font-semibold transition whitespace-nowrap border-b-2 ${
            activeTab === 'multilingual'
              ? 'border-sagedeep text-sagedeep'
              : 'border-transparent text-[var(--text-muted)] hover:text-[#2C3524]'
          }`}
        >
          {t.tabGlossary}
        </button>
      </div>

      {/* 1. CALCULUS EXPLORER (STRICTLY CLIPPED + INTERACTIVE) */}
      {activeTab === 'calculus' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                  {t.calcTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {t.calcDesc}
                </p>
              </div>

              {/* Function Selector */}
              <div className="flex gap-1.5 bg-[#F2E8CF]/60 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setCalcFunc('poly')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'poly' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  x² - 4x + 3
                </button>
                <button
                  onClick={() => setCalcFunc('trig')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'trig' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  2.5·sin(x)
                </button>
                <button
                  onClick={() => setCalcFunc('cubic')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    calcFunc === 'cubic' ? 'bg-sagedeep text-pcream shadow-sm' : 'text-[#2C3524]'
                  }`}
                >
                  0.5(x³ - 3x)
                </button>
              </div>
            </div>

            {/* Clipped Live SVG Graph with Click-to-Set x0 */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
              <svg
                width="100%"
                height={240}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-hidden rounded-lg cursor-crosshair select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = ((e.clientX - rect.left) / rect.width) * width;
                  setX0(fromSvgX(relX));
                }}
              >
                <defs>
                  <clipPath id="calc-plot-clip">
                    <rect x="0" y="0" width={width} height={height} />
                  </clipPath>
                </defs>

                {/* Subtle Coordinate Grid */}
                {[-2, -1, 1, 2].map((gx) => (
                  <line
                    key={`gx-${gx}`}
                    x1={toSvgX(gx)}
                    y1={0}
                    x2={toSvgX(gx)}
                    y2={height}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                ))}
                {[-4, -2, 2, 4, 6].map((gy) => (
                  <line
                    key={`gy-${gy}`}
                    x1={0}
                    y1={toSvgY(gy)}
                    x2={width}
                    y2={toSvgY(gy)}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                ))}

                {/* Main X & Y Axes */}
                <line x1={0} y1={toSvgY(0)} x2={width} y2={toSvgY(0)} stroke="#475569" strokeWidth="1.5" />
                <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={height} stroke="#475569" strokeWidth="1.5" />

                {/* Strictly Clipped Plot Elements */}
                <g clipPath="url(#calc-plot-clip)">
                  {/* Shaded Exact Area Under Curve */}
                  <path d={areaPoly} fill="#10b981" fillOpacity="0.22" />

                  {/* Riemann Sum Rectangles */}
                  {showRiemann &&
                    riemannRects.map((r, idx) => (
                      <rect
                        key={idx}
                        x={r.x}
                        y={r.y}
                        width={r.w}
                        height={r.h}
                        fill={r.positive ? '#10b981' : '#f59e0b'}
                        fillOpacity="0.32"
                        stroke={r.positive ? '#34d399' : '#fbbf24'}
                        strokeWidth="0.8"
                      />
                    ))}

                  {/* Function Curve f(x) */}
                  <path d={curvePoints} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

                  {/* Optional Secant Line */}
                  {showSecant && (
                    <>
                      <line
                        x1={toSvgX(x0)}
                        y1={toSvgY(fx)}
                        x2={toSvgX(xSec)}
                        y2={toSvgY(ySec)}
                        stroke="#fbbf24"
                        strokeWidth="2"
                      />
                      <circle cx={toSvgX(xSec)} cy={toSvgY(ySec)} r="4" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
                    </>
                  )}

                  {/* Tangent Line at x0 */}
                  <line
                    x1={toSvgX(tanX1)}
                    y1={toSvgY(tanY1)}
                    x2={toSvgX(tanX2)}
                    y2={toSvgY(tanY2)}
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />

                  {/* Point at (x0, f(x0)) */}
                  <circle cx={toSvgX(x0)} cy={toSvgY(fx)} r="5.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.8" />
                </g>

                {/* In-Canvas Coordinate Readout */}
                <text x={10} y={18} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Click anywhere on graph to move x₀ ({x0.toFixed(2)}, {fx.toFixed(2)})
                </text>
              </svg>

              <div className="w-full flex flex-wrap justify-between gap-2 text-[10px] text-slate-400 font-mono mt-2">
                <span>x ∈ [-3.0, +3.0]</span>
                <span className="text-emerald-400">Integral ∫₀^{x0.toFixed(1)} = {integral.toFixed(2)}</span>
                {showRiemann && (
                  <span className="text-teal-300">Riemann ({riemannN} bars) ≈ {riemannSum.toFixed(2)}</span>
                )}
                <span className="text-rose-400">Tangent Slope m = {dfx.toFixed(2)}</span>
              </div>
            </div>

            {/* Interactive Controls Row */}
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2C3524]">Point x₀: <strong className="font-mono text-sagedeep">{x0.toFixed(2)}</strong></span>
                  <Button
                    size="sm"
                    variant={isSweeping ? 'primary' : 'outline'}
                    className="text-[11px] py-0.5 px-2.5"
                    onClick={() => setIsSweeping((v) => !v)}
                  >
                    {isSweeping ? '⏸ Pause Sweep' : '▶ Auto-Sweep x₀'}
                  </Button>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full accent-sagedeep cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 font-semibold text-[#2C3524] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRiemann}
                      onChange={(e) => setShowRiemann(e.target.checked)}
                      className="accent-sagedeep"
                    />
                    Riemann Rectangles (N = {riemannN})
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-amber-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSecant}
                      onChange={(e) => setShowSecant(e.target.checked)}
                      className="accent-amber-600"
                    />
                    Secant Chord (Δx = {deltaX.toFixed(1)})
                  </label>
                </div>
                {showSecant ? (
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={deltaX}
                    onChange={(e) => setDeltaX(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                ) : (
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="2"
                    value={riemannN}
                    disabled={!showRiemann}
                    onChange={(e) => setRiemannN(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Analytical Breakdown & Real-World AI Insights */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h5 className="font-display font-semibold text-sm text-[#2C3524] uppercase tracking-wider">
                {t.liveCalcHeading}
              </h5>

              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5">
                <div className="text-sky-400 font-bold">{funcLabel}</div>
                <div className="text-rose-400 font-bold">{derivLabel}</div>
                <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                  <div>f({x0.toFixed(2)}) = <span className="text-emerald-400 font-bold">{fx.toFixed(2)}</span></div>
                  <div>Derivative f'({x0.toFixed(2)}) = <span className="text-rose-400 font-bold">{dfx.toFixed(2)}</span></div>
                  {showSecant && (
                    <div>Secant Slope Δy/Δx = <span className="text-amber-300 font-bold">{secSlope.toFixed(2)}</span></div>
                  )}
                  <div>Exact Integral ∫₀^{x0.toFixed(1)} = <span className="text-amber-400 font-bold">{integral.toFixed(2)}</span></div>
                  {showRiemann && (
                    <div>Riemann Sum (N={riemannN}) = <span className="text-teal-300 font-bold">{riemannSum.toFixed(2)}</span></div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F2E8CF]/50 border border-[#E1D6AE] text-xs space-y-1">
                <div className="font-bold text-[#2C3524]">Tangent Line at ({x0.toFixed(1)}, {fx.toFixed(1)}):</div>
                <div className="font-mono text-xs text-sagedeep font-bold">
                  y = {dfx.toFixed(2)} · (x - {x0.toFixed(2)}) + {fx.toFixed(2)}
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 uppercase tracking-wider">
                <span>🤖</span> AI & Machine Learning Link
              </div>
              <h6 className="font-semibold text-sm text-blue-950">{t.aiLinkTitle}</h6>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                {t.aiLinkBody}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 2. 2D MATRIX TRANSFORMATION SANDBOX (CLIPPED + ANIMATED MORPH + TEST VECTOR) */}
      {activeTab === 'matrix' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                  {t.matrixTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {t.matrixDesc}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('identity')}>
                  Identity
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('rot45')}>
                  45° Rotate
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('rot90')}>
                  90° Rotate
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('shearX')}>
                  X-Shear
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('reflect')}>
                  Reflect
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => applyMatrixPreset('singular')}>
                  Singular (det=0)
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="text-[10px] py-1 px-2.5"
                  onClick={() => {
                    setMorphT(0.0);
                    setIsMorphing(true);
                  }}
                >
                  ▶ Animate Morph
                </Button>
              </div>
            </div>

            {/* Strictly Clipped SVG Coordinate Grid with Click-to-Set Test Vector v */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
              <svg
                width="100%"
                height={260}
                viewBox="0 0 340 260"
                className="overflow-hidden rounded-lg cursor-crosshair select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const px = ((e.clientX - rect.left) / rect.width) * 340;
                  const py = ((e.clientY - rect.top) / rect.height) * 260;
                  const vx = Math.max(-2.5, Math.min(2.5, Number(((px - originX) / scale).toFixed(2))));
                  const vy = Math.max(-2.2, Math.min(2.2, Number(((originY - py) / scale).toFixed(2))));
                  setVecX(vx);
                  setVecY(vy);
                }}
              >
                <defs>
                  <clipPath id="matrix-plot-clip">
                    <rect x="0" y="0" width="340" height="260" />
                  </clipPath>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                  </marker>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                  </marker>
                </defs>

                {/* Reference Grid Lines */}
                {[-3, -2, -1, 1, 2, 3].map((g) => (
                  <React.Fragment key={g}>
                    <line x1={originX + g * scale} y1={0} x2={originX + g * scale} y2={260} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={0} y1={originY + g * scale} x2={340} y2={originY + g * scale} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                  </React.Fragment>
                ))}

                {/* Main Axes */}
                <line x1={0} y1={originY} x2={340} y2={originY} stroke="#475569" strokeWidth="1.5" />
                <line x1={originX} y1={0} x2={originX} y2={260} stroke="#475569" strokeWidth="1.5" />

                <g clipPath="url(#matrix-plot-clip)">
                  {/* Transformed Unit Square (Parallelogram) */}
                  <polygon
                    points={`${originX},${originY} ${iX},${iY} ${cornerX},${cornerY} ${jX},${jY}`}
                    fill={det < 0 ? '#f59e0b' : '#10b981'}
                    fillOpacity="0.24"
                    stroke={det < 0 ? '#fbbf24' : '#10b981'}
                    strokeWidth="1.5"
                  />

                  {/* Original Input Vector v (dashed slate) */}
                  <line
                    x1={originX}
                    y1={originY}
                    x2={vSvgX}
                    y2={vSvgY}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle cx={vSvgX} cy={vSvgY} r="3.5" fill="#94a3b8" />

                  {/* Transformed Vector A*v (Amber) */}
                  <line
                    x1={originX}
                    y1={originY}
                    x2={avSvgX}
                    y2={avSvgY}
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow-amber)"
                  />

                  {/* Transformed Basis Vector î' (Red) */}
                  <line x1={originX} y1={originY} x2={iX} y2={iY} stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrow-red)" />

                  {/* Transformed Basis Vector ĵ' (Blue) */}
                  <line x1={originX} y1={originY} x2={jX} y2={jY} stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                </g>

                <text x={8} y={16} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Click grid to place input vector v = [{vecX.toFixed(1)}, {vecY.toFixed(1)}]ᵀ
                </text>
              </svg>

              <div className="w-full flex flex-wrap justify-between gap-2 text-[10px] font-mono text-slate-400 mt-1">
                <span className="text-rose-400 font-bold">î' = [{effA.toFixed(2)}, {effC.toFixed(2)}]ᵀ</span>
                <span className="text-sky-400 font-bold">ĵ' = [{effB.toFixed(2)}, {effD.toFixed(2)}]ᵀ</span>
                <span className="text-amber-300 font-bold">A·v = [{outVecX.toFixed(2)}, {outVecY.toFixed(2)}]ᵀ</span>
                <span className="text-emerald-400 font-bold">Area |det(A)| = {Math.abs(det).toFixed(2)}</span>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-700">a (î_x scale):</span>
                  <span className="font-mono font-bold">{matA.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matA}
                  onChange={(e) => { setMatA(parseFloat(e.target.value)); setMorphT(1); }}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-sky-700">b (ĵ_x shear):</span>
                  <span className="font-mono font-bold">{matB.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matB}
                  onChange={(e) => { setMatB(parseFloat(e.target.value)); setMorphT(1); }}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-rose-700">c (î_y shear):</span>
                  <span className="font-mono font-bold">{matC.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matC}
                  onChange={(e) => { setMatC(parseFloat(e.target.value)); setMorphT(1); }}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-sky-700">d (ĵ_y scale):</span>
                  <span className="font-mono font-bold">{matD.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={matD}
                  onChange={(e) => { setMatD(parseFloat(e.target.value)); setMorphT(1); }}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>
          </Card>

          {/* Determinant & Graphic Applications */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h5 className="font-display font-semibold text-sm text-[#2C3524] uppercase tracking-wider">
                Transformation Matrix A
              </h5>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-center flex items-center justify-center gap-4 text-base shadow-inner">
                <span>[</span>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <span className="text-rose-400 font-bold">{effA.toFixed(2)}</span>
                  <span className="text-sky-400 font-bold">{effB.toFixed(2)}</span>
                  <span className="text-rose-400 font-bold">{effC.toFixed(2)}</span>
                  <span className="text-sky-400 font-bold">{effD.toFixed(2)}</span>
                </div>
                <span>]</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F2E8CF]/60 border border-[#E1D6AE] text-xs space-y-1.5">
                <div className="font-bold text-[#2C3524]">Determinant & Vector Mapping:</div>
                <div className="font-mono text-xs text-sagedeep font-bold">
                  det(A) = ({effA.toFixed(1)}·{effD.toFixed(1)}) - ({effB.toFixed(1)}·{effC.toFixed(1)}) = {det.toFixed(2)}
                </div>
                <div className="font-mono text-[11px] text-[#2C3524]">
                  v = [{vecX.toFixed(1)}, {vecY.toFixed(1)}]ᵀ → A·v = [{outVecX.toFixed(2)}, {outVecY.toFixed(2)}]ᵀ
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {Math.abs(det) < 0.01 ? (
                    <strong className="text-rose-700">⚠️ Singular Matrix (Rank &lt; 2): 2D plane collapses onto a line! Not invertible.</strong>
                  ) : det < 0 ? (
                    <strong className="text-amber-700">🔄 Orientation Inverted (det &lt; 0): Space is reflected across an axis.</strong>
                  ) : (
                    <strong className="text-emerald-700">✓ Orientation Preserved: Area scaled by {det.toFixed(2)}x.</strong>
                  )}
                </p>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <span>🎮</span> Computer Graphics & Vision Link
              </div>
              <h6 className="font-semibold text-sm text-emerald-950">{t.graphicsLinkTitle}</h6>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                {t.graphicsLinkBody}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 3. ALGORITHMS & SYSTEMS SANDBOX (REAL DYNAMIC SVG BST + SORTING + LRU) */}
      {activeTab === 'algorithms' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Dynamic SVG BST Sandbox */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display font-semibold text-base text-[#2C3524]">
                    {t.bstTitle}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t.bstDesc}
                  </p>
                </div>
                <Tag tone="sage">O(log n)</Tag>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  placeholder="Enter integer (e.g. 25, 65)..."
                  value={newBstVal}
                  onChange={(e) => setNewBstVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBstNode()}
                  className="flex-1 min-w-[140px] p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
                />
                <Button size="sm" variant="primary" onClick={handleAddBstNode}>
                  + Insert
                </Button>
                <Button size="sm" variant="outline" onClick={handleSearchBstNode}>
                  🔍 Search
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBstNodes([50, 30, 70, 20, 40, 60, 80]);
                    setHighlightedNode(null);
                    setTraversalOrder([]);
                    setBstStatusMsg('Reset to balanced 7-node BST.');
                  }}
                >
                  Reset
                </Button>
              </div>

              {/* Traversal Animator Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#2C3524] mr-1">Animate Traversal:</span>
                {(['In-Order', 'Pre-Order', 'Post-Order', 'Level-Order BFS'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => runBstTraversal(mode)}
                    className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
                      traversalType === mode && traversalOrder.length > 0
                        ? 'bg-sagedeep text-pcream border-sagedeep'
                        : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/50'
                    }`}
                  >
                    ▶ {mode}
                  </button>
                ))}
              </div>

              {/* Real Dynamic SVG Tree Canvas (click any node to remove it) */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                <svg width="100%" height={220} viewBox="0 0 340 220" className="overflow-hidden select-none">
                  {/* Edges */}
                  {bstLayout.edges.map((e, idx) => (
                    <line
                      key={idx}
                      x1={e.x1}
                      y1={e.y1}
                      x2={e.x2}
                      y2={e.y2}
                      stroke="#475569"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Nodes */}
                  {bstLayout.nodes.map((n) => {
                    const isHigh = highlightedNode === n.val;
                    const isVisited = traversalOrder.includes(n.val);
                    return (
                      <g
                        key={n.val}
                        className="cursor-pointer"
                        onClick={() => {
                          if (bstNodes.length <= 1) return;
                          setBstNodes((prev) => prev.filter((x) => x !== n.val));
                          setBstStatusMsg(`Removed node ${n.val} and rebuilt BST.`);
                        }}
                      >
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={isHigh ? 17 : 14}
                          fill={isHigh ? '#f43f5e' : isVisited ? '#10b981' : '#2563eb'}
                          stroke="#ffffff"
                          strokeWidth={isHigh ? 2.5 : 1.5}
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {n.val}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>{bstStatusMsg}</span>
                  <span>(Click any node to delete)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F2E8CF]/50 border border-[#E1D6AE] text-xs">
                <span className="font-semibold text-[#2C3524]">
                  {traversalOrder.length > 0 ? `${traversalType} Sequence:` : 'In-Order Sorted Sequence:'}
                </span>
                <div className="font-mono text-xs text-sagedeep font-bold mt-1">
                  [{(traversalOrder.length > 0 ? traversalOrder : [...bstNodes].sort((a, b) => a - b)).join(' → ')}]
                </div>
              </div>
            </Card>

            {/* LRU Cache Sandbox */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-base text-[#2C3524]">
                    {t.lruTitle}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t.lruDesc}
                  </p>
                </div>
                <Tag tone="purple">Capacity: 3</Tag>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. page:4)"
                  value={cacheKeyInput}
                  onChange={(e) => setCacheKeyInput(e.target.value)}
                  className="w-1/3 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Dashboard)"
                  value={cacheValInput}
                  onChange={(e) => setCacheValInput(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-[#E1D6AE] bg-white text-xs text-[#2C3524]"
                />
                <Button size="sm" variant="primary" onClick={handleLruPut}>
                  PUT
                </Button>
              </div>

              {/* Visual Cache Slots */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#2C3524] uppercase">
                  Live Cache Memory (Click any slot to trigger O(1) GET Hit):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {lruCache.map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => handleLruGet(item.key)}
                      className="p-3 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 transition cursor-pointer text-center"
                    >
                      <div className="text-[10px] text-purple-700 font-bold uppercase">
                        {idx === lruCache.length - 1 ? 'MRU (Newest)' : idx === 0 ? 'LRU (Evict Next)' : 'Cached'}
                      </div>
                      <div className="font-mono text-xs font-bold text-purple-950 mt-1">{item.key}</div>
                      <div className="text-[11px] text-purple-800">{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Log */}
              <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1">
                <div className="text-slate-500 font-bold uppercase text-[9px]">Operation Stream:</div>
                {cacheLog.map((log, i) => (
                  <div key={i} className="text-emerald-400">↳ {log}</div>
                ))}
              </div>
            </Card>
          </div>

          {/* Interactive Array Sorting Visualizer */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-semibold text-base text-[#2C3524]">
                  {t.sortTitle}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {t.sortDesc}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={handleSortStep}>
                  ▶ Next Swap Step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const sorted = [...sortArr].sort((a, b) => a - b);
                    setSortArr(sorted);
                    setCompareIndices([]);
                    setSortedIndices(sorted.map((_, idx) => idx));
                    setSortMsg('Completed full sort pass in O(N log N).');
                  }}
                >
                  ⚡ Complete Sort
                </Button>
                <Button size="sm" variant="outline" onClick={handleShuffleSort}>
                  🔀 Shuffle Array
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="h-36 flex items-end justify-center gap-3 px-4">
                {sortArr.map((val, idx) => {
                  const isComparing = compareIndices.includes(idx);
                  const isSorted = sortedIndices.includes(idx);
                  return (
                    <div key={idx} className="flex-1 max-w-[48px] flex flex-col items-center gap-1">
                      <span className="text-[11px] font-mono font-bold text-white">{val}</span>
                      <div
                        style={{ height: `${Math.max(18, val * 1.1)}px` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isComparing
                            ? 'bg-rose-500 shadow-lg'
                            : isSorted
                            ? 'bg-emerald-500'
                            : 'bg-sky-500'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-xs font-mono text-emerald-400 mt-3 pt-2 border-t border-slate-800">
                {sortMsg}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. MULTILINGUAL GLOSSARY */}
      {activeTab === 'multilingual' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E1D6AE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-semibold text-lg text-[#2C3524]">
                {t.glossaryTitle}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {t.glossaryDesc}
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sagedeep text-pcream shrink-0">
              Active Dialect: {selectedLang}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activeDict.map((item, idx) => (
              <Card key={idx} className="p-5 space-y-2.5 border border-[#E1D6AE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sagedeep uppercase tracking-wider">{item.term}</span>
                  <Tag tone="sage">{item.translit}</Tag>
                </div>
                <h5 className="font-display font-bold text-xl text-[#2C3524]">{item.native}</h5>
                {item.formula && (
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs">
                    {item.formula}
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[#E1D6AE]/50">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 10. INSTITUTE MENTORING & ACADEMIC QUERIES
// =========================================================================

export const StudentMentoringView: React.FC = () => {
  const [queries, setQueries] = useState<InstituteQueryItem[]>([]);
  const [guidance, setGuidance] = useState<InstituteGuidanceItem[]>([]);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [qRes, gRes] = await Promise.allSettled([
        studentApi.getQueries(),
        studentApi.getGuidance()
      ]);
      if (qRes.status === 'fulfilled' && qRes.value) {
        setQueries(qRes.value.queries || []);
      }
      if (gRes.status === 'fulfilled' && gRes.value) {
        setGuidance(gRes.value.guidance || []);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute Mentoring & Academic Queries"
        desc="Raise academic doubts, syllabus queries, or exam questions directly to your college faculty and view their responses."
        action={
          <Button variant="primary" onClick={() => setShowRaiseModal(true)}>
            + Ask Faculty a Question
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Queries & Faculty Responses */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Your Queries & Faculty Responses
          </h3>

          {queries.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
              You haven't raised any queries yet. Click "+ Ask Faculty a Question" to clear your doubts.
            </Card>
          ) : (
            queries.map((q) => (
              <Card key={q.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2C3524]">{q.title}</span>
                    <Tag tone="blue">{q.subject_name}</Tag>
                  </div>
                  <Tag tone={q.status === 'answered' ? 'sage' : 'amber'}>
                    {q.status === 'answered' ? 'Answered by Faculty ✓' : 'Pending Review'}
                  </Tag>
                </div>

                <p className="text-xs text-[#2C3524] mb-3 leading-relaxed">
                  {q.question_text}
                </p>

                {q.response_text ? (
                  <div className="p-3.5 rounded-xl bg-sagedeep/10 border border-sagedeep/20 text-xs">
                    <div className="font-bold text-sagedeep mb-1">Faculty Response:</div>
                    <p className="text-[#2C3524] leading-relaxed">{q.response_text}</p>
                    {q.answered_at && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                        Answered on {q.answered_at}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[var(--text-muted)] italic">
                    Faculty has received this query and will respond shortly.
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Right Col: Faculty Guidance & Tips */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-base text-[#2C3524]">
            Faculty Guidance Broadcasts
          </h3>
          {guidance.length === 0 ? (
            <Card className="p-6 text-center text-xs text-[var(--text-muted)]">
              No faculty guidance broadcasted yet.
            </Card>
          ) : (
            guidance.map((g) => (
              <Card key={g.id} className="p-4 bg-white border border-[#E1D6AE]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-xs text-[#2C3524]">{g.subject_name}</span>
                  <Tag tone="purple">{g.guidance_type}</Tag>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {g.message}
                </p>
                <div className="text-[10px] text-[var(--text-muted)] mt-2">
                  Broadcasted: {g.created_at}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {showRaiseModal && (
        <RaiseQueryModal
          onClose={() => setShowRaiseModal(false)}
          onSuccess={() => {
            loadData();
            setShowRaiseModal(false);
          }}
        />
      )}
    </div>
  );
};

const RaiseQueryModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [queryType, setQueryType] = useState('academic_doubt');
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.raiseQuery({
        subject_name: subject,
        query_type: queryType,
        title,
        question_text: questionText
      });
      alert('Academic query submitted to your institute faculty.');
      onSuccess();
    } catch {
      alert('Could not submit query.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Ask College Faculty a Question" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Query Type</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="academic_doubt">Concept / Syllabus Doubt</option>
            <option value="examination">Exam Preparation Question</option>
            <option value="schedule">Schedule or Assignment Conflict</option>
            <option value="guidance">General Academic Mentoring</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Query Subject / Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Clarification on Dijkstra's vs Bellman-Ford algorithm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Detailed Explanation</label>
          <textarea
            rows={3}
            required
            placeholder="Explain specifically what you find unclear or what topic was discussed in lecture that you need help with."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Send Query to Faculty'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 11. ACADEMICIAN RESEARCH COLLABORATION
// =========================================================================

export const StudentResearchView: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    try {
      const res = await studentApi.getResearchPapers();
      if (res?.papers) {
        setPapers(res.papers);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleAskQuestion = async (paperId: number | string) => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await studentApi.askResearchQuestion(paperId, questionText);
      alert('Question sent directly to the academic researcher!');
      setQuestionText('');
      setSelectedPaper(null);
      fetchPapers();
    } catch {
      alert('Could not submit research question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academician Research Collaboration"
        desc="Discover research papers published by university professors and academicians. Ask questions and participate directly in academic research discussions."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {papers.map((p) => (
          <Card key={p.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag tone="sage">{p.field || 'Research'}</Tag>
                {p.year && <span className="text-xs text-[var(--text-muted)] font-mono">{p.year}</span>}
              </div>
              <h3 className="font-display font-bold text-base text-[#2C3524] mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed line-clamp-3">
                {p.abstract || 'Academic paper exploring advanced paradigms and domain contributions.'}
              </p>
              <div className="text-[11px] text-[#2C3524] font-medium mb-4">
                <strong>Author:</strong> {p.author || 'University Researcher'}
              </div>

              {/* Discussions count */}
              {p.discussions && p.discussions.length > 0 && (
                <div className="p-3 rounded-lg bg-[#F2E8CF]/50 border border-[#E1D6AE] mb-4 text-xs space-y-2">
                  <div className="font-semibold text-sagedeep text-[11px]">
                    Academic Discussions ({p.discussions.length})
                  </div>
                  {p.discussions.slice(0, 2).map((d: any, idx: number) => (
                    <div key={idx} className="border-b border-[#E1D6AE]/50 pb-1.5 last:border-0 last:pb-0">
                      <div className="font-medium text-[#2C3524]">Q: {d.q || d.question}</div>
                      {d.response && (
                        <div className="text-sagedeep mt-0.5 text-[11px]">
                          <strong>Prof Response:</strong> {d.response}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E1D6AE]">
              {p.pdf_url ? (
                <a
                  href={p.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-sagedeep hover:underline"
                >
                  Download Paper PDF ↗
                </a>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">Verified Publication</span>
              )}

              <Button size="sm" variant="primary" onClick={() => setSelectedPaper(p)}>
                Ask Researcher a Question
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedPaper && (
        <Modal title={`Ask Researcher: ${selectedPaper.title}`} onClose={() => setSelectedPaper(null)}>
          <div className="space-y-4 text-xs p-2">
            <p className="text-[var(--text-muted)]">
              Submit an academic inquiry or research feedback directly to {selectedPaper.author || 'the professor'}.
            </p>

            <textarea
              rows={4}
              required
              placeholder="State your question about their methodology, theoretical derivation, or potential collaboration."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={submitting || !questionText.trim()}
                onClick={() => handleAskQuestion(selectedPaper.id)}
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// =========================================================================
// 12. EDUCATIONAL OPPORTUNITIES
// =========================================================================

export const StudentOpportunitiesView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<EducationalOpportunity[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    studentApi.getOpportunities().then((res) => {
      if (isMounted && res?.opportunities) {
        setOpportunities(res.opportunities);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const types = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'competition', label: 'Competitions & Hackathons' },
    { key: 'fellowship', label: 'Research Fellowships' },
    { key: 'scholarship', label: 'Scholarships' },
    { key: 'workshop', label: 'Workshops & Summer Schools' }
  ];

  const filtered = opportunities.filter((o) => filterType === 'all' || o.opportunity_type === filterType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matched Educational Opportunities"
        desc="Academic competitions, research fellowships, higher education scholarships, and advanced workshops matched to your syllabus and extra skills."
      />

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filterType === t.key
                ? 'bg-sagedeep text-pcream border-sagedeep'
                : 'bg-white text-[#2C3524] border-[#E1D6AE] hover:bg-[#F2E8CF]/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((opp) => (
          <Card key={opp.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Tag tone="purple">{opp.opportunity_type}</Tag>
                {opp.deadline && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Deadline: {opp.deadline}
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-base text-[#2C3524] mb-1">
                {opp.title}
              </h3>
              <div className="text-xs font-semibold text-sagedeep mb-3">
                {opp.provider_or_institute}
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                {opp.description}
              </p>

              <div className="space-y-1 text-xs text-[#2C3524]">
                <div><strong>Eligibility:</strong> {opp.eligibility}</div>
                <div><strong>Relevant Subjects:</strong> {opp.matched_subjects}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E1D6AE] mt-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert(`Details and application link for ${opp.title} have been saved to your profile.`)}
              >
                Apply / Register Now →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 13. KNOWLEDGE-GAP REPORTING MODAL
// =========================================================================

export const KnowledgeGapModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('Operating Systems');
  const [topic, setTopic] = useState('');
  const [feedbackType, setFeedbackType] = useState('unclear_explanation');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.reportKnowledgeGap({
        subject_name: subject,
        topic_name: topic,
        feedback_type: feedbackType,
        description
      });
      alert('Feedback submitted to your institute. Faculty can review aggregated student knowledge gaps.');
      onSuccess();
      onClose();
    } catch {
      alert('Could not report knowledge gap.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Report Topic Knowledge Gap to Institute" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs p-2">
        <p className="text-[var(--text-muted)]">
          If you feel a topic was taught too quickly, lacked practical demonstrations, or was unclear, submit this anonymous feedback to help faculty schedule revision lectures.
        </p>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="Operating Systems">Operating Systems</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Topic Name</label>
          <input
            type="text"
            required
            placeholder="e.g., Deadlock Detection & Banker's Algorithm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Feedback Category</label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          >
            <option value="unclear_explanation">Explanation was difficult to understand</option>
            <option value="pacing_too_fast">Pacing in lecture was too fast</option>
            <option value="needs_solved_examples">Need more solved numerical examples</option>
            <option value="practical_lab_missing">Needs hands-on practical lab demo</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[#2C3524] mb-1">Details & Suggestions</label>
          <textarea
            rows={3}
            required
            placeholder="Explain specifically what you'd like faculty to cover in a revision session."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Anonymous Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =========================================================================
// 14. STUDENT PROFILE & ACADEMIC ONBOARDING
// =========================================================================

export const StudentProfileView: React.FC<{
  onOpenDiagnostic: (subject: string) => void;
  onOpenReportGap: () => void;
}> = ({ onOpenDiagnostic, onOpenReportGap }) => {
  const [profile, setProfile] = useState<StudentLearningProfile | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  // Form states
  const [academicClass, setAcademicClass] = useState('');
  const [boardCurriculum, setBoardCurriculum] = useState('');
  const [college, setCollege] = useState('');
  const [academicSubjects, setAcademicSubjects] = useState('');
  const [academicInterests, setAcademicInterests] = useState('');
  const [extraSubjects, setExtraSubjects] = useState('');
  const [additionalSkills, setAdditionalSkills] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const [profRes, catRes] = await Promise.allSettled([
          studentApi.getProfile(),
          studentApi.getSubjectCatalog()
        ]);
        if (!isMounted) return;
        if (profRes.status === 'fulfilled' && profRes.value?.profile) {
          const p = profRes.value.profile;
          setProfile(p);
          setAcademicClass(p.academic_class || '');
          setBoardCurriculum(p.board_curriculum || '');
          setCollege(p.college || '');
          setAcademicSubjects(p.academic_subjects || '');
          setAcademicInterests(p.academic_interests || '');
          setExtraSubjects(p.extra_subjects || '');
          setAdditionalSkills(p.additional_skills || '');
          setPreferredLanguage(p.preferred_language || 'English');
        }
        if (catRes.status === 'fulfilled' && catRes.value?.subjects) {
          setCatalog(catRes.value.subjects);
        }
      } catch {
        // fallback
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.updateProfile({
        academic_class: academicClass,
        board_curriculum: boardCurriculum,
        college,
        academic_subjects: academicSubjects,
        academic_interests: academicInterests,
        extra_subjects: extraSubjects,
        additional_skills: additionalSkills,
        preferred_language: preferredLanguage
      });
      alert('Academic profile updated successfully!');
      setEditing(false);
      // Reload profile
      const updated = await studentApi.getProfile();
      if (updated?.profile) setProfile(updated.profile);
    } catch {
      alert('Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Educational Profile & Onboarding"
        desc="Manage your academic curriculum, Track 2 elective interests, additional skills, and language preference."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onOpenReportGap}>
              Report Knowledge Gap
            </Button>
            <Button variant="primary" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel Editing' : 'Edit Academic Profile'}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-sagedeep/20 flex items-center justify-center font-display text-2xl font-bold text-sagedeep">
            {profile?.name ? profile.name[0] : 'S'}
          </div>

          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#2C3524]">{profile?.name}</h2>
              <VerifiedBadge />
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {profile?.college} • Student ID: {profile?.university_roll_no || '2024CS102'}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Tag tone="sage">{profile?.academic_class || 'Semester 4'}</Tag>
              <Tag tone="blue">Board: {profile?.board_curriculum || 'Standard'}</Tag>
              <Tag tone="purple">Language: {profile?.preferred_language || 'English'}</Tag>
            </div>
          </div>
        </div>
      </Card>

      {editing ? (
        <Card className="p-6">
          <h3 className="font-display font-semibold text-base text-[#2C3524] mb-4">
            Edit Academic Information & Subject Preferences
          </h3>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Academic Class / Grade / Year
                </label>
                <input
                  type="text"
                  required
                  value={academicClass}
                  onChange={(e) => setAcademicClass(e.target.value)}
                  placeholder="e.g. B.Tech Semester 4, Grade 12"
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Board / Curriculum
                </label>
                <input
                  type="text"
                  required
                  value={boardCurriculum}
                  onChange={(e) => setBoardCurriculum(e.target.value)}
                  placeholder="e.g. State University Syllabus, CBSE"
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C3524] mb-1">
                  Preferred Learning Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                College / School / Institute Name
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Maharaja Sayajirao University of Baroda"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Enrolled Academic Subjects (Track 1, comma-separated)
              </label>
              <input
                type="text"
                required
                value={academicSubjects}
                onChange={(e) => setAcademicSubjects(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms, Operating Systems, Database Management Systems"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Extra Subjects / Electives to Learn (Track 2, comma-separated)
              </label>
              <input
                type="text"
                value={extraSubjects}
                onChange={(e) => setExtraSubjects(e.target.value)}
                placeholder="e.g. Full Stack Web Development, Artificial Intelligence & Machine Learning"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2C3524] mb-1">
                Additional Skills Developing (comma-separated)
              </label>
              <input
                type="text"
                value={additionalSkills}
                onChange={(e) => setAdditionalSkills(e.target.value)}
                placeholder="e.g. React, Python, Cloud Architecture, Git"
                className="w-full p-2.5 rounded-lg border border-[#E1D6AE] bg-white text-[#2C3524]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6AE]">
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-display font-semibold text-base text-[#2C3524] mb-3">
              Track 1: College Curriculum Setup
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Class/Grade:</span>{' '}
                <strong className="text-[#2C3524]">{profile?.academic_class}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Curriculum:</span>{' '}
                <strong className="text-[#2C3524]">{profile?.board_curriculum}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Core Subjects:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(profile?.academic_subjects || '').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                      >
                        {clean}
                        <button
                          onClick={() => onOpenDiagnostic(clean)}
                          title="Take Diagnostic"
                          className="hover:underline text-[10px] text-emerald-600 font-bold"
                        >
                          [Test]
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-display font-semibold text-base text-[#2C3524] mb-3">
              Track 2: Extra Learning & Skills Setup
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Extra Electives / Topics:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(profile?.extra_subjects || 'Web Dev, Cloud, AI').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return <Tag key={idx} tone="purple">{clean}</Tag>;
                  })}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Developing Skills:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(profile?.additional_skills || 'React, SQL, Python').split(',').map((s: string, idx: number) => {
                    const clean = s.trim();
                    if (!clean) return null;
                    return <Tag key={idx} tone="sage">{clean}</Tag>;
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
