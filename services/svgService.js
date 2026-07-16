const WIDTH = 540;
const HEIGHT = 190;
const BG_COLOR = '#1a1b2e';
const TEXT_COLOR = '#ffffff';
const DONE_COLOR = '#22c55e';
const MISSED_COLOR = '#4b5563';
const LABEL_COLOR = '#9ca3af';
const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

const { getStreakMessage, getStatusMessage, DEFAULT_LOCALE: DEFAULT_LANG } = require('./i18nService');

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateDayIcon(x, y, haveDone) {
  if (haveDone) {
    return `
      <circle cx="${x}" cy="${y}" r="16" fill="${DONE_COLOR}" opacity="0.2"/>
      <circle cx="${x}" cy="${y}" r="12" fill="${DONE_COLOR}"/>
      <path d="M${x - 5} ${y}L${x - 1} ${y + 4}L${x + 6} ${y - 3}" stroke="${BG_COLOR}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    return `
      <circle cx="${x}" cy="${y}" r="16" fill="${MISSED_COLOR}" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${MISSED_COLOR}" stroke-width="2"/>
      <path d="M${x - 4} ${y - 4}L${x + 4} ${y + 4}M${x + 4} ${y - 4}L${x - 4} ${y + 4}" stroke="${MISSED_COLOR}" stroke-width="2" stroke-linecap="round"/>
    `;
  }
}

function generateBadgeSvg(data, options = {}) {
  const { count, last7Days, status } = data;
  const totalDays = last7Days.length;

  let width = WIDTH;
  if (options.width) {
    const parsedWidth = parseInt(options.width, 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      width = parsedWidth;
    }
  }

  let height = HEIGHT;
  if (options.height) {
    const parsedHeight = parseInt(options.height, 10);
    if (!isNaN(parsedHeight) && parsedHeight > 0) {
      height = parsedHeight;
    }
  }

  const lang = options.lang || DEFAULT_LANG;

  const spacing = (width - 80) / (totalDays - 1);
  const startX = (width - (spacing * (totalDays - 1))) / 2;

  const dayLabels = last7Days.map((day, i) => {
    const x = startX + i * spacing;
    return `<text x="${x}" y="108" fill="${LABEL_COLOR}" font-family="${FONT_FAMILY}" font-size="13" text-anchor="middle" font-weight="500">${escapeXml(day.dayOfWeek)}</text>`;
  }).join('\n');

  const dayIcons = last7Days.map((day, i) => {
    const x = startX + i * spacing;
    return generateDayIcon(x, 140, day.haveDone);
  }).join('\n');

  const statusColor = status === getStatusMessage(true, lang) ? DONE_COLOR : '#fbbf24';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1f3a"/>
      <stop offset="100%" stop-color="${BG_COLOR}"/>
    </linearGradient>
    <linearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" rx="14" fill="url(#bg)" stroke="#2d2e4a" stroke-width="1"/>

  <text x="${width / 2}" y="42" fill="${TEXT_COLOR}" font-family="${FONT_FAMILY}" font-size="24" text-anchor="middle" font-weight="bold">
    <tspan fill="url(#fire)">🔥</tspan> ${escapeXml(getStreakMessage(count, lang))}
  </text>

  <text x="${width / 2}" y="70" fill="${statusColor}" font-family="${FONT_FAMILY}" font-size="14" text-anchor="middle">${escapeXml(status)}</text>

  <line x1="40" y1="88" x2="${width - 40}" y2="88" stroke="#2d2e4a" stroke-width="1"/>

  ${dayLabels}
  ${dayIcons}
</svg>`;

  return svg;
}

module.exports = { generateBadgeSvg };