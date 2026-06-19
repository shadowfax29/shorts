import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './Contact.module.css';

const CONTACT_EMAIL = 'contact@downloadshorts.com';

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
        <meta property="og:image" content="https://downloadshorts.com/logo.png" />
        <meta name="twitter:title" content="Contact Us - DownloadShorts" />
        <meta name="twitter:description" content="Contact DownloadShorts for support or to report an issue." />
        <meta name="twitter:image" content="https://downloadshorts.com/logo.png" />
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
