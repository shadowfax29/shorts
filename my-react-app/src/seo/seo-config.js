export const SITE = {
  name: 'DownloadShorts',
  url: 'https://downloadshorts.com',
  ogImage: 'https://downloadshorts.com/og-image.png',
  ogImageAlt:
    'DownloadShorts - Free Instagram Reels and YouTube video downloader. Clip, convert to MP3, no login required.',
  twitterHandle: '@DownloadShorts',
  locale: 'en_US',
  contactEmail: 'contact@downloadshorts.com',
};

/** Absolute canonical URL for a route path ("/" keeps its trailing slash, others have none). */
export const canonicalFor = (path) => (path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`);
