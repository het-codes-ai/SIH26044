import React, { useState } from 'react';
import { PortalShell } from '../common/PortalShell';
import {
  StudentOverview,
  StudentPathwaysView,
  DiagnosticModal,
  StudentSyllabusView,
  DailySyllabusModal,
  StudentScheduleView,
  StudentPracticeView,
  PracticeTestModal,
  StudentLearningView,
  StudentMentoringView,
  StudentResearchView,
  StudentOpportunitiesView,
  KnowledgeGapModal,
  StudentProfileView
} from './StudentComponents';
import { useAuth } from '../../context/AuthContext';

const STUDENT_TABS = [
  { key: 'overview',      label: 'Overview',              icon: 'home' },
  { key: 'pathways',      label: 'Dual-Track Roadmaps',   icon: 'compass' },
  { key: 'syllabus',      label: 'Syllabus & Fit Score',  icon: 'target' },
  { key: 'schedule',      label: 'AI Schedule',           icon: 'calendar' },
  { key: 'practice',      label: 'Targeted Practice',     icon: 'award' },
  { key: 'learning',      label: 'Multilingual & Visual', icon: 'zap' },
  { key: 'mentoring',     label: 'Faculty Mentoring',     icon: 'message' },
  { key: 'research',      label: 'Research Papers',       icon: 'book' },
  { key: 'opportunities', label: 'Opportunities',         icon: 'briefcase' },
  { key: 'profile',       label: 'Academic Profile',      icon: 'user' },
];

export const StudentPortal: React.FC<{ go: (page: string) => void }> = ({ go }) => {
  const [active, setActive] = useState('overview');
  const [practiceSubject, setPracticeSubject] = useState<string | null>(null);
  const [diagnosticSubject, setDiagnosticSubject] = useState<string | null>(null);
  const [selectedPathwaySubject, setSelectedPathwaySubject] = useState<string | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showReportGap, setShowReportGap] = useState(false);

  const { currentUser } = useAuth();

  const renderView = () => {
    switch (active) {
      case 'overview':
        return (
          <StudentOverview
            onTabChange={setActive}
            onOpenPractice={(subj) => setPracticeSubject(subj || 'Data Structures & Algorithms')}
            onOpenDailyUpdate={() => setShowDailyModal(true)}
            onOpenDiagnostic={(subj) => setDiagnosticSubject(subj)}
            onSelectPathway={(subj) => {
              setSelectedPathwaySubject(subj);
              setActive('pathways');
            }}
          />
        );
      case 'pathways':
        return (
          <StudentPathwaysView
            initialSubject={selectedPathwaySubject}
            onOpenDiagnostic={(subj) => setDiagnosticSubject(subj)}
          />
        );
      case 'syllabus':
        return (
          <StudentSyllabusView
            onOpenDailyUpdate={() => setShowDailyModal(true)}
            onOpenDiagnostic={(subj) => setDiagnosticSubject(subj)}
            onOpenReportGap={() => setShowReportGap(true)}
          />
        );
      case 'schedule':
        return <StudentScheduleView />;
      case 'practice':
        return (
          <StudentPracticeView
            onStartQuiz={(subj) => setPracticeSubject(subj || 'Data Structures & Algorithms')}
          />
        );
      case 'learning':
        return <StudentLearningView />;
      case 'mentoring':
        return <StudentMentoringView />;
      case 'research':
        return <StudentResearchView />;
      case 'opportunities':
        return <StudentOpportunitiesView />;
      case 'profile':
        return (
          <StudentProfileView
            onOpenDiagnostic={(subj) => setDiagnosticSubject(subj)}
            onOpenReportGap={() => setShowReportGap(true)}
          />
        );
      default:
        return (
          <StudentOverview
            onTabChange={setActive}
            onOpenPractice={(subj) => setPracticeSubject(subj || 'Data Structures & Algorithms')}
            onOpenDailyUpdate={() => setShowDailyModal(true)}
            onOpenDiagnostic={(subj) => setDiagnosticSubject(subj)}
          />
        );
    }
  };

  return (
    <PortalShell
      portalKey="student"
      tabs={STUDENT_TABS}
      active={active}
      setActive={setActive}
      go={go}
      subtitle={currentUser?.name || 'Student Portal'}
    >
      {renderView()}

      {/* Practice Test Modal */}
      {practiceSubject && (
        <PracticeTestModal
          initialSubject={practiceSubject}
          onClose={() => setPracticeSubject(null)}
          onComplete={() => {}}
        />
      )}

      {/* Diagnostic Assessment Modal */}
      {diagnosticSubject && (
        <DiagnosticModal
          subject={diagnosticSubject}
          onClose={() => setDiagnosticSubject(null)}
          onSuccess={(result) => {
            const targetSubject = result?.subject || result?.subject_name || diagnosticSubject;
            setSelectedPathwaySubject(targetSubject);
            setActive('pathways');
            setDiagnosticSubject(null);
          }}
        />
      )}

      {/* Daily Syllabus Update Modal */}
      {showDailyModal && (
        <DailySyllabusModal
          onClose={() => setShowDailyModal(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Report Knowledge Gap Modal */}
      {showReportGap && (
        <KnowledgeGapModal
          onClose={() => setShowReportGap(false)}
          onSuccess={() => {}}
        />
      )}
    </PortalShell>
  );
};

export default StudentPortal;
