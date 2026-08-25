import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { getStreak } from '../services/streakService.js';

describe('streakService - getStreak', () => {
  test('should return 0 for empty array', () => {
    assert.strictEqual(getStreak([]), 0);
  });

  test('should return 0 for null/undefined', () => {
    assert.strictEqual(getStreak(null as any), 0);
    assert.strictEqual(getStreak(undefined as any), 0);
  });

  test('should return 1 for single timestamp', () => {
    const now = Date.now();
    assert.strictEqual(getStreak([now]), 1);
  });

  test('should count consecutive days', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const twoDaysAgo = now - 2 * 86400000;
    assert.strictEqual(getStreak([now, yesterday, twoDaysAgo]), 3);
  });

  test('should break streak on non-consecutive day', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const threeDaysAgo = now - 3 * 86400000;
    assert.strictEqual(getStreak([now, yesterday, threeDaysAgo]), 2);
  });

  test('should not double count same day', () => {
    const now = Date.now();
    const laterToday = now + 3600000;
    assert.strictEqual(getStreak([now, laterToday]), 1);
  });

  test('should handle unsorted timestamps', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const twoDaysAgo = now - 2 * 86400000;
    assert.strictEqual(getStreak([twoDaysAgo, now, yesterday]), 3);
  });

  test('should handle streak starting from yesterday (not today)', () => {
    const yesterday = Date.now() - 86400000;
    const twoDaysAgo = Date.now() - 2 * 86400000;
    assert.strictEqual(getStreak([yesterday, twoDaysAgo]), 2);
  });

  test('should return 0 when last activity is older than yesterday', () => {
    const threeDaysAgo = Date.now() - 3 * 86400000;
    assert.strictEqual(getStreak([threeDaysAgo]), 0);
  });

  test('should handle multiple activities per day across streak', () => {
    const now = Date.now();
    const morning = now;
    const afternoon = now + 3600000;
    const yesterday = now - 86400000;
    const twoDaysAgo = now - 2 * 86400000;
    assert.strictEqual(getStreak([morning, afternoon, yesterday, twoDaysAgo]), 3);
  });

  test('should handle timezone correctly for day boundaries', () => {
    const originalNow = Date.now;
    Date.now = () => Date.UTC(2024, 0, 15, 12, 0, 0);
    try {
      const ts1 = Date.UTC(2024, 0, 15, 1, 0, 0);
      const ts2 = Date.UTC(2024, 0, 14, 1, 0, 0);
      const ts3 = Date.UTC(2024, 0, 13, 1, 0, 0);
      assert.strictEqual(getStreak([ts1, ts2, ts3]), 3);
    } finally {
      Date.now = originalNow;
    }
  });

  test('should handle edge case: streak of 1 day only today', () => {
    const now = Date.now();
    assert.strictEqual(getStreak([now]), 1);
  });
});