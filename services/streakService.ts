import { getDateString } from './dateUtils.js';

export function getStreak(timestamps: number[], timezone: string = 'UTC'): number {
  if (!timestamps || timestamps.length === 0) return 0;

  const sorted = [...timestamps].sort((a, b) => a - b);

  let lastStreakDate: string | null = null;
  let streakCount = 0;

  const reversed = [...sorted].reverse();
  for (const ts of reversed) {
    const dateStr = getDateString(ts, timezone);

    if (lastStreakDate === null) {
      const todayStr = getDateString(Date.now(), timezone);
      const yesterdayDate = new Date(Date.now());
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = getDateString(yesterdayDate.getTime(), timezone);

      if (dateStr !== todayStr && dateStr !== yesterdayStr) {
        break;
      }

      streakCount = 1;
      lastStreakDate = dateStr;
    } else {
      if (dateStr === lastStreakDate) {
        continue;
      }

      const [y, m, d] = lastStreakDate.split('-').map(Number) as [number, number, number];
      const prevDateStr = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);

      if (dateStr === prevDateStr) {
        streakCount++;
        lastStreakDate = dateStr;
      } else {
        break;
      }
    }
  }

  return streakCount;
}