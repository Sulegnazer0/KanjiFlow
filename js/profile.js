export const DEFAULT_DAILY_GOAL = 10;
export const MIN_DAILY_GOAL = 1;
export const MAX_DAILY_GOAL = 200;

export const DEFAULT_SIMILARITY_THRESHOLD = 75;
export const MIN_SIMILARITY_THRESHOLD = 30;
export const MAX_SIMILARITY_THRESHOLD = 100;

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

function clampSimilarityThreshold(value) {
    return Math.min(
        MAX_SIMILARITY_THRESHOLD,
        Math.max(MIN_SIMILARITY_THRESHOLD, Math.round(Number(value) || DEFAULT_SIMILARITY_THRESHOLD)),
    );
}

export function emptyProfile(now = Date.now()) {
    return {
        userId: "",
        name: "",
        dailyGoal: DEFAULT_DAILY_GOAL,
        createdAt: now,
        onboardedAt: 0,
        tourCompletedAt: 0,
        tourSkippedAt: 0,
        strokeEvaluatorEnabled: false,
        similarityThreshold: DEFAULT_SIMILARITY_THRESHOLD,
        // Not built yet — reserved for upcoming features so their achievements
        // can already exist in ACHIEVEMENT_DEFINITIONS (locked until wired up).
        googleAccountLinked: false,
        storeRated: false,
        sharedOnSocial: false,
        hasPurchased: false,
    };
}

export function normalizeProfile(profile = {}, now = Date.now()) {
    const normalized = { ...emptyProfile(now), ...profile };
    normalized.userId = String(normalized.userId || "").trim().slice(0, 80);
    normalized.name = String(normalized.name || "").trim().slice(0, 40);
    normalized.dailyGoal = clampDailyGoal(normalized.dailyGoal);
    normalized.createdAt = Number(normalized.createdAt) || now;
    normalized.onboardedAt = Number(normalized.onboardedAt) || 0;
    normalized.tourCompletedAt = Number(normalized.tourCompletedAt) || 0;
    normalized.tourSkippedAt = Number(normalized.tourSkippedAt) || 0;
    normalized.strokeEvaluatorEnabled = Boolean(normalized.strokeEvaluatorEnabled);
    normalized.similarityThreshold = clampSimilarityThreshold(normalized.similarityThreshold);
    normalized.googleAccountLinked = Boolean(normalized.googleAccountLinked);
    normalized.storeRated = Boolean(normalized.storeRated);
    normalized.sharedOnSocial = Boolean(normalized.sharedOnSocial);
    normalized.hasPurchased = Boolean(normalized.hasPurchased);
    return normalized;
}

export function emptyDailyEntry(dateKey = localDateKey()) {
    return {
        date: dateKey,
        goal: DEFAULT_DAILY_GOAL,
        reviews: 0,
        uniqueCards: [],
        cards: {},
        correct: 0,
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
        goalReachedAt: 0,
    };
}

function emptyDailyCard(cardId = "") {
    return {
        cardId: String(cardId),
        reviews: 0,
        correct: 0,
        again: 0,
        hard: 0,
        good: 0,
        easy: 0,
        firstReviewedAt: 0,
        lastReviewedAt: 0,
        lastRating: "",
    };
}

function normalizeDailyCard(card = {}, cardId = card.cardId || "") {
    const normalized = { ...emptyDailyCard(cardId), ...card };
    normalized.cardId = String(normalized.cardId || cardId);
    normalized.lastRating = String(normalized.lastRating || "");
    for (const key of [
        "reviews", "correct", "again", "hard", "good", "easy", "firstReviewedAt", "lastReviewedAt",
    ]) {
        normalized[key] = Number(normalized[key]) || 0;
    }
    return normalized;
}

export function normalizeDailyEntry(entry = {}, dateKey = entry.date || localDateKey()) {
    const normalized = { ...emptyDailyEntry(dateKey), ...entry };
    normalized.date = String(normalized.date || dateKey);
    normalized.uniqueCards = Array.isArray(normalized.uniqueCards)
        ? [...new Set(normalized.uniqueCards.map(String))]
        : [];
    const rawCards = normalized.cards && typeof normalized.cards === "object"
        ? normalized.cards
        : {};
    normalized.cards = Object.fromEntries(
        Object.entries(rawCards).map(([cardId, card]) => [
            String(cardId),
            normalizeDailyCard(card, cardId),
        ]),
    );
    for (const cardId of normalized.uniqueCards) {
        if (!normalized.cards[cardId]) {
            normalized.cards[cardId] = normalizeDailyCard({ cardId }, cardId);
        }
    }
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
    const card = normalizeDailyCard(entry.cards[normalizedCardId], normalizedCardId);
    const next = {
        ...entry,
        goal,
        reviews: entry.reviews + 1,
        uniqueCards: entry.uniqueCards.includes(normalizedCardId)
            ? entry.uniqueCards
            : [...entry.uniqueCards, normalizedCardId],
        cards: {
            ...entry.cards,
            [normalizedCardId]: {
                ...card,
                reviews: card.reviews + 1,
                firstReviewedAt: card.firstReviewedAt || now,
                lastReviewedAt: now,
                lastRating: String(rating || ""),
            },
        },
    };

    const nextCard = next.cards[normalizedCardId];
    if (rating === "again") {
        next.again += 1;
        nextCard.again += 1;
    } else {
        next.correct += 1;
        nextCard.correct += 1;
        if (rating === "hard") {
            next.hard += 1;
            nextCard.hard += 1;
        }
        if (rating === "good") {
            next.good += 1;
            nextCard.good += 1;
        }
        if (rating === "easy") {
            next.easy += 1;
            nextCard.easy += 1;
        }
    }

    if (!next.goalReachedAt && next.uniqueCards.length >= goal) {
        next.goalReachedAt = now;
    }

    return {
        ...normalized,
        [dateKey]: next,
    };
}

export function dailyEntry(stats, now = Date.now()) {
    const normalized = normalizeDailyStats(stats);
    const dateKey = localDateKey(now);
    return normalizeDailyEntry(normalized[dateKey], dateKey);
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
        failedUniqueCount: Object.values(entry.cards).filter(card => card.again > 0).length,
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
