const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert');
const { getStreakData } = require('../services/freeCodeCampService');

describe('freeCodeCampService - getStreakData', () => {
  afterEach((t) => {
    t.mock.restoreAll();
  });

  test('should calculate streak and weekly status correctly using calendar data (en-US)', async (t) => {
    t.mock.method(globalThis, 'fetch', async (url) => {
      assert.ok(url.includes('username=testuser'));
      
      const mockApiResponse = {
        entities: {
          user: {
            testuser: {
              calendar: {
                [Math.floor(Date.now() / 1000)]: 1,
                [Math.floor((Date.now() - 86400000) / 1000)]: 1,
                [Math.floor((Date.now() - 2 * 86400000) / 1000)]: 1
              },
              completedChallenges: []
            }
          }
        }
      };

      return {
        ok: true,
        json: async () => mockApiResponse
      };
    });

    const data = await getStreakData('testuser', 'UTC', 'en-US');
    
    assert.strictEqual(data.count, 3);
    assert.strictEqual(data.last7Days.length, 7);
    assert.strictEqual(data.last7Days[6].haveDone, true);
    assert.strictEqual(data.last7Days[5].haveDone, true);
    assert.strictEqual(data.last7Days[4].haveDone, true);
    assert.strictEqual(data.status, 'Well done! Keep learning');
  });

  test('should calculate streak and weekly status correctly using calendar data (pt-BR)', async (t) => {
    t.mock.method(globalThis, 'fetch', async (url) => {
      assert.ok(url.includes('username=testuser'));
      
      const mockApiResponse = {
        entities: {
          user: {
            testuser: {
              calendar: {
                [Math.floor(Date.now() / 1000)]: 1,
                [Math.floor((Date.now() - 86400000) / 1000)]: 1,
                [Math.floor((Date.now() - 2 * 86400000) / 1000)]: 1
              },
              completedChallenges: []
            }
          }
        }
      };

      return {
        ok: true,
        json: async () => mockApiResponse
      };
    });

    const data = await getStreakData('testuser', 'UTC', 'pt-BR');
    
    assert.strictEqual(data.count, 3);
    assert.strictEqual(data.last7Days.length, 7);
    assert.strictEqual(data.last7Days[6].haveDone, true);
    assert.strictEqual(data.last7Days[5].haveDone, true);
    assert.strictEqual(data.last7Days[4].haveDone, true);
    assert.strictEqual(data.status, 'Muito bem! Continue aprendendo');
  });

  test('should fallback to completedChallenges when calendar is missing or empty', async (t) => {
    t.mock.method(globalThis, 'fetch', async (url) => {
      const mockApiResponse = {
        entities: {
          user: {
            testuser: {
              calendar: {},
              completedChallenges: [
                { completedDate: Date.now() },
                { completedDate: Date.now() - 86400000 }
              ]
            }
          }
        }
      };

      return {
        ok: true,
        json: async () => mockApiResponse
      };
    });

    const data = await getStreakData('testuser', 'UTC', 'en-US');
    
    assert.strictEqual(data.count, 2);
    assert.strictEqual(data.last7Days[6].haveDone, true);
    assert.strictEqual(data.last7Days[5].haveDone, true);
  });

  test('should correctly compute streak according to numeric timezone offset', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      const mockApiResponse = {
        entities: {
          user: {
            testuser: {
              calendar: {
                [1780027200]: 1,
                [1780113600]: 1,
                [1780200000]: 1
              },
              completedChallenges: []
            }
          }
        }
      };

      return {
        ok: true,
        json: async () => mockApiResponse
      };
    });

    t.mock.method(Date, 'now', () => 1780286400000);

    const dataUTC = await getStreakData('testuser', 'UTC', 'en-US');
    assert.strictEqual(dataUTC.count, 3);
  });

  test('should throw an error when API returns non-ok status', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      return {
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      };
    });

    await assert.rejects(
      getStreakData('nonexistent'),
      /API returned status 404: Not Found/
    );
  });

  test('should throw an error when user is not found in the response', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      return {
        ok: true,
        json: async () => ({ entities: { user: {} } })
      };
    });

    await assert.rejects(
      getStreakData('missinguser'),
      /User not found/
    );
  });
});