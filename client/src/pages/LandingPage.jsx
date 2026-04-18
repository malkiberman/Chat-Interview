import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import styles from './LandingPage.module.css';

const LS_KEY = 'screenai_current_candidate';

export default function LandingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'שם הוא שדה חובה';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'נדרשת כתובת אימייל תקינה';
    if (!form.phone.trim()) e.phone = 'טלפון הוא שדה חובה';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    setTimeout(() => navigate('/interview'), 300);
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };
  }

  return (
    <div className={styles.page} dir="rtl">
      <AppHeader 
      />
      
      <div className={styles.body}>
        <div className={`${styles.card} animate-slide-up`}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>ברוך הבא לראיון שלך</h1>
            <p className={styles.subtitle}>אנא מלא את הפרטים שלך כדי להתחיל</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Field
              label="שם מלא"
              value={form.fullName}
              onChange={handleChange('fullName')}
              error={errors.fullName}
              placeholder="השם המלא שלך"
            />
            <Field
              label="אימייל"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Field
              label="טלפון"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              placeholder="+972-50-000-0000"
            />
            <button 
              type="submit" 
              className={styles.submit}
              disabled={isLoading}
            >
              {isLoading ? 'טוען...' : 'התחל ראיון ←'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              בתהליך זה קרא ללא הרגלים ממצלמתך<br />
              כל תשובה תיבחן ב-5 מדדים<br />
              הצליח כאן = התחלה של עתידך הבא
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, placeholder, type = 'text' }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
