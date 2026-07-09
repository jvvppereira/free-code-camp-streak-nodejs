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

function getStreakChallenges(challenges) {
  if (!challenges || challenges.length === 0) return [];

  const sorted = [...challenges].sort((a, b) => a.completedDate - b.completedDate);

  let lastStreakDate = null;
  const streak = [];

  for (const challenge of sorted.reverse()) {
    const challengeDate = new Date(challenge.completedDate);
    const dateStr = challengeDate.toISOString().slice(0, 10);

    if (lastStreakDate === null) {
      streak.push(challenge);
      lastStreakDate = dateStr;
    } else {
      if (dateStr === lastStreakDate) {
        continue;
      }

      const prevDate = new Date(lastStreakDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().slice(0, 10);

      if (dateStr === prevDateStr) {
        streak.push(challenge);
        lastStreakDate = dateStr;
      } else {
        break;
      }
    }
  }

  if (streak.length === 1) {
    const uniqueDate = new Date(streak[0].completedDate).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (uniqueDate !== today && uniqueDate !== yesterday) {
      streak.shift();
    }
  }

  return streak.reverse();
}

function getLastWeekStatus(challenges) {
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return days.map(date => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toISOString().slice(0, 10);

    const haveDone = (challenges || []).some(challenge => {
      const challengeDate = new Date(challenge.completedDate).toISOString().slice(0, 10);
      return challengeDate === dateStr;
    });

    return { dayOfWeek, haveDone };
  });
}

async function getStreakData(userName) {
  const user = await fetchUserData(userName);
  const challenges = user.completedChallenges || [];

  const streakChallenges = getStreakChallenges(challenges);
  const streakCount = streakChallenges.length;
  const last7Days = getLastWeekStatus(challenges);
  const statusMsg = last7Days[last7Days.length - 1]?.haveDone
    ? 'Well done! Keep learning'
    : 'Daily task pending!';

  return { count: streakCount, last7Days, status: statusMsg };
}

module.exports = { getStreakData };
