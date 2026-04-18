import Logo from './Logo';
import styles from './AppHeader.module.css';

export default function AppHeader({ subtitle, showRecruiterButton = false, onRecruiterClick }) {
  return (
    <header className={styles.header}>
      
        <Logo></Logo>
        
        {subtitle && <h2 className={styles.subtitle}>{subtitle}</h2>}
        
        {showRecruiterButton && (
          <button onClick={onRecruiterClick} className={styles.recruiterBtn}>
            
          </button>
        )}
    
    </header>
  );
}
