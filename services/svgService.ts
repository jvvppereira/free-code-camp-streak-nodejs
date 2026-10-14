import { getStreakMessage, getStatusMessage, DEFAULT_LOCALE } from './i18nService.js';

const WIDTH = 540;
const HEIGHT = 190;
const BG_COLOR = '#1a1b2e';
const TEXT_COLOR = '#ffffff';
const DONE_COLOR = '#22c55e';
const MISSED_COLOR = '#4b5563';
const LABEL_COLOR = '#9ca3af';
const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

const PRESETS = {
  default: { width: 540, height: 190 },
  'widget-small': { width: 280, height: 120 },
  'widget-medium': { width: 360, height: 160 },
} as const;

type PresetKey = keyof typeof PRESETS;
type BgMode = 'filled' | 'transparent' | 'dark' | 'light';

interface BadgeData {
  count: number;
  last7Days: Array<{ dayOfWeek: string; haveDone: boolean }>;
  status: string;
}

interface BadgeOptions {
  width?: string | number;
  height?: string | number;
  lang?: string;
  bg?: string;
  preset?: string;
}

function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function generateDayIcon(x: number, y: number, haveDone: boolean, checkStrokeColor: string, missedStrokeColor: string): string {
  if (haveDone) {
    return `
      <circle cx="${x}" cy="${y}" r="16" fill="${DONE_COLOR}" opacity="0.2"/>
      <circle cx="${x}" cy="${y}" r="12" fill="${DONE_COLOR}"/>
      <path d="M${x - 5} ${y}L${x - 1} ${y + 4}L${x + 6} ${y - 3}" stroke="${checkStrokeColor}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    return `
      <circle cx="${x}" cy="${y}" r="16" fill="${MISSED_COLOR}" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${missedStrokeColor}" stroke-width="2"/>
      <path d="M${x - 4} ${y - 4}L${x + 4} ${y + 4}M${x + 4} ${y - 4}L${x - 4} ${y + 4}" stroke="${missedStrokeColor}" stroke-width="2" stroke-linecap="round"/>
    `;
  }
}

export function generateBadgeSvg(data: BadgeData, options: BadgeOptions = {}): string {
  const { count, last7Days, status } = data;
  const totalDays = last7Days.length;

  const validPresets: PresetKey[] = ['default', 'widget-small', 'widget-medium'];
  const preset = options.preset && validPresets.includes(options.preset as PresetKey) ? options.preset as PresetKey : null;
  const presetDimensions = preset ? PRESETS[preset] : null;

  let width: number = presetDimensions?.width ?? WIDTH;
  if (options.width) {
    const parsedWidth = parseInt(String(options.width), 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      width = parsedWidth;
    }
  }

  let height: number = presetDimensions?.height ?? HEIGHT;
  if (options.height) {
    const parsedHeight = parseInt(String(options.height), 10);
    if (!isNaN(parsedHeight) && parsedHeight > 0) {
      height = parsedHeight;
    }
  }

  const lang = options.lang || DEFAULT_LOCALE;
  const validBgModes: BgMode[] = ['filled', 'transparent', 'dark', 'light'];
  const bgMode: BgMode = options.bg && validBgModes.includes(options.bg as BgMode) ? options.bg as BgMode : 'filled';

  const isLight = bgMode === 'light';
  const isTransparent = bgMode === 'transparent';
  const hasBackground = !isTransparent;

  const textColor = isLight ? BG_COLOR : TEXT_COLOR;
  const labelColor = isLight ? '#6b7280' : LABEL_COLOR;
  const strokeColor = isLight ? BG_COLOR : '#2d2e4a';
  const checkStrokeColor = isLight ? BG_COLOR : BG_COLOR;
  const missedStrokeColor = isLight ? BG_COLOR : MISSED_COLOR;

  const spacing = (width - 80) / (totalDays - 1);
  const startX = (width - spacing * (totalDays - 1)) / 2;

  const dayLabels = last7Days
    .map((day, i) => {
      const x = startX + i * spacing;
      return `<text x="${x}" y="108" fill="${labelColor}" font-family="${FONT_FAMILY}" font-size="13" text-anchor="middle" font-weight="500">${escapeXml(day.dayOfWeek)}</text>`;
    })
    .join('\n');

  const dayIcons = last7Days
    .map((day, i) => {
      const x = startX + i * spacing;
      return generateDayIcon(x, 140, day.haveDone, checkStrokeColor, missedStrokeColor);
    })
    .join('\n');

  const statusColor = status === getStatusMessage(true, lang) ? DONE_COLOR : '#fbbf24';

  const defs = bgMode === 'filled' ? `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1f3a"/>
      <stop offset="100%" stop-color="${BG_COLOR}"/>
    </linearGradient>
    <linearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>` : `
  <defs>
    <linearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>`;

  const backgroundRect = hasBackground
    ? bgMode === 'filled'
      ? `<rect width="${width}" height="${height}" rx="14" fill="url(#bg)" stroke="${strokeColor}" stroke-width="1"/>`
      : `<rect width="${width}" height="${height}" rx="14" fill="${isLight ? '#f8fafc' : BG_COLOR}"/>`
    : '';

  const dividerLine = hasBackground && bgMode !== 'dark' && bgMode !== 'light'
    ? `<line x1="40" y1="88" x2="${width - 40}" y2="88" stroke="${strokeColor}" stroke-width="1"/>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}

  ${backgroundRect}

  <text x="${width / 2}" y="42" fill="${textColor}" font-family="${FONT_FAMILY}" font-size="24" text-anchor="middle" font-weight="bold">
    <tspan fill="url(#fire)">🔥</tspan> ${escapeXml(getStreakMessage(count, lang))}
  </text>

  <text x="${width / 2}" y="70" fill="${statusColor}" font-family="${FONT_FAMILY}" font-size="14" text-anchor="middle">${escapeXml(status)}</text>

  ${dividerLine}

  ${dayLabels}
  ${dayIcons}
</svg>`;

  return svg;
}