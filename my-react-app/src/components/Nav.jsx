import { Link, useNavigate } from 'react-router-dom';
import styles from './Nav.module.css';
import logo from '../../public/logo.png'

export default function Nav() {
  const navigate = useNavigate();

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
       <Link to="/" className={styles.logoLink} aria-label="DownloadShorts home">
  <img src={logo} alt="DownloadShorts logo" width="512" height="512" decoding="async" className={styles.logoImg} />
  
<div
  style={{
    fontSize: "1.7rem",
    fontWeight: 800,
    letterSpacing: "-0.8px",
    lineHeight: 1,
    color: "#051B5C", // Dark navy (matches D)
  }}
>
  Download
  <span
    style={{
      color: "#1E88FF", // Bright blue (matches S)
    }}
  >
    Shorts
  </span>
</div>
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
