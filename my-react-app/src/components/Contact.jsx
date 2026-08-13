import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './Contact.module.css';
import { SITE } from '../seo/seo-config.js';

const CONTACT_EMAIL = SITE.contactEmail;

const CONTACT_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': 'https://downloadshorts.com/contact',
      url: 'https://downloadshorts.com/contact',
      name: 'Contact DownloadShorts',
      description:
        'Contact DownloadShorts for support, questions, or to report an issue with our Instagram Reels downloader.',
      mainEntity: {
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.url,
        contactPoint: {
          '@type': 'ContactPoint',
          email: CONTACT_EMAIL,
          contactType: 'customer support',
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://downloadshorts.com/' },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://downloadshorts.com/contact' },
      ],
    },
  ],
});

export default function Contact() {
  const [title, setTitle]     = useState('');
  const [link, setLink]       = useState('');
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!link.trim()) {
      setError('The link field is mandatory to send a report.');
      return;
    }
    setError('');

    const subject = encodeURIComponent(title || 'Report from downloadshorts.com');
    const body    = encodeURIComponent(
      `Link: ${link}\n\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <main className={styles.page}>
      <Helmet>
        <title>Contact Us - DownloadShorts</title>
        <meta name="description" content="Contact DownloadShorts for support, questions, or to report an issue with our Instagram Reels downloader. We respond to all inquiries." />
        <link rel="canonical" href="https://downloadshorts.com/contact" />
        <meta property="og:title" content="Contact Us - DownloadShorts" />
        <meta property="og:description" content="Contact DownloadShorts for support or to report an issue with our Instagram Reels downloader." />
        <meta property="og:url" content="https://downloadshorts.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:locale" content={SITE.locale} />
        <meta property="og:image" content={SITE.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SITE.ogImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SITE.twitterHandle} />
        <meta name="twitter:title" content="Contact Us - DownloadShorts" />
        <meta name="twitter:description" content="Contact DownloadShorts for support or to report an issue." />
        <meta name="twitter:image" content={SITE.ogImage} />
        <meta name="twitter:image:alt" content={SITE.ogImageAlt} />
        <script type="application/ld+json">{CONTACT_SCHEMA}</script>
      </Helmet>
      <div className={styles.hero}>
        <h1>Contact <span>Us</span></h1>
        <p>Have a problem or suggestion? Let us know.</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Download Error"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="link">
              Link <span className={styles.required}>*</span>
            </label>
            <input
              id="link"
              type="url"
              placeholder="Paste the Instagram link here"
              value={link}
              onChange={(e) => { setLink(e.target.value); setError(''); }}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Subject / Message</label>
            <textarea
              id="message"
              rows={5}
              placeholder="Describe the issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <button type="submit" className={styles.btn}>
            ⚠ Send Report
          </button>
        </form>
      </div>

      <p className={styles.directEmail}>
        Direct email:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </main>
  );
}
