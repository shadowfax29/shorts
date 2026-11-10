/** AdSense slot ids (set in Vercel env). Empty = that placement renders nothing. */
export const AD_SLOTS = {
  top: import.meta.env.VITE_ADSENSE_SLOT_TOP,
  mid: import.meta.env.VITE_ADSENSE_SLOT_MID,
  result: import.meta.env.VITE_ADSENSE_SLOT_RESULT,
};
