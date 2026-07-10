const express = require('express');
const { getStreakData } = require('./services/freeCodeCampService');
const { generateBadgeSvg } = require('./services/svgService');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/streak', async (req, res) => {
  const { username, width, height, timezone } = req.query;

  if (!username) {
    return res.status(400).type('text/plain').send('Missing "username" query parameter');
  }

  try {
    const data = await getStreakData(username, timezone);
    const svg = generateBadgeSvg(data, { width, height });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    console.error(`Error fetching data for "${username}":`, err.message);
    res.status(500).type('text/plain').send(`Error: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/streak?username=QuincyLarson`);
});
