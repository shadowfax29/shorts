import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SimpleCache } from './cache.js';

describe('SimpleCache', () => {
  it('should set and get values correctly', () => {
    const cache = new SimpleCache(1000);
    cache.set('key1', 'value1');
    assert.equal(cache.get('key1'), 'value1');
  });

  it('should return null for non-existent keys', () => {
    const cache = new SimpleCache(1000);
    assert.equal(cache.get('nonexistent'), null);
  });

  it('should expire values after TTL', async () => {
    const cache = new SimpleCache(10); // 10ms TTL
    cache.set('key1', 'value1');
    assert.equal(cache.get('key1'), 'value1');

    await new Promise((resolve) => setTimeout(resolve, 15));

    assert.equal(cache.get('key1'), null);
  });

  it('should support custom TTL on set', async () => {
    const cache = new SimpleCache(1000);
    cache.set('key1', 'value1', 10); // 10ms custom TTL
    assert.equal(cache.get('key1'), 'value1');

    await new Promise((resolve) => setTimeout(resolve, 15));

    assert.equal(cache.get('key1'), null);
  });

  it('should delete keys correctly', () => {
    const cache = new SimpleCache(1000);
    cache.set('key1', 'value1');
    assert.equal(cache.get('key1'), 'value1');
    cache.delete('key1');
    assert.equal(cache.get('key1'), null);
  });

  it('should clear all keys', () => {
    const cache = new SimpleCache(1000);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    assert.equal(cache.size, 2);
    cache.clear();
    assert.equal(cache.size, 0);
    assert.equal(cache.get('key1'), null);
  });

  it('should clear expired keys manually', async () => {
    const cache = new SimpleCache(5);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2', 1000); // long TTL
    assert.equal(cache.size, 2);

    await new Promise((resolve) => setTimeout(resolve, 10));

    cache.clearExpired();
    assert.equal(cache.size, 1);
    assert.equal(cache.get('key2'), 'value2');
  });
});
