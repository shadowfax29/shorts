import styles from './Nav.module.css';

export default function Nav() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.logo}>StreamSnap</div>
        <nav className={styles.links}>
          <a href="#how-it-works">How it works</a>
        </nav>
      </div>
    </header>
  );
}
