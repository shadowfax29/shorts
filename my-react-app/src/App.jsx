import { useState, useCallback } from 'react';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './components/LandingPage.jsx';
import VideoResult from './components/VideoResult.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';
import Toast from './components/Toast.jsx';
import './App.css';

const API = import.meta.env.VITE_API_URL || '';

// App-level state machine:  idle → loading → result | error
export default function App() {
  const [url, setUrl]           = useState('');
  const [phase, setPhase]       = useState('idle');  // idle | loading | result | error
  const [videoInfo, setVideoInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast]       = useState(null);   // { type, message }
  const [downloading, setDownloading] = useState(false);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const handleFetch = useCallback(async (inputUrl) => {
    setUrl(inputUrl);
    setPhase('loading');
    setVideoInfo(null);
    setErrorMsg('');

    try {
      const res  = await fetch(`${API}/api/info?url=${encodeURIComponent(inputUrl)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setPhase('error');
        return;
      }

      setVideoInfo(data);
      setPhase('result');
    } catch {
      setErrorMsg('Could not reach the server. Make sure the backend is running on port 3001.');
      setPhase('error');
    }
  }, []);

  const handleDownload = useCallback(async (formatId) => {
    if (!videoInfo) return;
    setDownloading(true);
    showToast('loading', 'Preparing your download…');

    try {
      const params = new URLSearchParams({ url, platform: videoInfo.platform });
      if (videoInfo.platform === 'youtube' && formatId) params.set('formatId', formatId);

      const res = await fetch(`${API}/api/download?${params}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast('error', data.error || 'Download failed.');
        setDownloading(false);
        return;
      }

      const blob      = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a         = document.createElement('a');
      a.href          = objectUrl;
      a.download      = slugify(videoInfo.title) + '.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      showToast('success', 'Your video is ready — check your Downloads folder.');
    } catch {
      showToast('error', 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [videoInfo, url, showToast]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setUrl('');
    setVideoInfo(null);
    setErrorMsg('');
  }, []);

  return (
    <>
      <Nav />

      <main style={{ flex: 1 }}>
        {phase === 'idle' && (
          <LandingPage onSubmit={handleFetch} />
        )}
        {phase === 'loading' && (
          <LoadingScreen />
        )}
        {phase === 'result' && videoInfo && (
          <VideoResult
            info={videoInfo}
            url={url}
            onDownload={handleDownload}
            onReset={handleReset}
            downloading={downloading}
          />
        )}
        {phase === 'error' && (
          <ErrorScreen message={errorMsg} onReset={handleReset} />
        )}
      </main>

      <Footer />
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner-wrap">
        <span className="material-symbols-outlined spin" style={{ fontSize: 40, color: 'var(--primary)' }}>
          sync
        </span>
        <p>Fetching video info…</p>
      </div>
    </div>
  );
}

function slugify(str) {
  return (str || 'video').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}
