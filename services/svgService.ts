import { getStreakMessage, getStatusMessage, DEFAULT_LOCALE } from './i18nService.js';

const WIDTH = 540;
const HEIGHT = 190;
const BG_COLOR = '#1a1b2e';
const TEXT_COLOR = '#ffffff';
const DONE_COLOR = '#22c55e';
const MISSED_COLOR = '#4b5563';
const LABEL_COLOR = '#9ca3af';
const FONT_FAMILY = 'system-ui, -apple-system, sans-serif';

interface PresetConfig {
  width: number;
  height: number;
  headerY: number;
  statusY: number;
  dividerY: number;
  labelsY: number;
  iconsY: number;
  headerSize: number;
  statusSize: number;
  labelSize: number;
  iconScale: number;
}

type PresetKey = 'default' | 'widget-small' | 'widget-medium';

const PRESETS: Record<PresetKey, PresetConfig> = {
  default: {
    width: 540, height: 190,
    headerY: 42, statusY: 70, dividerY: 88, labelsY: 108, iconsY: 140,
    headerSize: 24, statusSize: 14, labelSize: 13,
    iconScale: 1.0
  },
  'widget-medium': {
    width: 360, height: 160,
    headerY: 40, statusY: 62, dividerY: 75, labelsY: 90, iconsY: 115,
    headerSize: 20, statusSize: 12, labelSize: 11,
    iconScale: 0.75
  },
  'widget-small': {
    width: 280, height: 120,
    headerY: 35, statusY: 55, dividerY: 68, labelsY: 80, iconsY: 98,
    headerSize: 18, statusSize: 11, labelSize: 10,
    iconScale: 0.5
  },
} as const;

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

function generateDayIcon(x: number, y: number, haveDone: boolean, checkStrokeColor: string, missedStrokeColor: string, iconScale: number): string {
  const rOuter = 16 * iconScale;
  const rInner = 12 * iconScale;
  const checkOffset = 5 * iconScale;
  const checkArm1 = 1 * iconScale;
  const checkArm2 = 4 * iconScale;
  const checkArm3 = 6 * iconScale;
  const checkArm4 = 3 * iconScale;
  const missedOffset = 4 * iconScale;
  const strokeWidth = 2 * iconScale;
  const checkStrokeWidth = 2.5 * iconScale;

  if (haveDone) {
    return `
      <circle cx="${x}" cy="${y}" r="${rOuter}" fill="${DONE_COLOR}" opacity="0.2"/>
      <circle cx="${x}" cy="${y}" r="${rInner}" fill="${DONE_COLOR}"/>
      <path d="M${x - checkOffset} ${y}L${x - checkArm1} ${y + checkArm2}L${x + checkArm3} ${y - checkArm4}" stroke="${checkStrokeColor}" stroke-width="${checkStrokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    return `
      <circle cx="${x}" cy="${y}" r="${rOuter}" fill="${MISSED_COLOR}" opacity="0.3"/>
      <circle cx="${x}" cy="${y}" r="${rInner}" fill="none" stroke="${missedStrokeColor}" stroke-width="${strokeWidth}"/>
      <path d="M${x - missedOffset} ${y - missedOffset}L${x + missedOffset} ${y + missedOffset}M${x + missedOffset} ${y - missedOffset}L${x - missedOffset} ${y + missedOffset}" stroke="${missedStrokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    `;
  }
}

export function generateBadgeSvg(data: BadgeData, options: BadgeOptions = {}): string {
  const { count, last7Days, status } = data;
  const totalDays = last7Days.length;

  const validPresets: PresetKey[] = ['default', 'widget-small', 'widget-medium'];
  const preset = options.preset && validPresets.includes(options.preset as PresetKey) ? options.preset as PresetKey : null;
  const presetConfig = preset ? PRESETS[preset] : PRESETS.default;

  let width: number = presetConfig.width;
  if (options.width) {
    const parsedWidth = parseInt(String(options.width), 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      width = parsedWidth;
    }
  }

  let height: number = presetConfig.height;
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

  const { dividerY, labelsY, iconsY, headerY, statusY, headerSize, statusSize, labelSize, iconScale } = presetConfig;

  const dayLabels = last7Days
    .map((day, i) => {
      const x = startX + i * spacing;
      return `<text x="${x}" y="${labelsY}" fill="${labelColor}" font-family="${FONT_FAMILY}" font-size="${labelSize}" text-anchor="middle" font-weight="500">${escapeXml(day.dayOfWeek)}</text>`;
    })
    .join('\n');

  const dayIcons = last7Days
    .map((day, i) => {
      const x = startX + i * spacing;
      return generateDayIcon(x, iconsY, day.haveDone, checkStrokeColor, missedStrokeColor, iconScale);
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
    ? `<line x1="40" y1="${dividerY}" x2="${width - 40}" y2="${dividerY}" stroke="${strokeColor}" stroke-width="1"/>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}

  ${backgroundRect}

  <text x="${width / 2}" y="${headerY}" fill="${textColor}" font-family="${FONT_FAMILY}" font-size="${headerSize}" text-anchor="middle" font-weight="bold">
    <tspan fill="url(#fire)">🔥</tspan> ${escapeXml(getStreakMessage(count, lang))}
  </text>

  <text x="${width / 2}" y="${statusY}" fill="${statusColor}" font-family="${FONT_FAMILY}" font-size="${statusSize}" text-anchor="middle">${escapeXml(status)}</text>

  ${dividerLine}

  ${dayLabels}
  ${dayIcons}
</svg>`;

  return svg;
}