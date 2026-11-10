import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectPlatform, parseYouTube, parseInstagram, normalizeUrl, parseTimestamp, validateClipRange, safeFilename,
} from './urls.js';

describe('detectPlatform', () => {
  it('detects supported hosts, incl. mobile subdomains', () => {
    assert.equal(detectPlatform('https://m.youtube.com/watch?v=aqz-KE-bpKQ'), 'youtube');
    assert.equal(detectPlatform('https://youtu.be/aqz-KE-bpKQ'), 'youtube');
    assert.equal(detectPlatform('https://www.instagram.com/reel/abc123/'), 'instagram');
    assert.equal(detectPlatform('https://vm.tiktok.com/xyz'), 'tiktok');
  });
  it('rejects look-alike and unrelated hosts', () => {
    assert.equal(detectPlatform('https://notyoutube.com/watch?v=aqz-KE-bpKQ'), null);
    assert.equal(detectPlatform('https://youtube.com.evil.io/x'), null);
    assert.equal(detectPlatform('file:///etc/passwd'), null);
    assert.equal(detectPlatform('garbage'), null);
  });
});

describe('parseYouTube / normalizeUrl', () => {
  const id = 'aqz-KE-bpKQ';
  it('handles watch, shorts, youtu.be, embed, live', () => {
    for (const u of [
      `https://www.youtube.com/watch?v=${id}&t=30s&list=PL1`,
      `https://youtu.be/${id}?si=abc`,
      `https://www.youtube.com/shorts/${id}?feature=share`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube.com/live/${id}`,
    ]) {
      assert.equal(parseYouTube(u)?.id, id, u);
      assert.equal(normalizeUrl(u), `https://www.youtube.com/watch?v=${id}`);
    }
  });
  it('flags shorts', () => {
    assert.equal(parseYouTube(`https://youtube.com/shorts/${id}`).isShort, true);
    assert.equal(parseYouTube(`https://youtube.com/watch?v=${id}`).isShort, false);
  });
  it('returns null for channel / playlist pages', () => {
    assert.equal(parseYouTube('https://www.youtube.com/@name'), null);
    assert.equal(parseYouTube('https://www.youtube.com/playlist?list=PL1'), null);
  });
});

describe('parseInstagram / normalizeUrl', () => {
  it('canonicalises reel, p and user-scoped URLs and drops tracking params', () => {
    assert.equal(normalizeUrl('https://www.instagram.com/reel/CuE2WNQs6vH/?igsh=abc'), 'https://www.instagram.com/reel/CuE2WNQs6vH/');
    assert.equal(normalizeUrl('https://instagram.com/reels/CuE2WNQs6vH'), 'https://www.instagram.com/reel/CuE2WNQs6vH/');
    assert.equal(normalizeUrl('https://www.instagram.com/someone/p/CuE2WNQs6vH/'), 'https://www.instagram.com/p/CuE2WNQs6vH/');
  });
  it('rejects profile pages', () => {
    assert.equal(parseInstagram('https://www.instagram.com/someone/'), null);
  });
});

describe('clip ranges', () => {
  it('parses timestamps', () => {
    assert.equal(parseTimestamp('90'), 90);
    assert.equal(parseTimestamp('1:30'), 90);
    assert.equal(parseTimestamp('1:01:01'), 3661);
    assert.ok(Number.isNaN(parseTimestamp('abc')));
    assert.ok(Number.isNaN(parseTimestamp('')));
  });
  it('validates and clamps to duration', () => {
    assert.deepEqual(validateClipRange('10', '40', { duration: 100 }), { start: 10, end: 40 });
    assert.deepEqual(validateClipRange('10', '400', { duration: 100 }), { start: 10, end: 100 });
  });
  it('rejects bad ranges', () => {
    assert.match(validateClipRange('40', '10').error, /after/);
    assert.match(validateClipRange('-1', '10').error, /valid/);
    assert.match(validateClipRange('x', '10').error, /valid/);
    assert.match(validateClipRange('200', '300', { duration: 100 }).error, /beyond/);
    assert.match(validateClipRange('0', '700', { maxSeconds: 600 }).error, /at most 10 minutes/);
  });
});

describe('safeFilename', () => {
  it('produces ASCII-only names', () => {
    assert.equal(safeFilename('Big Buck Bunny! 4K - "Official"', 'mp4'), 'big-buck-bunny-4k-official.mp4');
    assert.equal(safeFilename('日本語', 'mp4'), 'video.mp4');
    assert.doesNotMatch(safeFilename('a\r\nb"; x', 'mp3'), /[\r\n"; ]/);
  });
});
