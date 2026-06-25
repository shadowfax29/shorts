import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scrapeInstagramReel } from './instagramScraper.js';

const makeHtml = ({ video = '', title = '', image = '' } = {}) => `
<html>
<head>
  <meta property="og:video" content="${video}" />
  <meta property="og:video:secure_url" content="${video}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${image}" />
</head>
<body></body>
</html>`;

const mockFetch = (html, status = 200) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => html,
});

describe('scrapeInstagramReel', () => {
  it('extracts videoUrl from og:video', async () => {
    const html = makeHtml({ video: 'https://cdn.instagram.com/video.mp4' });
    const result = await scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html));
    assert.equal(result.videoUrl, 'https://cdn.instagram.com/video.mp4');
  });

  it('extracts title from og:title', async () => {
    const html = makeHtml({ video: 'https://cdn.instagram.com/video.mp4', title: 'My Reel' });
    const result = await scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html));
    assert.equal(result.title, 'My Reel');
  });

  it('extracts thumbnail from og:image', async () => {
    const html = makeHtml({ video: 'https://cdn.instagram.com/video.mp4', image: 'https://cdn.instagram.com/thumb.jpg' });
    const result = await scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html));
    assert.equal(result.thumbnail, 'https://cdn.instagram.com/thumb.jpg');
  });

  it('throws when og:video missing', async () => {
    const html = makeHtml({ title: 'No video here' });
    await assert.rejects(
      () => scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html)),
      /unavailable|not found|private/i
    );
  });

  it('sends Chrome User-Agent and Instagram Referer', async () => {
    const html = makeHtml({ video: 'https://cdn.instagram.com/video.mp4' });
    let capturedHeaders;
    const spyFetch = async (url, opts) => { capturedHeaders = opts?.headers; return mockFetch(html)(); };
    await scrapeInstagramReel('https://www.instagram.com/reels/abc/', spyFetch);
    assert.match(capturedHeaders['User-Agent'], /Chrome/);
    assert.match(capturedHeaders['Referer'], /instagram\.com/);
  });
  it('extracts audioUrl when audio field present in JSON', async () => {
    const html = `
    <meta property="og:video" content="https://cdn.instagram.com/video.mp4" />
    <script>"audio":{"url":"https:\\/\\/cdn.instagram.com\\/audio.mp4"}</script>`;
    const result = await scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html));
    assert.equal(result.audioUrl, 'https://cdn.instagram.com/audio.mp4');
  });

  it('returns null audioUrl when no audio found', async () => {
    const html = makeHtml({ video: 'https://cdn.instagram.com/video.mp4' });
    const result = await scrapeInstagramReel('https://www.instagram.com/reels/abc/', mockFetch(html));
    assert.equal(result.audioUrl, null);
  });
});
