import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { friendlyError, cookieArgs } from './helpers.js';
import { writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// ── cookieArgs ───────────────────────────────────────────────────────────────

const TMP = tmpdir();

describe('cookieArgs', () => {
  it('youtube → passes cookie file when it exists', () => {
    const f = join(TMP, 'cookies.txt');
    writeFileSync(f, 'test');
    const args = cookieArgs('youtube', TMP);
    assert.deepEqual(args, ['--cookies', f]);
    rmSync(f);
  });

  it('instagram → passes instagram cookie file when it exists', () => {
    const f = join(TMP, 'instagram_cookies.txt');
    writeFileSync(f, 'test');
    const args = cookieArgs('instagram', TMP);
    assert.deepEqual(args, ['--cookies', f]);
    rmSync(f);
  });

  it('tiktok → empty array when file does not exist', () => {
    const args = cookieArgs('tiktok', TMP);
    assert.deepEqual(args, []);
  });
});

// ── friendlyError ────────────────────────────────────────────────────────────

describe('friendlyError', () => {
  it('YouTube bot/sign-in msg → 503 with YouTube message', () => {
    const msg = 'Sign in to confirm your age. This video may be inappropriate for some users.';
    const result = friendlyError(msg);
    assert.equal(result.status, 503);
    assert.match(result.error, /youtube/i);
  });

  it('Instagram rate-limit/cookies msg → 503 with Instagram message (not YouTube)', () => {
    const msg = 'Requested content is not available, rate-limit reached or login required. Use --cookies-from-browser or --cookies for the authentication.';
    const result = friendlyError(msg);
    assert.equal(result.status, 503);
    assert.match(result.error, /instagram/i);
    assert.doesNotMatch(result.error, /youtube/i);
  });

  it('private video → 403', () => {
    const result = friendlyError('This video is private.');
    assert.equal(result.status, 403);
    assert.match(result.error, /private/i);
  });

  it('not available / removed → 404', () => {
    const result = friendlyError('Video not available or has been removed.');
    assert.equal(result.status, 404);
  });

  it('unsupported URL → 400', () => {
    const result = friendlyError('Unsupported URL: https://example.com');
    assert.equal(result.status, 400);
  });

  it('unknown error → 500', () => {
    const result = friendlyError('some unexpected yt-dlp failure');
    assert.equal(result.status, 500);
  });
});
