import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getDateString } from '../services/dateUtils.js';

describe('dateUtils - getDateString', () => {
  test('should format UTC date correctly', () => {
    const ts = Date.UTC(2024, 0, 15, 12, 30, 45);
    assert.strictEqual(getDateString(ts, 'UTC'), '2024-01-15');
  });

  test('should format date with timezone offset', () => {
    const ts = Date.UTC(2024, 0, 15, 12, 30, 45);
    const result = getDateString(ts, 'America/Sao_Paulo');
    assert.ok(['2024-01-15', '2024-01-14'].includes(result));
  });

  test('should handle end of month', () => {
    const ts = Date.UTC(2024, 1, 29, 23, 59, 59);
    assert.strictEqual(getDateString(ts, 'UTC'), '2024-02-29');
  });

  test('should handle end of year', () => {
    const ts = Date.UTC(2024, 11, 31, 23, 59, 59);
    assert.strictEqual(getDateString(ts, 'UTC'), '2024-12-31');
  });

  test('should handle leap year', () => {
    const ts = Date.UTC(2024, 1, 29);
    assert.strictEqual(getDateString(ts, 'UTC'), '2024-02-29');
  });

  test('should pad single digit month and day', () => {
    const ts = Date.UTC(2024, 0, 5);
    assert.strictEqual(getDateString(ts, 'UTC'), '2024-01-05');
  });
});