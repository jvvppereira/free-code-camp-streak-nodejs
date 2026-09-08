import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AddressInfo } from 'node:net';
import { Server } from 'node:http';
import { createApp } from '../app.js';

function getPort(server: Server): number {
  const address = server.address();
  if (address && typeof address === 'object') {
    return (address as AddressInfo).port;
  }
  throw new Error('Could not get port from server');
}

describe('GET /streak endpoint', () => {
  test('should return 200 and SVG content for a valid username', async () => {
    const mockGetStreakData = async (username: string, timezone?: string) => {
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
    };

    const app = createApp({ getStreakData: mockGetStreakData });
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=QuincyLarson`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'image/svg+xml; charset=utf-8');
      
      const body = await res.text();
      assert.match(body, /<svg/);
      assert.match(body, /10-day streak!/);
      assert.match(body, /width="540"/);
      assert.match(body, /height="190"/);
    } finally {
      server.close();
    }
  });

  test('should return 400 Bad Request if username query parameter is missing', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = getPort(server);

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

  test('should return 500 Internal Server Error if freeCodeCampService throws an error', async () => {
    const mockGetStreakData = async () => {
      throw new Error('API down');
    };

    const app = createApp({ getStreakData: mockGetStreakData });
    const server = app.listen(0);
    const port = getPort(server);

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

  test('should correctly pass timezone parameter to freeCodeCampService', async () => {
    let capturedTimezone: string | null = null;
    const mockGetStreakData = async (username: string, timezone?: string) => {
      capturedTimezone = timezone ?? null;
      return {
        count: 5,
        last7Days: [{ dayOfWeek: 'Mon', haveDone: true }],
        status: 'Well done!'
      };
    };

    const app = createApp({ getStreakData: mockGetStreakData });
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/streak?username=testuser&timezone=America/Sao_Paulo`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(capturedTimezone, 'America/Sao_Paulo');
    } finally {
      server.close();
    }
  });

  test('should correctly pass custom width and height parameters to generateBadgeSvg', async () => {
    const mockGetStreakData = async () => {
      return {
        count: 5,
        last7Days: [{ dayOfWeek: 'Mon', haveDone: true }],
        status: 'Well done!'
      };
    };

    const app = createApp({ getStreakData: mockGetStreakData });
    const server = app.listen(0);
    const port = getPort(server);

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

describe('GET /activity/today endpoint', () => {
  test('should return 200 and true when user has activity today', async () => {
    const mockHasActivityToday = async (username: string) => {
      assert.strictEqual(username, 'QuincyLarson');
      return true;
    };

    const app = createApp({ hasActivityToday: mockHasActivityToday });
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/activity/today?username=QuincyLarson`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'application/json; charset=utf-8');
      
      const body = await res.json();
      assert.strictEqual(body, true);
    } finally {
      server.close();
    }
  });

  test('should return 200 and false when user has no activity today', async () => {
    const mockHasActivityToday = async (username: string) => {
      assert.strictEqual(username, 'testuser');
      return false;
    };

    const app = createApp({ hasActivityToday: mockHasActivityToday });
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/activity/today?username=testuser`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'application/json; charset=utf-8');
      
      const body = await res.json();
      assert.strictEqual(body, false);
    } finally {
      server.close();
    }
  });

  test('should return 400 Bad Request if username query parameter is missing', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/activity/today`);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.headers.get('content-type'), 'text/plain; charset=utf-8');
      
      const body = await res.text();
      assert.strictEqual(body, 'Missing "username" query parameter');
    } finally {
      server.close();
    }
  });

  test('should return 500 Internal Server Error if freeCodeCampService throws an error', async () => {
    const mockHasActivityToday = async () => {
      throw new Error('API down');
    };

    const app = createApp({ hasActivityToday: mockHasActivityToday });
    const server = app.listen(0);
    const port = getPort(server);

    try {
      const res = await fetch(`http://localhost:${port}/activity/today?username=testuser`);
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.headers.get('content-type'), 'text/plain; charset=utf-8');
      
      const body = await res.text();
      assert.strictEqual(body, 'Error: API down');
    } finally {
      server.close();
    }
  });
});