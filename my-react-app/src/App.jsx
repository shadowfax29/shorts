import { useState, useCallback, useRef } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './components/LandingPage.jsx';
import VideoResult from './components/VideoResult.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import Toast from './components/Toast.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsAndConditions from './components/TermsAndConditions.jsx';
import Contact from './components/Contact.jsx';
import { PAGES } from './seo/pages.js';
import { apiUrl, startDownload } from './utils/api.js';
import './App.css';

// Downloads are streamed by the browser (hidden iframe), so we can't observe
// completion. Keep the button disabled briefly to stop accidental double-starts.
const DOWNLOAD_LOCK_MS = 8000;

// App-level state machine:  idle → loading → result | error
export default function App() {
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | result | error
  const [videoInfo, setVideoInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null); // { type, message }
  const [downloading, setDownloading] = useState(false);
  const [extractingAudio, setExtractingAudio] = useState(false);
  const fetchAbort = useRef(null);

  // Navigating to another tool page always starts from a clean form. Adjusting state
  // while rendering (instead of in an effect) avoids an extra render with stale UI.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setPhase('idle');
    setUrl('');
    setVideoInfo(null);
    setErrorMsg('');
  }

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 6000);
  }, []);

  const handleFetch = useCallback(async (inputUrl) => {
    fetchAbort.current?.abort();
    const ac = new AbortController();
    fetchAbort.current = ac;

    setUrl(inputUrl);
    setPhase('loading');
    setVideoInfo(null);
    setErrorMsg('');

    try {
      const res = await fetch(apiUrl('info', { url: inputUrl }), { signal: ac.signal });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setPhase('error');
        return;
      }
      setVideoInfo(data);
      setPhase('result');
    } catch (e) {
      if (e.name === 'AbortError') return;
      setErrorMsg('Could not reach the server. Please check your connection and try again.');
      setPhase('error');
    }
  }, []);

  const lock = useCallback((setter) => {
    setter(true);
    setTimeout(() => setter(false), DOWNLOAD_LOCK_MS);
  }, []);

  const handleDownload = useCallback((height) => {
    if (!videoInfo) return;
    lock(setDownloading);
    showToast('loading', 'Preparing your file. The download starts automatically. HD and long videos can take up to a minute.');
    startDownload(apiUrl('download', { url, height, title: videoInfo.title }));
  }, [videoInfo, url, showToast, lock]);

  const handleDownloadClip = useCallback((start, end, height) => {
    if (!videoInfo) return;
    showToast('loading', 'Cutting your clip. The download starts automatically in a few seconds.');
    // Clips are capped at 1080p: 4K sections are very large and slow to cut.
    startDownload(apiUrl('clip', { url, start, end, height: Math.min(height || 1080, 1080), title: videoInfo.title }));
  }, [videoInfo, url, showToast]);

  const handleExtractAudio = useCallback(() => {
    if (!videoInfo) return;
    lock(setExtractingAudio);
    showToast('loading', 'Converting to MP3. The download starts automatically.');
    startDownload(apiUrl('audio', { url, title: videoInfo.title }));
  }, [videoInfo, url, showToast, lock]);

  const handleReset = useCallback(() => {
    fetchAbort.current?.abort();
    setPhase('idle');
    setUrl('');
    setVideoInfo(null);
    setErrorMsg('');
  }, []);

  // Same tool flow for every landing page; only the copy differs.
  const renderTool = (page) => (
    <>
      {phase === 'idle' && <LandingPage page={page} onSubmit={handleFetch} />}
      {phase === 'loading' && <LoadingScreen />}
      {phase === 'result' && videoInfo && (
        <VideoResult
          info={videoInfo}
          url={url}
          onDownload={handleDownload}
          onDownloadClip={handleDownloadClip}
          onExtractAudio={handleExtractAudio}
          onReset={handleReset}
          downloading={downloading}
          extractingAudio={extractingAudio}
        />
      )}
      {phase === 'error' && <ErrorScreen message={errorMsg} onReset={handleReset} />}
    </>
  );

  return (
    <>
      <Nav />

      <main style={{ flex: 1 }}>
        <Routes>
          {PAGES.map((page) => (
            <Route key={page.path} path={page.path} element={renderTool(page)} />
          ))}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-spinner-wrap">
        <span className="material-symbols-outlined spin" style={{ fontSize: 40, color: 'var(--primary)' }}>
          sync
        </span>
        <p>Fetching video info&hellip;</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <section style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <Helmet>
        <title>Page not found | DownloadShorts</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>
        The page you are looking for does not exist. Try one of our downloaders instead.
      </p>
      <p style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {PAGES.map((p) => (
          <Link key={p.path} to={p.path} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {p.nav}
          </Link>
        ))}
      </p>
    </section>
  );
}
