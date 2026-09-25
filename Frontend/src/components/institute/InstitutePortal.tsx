import React, { useState } from 'react';
import { PortalShell } from '../common/PortalShell';
import {
  InstituteOverview,
  InstituteStudentMonitoring,
  InstituteStudentDetailModal,
  InstituteMarksManagement,
  InstituteScheduleManagement,
  InstituteMentoringAndQueries,
  InstituteAnalytics,
  InstituteVerifications,
} from './InstituteComponents';
import { useAuth } from '../../context/AuthContext';

const INSTITUTE_TABS = [
  { key: 'overview', label: 'Dashboard', icon: 'home' },
  { key: 'students', label: 'Student Monitoring', icon: 'users' },
  { key: 'marks', label: 'Marks Management', icon: 'award' },
  { key: 'schedule', label: 'Academic Schedule', icon: 'calendar' },
  { key: 'mentoring', label: 'Mentoring & Queries', icon: 'message' },
  { key: 'analytics', label: 'Academic Analytics', icon: 'chart' },
  { key: 'verifications', label: 'Verifications', icon: 'check-circle' },
];

export const InstitutePortal: React.FC<{ go: (page: string) => void }> = ({ go }) => {
  const [active, setActive] = useState('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [marksStudent, setMarksStudent] = useState<{ id: number; name: string } | null>(null);
  const [mentorStudent, setMentorStudent] = useState<{ id: number; name: string } | null>(null);
  const { currentUser } = useAuth();

  const renderView = () => {
    switch (active) {
      case 'overview':
        return (
          <InstituteOverview
            onTabChange={setActive}
            onOpenStudent={(id: number) => setSelectedStudentId(id)}
          />
        );
      case 'students':
        return (
          <InstituteStudentMonitoring
            onSelectStudent={(id: number) => setSelectedStudentId(id)}
            onOpenMarksModal={(id: number, name: string) => {
              setMarksStudent({ id, name });
              setActive('marks');
            }}
            onOpenMentorModal={(id: number, name: string) => {
              setMentorStudent({ id, name });
              setActive('mentoring');
            }}
          />
        );
      case 'marks':
        return (
          <InstituteMarksManagement
            initialStudentId={marksStudent?.id}
            initialStudentName={marksStudent?.name}
          />
        );
      case 'schedule':
        return <InstituteScheduleManagement />;
      case 'mentoring':
        return (
          <InstituteMentoringAndQueries
            initialMentorStudentId={mentorStudent?.id}
            initialMentorStudentName={mentorStudent?.name}
          />
        );
      case 'analytics':
        return <InstituteAnalytics />;
      case 'verifications':
        return <InstituteVerifications />;
      default:
        return (
          <InstituteOverview
            onTabChange={setActive}
            onOpenStudent={(id: number) => setSelectedStudentId(id)}
          />
        );
    }
  };

  return (
    <PortalShell
      portalKey="institute"
      tabs={INSTITUTE_TABS}
      active={active}
      setActive={setActive}
      go={go}
      subtitle={currentUser?.name || 'Institute Portal'}
    >
      {renderView()}

      {selectedStudentId !== null && (
        <InstituteStudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onOpenMarks={(id: number, name: string) => {
            setSelectedStudentId(null);
            setMarksStudent({ id, name });
            setActive('marks');
          }}
          onOpenMentor={(id: number, name: string) => {
            setSelectedStudentId(null);
            setMentorStudent({ id, name });
            setActive('mentoring');
          }}
        />
      )}
    </PortalShell>
  );
};

export default InstitutePortal;
