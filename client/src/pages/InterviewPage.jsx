import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ChatInterview from '../components/ChatInterview';
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
    <div className={styles.page} dir="rtl">
      <AppHeader subtitle={`ברוך הבא, ${candidateInfo.fullName}`} />

      <div className={styles.body}>
        {done ? (
          <div className={styles.doneCard}>
            <div className={styles.doneIcon}>✅</div>
            <h2 className={styles.doneTitle}>תודה רבה!</h2>
            <p className={styles.doneSub}>
              הראיון שלך נשלח בהצלחה.<br />
              נבחן את תשובותיך ונחזור אליך בקרוב.
            </p>
          </div>
        ) : (
          <ChatInterview
            candidateInfo={candidateInfo}
            onConversationEnd={() => setDone(true)}
          />
        )}
      </div>
    </div>
  );
}
