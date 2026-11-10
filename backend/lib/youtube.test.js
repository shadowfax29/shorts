import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildQualities, slimInfo, videoFormat } from './youtube.js';

describe('buildQualities', () => {
  it('dedupes by height, prefers higher fps, skips audio/storyboards', () => {
    const q = buildQualities([
      { format_id: 'a', vcodec: 'none', height: null },
      { format_id: 'sb', vcodec: 'images', height: 90, ext: 'mhtml', format_note: 'storyboard' },
      { format_id: '136', vcodec: 'avc1', height: 720, fps: 30, tbr: 1000 },
      { format_id: '298', vcodec: 'avc1', height: 720, fps: 60, tbr: 2000 },
      { format_id: '137', vcodec: 'avc1', height: 1080, fps: 30, tbr: 3000, filesize: 5e6 },
      { format_id: '160', vcodec: 'avc1', height: 144, fps: 30 },
    ]);
    assert.deepEqual(q.map((x) => x.label), ['1080p', '720p', '144p']);
    assert.equal(q[1].formatId, '298');
    assert.equal(q[0].filesize, 5e6);
  });
  it('is safe with garbage', () => {
    assert.deepEqual(buildQualities(undefined), []);
  });
});

describe('slimInfo', () => {
  it('drops heavy fields but keeps formats', () => {
    const s = slimInfo({
      id: 'x', subtitles: { en: [] }, heatmap: [1],
      formats: [{ format_id: '1' }, { format_id: 'sb0', format_note: 'storyboard' }],
    });
    assert.equal(s.subtitles, undefined);
    assert.equal(s.heatmap, undefined);
    assert.deepEqual(s.formats.map((f) => f.format_id), ['1']);
  });
});

describe('videoFormat', () => {
  it('clamps height and falls back to best', () => {
    assert.match(videoFormat('1080'), /height<=1080/);
    assert.match(videoFormat('abc'), /height<=720/);
    assert.match(videoFormat('99999'), /height<=4320/);
    assert.ok(videoFormat(720).endsWith('/b'));
  });
});
