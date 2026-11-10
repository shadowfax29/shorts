import { useState } from 'react';
import styles from './ClipTool.module.css';
import { formatTimestamp, parseTimestamp, splitIntoParts } from '../utils/time.js';

export const MAX_CLIP_SECONDS = 600;
const MAX_PARTS = 100;
const PART_LENGTHS = [
  { seconds: 15, label: '15 sec' },
  { seconds: 30, label: '30 sec' },
  { seconds: 60, label: '1 min' },
  { seconds: 120, label: '2 min' },
  { seconds: 300, label: '5 min' },
  { seconds: 600, label: '10 min' },
];

/**
 * Cut a section out of a YouTube video, or split it into equal parts.
 * `onClip(start, end)` triggers the download (parent knows the URL / quality).
 */
export default function ClipTool({ duration, onClip }) {
  const total = Math.floor(duration);
  const [mode, setMode] = useState('custom'); // custom | split
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(Math.min(total, 30));
  const [startText, setStartText] = useState('0:00');
  const [endText, setEndText] = useState(formatTimestamp(Math.min(total, 30)));
  const [partLen, setPartLen] = useState(total > 600 ? 60 : 15);

  const length = end - start;
  const problem =
    !(end > start) ? 'End time must be after the start time.'
    : length > MAX_CLIP_SECONDS ? `Clips can be at most ${MAX_CLIP_SECONDS / 60} minutes. Shorten the range or split the video into parts.`
    : null;

  const setStartSafe = (v) => {
    const s = Math.min(Math.max(0, v), total - 1);
    setStart(s);
    setStartText(formatTimestamp(s));
    if (s >= end) {
      const e = Math.min(total, s + 1);
      setEnd(e);
      setEndText(formatTimestamp(e));
    }
  };
  const setEndSafe = (v) => {
    const e = Math.min(Math.max(1, v), total);
    setEnd(e);
    setEndText(formatTimestamp(e));
    if (e <= start) {
      const s = Math.max(0, e - 1);
      setStart(s);
      setStartText(formatTimestamp(s));
    }
  };
  const commitText = (text, apply, fallback) => {
    const v = parseTimestamp(text);
    if (Number.isNaN(v)) apply(fallback);
    else apply(v);
  };

  const parts = splitIntoParts(total, partLen);
  const tooMany = parts.length > MAX_PARTS;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className="material-symbols-outlined" aria-hidden="true">content_cut</span>
        <h2>Clip this video</h2>
      </div>

      <p className={styles.hint}>Clips are saved as MP4 up to 1080p, up to {MAX_CLIP_SECONDS / 60} minutes each.</p>

      <div className={styles.tabs} role="tablist" aria-label="Clip mode">
        {[['custom', 'Custom clip'], ['split', 'Split into parts']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={`${styles.tab} ${mode === id ? styles.tabActive : ''}`}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'custom' ? (
        <div className={styles.panel}>
          <div className={styles.timeRow}>
            <label className={styles.timeField}>
              <span>Start</span>
              <input
                type="text"
                inputMode="numeric"
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                onBlur={() => commitText(startText, setStartSafe, start)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                aria-label="Clip start time"
              />
            </label>
            <label className={styles.timeField}>
              <span>End</span>
              <input
                type="text"
                inputMode="numeric"
                value={endText}
                onChange={(e) => setEndText(e.target.value)}
                onBlur={() => commitText(endText, setEndSafe, end)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                aria-label="Clip end time"
              />
            </label>
            <div className={styles.length}>
              <span>Length</span>
              <strong>{formatTimestamp(Math.max(0, length))}</strong>
            </div>
          </div>

          <input
            className={styles.slider}
            type="range"
            min={0}
            max={total}
            step={1}
            value={start}
            onChange={(e) => setStartSafe(Number(e.target.value))}
            aria-label="Start position"
          />
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={total}
            step={1}
            value={end}
            onChange={(e) => setEndSafe(Number(e.target.value))}
            aria-label="End position"
          />
          <div className={styles.scale}>
            <span>0:00</span>
            <span>{formatTimestamp(total)}</span>
          </div>

          {problem && <p className={styles.problem} role="alert">{problem}</p>}

          <button
            type="button"
            className={styles.primary}
            disabled={Boolean(problem)}
            onClick={() => onClip(start, end)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">download</span>
            Download clip ({formatTimestamp(start)} &ndash; {formatTimestamp(end)})
          </button>
        </div>
      ) : (
        <div className={styles.panel}>
          <p className={styles.hint}>Choose how long each clip should be. Download only the parts you need.</p>
          <div className={styles.chips} role="group" aria-label="Part length">
            {PART_LENGTHS.map((p) => (
              <button
                key={p.seconds}
                type="button"
                className={`${styles.chip} ${partLen === p.seconds ? styles.chipActive : ''}`}
                aria-pressed={partLen === p.seconds}
                onClick={() => setPartLen(p.seconds)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {tooMany ? (
            <p className={styles.problem} role="alert">
              That would create {parts.length} parts. Choose a longer part length (max {MAX_PARTS} parts).
            </p>
          ) : (
            <ol className={styles.parts}>
              {parts.map((p, i) => (
                <li key={p.start} className={styles.part}>
                  <span className={styles.partName}>Part {i + 1}</span>
                  <span className={styles.partRange}>
                    {formatTimestamp(p.start)} &ndash; {formatTimestamp(p.end)}
                  </span>
                  <button type="button" className={styles.partBtn} onClick={() => onClip(p.start, p.end)}>
                    <span className="material-symbols-outlined" aria-hidden="true">download</span>
                    Download
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
