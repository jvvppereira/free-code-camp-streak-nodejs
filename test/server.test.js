const { test, describe, afterEach } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const freeCodeCampService = require('../services/freeCodeCampService');
const svgService = require('../services/svgService');

describe('GET /streak endpoint', () => {
  afterEach((t) => {
    // Restore all mocked methods after each test
    t.mock.restoreAll();
  });

  test('should return 200 and SVG content for a valid username', async (t) => {
    // Mock getStreakData
    t.mock.method(freeCodeCampService, 'getStreakData', async (username, timezone) => {
      assert.strictEqual(username, 'QuincyLarson');
      assert.strictEqual(timezone, undefined);
      return {
        count: 10,
        last7Days: [
          { dayOfWeek: 'Mon', haveDone: true },
          { dayOfWeek: 'Tue', haveDone: true }
        ],
        status: 'Well done! Keep learning'
      };
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=QuincyLarson`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'image/svg+xml; charset=utf-8');
      
      const body = await res.text();
      assert.match(body, /<svg/);
      assert.match(body, /10-day streak!/);
      assert.match(body, /width="540"/); // default width
      assert.match(body, /height="190"/); // default height
    } finally {
      server.close();
    }
  });

  test('should return 400 Bad Request if username query parameter is missing', async (t) => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/streak`);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.headers.get('content-type'), 'text/plain; charset=utf-8');
      
      const body = await res.text();
      assert.strictEqual(body, 'Missing "username" query parameter');
    } finally {
      server.close();
    }
  });

  test('should return 500 Internal Server Error if freeCodeCampService throws an error', async (t) => {
    // Mock getStreakData to fail
    t.mock.method(freeCodeCampService, 'getStreakData', async () => {
      throw new Error('API down');
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=testuser`);
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.headers.get('content-type'), 'text/plain; charset=utf-8');
      
      const body = await res.text();
      assert.strictEqual(body, 'Error: API down');
    } finally {
      server.close();
    }
  });

  test('should correctly pass timezone parameter to freeCodeCampService', async (t) => {
    let capturedTimezone = null;
    t.mock.method(freeCodeCampService, 'getStreakData', async (username, timezone) => {
      capturedTimezone = timezone;
      return {
        count: 5,
        last7Days: [{ dayOfWeek: 'Mon', haveDone: true }],
        status: 'Well done!'
      };
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=testuser&timezone=America/Sao_Paulo`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(capturedTimezone, 'America/Sao_Paulo');
    } finally {
      server.close();
    }
  });

  test('should correctly pass custom width and height parameters to generateBadgeSvg', async (t) => {
    t.mock.method(freeCodeCampService, 'getStreakData', async () => {
      return {
        count: 5,
        last7Days: [{ dayOfWeek: 'Mon', haveDone: true }],
        status: 'Well done!'
      };
    });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=testuser&width=700&height=250`);
      assert.strictEqual(res.status, 200);
      
      const body = await res.text();
      assert.match(body, /width="700"/);
      assert.match(body, /height="250"/);
      assert.match(body, /viewBox="0 0 700 250"/);
    } finally {
      server.close();
    }
  });
});
