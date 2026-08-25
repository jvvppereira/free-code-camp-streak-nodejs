import express, { Request, Response, Express } from 'express';
import { getStreakData } from './services/freeCodeCampService.js';
import { generateBadgeSvg } from './services/svgService.js';

interface Services {
  getStreakData: typeof getStreakData;
  generateBadgeSvg: typeof generateBadgeSvg;
}

function createApp(services?: Partial<Services>): Express {
  const app = express();
  const streakDataFn = services?.getStreakData ?? getStreakData;
  const generateBadgeSvgFn = services?.generateBadgeSvg ?? generateBadgeSvg;

  app.get('/streak', async (req: Request, res: Response) => {
    const username = getQueryParam(req.query, 'username');
    const width = getQueryParam(req.query, 'width');
    const height = getQueryParam(req.query, 'height');
    const timezone = getQueryParam(req.query, 'timezone');
    const lang = getQueryParam(req.query, 'lang');

    if (!username) {
      return res.status(400).type('text/plain').send('Missing "username" query parameter');
    }

    try {
      const data = await streakDataFn(username, timezone, lang);
      const svg = generateBadgeSvgFn(data, { width, height, lang });

      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (err) {
      const error = err as Error;
      console.error(`Error fetching data for "${username}":`, error.message);
      res.status(500).type('text/plain').send(`Error: ${error.message}`);
    }
  });

  return app;
}

function getQueryParam(query: Request['query'], key: string): string | undefined {
  const value = query[key];
  if (Array.isArray(value)) return value[0] as string | undefined;
  if (typeof value === 'string') return value;
  return undefined;
}

const app = createApp();

export { createApp };
export default app;