import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickInstagramFromYtdlp } from './instagramYtdlp.js';

// Shape captured from a real public post via yt-dlp
const meta = {
  title: 'Video by google',
  uploader: 'Google',
  thumbnail: 'https://cdn/t.jpg',
  description: 'Hello #Ballroom #art #Ballroom',
  formats: [
    { format_id: 'dash-a', ext: 'm4a', protocol: 'https', vcodec: 'none', acodec: 'mp4a.40.5', url: 'https://cdn/a.m4a' },
    { format_id: '1', ext: 'mp4', protocol: 'https', url: 'https://cdn/1.mp4' },
    { format_id: '3', ext: 'mp4', protocol: 'https', url: 'https://cdn/3.mp4' },
    { format_id: 'dash-v', ext: 'mp4', protocol: 'https', vcodec: 'avc1', acodec: 'none', height: 1280, url: 'https://cdn/v.mp4' },
  ],
};

describe('pickInstagramFromYtdlp', () => {
  it('prefers the last progressive file over video-only DASH', () => {
    const r = pickInstagramFromYtdlp(meta);
    assert.equal(r.videoUrl, 'https://cdn/3.mp4');
    assert.equal(r.audioUrl, 'https://cdn/a.m4a');
    assert.equal(r.uploader, 'Google');
  });
  it('extracts unique hashtags from the description', () => {
    assert.deepEqual(pickInstagramFromYtdlp(meta).hashtags, ['#Ballroom', '#art']);
  });
  it('returns null videoUrl when only DASH is available', () => {
    const r = pickInstagramFromYtdlp({ formats: [meta.formats[0], meta.formats[3]] });
    assert.equal(r.videoUrl, null);
  });
  it('falls back to top-level url for single-file posts', () => {
    assert.equal(pickInstagramFromYtdlp({ url: 'https://cdn/single.mp4', formats: [] }).videoUrl, 'https://cdn/single.mp4');
  });
});
