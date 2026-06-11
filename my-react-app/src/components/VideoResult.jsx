import { useState } from 'react';
import styles from './VideoResult.module.css';
import PlatformBadge from './PlatformBadge.jsx';

function getThumbnailSrc(platform, thumbnail) {
  return thumbnail || null;
}

function formatDuration(secs) {
  if (!secs) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}



export default function VideoResult({ info, url, onDownload, onReset, downloading }) {
  const { platform, title, thumbnail, duration, uploader, qualities,caption,hashtags } = info;
  const isYouTube = platform === 'youtube';
  const [selected, setSelected] = useState(qualities?.[0]?.formatId ?? null);
  const selectedQ    = qualities?.find(q => q.formatId === selected);
const thumbnailSrc = getThumbnailSrc(platform, thumbnail);
  return (
    <section className={`${styles.section} fade-in-up`}>
      <div className={styles.container}>
        <div className={styles.card}>

          {/* Thumbnail */}
          <div className={styles.thumb}>
            {thumbnailSrc ? (
              <img src={thumbnailSrc} alt={title} />
            ) : (
              <div className={styles.thumbPlaceholder}>
                <span className="material-symbols-outlined" style={{ fontSize: 48 }}>movie</span>
              </div>
            )}
            <div className={styles.thumbBadge}>
              <PlatformBadge platform={platform} size="sm" />
            </div>
            {duration && (
              <div className={styles.thumbDuration}>{formatDuration(duration)}</div>
            )}
            <div className={styles.thumbOverlay}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 56, color: '#fff' }}>
                play_circle
              </span>
            </div>
          </div>

          {/* Info + actions */}
          <div className={styles.info}>
         <div style={{ display: "flex", justifyContent: "flex-end" }}>
  <button
    className={styles.closePageBtn}
    onClick={onReset}
    type="button"
    aria-label="Go Home"
  >
    <span className="material-symbols-outlined">
      close
    </span>
  </button>
</div>
   
            {uploader && <p className={styles.uploader}>{uploader}</p>}
            <h1 className={styles.title}>{title}</h1>
{/* Caption */}
{/* {caption && (
  <div className={styles.captionCard}>
    <h3>
      <span className="material-symbols-outlined">
        article
      </span>
      Caption
    </h3>

    <p>{caption.replace(/#\w+/g, "").trim()}</p>
  </div>
)} */}

{/* Hashtags */}
{hashtags?.length > 0 && (
  <div className={styles.hashtagCard}>
    <h3>
      <span className="material-symbols-outlined">
        tag
      </span>
      Hashtags
    </h3>

  <div className={styles.hashtagWrap}>
  {hashtags.map((tag) => (
    <button
      key={tag}
      type="button"
      className={styles.hashtag}
      onClick={() => navigator.clipboard.writeText(tag)}
    >
      {tag}
    </button>
  ))}
</div>
  </div>
)}
            {/* YouTube quality selector */}
            {isYouTube && qualities?.length > 0 && (
              <div className={styles.qualitySection}>
                <div className={styles.qualityHeader}>
                  <span className={styles.qualityLabel}>Select Quality</span>
                  <span className={styles.qualityNote}>MP4 · Audio available</span>
                </div>
                <div className={styles.qualityGrid}>
                  {qualities.map((q) => (
                    <button
                      key={q.formatId}
                      className={`${styles.qualityCard} ${selected === q.formatId ? styles.qualityCardSelected : ''}`}
                      onClick={() => setSelected(q.formatId)}
                      type="button"
                    >
                      {q.label === qualities[0].label && (
                        <span className={styles.qualityRecommended}>Recommended</span>
                      )}
                      <span className={styles.qualityRes}>{q.label}</span>
                      <span className={styles.qualityMeta}>
                        MP4{q.fps > 30 ? ` · ${q.fps}fps` : ''}
                        {q.filesize ? ` · ${formatBytes(q.filesize)}` : ''}
                      </span>
                      {selected === q.formatId && (
                        <span className={`material-symbols-outlined icon-fill ${styles.qualityCheck}`}>
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TikTok / Instagram format row */}
            {!isYouTube && (
              <div className={styles.formatCard}>
                <div className={styles.formatIcon}>
                  <span className="material-symbols-outlined">high_quality</span>
                </div>
                <div>
                  <p className={styles.formatRes}>Original Quality</p>
                  <p className={styles.formatMeta}>MP4 · No watermark</p>
                </div>
                <span
                  className="material-symbols-outlined icon-fill"
                  style={{ color: 'var(--primary)', marginLeft: 'auto' }}
                >
                  radio_button_checked
                </span>
              </div>
            )}

            {/* Download button */}
            <button
              className={styles.downloadBtn}
              onClick={() => onDownload(selected)}
              disabled={downloading}
              type="button"
            >
              {downloading ? (
                <>
                  <span className="material-symbols-outlined spin">sync</span>
                  Downloading…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">download</span>
                  Download{isYouTube && selectedQ ? ` (${selectedQ.label})` : ' Video'}
                </>
              )}
            </button>

            <button className={styles.resetBtn} onClick={onReset} type="button">
              <span className="material-symbols-outlined">add_circle</span>
              Go Back & Download another video
            </button>

            {/* Feature pills */}
            <div className={styles.featurePills}>
              {[
                { icon: 'speed',        label: 'Fast Speed' },
                { icon: 'lock',         label: 'Secure'     },
                { icon: 'check_circle', label: 'No Login'   },
              ].map(f => (
                <div key={f.label} className={styles.featurePill}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>
                    {f.icon}
                  </span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
