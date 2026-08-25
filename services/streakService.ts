import { getDateString } from './dateUtils.js';

function getPreviousDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

function isValidStreakStart(dateStr: string): boolean {
  const todayStr = getDateString(Date.now());
  const yesterdayDate = new Date(Date.now());
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getDateString(yesterdayDate.getTime());
  return dateStr === todayStr || dateStr === yesterdayStr;
}

function continuesStreak(dateStr: string, lastStreakDate: string): boolean {
  return dateStr === getPreviousDateStr(lastStreakDate);
}

function processTimestamps(sortedTimestamps: number[]): number {
  let lastStreakDate: string | null = null;
  let streakCount = 0;

  for (const ts of sortedTimestamps) {
    const dateStr = getDateString(ts);

    if (lastStreakDate === null) {
      if (!isValidStreakStart(dateStr)) break;
      streakCount = 1;
      lastStreakDate = dateStr;
    } else {
      if (dateStr === lastStreakDate) continue;
      if (continuesStreak(dateStr, lastStreakDate)) {
        streakCount++;
        lastStreakDate = dateStr;
      } else {
        break;
      }
    }
  }

  return streakCount;
}

export function getStreak(timestamps: number[]): number {
  if (!timestamps || timestamps.length === 0) return 0;
  const sorted = [...timestamps].sort((a, b) => a - b).reverse();
  return processTimestamps(sorted);
}