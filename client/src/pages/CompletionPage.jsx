import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CompletionPage.module.css';

const stages = [
  { icon: '📹', title: 'ראיון אוטומטי' },
  { icon: '☎️', title: 'שיחה לתיאום ראיון' },
  { icon: '🤝', title: 'ראיון פרונטלי' },
  { icon: '🎓', title: 'קורס הכשרה' },
  { icon: '💼', title: 'תחילת עבודה' },
];

export default function CompletionPage({ candidateInfo }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const currentStage = 1;
  const target = Math.round(((currentStage + 0.5) / stages.length) * 100);

  useEffect(() => {
    const t = setTimeout(() => setProgress(target), 250);
    return () => clearTimeout(t);
  }, [target]);

  function handleNewInterview() {
    localStorage.removeItem('screenai_current_candidate');
    navigate('/');
  }

  return (
    <div dir="rtl" className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Status badge */}
        
          {/* Headline */}
          <div className={`${styles.fadeIn} ${styles.headline}`} style={{ animationDelay: '80ms' }}>
            <h1 className={styles.title}>
             תודה לך!<br />
              <span className={styles.highlight}>אנחנו ניצור איתך קשר.</span>
            </h1>
            <p className={styles.subtitle}>
במידה ותמצא מתאים           </p>
            <p className={styles.subtitle}>
              נציג/ה תתקשר אלייך בימים הקרובים לתיאום ראיון פרונטלי.
            </p>
          </div>

          {/* Current stage card */}
          <div className={`${styles.fadeIn} ${styles.stageCard}`} style={{ animationDelay: '160ms' }}>
            <div className={styles.stageContent}>
              <div className={styles.stageIcon}>☎️</div>
              <div className={styles.stageInfo}>
                <div className={styles.stageLabel}>השלב הנוכחי</div>
                <h2 className={styles.stageName}>ממתינ/ה לשיחת טלפון</h2>
                <div className={styles.stageDuration}>
                  ⏱️ עד 3 ימי עסקים
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>את כבר ב-{progress}% מהדרך</span>
                <span>שלב {currentStage + 1} / {stages.length}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={`${styles.fadeIn} ${styles.timeline}`} style={{ animationDelay: '240ms' }}>
            <ol className={styles.stagesList}>
              {stages.map((s, i) => {
                const status = i < currentStage ? 'done' : i === currentStage ? 'current' : 'upcoming';
                return (
                  <li key={s.title} className={styles.stageItem}>
                    <div className={`${styles.stageItemIcon} ${styles[`status${status}`]}`}>
                      {status === 'done' ? '✅' : s.icon}
                    </div>
                    <div className={styles.stageItemContent}>
                      <span className={styles.stageItemTitle}>{s.title}</span>
                      {status === 'current' && <span className={styles.stageBadge}>כעת</span>}
                      {status === 'done' && <span className={styles.doneBadge}>הושלם</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Encouragement */}
          <div className={`${styles.fadeIn} ${styles.encouragement}`} style={{ animationDelay: '320ms' }}>
            <span className={styles.encouragementIcon}>✨</span>
            <span>94% מהמועמדים שהגיעו לכאן ממשיכים עד הסוף</span>
          </div>

          {/* Candidate info */}
          <div className={`${styles.fadeIn} ${styles.candidateCard}`} style={{ animationDelay: '400ms' }}>
            <h3 className={styles.cardTitle}>פרטיך</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>שם:</span>
                <span className={styles.infoValue}>{candidateInfo?.fullName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>אימייל:</span>
                <span className={styles.infoValue}>{candidateInfo?.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>טלפון:</span>
                <span className={styles.infoValue}>{candidateInfo?.phone}</span>
              </div>
            </div>
            <button onClick={handleNewInterview} className={styles.newInterviewBtn}>
              ראיון חדש
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>ביטוח ישיר</span>
      </footer>
    </div>
  );
}
