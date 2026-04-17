import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import Dashboard from './pages/Dashboard';
import CandidateAnalysis from './pages/CandidateAnalysis';
import './App.css';

const PORTAL_MODE_KEY = 'screenai_portal_mode';

function CandidateLayout({ children }) {
  useEffect(() => {
    sessionStorage.setItem(PORTAL_MODE_KEY, 'candidate');
  }, []);

  return <>{children}</>;
}

function RecruiterLayout({ children }) {
  useEffect(() => {
    sessionStorage.setItem(PORTAL_MODE_KEY, 'recruiter');
  }, []);

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="brand">ScreenAI</span>
        <span className="navTag">Recruiter Portal</span>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

import { useLocation } from 'react-router-dom';

function CandidateOnly({ children }) {
  const location = useLocation();
  useEffect(() => {
    // אם בנתיב ראיון או דף בית, תמיד mode=candidate
    if (location.pathname === '/interview' || location.pathname === '/') {
      sessionStorage.setItem(PORTAL_MODE_KEY, 'candidate');
    }
  }, [location.pathname]);
  return <CandidateLayout>{children}</CandidateLayout>;
}

function RecruiterOnly({ children }) {
  const location = useLocation();
  useEffect(() => {
    // אם בנתיב דשבורד או עמוד מועמד, תמיד mode=recruiter
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/candidate')) {
      sessionStorage.setItem(PORTAL_MODE_KEY, 'recruiter');
    }
  }, [location.pathname]);
  return <RecruiterLayout>{children}</RecruiterLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CandidateOnly><LandingPage /></CandidateOnly>} />
        <Route path="/interview" element={<CandidateOnly><InterviewPage /></CandidateOnly>} />
        <Route path="/dashboard" element={<RecruiterOnly><Dashboard /></RecruiterOnly>} />
        <Route path="/candidate/:id" element={<RecruiterOnly><CandidateAnalysis /></RecruiterOnly>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
