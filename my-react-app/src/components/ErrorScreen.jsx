import styles from './ErrorScreen.module.css';

export default function ErrorScreen({ message, onReset }) {
  return (
    <section className={`${styles.section} fade-in-up`}>
      <div className={styles.container}>

        {/* Main error card */}
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--tertiary)' }}>
              error_outline
            </span>
            <div className={styles.iconPing} aria-hidden="true" />
          </div>

          <div className={styles.text}>
            <h1>Something went wrong</h1>
            <p>{message || 'This video could not be downloaded. The URL may be invalid or the content is restricted.'}</p>
          </div>

          <div className={styles.detailBox}>
            <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', flexShrink: 0 }}>info</span>
            <div>
              <strong>Access Restricted</strong>
              <p>Verify the URL is public and accessible without a login. Only public content can be downloaded.</p>
            </div>
          </div>

          <button className={styles.retryBtn} onClick={onReset} type="button">
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </div>

        {/* FAQ bento */}
        <div className={styles.faqGrid}>
          {[
            { icon: 'lock',              title: 'Private Content',     body: 'We cannot access videos behind login screens or set to Private by the creator.' },
            { icon: 'public_off',        title: 'Public Accounts Only', body: 'Instagram Reels are only available from public accounts.' },
            { icon: 'link',              title: 'Supported Platforms', body: 'Only YouTube, TikTok, and Instagram Reels URLs are supported.' },
            { icon: 'no_adult_content',  title: 'Restricted Content',  body: 'Age-restricted or geo-blocked content cannot be downloaded.' },
          ].map(f => (
            <div key={f.title} className={styles.faqCard}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>{f.icon}</span>
              <div>
                <strong>{f.title}</strong>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
