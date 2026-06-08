import styles from './Toast.module.css';

const CONFIG = {
  success: { icon: 'check_circle', borderColor: 'var(--secondary)',   iconColor: 'var(--secondary)'   },
  error:   { icon: 'error',        borderColor: 'var(--tertiary)',     iconColor: 'var(--tertiary)'    },
  loading: { icon: 'sync',         borderColor: 'var(--primary)',      iconColor: 'var(--primary)'     },
};

export default function Toast({ toast, onClose }) {
  const cfg = CONFIG[toast.type] || CONFIG.loading;
  return (
    <div
      className={`${styles.toast} glass fade-in-down`}
      style={{ borderLeftColor: cfg.borderColor }}
      role="status"
      aria-live="polite"
    >
      <span
        className={`material-symbols-outlined icon-fill ${toast.type === 'loading' ? 'spin' : ''}`}
        style={{ color: cfg.iconColor, flexShrink: 0 }}
      >
        {cfg.icon}
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Dismiss">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
