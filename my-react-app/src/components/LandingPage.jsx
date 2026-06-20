import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './LandingPage.module.css';
import { detectPlatform } from '../utils/platform.js';
import PlatformBadge from './PlatformBadge.jsx';
// FAQ data — single source of truth for both visible HTML and JSON-LD schema
const FAQ_ITEMS = [
  {
    question: 'Is DownloadShorts free?',
    answer: 'Yes. DownloadShorts is completely free and does not require any subscription.',
  },
  {
    question: 'Can I download Instagram Reel audio?',
    answer: 'Yes. You can download Instagram Reel videos and audio in high quality.',
  },
  {
    question: 'Do I need to log in?',
    answer: 'No. DownloadShorts works without creating an account.',
  },
  {
    question: 'Can I use it on mobile?',
    answer: 'Yes. DownloadShorts works on Android, iPhone, tablets and desktop browsers.',
  },
];

const FAQ_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

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
      setError('Only Instagram Reels URLs are supported.');
      return;
    }

      onSubmit(trimmed);
  } catch {
    inputRef.current?.focus();
  }
};

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError('Please paste a video URL first.'); return; }
    if (!detectPlatform(trimmed)) {
      setError('Only Instagram Reels URLs are supported.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <>
      <Helmet>
        <title>DownloadShorts - Free Instagram Reels Downloader | No Watermark</title>
        <meta name="description" content="Download Instagram Reels for free in HD quality without watermark. No login required — paste the link and download instantly." />
        <link rel="canonical" href="https://downloadshorts.com/" />
        <meta property="og:title" content="DownloadShorts - Free Instagram Reels Downloader" />
        <meta property="og:description" content="Download Instagram Reels without watermark in HD quality. Free, fast, no login required." />
        <meta property="og:url" content="https://downloadshorts.com/" />
        <meta property="og:image" content="https://downloadshorts.com/logo.png" />
        <meta name="twitter:title" content="DownloadShorts - Free Instagram Reels Downloader" />
        <meta name="twitter:description" content="Download Instagram Reels without watermark in HD quality. Free and fast." />
        <meta name="twitter:image" content="https://downloadshorts.com/logo.png" />
        <script type="application/ld+json">{FAQ_SCHEMA}</script>
      </Helmet>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* background blobs */}
        <div className={styles.blobTop}  aria-hidden="true" />
        <div className={styles.blobBtm}  aria-hidden="true" />

        <div className={styles.heroContent}>
         <h1 className={styles.heroTitle}>
  Instagram Reels Downloader
</h1>

<p className={styles.heroSubtitle}>
  Download Instagram Reels without watermark and save
  Instagram Reel videos in HD quality for free.
  No login required.
</p>

          {/* URL Input */}
          <form className={styles.inputForm} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.inputWrap} ${focused ? styles.inputFocused : ''}`}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>link</span>
<input
  ref={inputRef}
  className={styles.input}
  type="url"
  value={url}
  placeholder="Paste your Instagram Reel URL here..."

  onChange={(e) => {
    const value = e.target.value;
    setUrl(value);
    setError("");

    if (detectPlatform(value.trim())) {
      onSubmit(value.trim());
    }
  }}

  onPaste={(e) => {
    const pasted = e.clipboardData.getData("text").trim();

    setTimeout(() => {
      if (detectPlatform(pasted)) {
        onSubmit(pasted);
      }
    }, 0);
  }}
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
          {/* <div className={styles.platforms}>
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
          </div> */}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>How it works</h2>
<p>
Three simple steps to download Instagram Reels in HD quality.
</p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { icon: 'content_copy',  color: 'var(--primary-fixed)',    textColor: 'var(--on-primary-fixed)',              title: 'Copy URL',        desc: 'Find the video you want and copy its URL from the browser or app share menu.' },
              { icon: 'content_paste', color: 'var(--secondary-fixed)',  textColor: 'var(--on-secondary-fixed-variant)',    title: 'Paste Reel URL',  desc: 'Paste the link into DownloadShorts. Paste your Instagram Reel URL and prepare for download.' },
              { icon: 'download_done', color: 'var(--tertiary-fixed)',   textColor: 'var(--on-tertiary-fixed-variant)',     title: 'Download Reel',   desc: 'Hit Download and your video saves directly to your device in seconds.' },
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
              <p>Download Instagram Reels in high quality without watermark. Never compromise on visual fidelity.</p>
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

      {/* seo section */}
      {/* SEO Content */}
<section className={styles.seoSection}>
  <div className={styles.sectionInner}>

    <div className={styles.seoHeader}>
      <span className={styles.seoBadge}>
        Instagram Reels Downloader
      </span>

      <h2>
        Download Instagram Reels Without Watermark
      </h2>

      <p>
        DownloadShorts is a free online Instagram Reels downloader
        that lets you save Instagram Reel videos and audio in HD
        quality. No login, no registration, and no watermark.
      </p>
    </div>

    <div className={styles.seoGrid}>

      <div className={styles.seoCard}>
        <h3>How to Download Instagram Reels</h3>

        <div className={styles.stepItem}>
          <span>1</span>
          <p>Open Instagram and copy the Reel URL.</p>
        </div>

        <div className={styles.stepItem}>
          <span>2</span>
          <p>Paste the link into DownloadShorts.</p>
        </div>

        <div className={styles.stepItem}>
          <span>3</span>
          <p>Click Download and save the Reel instantly.</p>
        </div>
      </div>

      <div className={styles.seoCard}>
        <h3>Why Choose DownloadShorts?</h3>

        <ul className={styles.featureList}>
          <li>✓ Download Instagram Reels without watermark</li>
          <li>✓ HD quality downloads</li>
          <li>✓ Fast and secure processing</li>
          <li>✓ No account required</li>
          <li>✓ Mobile and desktop support</li>
          <li>✓ Completely free to use</li>
        </ul>
      </div>

    </div>

    <div className={styles.faqSection}>
      <h2>Frequently Asked Questions</h2>
      {FAQ_ITEMS.map(({ question, answer }) => (
        <div key={question} className={styles.faqItem}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}
    </div>

  </div>
</section>
    </>
  );
}
