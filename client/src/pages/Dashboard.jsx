import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCandidates } from '../services/api';
import styles from './Dashboard.module.css';

const PRIORITY_COLORS = {
  high: { bg: '#dcfce7', color: '#16a34a' },
  medium: { bg: '#fff7ed', color: '#ea580c' },
  low: { bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_LABELS = { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    let mounted = true;

    async function loadCandidates() {
      setLoading(true);
      setError('');
      try {
        const list = await fetchCandidates();
        if (mounted) setCandidates(list);
      } catch (apiError) {
        if (mounted) {
          setError('לא הצלחנו לטעון מועמדים מהשרת.');
          setCandidates([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCandidates();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: candidates.length,
      above80: candidates.filter((candidate) => candidate.score > 80).length,
      mid: candidates.filter((candidate) => candidate.score >= 50 && candidate.score <= 80).length,
      below50: candidates.filter((candidate) => candidate.score < 50).length,
    }),
    [candidates],
  );

  const filtered = useMemo(() => {
    let list = [...candidates];

    list = list.filter((candidate) => candidate.score >= scoreRange[0] && candidate.score <= scoreRange[1]);
    if (roleFilter !== 'all') list = list.filter((candidate) => String(candidate.recommendedRole) === roleFilter);

    return list.sort((a, b) => b.score - a.score);
  }, [candidates, scoreRange, roleFilter]);

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>לוח מועמדים</h1>
          <p className={styles.subtitle}>תוצאות סינון מוקדם ודירוג עדיפויות</p>
        </div>
      </div>

      <div className={styles.cards}>
        <StatCard label="סה״כ מועמדים" value={stats.total} accent="#7c3aed" />
        <StatCard label="מעל 80%" value={stats.above80} accent="#16a34a" />
        <StatCard label="50 - 80%" value={stats.mid} accent="#d4a017" />
        <StatCard label="מתחת ל-50%" value={stats.below50} accent="#dc2626" />
      </div>

      <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '600px' }}>
          <label style={{ fontWeight: 700, color: '#374151', minWidth: '100px' }}>טווח התאמה:</label>
          <RangeSlider min={0} max={100} value={scoreRange} onChange={setScoreRange} />
          <div style={{ display: 'flex', gap: '0.3rem', minWidth: '80px', fontSize: '0.95rem', fontWeight: 700, color: '#1f2937' }}>
            <span>{scoreRange[0]}</span>
            <span>-</span>
            <span>{scoreRange[1]}</span>
            <span>%</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <FilterBtn active={roleFilter === 'all'} onClick={() => setRoleFilter('all')}>
          כל התפקידים
        </FilterBtn>
        <FilterBtn active={roleFilter === '1'} onClick={() => setRoleFilter('1')}>
          מכירות
        </FilterBtn>
        <FilterBtn active={roleFilter === '2'} onClick={() => setRoleFilter('2')}>
          שירות
        </FilterBtn>
      </div>

      <div className={styles.tableWrap} dir="rtl">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>שם מלא</th>
              <th>טלפון</th>
              <th>אימייל</th>
              <th>תפקיד מומלץ</th>
              <th>ציון</th>
              <th>עדיפות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>טוען נתונים...</td>
              </tr>
            ) : null}
            {!loading && error ? (
              <tr>
                <td colSpan={6}>{error}</td>
              </tr>
            ) : null}
            {!loading && !error && filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>אין מועמדים להצגה.</td>
              </tr>
            ) : null}
            {!loading && !error
              ? filtered.map((candidate) => (
                  <tr key={candidate.id} className={styles.row} onClick={() => navigate(`/candidate/${candidate.id}`)}>
                    <td className={styles.name}>{candidate.fullName}</td>
                    <td>{candidate.phone || '-'}</td>
                    <td>{candidate.email || '-'}</td>
                    <td>{candidate.recommendedRoleLabel}</td>
                    <td>
                      <ScoreBar score={candidate.score} />
                    </td>
                    <td>
                      <span className={styles.badge} style={PRIORITY_COLORS[candidate.priority] || PRIORITY_COLORS.low}>
                        {PRIORITY_LABELS[candidate.priority] || candidate.priority}
                      </span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={styles.statCard} style={{ '--card-accent': accent }}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ''}`}>
      {children}
    </button>
  );
}

function RangeSlider({ min, max, value, onChange }) {
  const handleChange = (index, newVal) => {
    const newValue = [...value];
    newValue[index] = newVal;
    
    if (index === 0 && newVal <= newValue[1]) {
      onChange(newValue);
    } else if (index === 1 && newVal >= newValue[0]) {
      onChange(newValue);
    }
  };

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div style={{ flex: 1, minWidth: '280px' }}>
      <div style={{ position: 'relative', height: '8px', background: 'linear-gradient(90deg, #e11d48 0%, #f59e0b 25%, #22c55e 50%, #0ea5e9 75%, #7c3aed 100%)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div
          style={{
            position: 'absolute',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.2)',
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            pointerEvents: 'none',
            borderRadius: '4px',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => handleChange(0, Number(e.target.value))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            background: 'transparent',
            cursor: 'pointer',
            zIndex: value[0] > max - (max - min) / 2 ? 5 : 3,
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            background: 'transparent',
            cursor: 'pointer',
            zIndex: value[1] <= max - (max - min) / 2 ? 5 : 4,
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />
      </div>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          background: #1f2937;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 3px solid #fff;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: #1f2937;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 3px solid #fff;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background: #111827;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        input[type="range"]::-moz-range-thumb:hover {
          background: #111827;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score > 80 ? '#16a34a' : score >= 50 ? '#d4a017' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{ flex: 1, height: '5px', background: '#f3f0ff', borderRadius: '999px', minWidth: '80px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontWeight: 700, color, fontSize: '0.88rem', minWidth: '36px' }}>{score}%</span>
    </div>
  );
}
