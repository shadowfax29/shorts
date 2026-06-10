import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>Fastvideosave</span>
          <p>© 2026 Fastvideosave - All Rights Reserved.</p>
        </div>
        <nav className={styles.links}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">DMCA</a>
          <a href="#">Contact</a>
        </nav>
        <p className={styles.disclaimer}>
          Fastvideosave.net is not connected to Instagram™ or any other social platforms. We do not host or store files on our servers; all content belongs to its original owners. Please do not use our tool for copyrighted or restricted content. We comply with DMCA policies and respond to all valid infringement notices.
        </p>
      </div>
    </footer>
  );
}
