import { useEffect, useRef } from 'react';

/**
 * Google AdSense unit. Renders nothing until VITE_ADSENSE_CLIENT (ca-pub-…) and
 * a slot id are configured, so the site stays ad-free (and CLS-free) in dev and
 * until the AdSense account is approved.
 *
 *   VITE_ADSENSE_CLIENT=ca-pub-1234567890123456
 *   VITE_ADSENSE_SLOT_TOP=1111111111     (shown under the tool)
 *   VITE_ADSENSE_SLOT_MID=2222222222     (shown between content sections)
 *   VITE_ADSENSE_SLOT_RESULT=3333333333  (shown under a download result)
 */
const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
let scriptRequested = false;

function loadAdSense() {
  if (scriptRequested || typeof document === 'undefined') return;
  scriptRequested = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}

export default function AdSlot({ slot, minHeight = 120 }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    loadAdSense();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers etc. - ignore */
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;

  return (
    <aside aria-label="Advertisement" style={{ maxWidth: 970, margin: '24px auto', minHeight, padding: '0 16px' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

