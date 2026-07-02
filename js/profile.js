export const DEFAULT_DAILY_GOAL = 10;
export const MIN_DAILY_GOAL = 1;
export const MAX_DAILY_GOAL = 200;

const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateKey(value = Date.now()) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function clampDailyGoal(value) {
    return Math.min(
        MAX_DAILY_GOAL,
        Math.max(MIN_DAILY_GOAL, Math.round(Number(value) || DEFAULT_DAILY_GOAL)),
    );
}

export function emptyProfile(now = Date.now()) {
    return {
        name: "",
        dailyGoal: DEFAULT_DAILY_GOAL,
        createdAt: now,
    };
}

export function normalizeProfile(profile = {}, now = Date.now()) {
    const normalized = { ...emptyProfile(now), ...profile };
    normalized.name = String(normalized.name || "").trim().slice(0, 40);
    normalized.dailyGoal = clampDailyGoal(normalized.dailyGoal);
    normalized.createdAt = Number(normalized.createdAt) || now;
    return normalized;
}

export function emptyDailyEntry(dateKey = localDateKey()) {
    return {
        date: dateKey,
        goal: DEFAULT_DAILY_GOAL,
        reviews: 0,
        uniqueCards: [],
        correct: 0,
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
        goalReachedAt: 0,
    };
}

export function normalizeDailyEntry(entry = {}, dateKey = entry.date || localDateKey()) {
    const normalized = { ...emptyDailyEntry(dateKey), ...entry };
    normalized.date = String(normalized.date || dateKey);
    normalized.uniqueCards = Array.isArray(normalized.uniqueCards)
        ? [...new Set(normalized.uniqueCards.map(String))]
        : [];
    normalized.goal = clampDailyGoal(normalized.goal);
    for (const key of ["reviews", "correct", "again", "hard", "good", "easy", "goalReachedAt"]) {
        normalized[key] = Number(normalized[key]) || 0;
    }
    return normalized;
}

export function normalizeDailyStats(stats = {}) {
    return Object.fromEntries(
        Object.entries(stats || {}).map(([dateKey, entry]) => [
            dateKey,
            normalizeDailyEntry(entry, dateKey),
        ]),
    );
}

export function recordDailyPractice(stats, { cardId, rating, dailyGoal, now = Date.now() }) {
    const normalized = normalizeDailyStats(stats);
    const dateKey = localDateKey(now);
    const entry = normalizeDailyEntry(normalized[dateKey], dateKey);
    const goal = clampDailyGoal(dailyGoal);
    const normalizedCardId = String(cardId || "unknown");
    const next = {
        ...entry,
        goal,
        reviews: entry.reviews + 1,
        uniqueCards: entry.uniqueCards.includes(normalizedCardId)
            ? entry.uniqueCards
            : [...entry.uniqueCards, normalizedCardId],
    };

    if (rating === "again") next.again += 1;
    else {
        next.correct += 1;
        if (rating === "hard") next.hard += 1;
        if (rating === "good") next.good += 1;
        if (rating === "easy") next.easy += 1;
    }

    if (!next.goalReachedAt && next.uniqueCards.length >= goal) {
        next.goalReachedAt = now;
    }

    return {
        ...normalized,
        [dateKey]: next,
    };
}

export function dailySummary(stats, profile, now = Date.now()) {
    const normalizedProfile = normalizeProfile(profile, now);
    const dateKey = localDateKey(now);
    const normalized = normalizeDailyStats(stats);
    const existingEntry = normalized[dateKey];
    const entry = normalizeDailyEntry(existingEntry, dateKey);
    const goal = existingEntry ? entry.goal : normalizedProfile.dailyGoal;
    const uniqueCount = entry.uniqueCards.length;
    const percent = Math.min(100, Math.round((uniqueCount / goal) * 100));
    return {
        dateKey,
        goal,
        reviews: entry.reviews,
        uniqueCount,
        correct: entry.correct,
        again: entry.again,
        goalReached: uniqueCount >= goal,
        goalReachedAt: entry.goalReachedAt,
        percent,
    };
}

function dateFromKey(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function recentDailySummaries(stats, profile, days = 7, now = Date.now()) {
    const normalized = normalizeDailyStats(stats);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(start.getTime() - (days - index - 1) * DAY_MS);
        const dateKey = localDateKey(date);
        const entry = normalizeDailyEntry(normalized[dateKey], dateKey);
        return {
            ...dailySummary(normalized, profile, date),
            reviews: entry.reviews,
            uniqueCount: entry.uniqueCards.length,
        };
    });
}

export function practiceStats(stats, profile, now = Date.now()) {
    const normalized = normalizeDailyStats(stats);
    const profileGoal = normalizeProfile(profile, now).dailyGoal;
    const entries = Object.values(normalized)
        .map(entry => normalizeDailyEntry(entry))
        .sort((left, right) => left.date.localeCompare(right.date));
    const activeDays = entries.filter(entry => entry.reviews > 0).length;
    const goalForEntry = entry => clampDailyGoal(entry.goal || profileGoal);
    const goalDays = entries.filter(entry => entry.uniqueCards.length >= goalForEntry(entry)).length;
    const totalReviews = entries.reduce((sum, entry) => sum + entry.reviews, 0);
    const totalUniqueCards = entries.reduce((sum, entry) => sum + entry.uniqueCards.length, 0);

    let currentGoalStreak = 0;
    let streakDate = new Date(now);
    const todayKey = localDateKey(streakDate);
    const todayEntry = normalizeDailyEntry(normalized[todayKey], todayKey);
    const todayGoal = normalized[todayKey] ? goalForEntry(todayEntry) : profileGoal;
    if (todayEntry.uniqueCards.length < todayGoal) {
        streakDate = new Date(streakDate.getTime() - DAY_MS);
    }
    for (let date = streakDate; ; date = new Date(date.getTime() - DAY_MS)) {
        const dateKey = localDateKey(date);
        const entry = normalized[dateKey];
        if (!entry) break;
        const normalizedEntry = normalizeDailyEntry(entry, dateKey);
        if (normalizedEntry.uniqueCards.length < goalForEntry(normalizedEntry)) break;
        currentGoalStreak += 1;
    }

    let bestGoalStreak = 0;
    let running = 0;
    let previousDate = null;
    for (const entry of entries) {
        const currentDate = dateFromKey(entry.date);
        const consecutive = previousDate
            ? Math.round((currentDate - previousDate) / DAY_MS) === 1
            : true;
        if (entry.uniqueCards.length >= goalForEntry(entry)) {
            running = consecutive ? running + 1 : 1;
            bestGoalStreak = Math.max(bestGoalStreak, running);
        } else {
            running = 0;
        }
        previousDate = currentDate;
    }

    return {
        activeDays,
        goalDays,
        totalReviews,
        totalUniqueCards,
        currentGoalStreak,
        bestGoalStreak,
    };
}
