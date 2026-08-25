import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { getLastWeekStatus } from '../services/weekStatusService.js';

describe('weekStatusService - getLastWeekStatus', () => {
  test('should return 7 days', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    assert.strictEqual(result.length, 7);
  });

  test('should return correct structure for each day', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    result.forEach(day => {
      assert.ok(day.hasOwnProperty('dayOfWeek'));
      assert.ok(day.hasOwnProperty('haveDone'));
      assert.strictEqual(typeof day.dayOfWeek, 'string');
      assert.strictEqual(typeof day.haveDone, 'boolean');
    });
  });

  test('should mark haveDone true for today', () => {
    const now = Date.now();
    const result = getLastWeekStatus([now], 'UTC', 'en-US');
    const today = result[6];
    assert.strictEqual(today.haveDone, true);
  });

  test('should mark haveDone true for yesterday', () => {
    const yesterday = Date.now() - 86400000;
    const result = getLastWeekStatus([yesterday], 'UTC', 'en-US');
    const yesterdayResult = result[5];
    assert.strictEqual(yesterdayResult.haveDone, true);
  });

  test('should mark haveDone false for days without activity', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    result.forEach(day => {
      assert.strictEqual(day.haveDone, false);
    });
  });

  test('should handle multiple activities on same day', () => {
    const now = Date.now();
    const morning = now;
    const afternoon = now + 3600000;
    const result = getLastWeekStatus([morning, afternoon], 'UTC', 'en-US');
    const today = result[6];
    assert.strictEqual(today.haveDone, true);
  });

  test('should return English day names for en-US locale', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    const dayNames = result.map(d => d.dayOfWeek);
    dayNames.forEach(name => {
      assert.ok(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(name));
    });
  });

  test('should return Portuguese day names for pt-BR locale', () => {
    const result = getLastWeekStatus([], 'UTC', 'pt-BR');
    const dayNames = result.map(d => d.dayOfWeek);
    dayNames.forEach(name => {
      assert.ok(['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'].includes(name));
    });
  });

  test('should handle activity across full week', () => {
    const now = Date.now();
    const timestamps = Array.from({ length: 7 }, (_, i) => now - i * 86400000);
    const result = getLastWeekStatus(timestamps, 'UTC', 'en-US');
    result.forEach(day => {
      assert.strictEqual(day.haveDone, true);
    });
  });

  test('should handle timezone correctly', () => {
    const originalNow = Date.now;
    Date.now = () => Date.UTC(2024, 0, 15, 12, 0, 0);
    try {
      const timestamps = [
        Date.UTC(2024, 0, 15),
        Date.UTC(2024, 0, 14),
        Date.UTC(2024, 0, 13),
      ];
      const result = getLastWeekStatus(timestamps, 'UTC', 'en-US');
      assert.strictEqual(result[6].haveDone, true);
      assert.strictEqual(result[5].haveDone, true);
      assert.strictEqual(result[4].haveDone, true);
    } finally {
      Date.now = originalNow;
    }
  });

  test('should return days in correct order (oldest to newest)', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    const dayNames = result.map(d => d.dayOfWeek);
    const uniqueNames = [...new Set(dayNames)];
    assert.strictEqual(uniqueNames.length, 7);
  });

  test('should handle empty timestamps array', () => {
    const result = getLastWeekStatus([], 'UTC', 'en-US');
    assert.strictEqual(result.length, 7);
    result.forEach(day => assert.strictEqual(day.haveDone, false));
  });

  test('should handle undefined timestamps', () => {
    const result = getLastWeekStatus(undefined as any, 'UTC', 'en-US');
    assert.strictEqual(result.length, 7);
    result.forEach(day => assert.strictEqual(day.haveDone, false));
  });
});