import { getDateString } from './dateUtils.js';
import { DEFAULT_LOCALE } from './i18nService.js';

export function getLastWeekStatus(
  timestamps: number[],
  timezone: string = 'UTC',
  lang: string = DEFAULT_LOCALE
): Array<{ dayOfWeek: string; haveDone: boolean }> {
  const days: Date[] = [];
  const now = Date.now();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const activityDates = new Set(
    (timestamps || []).map((ts) => getDateString(ts, timezone))
  );

  return days.map((date) => {
    let adjustedDate = date;
    const tzString = timezone;
    const formattedDayOfWeek = adjustedDate.toLocaleDateString(lang, {
      timeZone: tzString,
      weekday: 'short',
    });

    const dateStr = getDateString(date.getTime(), timezone);
    const haveDone = activityDates.has(dateStr);

    return { dayOfWeek: formattedDayOfWeek, haveDone };
  });
}