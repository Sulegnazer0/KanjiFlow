import { isMastered, itemId, progressStats } from "./core.js";
import { dailySummary, normalizeDailyStats, practiceStats } from "./profile.js";

export const ACHIEVEMENT_DEFINITIONS = [
    {
        id: "first_review",
        icon: "✍️",
        titleKey: "achievements.firstReview.title",
        descriptionKey: "achievements.firstReview.description",
        goal: 1,
        value: stats => stats.totalReviews,
    },
    {
        id: "review_100",
        icon: "🔥",
        titleKey: "achievements.review100.title",
        descriptionKey: "achievements.review100.description",
        goal: 100,
        value: stats => stats.totalReviews,
    },
    {
        id: "first_daily_goal",
        icon: "🎯",
        titleKey: "achievements.firstDailyGoal.title",
        descriptionKey: "achievements.firstDailyGoal.description",
        goal: 1,
        value: stats => stats.goalDays,
    },
    {
        id: "daily_goal_7",
        icon: "📅",
        titleKey: "achievements.dailyGoal7.title",
        descriptionKey: "achievements.dailyGoal7.description",
        goal: 7,
        value: stats => stats.goalDays,
    },
    {
        id: "streak_7",
        icon: "🌊",
        titleKey: "achievements.streak7.title",
        descriptionKey: "achievements.streak7.description",
        goal: 7,
        value: stats => stats.bestGoalStreak,
    },
    {
        id: "active_14",
        icon: "🧭",
        titleKey: "achievements.active14.title",
        descriptionKey: "achievements.active14.description",
        goal: 14,
        value: stats => stats.activeDays,
    },
    {
        id: "first_mastered",
        icon: "✅",
        titleKey: "achievements.firstMastered.title",
        descriptionKey: "achievements.firstMastered.description",
        goal: 1,
        value: stats => stats.masteredCount,
    },
    {
        id: "mastered_10",
        icon: "🏅",
        titleKey: "achievements.mastered10.title",
        descriptionKey: "achievements.mastered10.description",
        goal: 10,
        value: stats => stats.masteredCount,
    },
    {
        id: "mastered_50",
        icon: "🏯",
        titleKey: "achievements.mastered50.title",
        descriptionKey: "achievements.mastered50.description",
        goal: 50,
        value: stats => stats.masteredCount,
    },
    {
        id: "first_kanji",
        icon: "漢",
        titleKey: "achievements.firstKanji.title",
        descriptionKey: "achievements.firstKanji.description",
        goal: 1,
        value: stats => stats.masteredKanjiCount,
    },
    {
        id: "kanji_10",
        icon: "書",
        titleKey: "achievements.kanji10.title",
        descriptionKey: "achievements.kanji10.description",
        goal: 10,
        value: stats => stats.masteredKanjiCount,
    },
    {
        id: "kana_20",
        icon: "かな",
        titleKey: "achievements.kana20.title",
        descriptionKey: "achievements.kana20.description",
        goal: 20,
        value: stats => stats.masteredKanaCount,
    },
    {
        id: "first_favorite",
        icon: "★",
        titleKey: "achievements.firstFavorite.title",
        descriptionKey: "achievements.firstFavorite.description",
        goal: 1,
        value: stats => stats.favoriteCount,
    },
    {
        id: "favorites_10",
        icon: "⭐",
        titleKey: "achievements.favorites10.title",
        descriptionKey: "achievements.favorites10.description",
        goal: 10,
        value: stats => stats.favoriteCount,
    },
];

export function emptyAchievements() {
    return {
        unlocked: {},
        lastCheckedAt: 0,
    };
}

export function normalizeAchievements(state = {}) {
    const definitionIds = new Set(ACHIEVEMENT_DEFINITIONS.map(achievement => achievement.id));
    const rawUnlocked = state?.unlocked && typeof state.unlocked === "object"
        ? state.unlocked
        : {};
    const unlocked = {};
    for (const [id, value] of Object.entries(rawUnlocked)) {
        if (!definitionIds.has(id)) continue;
        const unlockedAt = Number(value) || 0;
        if (unlockedAt > 0) unlocked[id] = unlockedAt;
    }
    return {
        unlocked,
        lastCheckedAt: Number(state?.lastCheckedAt) || 0,
    };
}

function uniqueReviewedCardCount(stats = {}) {
    const normalized = normalizeDailyStats(stats);
    const unique = new Set();
    for (const entry of Object.values(normalized)) {
        for (const cardId of entry.uniqueCards) unique.add(cardId);
    }
    return unique.size;
}

export function buildAchievementStats({
    dictionary = [],
    progress = {},
    favorites = {},
    dailyStats = {},
    profile = {},
    now = Date.now(),
} = {}) {
    const mastery = progressStats(dictionary, progress, now);
    const practice = practiceStats(dailyStats, profile, now);
    const today = dailySummary(dailyStats, profile, now);
    const masteredItems = dictionary.filter(item => isMastered(progress[itemId(item)]));

    return {
        ...practice,
        todayUniqueCount: today.uniqueCount,
        todayReviews: today.reviews,
        totalReviews: practice.totalReviews,
        reviewedUniqueCount: uniqueReviewedCardCount(dailyStats),
        favoriteCount: Object.values(favorites || {}).filter(Boolean).length,
        masteredCount: mastery.masteredCount,
        masteredKanjiCount: masteredItems.filter(item => item.tipo === "kanji").length,
        masteredKanaCount: masteredItems.filter(item => item.tipo === "hiragana" || item.tipo === "katakana").length,
        bestGoalStreak: practice.bestGoalStreak,
        currentGoalStreak: practice.currentGoalStreak,
        activeDays: practice.activeDays,
        goalDays: practice.goalDays,
    };
}

export function syncAchievements(state = {}, stats = {}, now = Date.now()) {
    const next = normalizeAchievements(state);
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        const value = Math.max(0, Number(achievement.value(stats)) || 0);
        if (value >= achievement.goal && !next.unlocked[achievement.id]) {
            next.unlocked[achievement.id] = now;
            newlyUnlocked.push(achievement);
        }
    }

    if (newlyUnlocked.length) next.lastCheckedAt = now;
    return {
        state: next,
        newlyUnlocked,
        changed: newlyUnlocked.length > 0,
    };
}

export function achievementProgress(state = {}, stats = {}) {
    const normalized = normalizeAchievements(state);
    return ACHIEVEMENT_DEFINITIONS.map(achievement => {
        const value = Math.max(0, Number(achievement.value(stats)) || 0);
        const clampedValue = Math.min(value, achievement.goal);
        const unlockedAt = normalized.unlocked[achievement.id] || 0;
        return {
            ...achievement,
            value,
            clampedValue,
            unlocked: Boolean(unlockedAt),
            unlockedAt,
            percent: achievement.goal ? Math.min(100, Math.round((clampedValue / achievement.goal) * 100)) : 0,
        };
    });
}

export function achievementSummary(state = {}) {
    const normalized = normalizeAchievements(state);
    return {
        unlocked: ACHIEVEMENT_DEFINITIONS.filter(achievement => normalized.unlocked[achievement.id]).length,
        total: ACHIEVEMENT_DEFINITIONS.length,
    };
}
