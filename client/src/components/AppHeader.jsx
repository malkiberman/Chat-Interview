import styles from './AppHeader.module.css';

export default function AppHeader({ subtitle }) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>ScreenAI</span>
      {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
    </header>
  );
}
