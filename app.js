const express = require('express');
const freeCodeCampService = require('./services/freeCodeCampService');
const svgService = require('./services/svgService');

const app = express();

app.get('/streak', async (req, res) => {
  const { username, width, height, timezone, lang } = req.query;

  if (!username) {
    return res.status(400).type('text/plain').send('Missing "username" query parameter');
  }

  try {
    const data = await freeCodeCampService.getStreakData(username, timezone, lang);
    const svg = svgService.generateBadgeSvg(data, { width, height, lang });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    console.error(`Error fetching data for "${username}":`, err.message);
    res.status(500).type('text/plain').send(`Error: ${err.message}`);
  }
});

module.exports = app;