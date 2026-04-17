import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCandidateById } from '../services/api';
import styles from './CandidateAnalysis.module.css';

const PARAM_COLORS = {
  High: { bg: 'rgba(22,163,74,0.12)', color: '#15803d' },
  Medium: { bg: 'rgba(212,160,23,0.14)', color: '#92600a' },
  Low: { bg: 'rgba(220,38,38,0.1)', color: '#b91c1c' },
};

const PRIORITY_COLORS = {
  high: { bg: '#dcfce7', color: '#16a34a' },
  medium: { bg: '#fff7ed', color: '#ea580c' },
  low: { bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_LABELS = { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' };
const PARAM_VALUE_LABELS = { High: 'גבוה', Medium: 'בינוני', Low: 'נמוך' };

function availabilityLabel(value) {
  return Number(value) === 1 ? 'זמין' : 'לא זמין / לא צוין';
}

function relativeLabel(value) {
  return Number(value) === 1 ? 'כן' : 'לא';
}

function scoreColor(score) {
  if (score > 80) return '#16a34a';
  if (score >= 50) return '#d4a017';
  return '#dc2626';
}

export default function CandidateAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadCandidate() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCandidateById(id);
        if (mounted) {
          // אחזר את השיחה של המועמד כדי לקבל את ה-answers
          try {
            const response = await fetch(`http://localhost:3000/conversations/${data.candidateId}`);
            if (response.ok) {
              const conversation = await response.json();
              console.log('📞 [קליינט] השיחה שהתקבלה:', conversation);
              // שמור את הנתונים של השיחה המלאה
              data.conversationData = conversation;
              data.answers = conversation.answers || [];
              // ודא שתמיד יש recommendedQuestions
              if (!data.recommendedQuestions || data.recommendedQuestions.length === 0) {
                data.recommendedQuestions = conversation.recommendedQuestions || [];
              }
            }
          } catch (e) {
            console.log('❌ לא הצלחנו לטעון את השיחה:', e);
            data.conversationData = null;
            data.answers = [];
          }
          setCandidate(data);
        }
      } catch (apiError) {
        if (mounted) {
          setCandidate(null);
          setError('לא הצלחנו לטעון את המועמד מהשרת.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCandidate();
    return () => {
      mounted = false;
    };
  }, [id]);

  const parameters = useMemo(() => candidate?.parameters || [], [candidate]);

  if (loading) {
    return <div className={styles.page}>טוען נתונים...</div>;
  }

  if (error || !candidate) {
    return (
      <div className={styles.page}>
        <p>{error || 'מועמד לא נמצא.'}</p>
        <button onClick={() => navigate('/dashboard')}>חזרה ללוח הבקרה</button>
      </div>
    );
  }

  const candidateScoreColor = scoreColor(candidate.score);

  return (
    <div className={styles.page} dir="rtl">
      <button className={styles.back} onClick={() => navigate('/dashboard')}>
        חזרה ללוח הבקרה
      </button>

      <div className={styles.top}>
        <div className={styles.card}>
          <div className={styles.avatar}>{candidate.fullName.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <h2 className={styles.candidateName}>{candidate.fullName}</h2>
            <div className={styles.contacts}>
              <span>📞 {candidate.phone || '-'}</span>
              <span>✉️ {candidate.email || '-'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-end' }}>
            <span className={styles.priorityBadge} style={PRIORITY_COLORS[candidate.priority] || PRIORITY_COLORS.low}>
              עדיפות {PRIORITY_LABELS[candidate.priority] || candidate.priority}
            </span>
            <span className={styles.priorityBadge} style={{ background: '#ede9fe', color: '#6d28d9' }}>
              תפקיד: {candidate.recommendedRoleLabel}
            </span>
          </div>
        </div>

        <div className={styles.scoreCard}>
          <CircularScore score={candidate.score} />
          <p className={styles.scoreLabel}>ציון התאמה</p>
        </div>

        <div className={styles.scoreCard}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '140px',
          }}>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#6d28d9',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}>
              {candidate.experienceLevel}/3
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#7c6f8e',
              fontWeight: 600,
            }}>
            
            </div>
          </div>
          <p className={styles.scoreLabel}>רמת ניסיון</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>כישורים וכישרונות</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '1.5rem',
        }}>
          {Object.entries(candidate.scores || {}).map(([key, value]) => (
            <SmallCircularSkill key={key} label={scoreKeyToLabel(key)} value={Number(value) || 0} />
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '2rem',
        alignItems: 'start',
      }}>
        {/* עמודה משמאל - כל הפרטים */}
        <div>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>פרטים טכניים</h3>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <InfoRow label="מיקום" value={candidate.technical.locationLabel} />
              <InfoRow label="זמינות" value={availabilityLabel(candidate.technical.availability)} />
              <InfoRow label="קרוב משפחה בחברה" value={relativeLabel(candidate.technical.hasRelativeInCompany)} />
            </div>
          </div>
        </div>

        {/* עמודה מימין - 3 כפתורים מרשימים */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          position: 'sticky',
          top: '20px',
        }}>
          {/* כפתור סיכום AI */}
          <button
            onClick={() => setModal({
              title: 'סיכום AI',
              content: candidate.aiSummary || 'אין סיכום זמין',
              color: '#6d28d9',
              icon: '📝'
            })}
            style={{
              padding: '1.8rem',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(124, 58, 237, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>סיכום AI</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>ניתוח מפורט של התשובות</div>
          </button>

          {/* כפתור שאלות המשך מומלצות */}
          <button
            onClick={() => setModal({
              title: 'שאלות המשך מומלצות',
              questions: candidate.recommendedQuestions,
              color: '#d97706',
              icon: '💡'
            })}
            style={{
              padding: '1.8rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(245, 158, 11, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>💡</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>שאלות המשך</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>מומלצות</div>
          </button>

          {/* כפתור שאלות ותשובות מהראיון */}
          <button
            onClick={() => setModal({
              title: 'שאלות ותשובות מהראיון',
              conversation: candidate.conversationData || {},
              chatMode: true,
              color: '#2563eb',
              icon: '❓'
            })}
            style={{
              padding: '1.8rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(37, 99, 235, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>❓</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>שאלות ותשובות</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>מן הראיון</div>
          </button>
        </div>
      </div>

      {modal && (
        <Modal 
          modal={modal} 
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0.7rem',
        borderRadius: '8px',
        background: '#faf8ff',
        border: '1px solid #ede9fe',
      }}
    >
      <strong style={{ color: '#4b5563', fontSize: '0.87rem' }}>{label}</strong>
      <span style={{ color: '#1f1535', fontWeight: 700, fontSize: '0.87rem' }}>{value}</span>
    </div>
  );
}

function SkillBar({ label, value }) {
  const [animated, setAnimated] = useState(false);
  const color = scoreColor(value);
  
  useEffect(() => {
    // הפעל אנימציה כמו שהקומפוננטה מרכיבה
    setAnimated(true);
  }, []);

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>{label}</span>
        <strong style={{ fontSize: '0.9rem', fontWeight: 700, color, minWidth: '30px', textAlign: 'right' }}>
          {Math.round(value)}
        </strong>
      </div>
      <div style={{
        height: '10px',
        borderRadius: '999px',
        background: '#f3f0ff',
        overflow: 'hidden',
        border: '1px solid #ede9fe',
        position: 'relative',
      }}>
        <div
          style={{
            width: animated ? `${Math.max(0, Math.min(100, value))}%` : '0%',
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color})`,
            transition: 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            borderRadius: '999px',
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

function CircularScore({ score, maxScore = 100 }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setAnimated(true);
  }, []);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = '#dc2626';
  if (score >= 80) color = '#16a34a';
  else if (score >= 50) color = '#d4a017';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f3f0ff"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              filter: `drop-shadow(0 0 10px ${color}30)`,
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color, lineHeight: 1 }}>
            {Math.round(score)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7c6f8e', marginTop: '2px' }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

function SmallCircularSkill({ label, value }) {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setAnimated(true);
  }, []);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / 100) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = '#dc2626';
  if (value >= 80) color = '#16a34a';
  else if (value >= 50) color = '#d4a017';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#f3f0ff" strokeWidth="2" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              filter: `drop-shadow(0 0 6px ${color}30)`,
            }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{Math.round(value)}</div>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </span>
    </div>
  );
}

function scoreKeyToLabel(key) {
  const labels = {
    motivation: 'מוטיבציה',
    verbalAbility: 'וורבליות',
    peopleSkills: 'כישורים בין אישיים',
    salesOrientation: 'אוריינטציה מכירתית',
    targetOrientation: 'אוריינטציה ליעדים',
  };
  return labels[key] || key;
}

function AccordionItem({ question, answer, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.accordionItem}>
      <button className={`${styles.accordionHeader} ${open ? styles.accordionHeaderOpen : ''}`} onClick={() => setOpen((value) => !value)}>
        <span>
          <span className={styles.qIndex}>Q{index}</span>
          {question}
        </span>
        <span className={styles.chevron} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▾
        </span>
      </button>
      {open ? <div className={styles.accordionBody}>{answer}</div> : null}
    </div>
  );
}

function Modal({ modal, onClose }) {
  if (!modal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          maxWidth: '650px',
          width: '90%',
          maxHeight: '85vh',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35), 0 0 1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient with decorative element */}
        <div
          style={{
            padding: '2rem',
            background: `linear-gradient(135deg, ${modal.color || '#7c3aed'} 0%, ${modal.color || '#7c3aed'}dd 100%)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '180px',
              height: '180px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              position: 'relative',
              zIndex: 1,
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'rotate(90deg) scale(1.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              }}
            >
              ✕
            </button>
            <div>
              <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.3rem', animation: 'bounce 2s infinite' }}>
                {modal.icon || '📋'}
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.8rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                flex: 1,
                textAlign: 'right',
              }}
            >
              {modal.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '2.2rem',
            color: '#333',
            direction: 'rtl',
            textAlign: 'right',
            overflowY: 'auto',
            maxHeight: 'calc(85vh - 150px)',
            lineHeight: 1.8,
          }}
        >
          {/* סיכום AI */}
          {modal.content && (
            <div style={{ fontSize: '0.98rem', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {modal.content}
            </div>
          )}

          {/* חוזקות וחולשות */}
          {modal.strength && modal.weakness && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    color: '#16a34a',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                  }}
                >
                  ✓ חוזקות
                </h3>
                <ul style={{ margin: 0, paddingRight: '1.5rem', lineHeight: 2 }}>
                  {(modal.strength || []).map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        color: '#1f2937',
                        fontSize: '0.96rem',
                        marginBottom: '0.6rem',
                        paddingLeft: '0.8rem',
                        borderLeft: '3px solid #16a34a',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '2rem',
                }}
              >
                <h3
                  style={{
                    color: '#dc2626',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                  }}
                >
                  ✕ חולשות
                </h3>
                <ul style={{ margin: 0, paddingRight: '1.5rem', lineHeight: 2 }}>
                  {(modal.weakness || []).map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        color: '#1f2937',
                        fontSize: '0.96rem',
                        marginBottom: '0.6rem',
                        paddingLeft: '0.8rem',
                        borderLeft: '3px solid #dc2626',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* שאלות מומלצות */}
          {modal.questions && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.5rem 0 0 0',
            }}>
              <div style={{
                fontSize: '2.5rem',
                color: '#f59e0b',
                marginBottom: '0.5rem',
                animation: 'bounce 1.2s infinite',
                filter: 'drop-shadow(0 2px 8px #fbbf2433)'
              }}>💡</div>
              <h2 style={{
                color: '#d97706',
                fontWeight: 900,
                fontSize: '1.35rem',
                marginBottom: '1.2rem',
                letterSpacing: '0.5px',
                textShadow: '0 2px 8px #fffbe7',
                borderBottom: '2px solid #fde68a',
                paddingBottom: '0.4rem',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
              }}>
                שאלות המשך מומלצות
              </h2>
              <ul style={{
                margin: 0,
                padding: 0,
                width: '100%',
                maxWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}>
                {(modal.questions || []).map((q, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: '#1f2937',
                      fontSize: '1.13rem',
                      padding: '1.05rem 1.2rem',
                      background: 'linear-gradient(90deg, #fffbe7 70%, #fef3c7 100%)',
                      border: '1.5px solid #fde68a',
                      borderRight: '7px solid #f59e0b',
                      borderRadius: '14px',
                      listStyle: 'none',
                      boxShadow: '0 2px 16px 0 #fbbf2422',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      fontWeight: 600,
                      letterSpacing: '0.2px',
                      transition: 'box-shadow 0.2s',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      fontSize: '1.45rem',
                      color: '#f59e0b',
                      marginLeft: '0.7rem',
                      filter: 'drop-shadow(0 1px 4px #fbbf2444)'
                    }}>★</span>
                    <span style={{ flex: 1 }}>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* שאלה ותשובה */}
          {modal.question && modal.answer && (
            <div>
              <div style={{ marginBottom: '1.8rem' }}>
                <h3
                  style={{
                    color: '#7c3aed',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '0.8rem',
                  }}
                >
                  ❓ השאלה:
                </h3>
                <div
                  style={{
                    background: '#f3f0ff',
                    border: '1px solid #e9d5ff',
                    borderRight: '4px solid #7c3aed',
                    padding: '1rem 1.2rem',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '0.98rem',
                  }}
                >
                  {modal.question}
                </div>
              </div>

              <div>
                <h3
                  style={{
                    color: '#16a34a',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '0.8rem',
                  }}
                >
                  💬 התשובה:
                </h3>
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRight: '4px solid #16a34a',
                    padding: '1rem 1.2rem',
                    borderRadius: '8px',
                    color: '#1f2937',
                    fontSize: '0.96rem',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                >
                  {modal.answer}
                </div>
              </div>
            </div>
          )}

          {/* שאלות ותשובות מהראיון - צ'אט */}
          {modal.chatMode && (
            <div>
              {(() => {
                // Always try to show Q&A, even if answers are missing
                const answers =
                  (modal.conversation && Array.isArray(modal.conversation.answers) && modal.conversation.answers.length > 0)
                    ? modal.conversation.answers
                    : (modal.conversation && Array.isArray(modal.conversation.questions))
                      ? modal.conversation.questions.map((q, idx) => ({ question: q, answer: 'אין תשובה' }))
                      : [];
                if (answers.length === 0) {
                  return (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#666',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                    }}>
                      <p>🔍 לא נמצאו שאלות ותשובות</p>
                      <small>אנא ודא שהראיון שלם ונשמר כראוי</small>
                    </div>
                  );
                }
                return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '0.5rem 0',
                  }}>
                    {answers.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {/* שאלה - משמאל */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                        }}>
                          <div style={{
                            maxWidth: '75%',
                            background: '#e0e7ff',
                            borderRadius: '16px',
                            padding: '0.9rem 1.2rem',
                            borderBottomLeft: '2px solid transparent',
                            color: '#1f2937',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}>
                            <div style={{ fontWeight: 600, color: '#2563eb', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                              ❓ שאלה {idx + 1}
                            </div>
                            {typeof item === 'object' && item.question ? item.question : item}
                          </div>
                        </div>

                        {/* תשובה - מימין */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}>
                          <div style={{
                            maxWidth: '75%',
                            background: '#d1fae5',
                            borderRadius: '16px',
                            padding: '0.9rem 1.2rem',
                            borderBottomRight: '2px solid transparent',
                            color: '#1f2937',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}>
                            <div style={{ fontWeight: 600, color: '#059669', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                              💬 תשובה
                            </div>
                            {typeof item === 'object' && item.answer ? item.answer : 'אין תשובה'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>



        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(25px); }
          }
        `}</style>
      </div>
    </div>
  );
}
