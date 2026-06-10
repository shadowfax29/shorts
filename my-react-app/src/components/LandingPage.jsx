import { useState, useRef } from 'react';
import styles from './LandingPage.module.css';
import { detectPlatform } from '../utils/platform.js';
import PlatformBadge from './PlatformBadge.jsx';

export default function LandingPage({ onSubmit }) {
  const [url, setUrl]       = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError]   = useState('');
  const inputRef            = useRef(null);

  const platform = detectPlatform(url);

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const trimmed = text.trim();

    if (!trimmed) return;

    setUrl(trimmed);
    setError('');

    if (!detectPlatform(trimmed)) {
      setError('Only YouTube, TikTok, and Instagram Reels URLs are supported.');
      return;
    }

    setTimeout(() => {
      onSubmit(trimmed);
    }, 2000); // 2 seconds
  } catch {
    inputRef.current?.focus();
  }
};

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError('Please paste a video URL first.'); return; }
    if (!detectPlatform(trimmed)) {
      setError('Only YouTube, TikTok, and Instagram Reels URLs are supported.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* background blobs */}
        <div className={styles.blobTop}  aria-hidden="true" />
        <div className={styles.blobBtm}  aria-hidden="true" />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Download videos from your favorite platforms.
          </h1>

          {/* URL Input */}
          <form className={styles.inputForm} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.inputWrap} ${focused ? styles.inputFocused : ''}`}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>link</span>
           <input
  ref={inputRef}
  className={styles.input}
  type="url"
  value={url}
  onChange={(e) => {
    setUrl(e.target.value);
    setError('');
  }}
  onPaste={(e) => {
    setTimeout(() => {
      const pastedText = e.target.value.trim();

      if (detectPlatform(pastedText)) {
        onSubmit(pastedText);
      }
    }, 0);
  }}
  placeholder="Paste your video link here…"
/>
              {url ? (
                <button type="button" className={styles.clearBtn} onClick={() => { setUrl(''); setError(''); }} aria-label="Clear">
                  <span className="material-symbols-outlined">close</span>
                </button>
              ) : (
           
                 <button type="button" className={styles.downloadBtn} onClick={handlePaste}>
                <span> Paste</span>
                <span className="material-symbols-outlined icon-fill"></span>
              </button>
              )}
              {/* <button type="submit" className={styles.downloadBtn}>
                <span>Download</span>
                <span className="material-symbols-outlined icon-fill">download</span>
              </button> */}
            </div>

            {platform && (
              <div className={styles.detectedRow}>
                <span className={styles.detectedLabel}>Detected:</span>
                <PlatformBadge platform={platform} />
              </div>
            )}
            {error && <p className={styles.inputError} role="alert">{error}</p>}
          </form>

          {/* Platform pills */}
          <div className={styles.platforms}>
            {[
              { id: 'youtube',   icon: 'play_circle',   label: 'YouTube',   color: '#ff0000' },
              { id: 'tiktok',    icon: 'music_note',    label: 'TikTok',    color: '#000000' },
              { id: 'instagram', icon: 'photo_camera',  label: 'Instagram', color: '#e1306c' },
            ].map((p) => (
              <div key={p.id} className={styles.platformPill}>
                <span className="material-symbols-outlined icon-fill" style={{ color: p.color }}>{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>How it works</h2>
            <p>Three simple steps to grab your favorite content in high quality.</p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { icon: 'content_copy',  color: 'var(--primary-fixed)',    textColor: 'var(--on-primary-fixed)',              title: 'Copy URL',        desc: 'Find the video you want and copy its URL from the browser or app share menu.' },
              { icon: 'content_paste', color: 'var(--secondary-fixed)',  textColor: 'var(--on-secondary-fixed-variant)',    title: 'Paste & Select',  desc: 'Paste the link into DownloadShorts. For YouTube, choose your preferred resolution.' },
              { icon: 'download_done', color: 'var(--tertiary-fixed)',   textColor: 'var(--on-tertiary-fixed-variant)',     title: 'Enjoy Offline',   desc: 'Hit Download and your video saves directly to your device in seconds.' },
            ].map((step) => (
              <div key={step.title} className={styles.stepCard}>
                <div className={styles.stepIcon} style={{ background: step.color, color: step.textColor }}>
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Bento ── */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.bentoGrid}>
            <div className={`${styles.bentoCard} ${styles.bentoFeatured}`}>
              <h3>Crystal Clear Quality</h3>
              <p>We support up to 4K resolution for supported platforms. Never compromise on visual fidelity.</p>
              <div className={styles.bentoBadges}>
                <span>4K UHD</span><span>1080p</span><span>MP4</span><span>MP3</span>
              </div>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoFast}`}>
              <div>
                <h4>Blazing Fast</h4>
                <p>High-performance processing means no waiting. Links resolve in seconds.</p>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }}>bolt</span>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 32 }}>security</span>
              <strong>Safe &amp; Secure</strong>
              <small>Encrypted connections only.</small>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: 32 }}>ads_click</span>
              <strong>No Account Needed</strong>
              <small>Works without any login.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
