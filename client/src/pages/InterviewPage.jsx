import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ChatInterview from '../components/ChatInterview';
import CompletionPage from './CompletionPage';
import styles from './InterviewPage.module.css';

const LS_KEY = 'screenai_current_candidate';

export default function InterviewPage() {
  const [done, setDone] = useState(false);

  const candidateInfo = (() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); }
    catch { return null; }
  })();

  if (!candidateInfo?.fullName) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {done ? (
        <CompletionPage candidateInfo={candidateInfo} />
      ) : (
        <div className={styles.page} dir="rtl">
          <AppHeader subtitle={`ברוך הבא, ${candidateInfo.fullName}`} />

          <div className={styles.body}>
            <ChatInterview
              candidateInfo={candidateInfo}
              onConversationEnd={() => setDone(true)}
            />
          </div>
        </div>
      )}
    </>
  );
}
