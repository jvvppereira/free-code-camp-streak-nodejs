import { getStatusMessage, DEFAULT_LOCALE } from './i18nService.js';
import { getStreak } from './streakService.js';
import { getLastWeekStatus } from './weekStatusService.js';

const FCC_API_URL = 'https://api.freecodecamp.org/users/get-public-profile';

interface FCCUser {
  calendar?: Record<string, number>;
  completedChallenges?: Array<{ completedDate: number }>;
}

interface FCCApiResponse {
  entities?: {
    user?: Record<string, FCCUser>;
  };
}

export interface StreakData {
  count: number;
  last7Days: Array<{ dayOfWeek: string; haveDone: boolean }>;
  status: string;
}

async function fetchUserData(userName: string): Promise<FCCUser> {
  const url = `${FCC_API_URL}?username=${encodeURIComponent(userName)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FCCStreakBot/1.0)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API returned status ${response.status}: ${text}`);
  }

  const data = (await response.json()) as FCCApiResponse;
  const user = data?.entities?.user?.[userName];

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function getStreakData(
  userName: string,
  timezone: string = 'UTC',
  lang: string = DEFAULT_LOCALE
): Promise<StreakData> {
  const user = await fetchUserData(userName);

  let activityTimestamps: number[] = [];
  if (user.calendar && Object.keys(user.calendar).length > 0) {
    activityTimestamps = Object.keys(user.calendar).map((tsStr) => Number(tsStr) * 1000);
  } else if (user.completedChallenges && user.completedChallenges.length > 0) {
    activityTimestamps = user.completedChallenges.map((c) => c.completedDate);
  }

  const streakCount = getStreak(activityTimestamps, timezone);
  const last7Days = getLastWeekStatus(activityTimestamps, timezone, lang);
  const statusMsg = getStatusMessage(last7Days[last7Days.length - 1]?.haveDone ?? false, lang);

  return { count: streakCount, last7Days, status: statusMsg };
}