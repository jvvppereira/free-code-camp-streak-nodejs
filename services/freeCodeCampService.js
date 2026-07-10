const FCC_API_URL = 'https://api.freecodecamp.org/users/get-public-profile';

async function fetchUserData(userName) {
  const url = `${FCC_API_URL}?username=${encodeURIComponent(userName)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FCCStreakBot/1.0)',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API returned status ${response.status}: ${text}`);
  }

  const data = await response.json();
  const user = data?.entities?.user?.[userName];

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

function getDateString(timestampMs, timezone = 'UTC') {
  const date = new Date(timestampMs);
  const offsetNum = parseFloat(timezone);
  if (!isNaN(offsetNum)) {
    const offsetDate = new Date(timestampMs + offsetNum * 60 * 60 * 1000);
    return offsetDate.toISOString().slice(0, 10);
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    // YYYY-MM-DD (ISO 8601)
    return formatter.format(date);
  } catch (e) {
    return date.toISOString().slice(0, 10);
  }
}

function getStreak(timestamps, timezone = 'UTC') {
  if (!timestamps || timestamps.length === 0) return 0;

  const sorted = [...timestamps].sort((a, b) => a - b);

  let lastStreakDate = null;
  let streakCount = 0;

  const reversed = [...sorted].reverse();
  for (const ts of reversed) {
    const dateStr = getDateString(ts, timezone);

    if (lastStreakDate === null) {
      const todayStr = getDateString(Date.now(), timezone);
      const yesterdayDate = new Date();
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

      const [y, m, d] = lastStreakDate.split('-').map(Number);
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

function getLastWeekStatus(timestamps, timezone = 'UTC') {
  const days = [];
  const now = Date.now();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const activityDates = new Set(
    (timestamps || []).map(ts => getDateString(ts, timezone))
  );

  return days.map(date => {
    let adjustedDate = date;
    const offsetNum = parseFloat(timezone);
    if (!isNaN(offsetNum)) {
      adjustedDate = new Date(date.getTime() + offsetNum * 60 * 60 * 1000);
    }
    const tzString = !isNaN(offsetNum) ? 'UTC' : timezone;
    const formattedDayOfWeek = adjustedDate.toLocaleDateString('en-US', {
      timeZone: tzString,
      weekday: 'short'
    });

    const dateStr = getDateString(date.getTime(), timezone);
    const haveDone = activityDates.has(dateStr);

    return { dayOfWeek: formattedDayOfWeek, haveDone };
  });
}

async function getStreakData(userName, timezone = 'UTC') {
  const user = await fetchUserData(userName);

  let activityTimestamps = [];
  if (user.calendar && Object.keys(user.calendar).length > 0) {
    activityTimestamps = Object.keys(user.calendar).map(tsStr => Number(tsStr) * 1000);
  } else if (user.completedChallenges && user.completedChallenges.length > 0) {
    activityTimestamps = user.completedChallenges.map(c => c.completedDate);
  }

  const streakCount = getStreak(activityTimestamps, timezone);
  const last7Days = getLastWeekStatus(activityTimestamps, timezone);
  const statusMsg = last7Days[last7Days.length - 1]?.haveDone
    ? 'Well done! Keep learning'
    : 'Daily task pending!';

  return { count: streakCount, last7Days, status: statusMsg };
}

module.exports = { getStreakData };
