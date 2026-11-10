import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { detectPlatform, isVideoUrl } from '../utils/platform.js';
import { PAGE_BY_PATH } from '../seo/pages.js';
import PageHead from '../seo/PageHead.jsx';
import PlatformBadge from './PlatformBadge.jsx';
import AdSlot from './AdSlot.jsx';
import { AD_SLOTS } from '../seo/adSlots.js';

const ACCEPT_TEXT = {
  instagram: 'Please paste a valid Instagram Reel or post link.',
  youtube: 'Please paste a valid YouTube video, Shorts or youtu.be link.',
  both: 'Please paste a valid Instagram Reel or YouTube video link.',
};

/**
 * One component renders every indexable tool page (home + keyword pages).
 * All copy, <head> data and schema come from `page` (see seo/pages.js).
 */
export default function LandingPage({ page, onSubmit }) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const platform = detectPlatform(url.trim());
  const [intro, ...moreIntro] = page.sections[0].paragraphs;
  const second = page.sections[1];

  const submit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please paste a video URL first.');
      return;
    }
    if (!isVideoUrl(trimmed)) {
      setError(ACCEPT_TEXT[page.accepts] || ACCEPT_TEXT.both);
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  const handlePasteButton = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return;
      setUrl(text);
      submit(text);
    } catch {
      inputRef.current?.focus();
    }
  };

  const related = page.related.map((p) => PAGE_BY_PATH[p]).filter(Boolean);

  return (
    <>
      <PageHead page={page} />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.blobTop} aria-hidden="true" />
        <div className={styles.blobBtm} aria-hidden="true" />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{page.h1}</h1>
          <p className={styles.heroSubtitle}>{page.subtitle}</p>

          <form
            className={styles.inputForm}
            onSubmit={(e) => {
              e.preventDefault();
              submit(url);
            }}
            noValidate
          >
            <div className={`${styles.inputWrap} ${focused ? styles.inputFocused : ''}`}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`} aria-hidden="true">link</span>
              <input
                ref={inputRef}
                className={styles.input}
                type="url"
                name="url"
                value={url}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={page.placeholder.replace(/\.+$/, '')}
                placeholder={page.placeholder}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onPaste={(e) => {
                  // Fetch immediately on paste; typing waits for the button / Enter.
                  const pasted = e.clipboardData.getData('text').trim();
                  if (isVideoUrl(pasted)) {
                    e.preventDefault();
                    setUrl(pasted);
                    submit(pasted);
                  }
                }}
              />
              {url ? (
                <>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => { setUrl(''); setError(''); inputRef.current?.focus(); }}
                    aria-label="Clear"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <button type="submit" className={styles.downloadBtn}>
                    <span>Download</span>
                    <span className="material-symbols-outlined" aria-hidden="true">download</span>
                  </button>
                </>
              ) : (
                <button type="button" className={styles.downloadBtn} onClick={handlePasteButton}>
                  <span>Paste</span>
                </button>
              )}
            </div>

            {platform && (
              <div className={styles.detectedRow}>
                <span className={styles.detectedLabel}>Detected:</span>
                <PlatformBadge platform={platform} />
              </div>
            )}
            {error && <p className={styles.inputError} role="alert">{error}</p>}
          </form>
        </div>
      </section>

      <AdSlot slot={AD_SLOTS.top} />

      {/* ── How it works ── */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>How to use the {page.badge} tool</h2>
            <p>Three simple steps. No signup, no software.</p>
          </div>
          <ol className={styles.stepsGrid} style={{ listStyle: 'none', padding: 0 }}>
            {page.steps.map((step, i) => (
              <li key={step.title} className={styles.stepCard}>
                <div
                  className={styles.stepIcon}
                  style={{
                    background: ['var(--primary-fixed)', 'var(--secondary-fixed)', 'var(--tertiary-fixed)'][i % 3],
                    color: ['var(--on-primary-fixed)', 'var(--on-secondary-fixed-variant)', 'var(--on-tertiary-fixed-variant)'][i % 3],
                    fontWeight: 800,
                    fontSize: 20,
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Feature Bento ── */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.bentoGrid}>
            <div className={`${styles.bentoCard} ${styles.bentoFeatured}`}>
              <h3>Crystal Clear Quality</h3>
              <p>Always the best quality the source offers: up to 4K for YouTube, original resolution for Instagram Reels.</p>
              <div className={styles.bentoBadges}>
                <span>4K UHD</span><span>1080p</span><span>MP4</span><span>MP3</span>
              </div>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoFast}`}>
              <div>
                <h4>Blazing Fast</h4>
                <p>Links resolve in seconds and downloads stream straight to your device.</p>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }} aria-hidden="true">bolt</span>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 32 }} aria-hidden="true">security</span>
              <strong>Safe &amp; Secure</strong>
              <small>Encrypted connections only.</small>
            </div>
            <div className={`${styles.bentoCard} ${styles.bentoSmall}`}>
              <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: 32 }} aria-hidden="true">ads_click</span>
              <strong>No Account Needed</strong>
              <small>Works without any login.</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO content ── */}
      <section className={styles.seoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.seoHeader}>
            <span className={styles.seoBadge}>{page.badge}</span>
            <h2>{page.sections[0].h2}</h2>
            <p>{intro}</p>
            {moreIntro.map((t) => <p key={t} style={{ marginTop: 14 }}>{t}</p>)}
          </div>

          <div className={styles.seoGrid}>
            {second && (
              <div className={styles.seoCard}>
                <h3>{second.h2}</h3>
                {second.paragraphs.map((t) => (
                  <p key={t} style={{ lineHeight: 1.75, color: '#555', marginBottom: 12 }}>{t}</p>
                ))}
              </div>
            )}
            <div className={styles.seoCard}>
              <h3>Why choose DownloadShorts?</h3>
              <ul className={styles.featureList}>
                {page.benefits.map((b) => <li key={b}>&#10003; {b}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.faqSection}>
            <h2>Frequently Asked Questions</h2>
            {page.faq.map(({ question, answer }) => (
              <div key={question} className={styles.faqItem}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdSlot slot={AD_SLOTS.mid} />

      {/* ── Related tools (internal links) ── */}
      <section className={styles.related} aria-labelledby="more-tools">
        <div className={styles.sectionInner}>
          <h2 id="more-tools">More free tools</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <Link key={p.path} to={p.path} className={styles.relatedCard}>
                <strong>{p.h1}</strong>
                <span>{p.subtitle.split('. ')[0].replace(/\.$/, '')}.</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
