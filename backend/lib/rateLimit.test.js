import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, Semaphore } from './rateLimit.js';

const fakeRes = () => ({
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
  status(c) { this.code = c; return this; },
  json(b) { this.body = b; },
});

describe('rateLimit', () => {
  it('blocks after max hits per IP, not other IPs', () => {
    const mw = rateLimit({ max: 2, windowMs: 60_000 });
    let passed = 0;
    for (let i = 0; i < 3; i++) {
      const res = fakeRes();
      mw({ ip: '1.1.1.1' }, res, () => passed++);
      if (i === 2) assert.equal(res.code, 429);
    }
    assert.equal(passed, 2);
    mw({ ip: '2.2.2.2' }, fakeRes(), () => passed++);
    assert.equal(passed, 3);
  });
});

describe('Semaphore', () => {
  it('caps concurrency and release is idempotent', () => {
    const s = new Semaphore(1);
    const r = s.tryAcquire();
    assert.equal(s.tryAcquire(), null);
    r(); r();
    assert.equal(s.active, 0);
    assert.ok(s.tryAcquire());
  });
});
