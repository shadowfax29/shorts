import styles from './PlatformBadge.module.css';

const META = {
  youtube:   { label: 'YouTube',   icon: 'play_circle',  color: '#ff0000', bg: 'rgba(255,0,0,0.1)',    border: 'rgba(255,0,0,0.25)'    },
  tiktok:    { label: 'TikTok',    icon: 'music_note',   color: '#000000', bg: 'rgba(0,0,0,0.06)',     border: 'rgba(0,0,0,0.15)'      },
  instagram: { label: 'Instagram', icon: 'photo_camera', color: '#e1306c', bg: 'rgba(225,48,108,0.1)', border: 'rgba(225,48,108,0.25)' },
};

export default function PlatformBadge({ platform, size = 'md' }) {
  const m = META[platform];
  if (!m) return null;
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: m.bg, borderColor: m.border, color: m.color }}
    >
      <span className="material-symbols-outlined icon-fill" style={{ fontSize: size === 'sm' ? 14 : 16 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}
