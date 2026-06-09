import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>DownloadShorts</span>
          <p>© 2025 DownloadShorts. All rights reserved.</p>
        </div>
        <nav className={styles.links}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Legal</a>
          <a href="#">Contact</a>
        </nav>
        <p className={styles.disclaimer}>
          For personal use only. Do not use downloaded content for commercial purposes.
        </p>
      </div>
    </footer>
  );
}
