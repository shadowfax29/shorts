import { Link } from 'react-router-dom';
import styles from './Nav.module.css';
import { toolPages } from '../seo/pages.js';
import logo from '../../public/logo.png'

export default function Nav() {

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
        <nav className={styles.links} aria-label="Main">
          {['/instagram-reels-downloader', '/youtube-video-downloader', '/youtube-video-clipper', '/youtube-to-mp3'].map((path) => {
            const p = toolPages.find((t) => t.path === path);
            return <Link key={path} to={path}>{p.nav}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
