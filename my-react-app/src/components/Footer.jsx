import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>DownloadShorts</span>
          <p>© 2026 DownloadShorts - All Rights Reserved.</p>
        </div>
        <nav className={styles.links}>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms of Service</Link>
        
          <Link to="/contact">Contact</Link>
        </nav>
        <p className={styles.disclaimer}>
          DownloadShorts.com, is not connected to Instagram™ or any other social platforms. We do not host or store files on our servers; all content belongs to its original owners. Please do not use our tool for copyrighted or restricted content. We comply with DMCA policies and respond to all valid infringement notices.
        </p>
      </div>
    </footer>
  );
}
