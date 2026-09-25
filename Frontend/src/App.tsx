import React, { useState, useEffect, Fragment } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/landing/AuthModal';
import { StudentPortal } from './components/student/StudentPortal';
import { AcademicianPortal } from './components/academician/AcademicianPortal';
import { InstitutePortal } from './components/institute/InstitutePortal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import './App.css';

function MainContent() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const { currentUser } = useAuth();

  const go = (p: string) => {
    if (p === 'landing') {
      window.location.hash = '';
      setPage('landing');
      window.scrollTo(0, 0);
      return;
    }

    if (currentUser) {
      // Role-based access control: user can only access their designated portal
      setPage(currentUser.role);
    } else {
      // Unauthenticated users are redirected to landing with login modal
      window.location.hash = '';
      setPage('landing');
      setAuthMode('login');
    }
    window.scrollTo(0, 0);
  };

  // Sync state whenever login or logout occurs
  useEffect(() => {
    if (currentUser) {
      setPage(currentUser.role);
    } else {
      window.location.hash = '';
      setPage('landing');
    }
  }, [currentUser]);

  // Sync URL hash with current active page
  useEffect(() => {
    const map: Record<string, string> = {
      landing: '',
      student: 'student',
      academician: 'academician',
      institute: 'institute',
      university: 'institute', // backwards compatibility
    };
    const h = '#' + (map[page] || '');
    if (window.location.hash !== h) {
      window.history.replaceState(null, '', h || '#');
    }
  }, [page]);

  // Enforce hash guard: logged-in user can only view their own portal
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (!hash) {
        if (!currentUser) setPage('landing');
        return;
      }

      if (currentUser) {
        // Enforce strict single-portal access for authenticated user
        setPage(currentUser.role);
      } else {
        // Logged-out users cannot access portals by typing hash URLs
        window.location.hash = '';
        setPage('landing');
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [currentUser]);

  const openAuth = (mode: 'login' | 'register') => setAuthMode(mode);

  const handleAuthSuccess = (userRole: UserRole) => {
    setPage(userRole);
  };

  let body;
  if (page === 'landing') {
    body = <LandingPage go={go} openAuth={openAuth} />;
  } else if (page === 'student') {
    body = <StudentPortal go={go} />;
  } else if (page === 'academician') {
    body = <AcademicianPortal go={go} />;
  } else if (page === 'institute' || page === 'university') {
    body = <InstitutePortal go={go} />;
  } else {
    body = <LandingPage go={go} openAuth={openAuth} />;
  }

  return (
    <Fragment>
      {body}
      <AuthModal
        mode={authMode}
        onClose={() => setAuthMode(null)}
        setMode={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </Fragment>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
