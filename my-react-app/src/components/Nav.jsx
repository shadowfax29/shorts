import { Link, useNavigate } from 'react-router-dom';
import styles from './Nav.module.css';

export default function Nav() {
  const navigate = useNavigate();

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoLink} aria-label="DownloadShorts home">
          <img src="/logo.png" alt="DownloadShorts logo" className={styles.logoImg} />
        </Link>
        <nav className={styles.links}>
          <a href="/#how-it-works" onClick={(e) => {
            e.preventDefault();
            navigate('/');
            setTimeout(() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>How it works</a>
        </nav>
      </div>
    </header>
  );
}
