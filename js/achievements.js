import { isMastered, itemId, progressStats } from "./core.js";
import { dailySummary, normalizeDailyStats, practiceStats } from "./profile.js";
import { normalizeExamStats } from "./exam.js";

const CATEGORY_TOTALS = { N5: 80, N4: 170, N3: 361, N2: 370 };

export const ACHIEVEMENT_DEFINITIONS = [
    // --- Repasos totales ---
    { id: "first_review", icon: "✍️", titleKey: "achievements.firstReview.title", descriptionKey: "achievements.firstReview.description", goal: 1, value: stats => stats.totalReviews },
    { id: "review_50", icon: "📝", titleKey: "achievements.review50.title", descriptionKey: "achievements.review50.description", goal: 50, value: stats => stats.totalReviews },
    { id: "review_100", icon: "🔥", titleKey: "achievements.review100.title", descriptionKey: "achievements.review100.description", goal: 100, value: stats => stats.totalReviews },
    { id: "review_250", icon: "🌟", titleKey: "achievements.review250.title", descriptionKey: "achievements.review250.description", goal: 250, value: stats => stats.totalReviews },
    { id: "review_500", icon: "💪", titleKey: "achievements.review500.title", descriptionKey: "achievements.review500.description", goal: 500, value: stats => stats.totalReviews },
    { id: "review_1000", icon: "🚀", titleKey: "achievements.review1000.title", descriptionKey: "achievements.review1000.description", goal: 1000, value: stats => stats.totalReviews },
    { id: "review_2500", icon: "🏆", titleKey: "achievements.review2500.title", descriptionKey: "achievements.review2500.description", goal: 2500, value: stats => stats.totalReviews },

    // --- Metas diarias cumplidas ---
    { id: "first_daily_goal", icon: "🎯", titleKey: "achievements.firstDailyGoal.title", descriptionKey: "achievements.firstDailyGoal.description", goal: 1, value: stats => stats.goalDays },
    { id: "daily_goal_7", icon: "📅", titleKey: "achievements.dailyGoal7.title", descriptionKey: "achievements.dailyGoal7.description", goal: 7, value: stats => stats.goalDays },
    { id: "daily_goal_30", icon: "🗓️", titleKey: "achievements.dailyGoal30.title", descriptionKey: "achievements.dailyGoal30.description", goal: 30, value: stats => stats.goalDays },
    { id: "daily_goal_60", icon: "📆", titleKey: "achievements.dailyGoal60.title", descriptionKey: "achievements.dailyGoal60.description", goal: 60, value: stats => stats.goalDays },
    { id: "daily_goal_100", icon: "💯", titleKey: "achievements.dailyGoal100.title", descriptionKey: "achievements.dailyGoal100.description", goal: 100, value: stats => stats.goalDays },
    { id: "daily_goal_180", icon: "🎖️", titleKey: "achievements.dailyGoal180.title", descriptionKey: "achievements.dailyGoal180.description", goal: 180, value: stats => stats.goalDays },
    { id: "daily_goal_365", icon: "👑", titleKey: "achievements.dailyGoal365.title", descriptionKey: "achievements.dailyGoal365.description", goal: 365, value: stats => stats.goalDays },

    // --- Racha (días consecutivos cumpliendo la meta) ---
    { id: "streak_3", icon: "🔗", titleKey: "achievements.streak3.title", descriptionKey: "achievements.streak3.description", goal: 3, value: stats => stats.bestGoalStreak },
    { id: "streak_7", icon: "🌊", titleKey: "achievements.streak7.title", descriptionKey: "achievements.streak7.description", goal: 7, value: stats => stats.bestGoalStreak },
    { id: "streak_14", icon: "⛓️", titleKey: "achievements.streak14.title", descriptionKey: "achievements.streak14.description", goal: 14, value: stats => stats.bestGoalStreak },
    { id: "streak_30", icon: "🌟", titleKey: "achievements.streak30.title", descriptionKey: "achievements.streak30.description", goal: 30, value: stats => stats.bestGoalStreak },
    { id: "streak_60", icon: "🌈", titleKey: "achievements.streak60.title", descriptionKey: "achievements.streak60.description", goal: 60, value: stats => stats.bestGoalStreak },
    { id: "streak_100", icon: "💎", titleKey: "achievements.streak100.title", descriptionKey: "achievements.streak100.description", goal: 100, value: stats => stats.bestGoalStreak },

    // --- Días activos (con al menos un repaso) ---
    { id: "active_7", icon: "🗺️", titleKey: "achievements.active7.title", descriptionKey: "achievements.active7.description", goal: 7, value: stats => stats.activeDays },
    { id: "active_14", icon: "🧭", titleKey: "achievements.active14.title", descriptionKey: "achievements.active14.description", goal: 14, value: stats => stats.activeDays },
    { id: "active_30", icon: "🏔️", titleKey: "achievements.active30.title", descriptionKey: "achievements.active30.description", goal: 30, value: stats => stats.activeDays },
    { id: "active_60", icon: "🏕️", titleKey: "achievements.active60.title", descriptionKey: "achievements.active60.description", goal: 60, value: stats => stats.activeDays },
    { id: "active_100", icon: "🎒", titleKey: "achievements.active100.title", descriptionKey: "achievements.active100.description", goal: 100, value: stats => stats.activeDays },
    { id: "active_200", icon: "⛰️", titleKey: "achievements.active200.title", descriptionKey: "achievements.active200.description", goal: 200, value: stats => stats.activeDays },
    { id: "active_365", icon: "🗻", titleKey: "achievements.active365.title", descriptionKey: "achievements.active365.description", goal: 365, value: stats => stats.activeDays },

    // --- Caracteres dominados (kanji + kana) ---
    { id: "first_mastered", icon: "✅", titleKey: "achievements.firstMastered.title", descriptionKey: "achievements.firstMastered.description", goal: 1, value: stats => stats.masteredCount },
    { id: "mastered_10", icon: "🏅", titleKey: "achievements.mastered10.title", descriptionKey: "achievements.mastered10.description", goal: 10, value: stats => stats.masteredCount },
    { id: "mastered_25", icon: "🎗️", titleKey: "achievements.mastered25.title", descriptionKey: "achievements.mastered25.description", goal: 25, value: stats => stats.masteredCount },
    { id: "mastered_50", icon: "🏯", titleKey: "achievements.mastered50.title", descriptionKey: "achievements.mastered50.description", goal: 50, value: stats => stats.masteredCount },
    { id: "mastered_100", icon: "🏆", titleKey: "achievements.mastered100.title", descriptionKey: "achievements.mastered100.description", goal: 100, value: stats => stats.masteredCount },
    { id: "mastered_200", icon: "🥇", titleKey: "achievements.mastered200.title", descriptionKey: "achievements.mastered200.description", goal: 200, value: stats => stats.masteredCount },
    { id: "mastered_300", icon: "🥈", titleKey: "achievements.mastered300.title", descriptionKey: "achievements.mastered300.description", goal: 300, value: stats => stats.masteredCount },
    { id: "mastered_500", icon: "🥉", titleKey: "achievements.mastered500.title", descriptionKey: "achievements.mastered500.description", goal: 500, value: stats => stats.masteredCount },
    { id: "mastered_750", icon: "💠", titleKey: "achievements.mastered750.title", descriptionKey: "achievements.mastered750.description", goal: 750, value: stats => stats.masteredCount },
    { id: "mastered_all", icon: "👑", titleKey: "achievements.masteredAll.title", descriptionKey: "achievements.masteredAll.description", goal: 1194, value: stats => stats.masteredCount },

    // --- Kanji dominados ---
    { id: "first_kanji", icon: "漢", titleKey: "achievements.firstKanji.title", descriptionKey: "achievements.firstKanji.description", goal: 1, value: stats => stats.masteredKanjiCount },
    { id: "kanji_10", icon: "書", titleKey: "achievements.kanji10.title", descriptionKey: "achievements.kanji10.description", goal: 10, value: stats => stats.masteredKanjiCount },
    { id: "kanji_25", icon: "字", titleKey: "achievements.kanji25.title", descriptionKey: "achievements.kanji25.description", goal: 25, value: stats => stats.masteredKanjiCount },
    { id: "kanji_50", icon: "力", titleKey: "achievements.kanji50.title", descriptionKey: "achievements.kanji50.description", goal: 50, value: stats => stats.masteredKanjiCount },
    { id: "kanji_100", icon: "道", titleKey: "achievements.kanji100.title", descriptionKey: "achievements.kanji100.description", goal: 100, value: stats => stats.masteredKanjiCount },
    { id: "kanji_150", icon: "学", titleKey: "achievements.kanji150.title", descriptionKey: "achievements.kanji150.description", goal: 150, value: stats => stats.masteredKanjiCount },
    { id: "kanji_200", icon: "心", titleKey: "achievements.kanji200.title", descriptionKey: "achievements.kanji200.description", goal: 200, value: stats => stats.masteredKanjiCount },
    { id: "kanji_300", icon: "知", titleKey: "achievements.kanji300.title", descriptionKey: "achievements.kanji300.description", goal: 300, value: stats => stats.masteredKanjiCount },
    { id: "kanji_400", icon: "智", titleKey: "achievements.kanji400.title", descriptionKey: "achievements.kanji400.description", goal: 400, value: stats => stats.masteredKanjiCount },
    { id: "kanji_500", icon: "賢", titleKey: "achievements.kanji500.title", descriptionKey: "achievements.kanji500.description", goal: 500, value: stats => stats.masteredKanjiCount },
    { id: "kanji_611", icon: "極", titleKey: "achievements.kanji611.title", descriptionKey: "achievements.kanji611.description", goal: 611, value: stats => stats.masteredKanjiCount },
    { id: "kanji_all", icon: "神", titleKey: "achievements.kanjiAll.title", descriptionKey: "achievements.kanjiAll.description", goal: 981, value: stats => stats.masteredKanjiCount },

    // --- Kana dominadas ---
    { id: "kana_5", icon: "あ", titleKey: "achievements.kana5.title", descriptionKey: "achievements.kana5.description", goal: 5, value: stats => stats.masteredKanaCount },
    { id: "kana_20", icon: "かな", titleKey: "achievements.kana20.title", descriptionKey: "achievements.kana20.description", goal: 20, value: stats => stats.masteredKanaCount },
    { id: "kana_50", icon: "ア", titleKey: "achievements.kana50.title", descriptionKey: "achievements.kana50.description", goal: 50, value: stats => stats.masteredKanaCount },
    { id: "kana_100", icon: "ン", titleKey: "achievements.kana100.title", descriptionKey: "achievements.kana100.description", goal: 100, value: stats => stats.masteredKanaCount },
    { id: "kana_all", icon: "五十音", titleKey: "achievements.kanaAll.title", descriptionKey: "achievements.kanaAll.description", goal: 213, value: stats => stats.masteredKanaCount },

    // --- Dominio por nivel JLPT (porcentaje de esa categoría) ---
    { id: "n5_25", icon: "🌱", titleKey: "achievements.n5_25.title", descriptionKey: "achievements.n5_25.description", goal: 25, value: stats => stats.categoryMastered.N5.percent },
    { id: "n5_50", icon: "🌿", titleKey: "achievements.n5_50.title", descriptionKey: "achievements.n5_50.description", goal: 50, value: stats => stats.categoryMastered.N5.percent },
    { id: "n5_75", icon: "🌳", titleKey: "achievements.n5_75.title", descriptionKey: "achievements.n5_75.description", goal: 75, value: stats => stats.categoryMastered.N5.percent },
    { id: "n5_100", icon: "🎋", titleKey: "achievements.n5_100.title", descriptionKey: "achievements.n5_100.description", goal: 100, value: stats => stats.categoryMastered.N5.percent },
    { id: "n4_25", icon: "🌱", titleKey: "achievements.n4_25.title", descriptionKey: "achievements.n4_25.description", goal: 25, value: stats => stats.categoryMastered.N4.percent },
    { id: "n4_50", icon: "🌿", titleKey: "achievements.n4_50.title", descriptionKey: "achievements.n4_50.description", goal: 50, value: stats => stats.categoryMastered.N4.percent },
    { id: "n4_75", icon: "🌳", titleKey: "achievements.n4_75.title", descriptionKey: "achievements.n4_75.description", goal: 75, value: stats => stats.categoryMastered.N4.percent },
    { id: "n4_100", icon: "🎍", titleKey: "achievements.n4_100.title", descriptionKey: "achievements.n4_100.description", goal: 100, value: stats => stats.categoryMastered.N4.percent },
    { id: "n3_25", icon: "🌱", titleKey: "achievements.n3_25.title", descriptionKey: "achievements.n3_25.description", goal: 25, value: stats => stats.categoryMastered.N3.percent },
    { id: "n3_50", icon: "🌿", titleKey: "achievements.n3_50.title", descriptionKey: "achievements.n3_50.description", goal: 50, value: stats => stats.categoryMastered.N3.percent },
    { id: "n3_75", icon: "🌳", titleKey: "achievements.n3_75.title", descriptionKey: "achievements.n3_75.description", goal: 75, value: stats => stats.categoryMastered.N3.percent },
    { id: "n3_100", icon: "🏯", titleKey: "achievements.n3_100.title", descriptionKey: "achievements.n3_100.description", goal: 100, value: stats => stats.categoryMastered.N3.percent },
    { id: "n2_25", icon: "🌱", titleKey: "achievements.n2_25.title", descriptionKey: "achievements.n2_25.description", goal: 25, value: stats => stats.categoryMastered.N2.percent },
    { id: "n2_50", icon: "🌿", titleKey: "achievements.n2_50.title", descriptionKey: "achievements.n2_50.description", goal: 50, value: stats => stats.categoryMastered.N2.percent },
    { id: "n2_75", icon: "🌳", titleKey: "achievements.n2_75.title", descriptionKey: "achievements.n2_75.description", goal: 75, value: stats => stats.categoryMastered.N2.percent },
    { id: "n2_100", icon: "⛩️", titleKey: "achievements.n2_100.title", descriptionKey: "achievements.n2_100.description", goal: 100, value: stats => stats.categoryMastered.N2.percent },

    // --- Favoritas ---
    { id: "first_favorite", icon: "★", titleKey: "achievements.firstFavorite.title", descriptionKey: "achievements.firstFavorite.description", goal: 1, value: stats => stats.favoriteCount },
    { id: "favorite_5", icon: "✨", titleKey: "achievements.favorite5.title", descriptionKey: "achievements.favorite5.description", goal: 5, value: stats => stats.favoriteCount },
    { id: "favorites_10", icon: "⭐", titleKey: "achievements.favorites10.title", descriptionKey: "achievements.favorites10.description", goal: 10, value: stats => stats.favoriteCount },
    { id: "favorite_25", icon: "🌠", titleKey: "achievements.favorite25.title", descriptionKey: "achievements.favorite25.description", goal: 25, value: stats => stats.favoriteCount },
    { id: "favorite_50", icon: "💫", titleKey: "achievements.favorite50.title", descriptionKey: "achievements.favorite50.description", goal: 50, value: stats => stats.favoriteCount },
    { id: "favorite_100", icon: "🎆", titleKey: "achievements.favorite100.title", descriptionKey: "achievements.favorite100.description", goal: 100, value: stats => stats.favoriteCount },

    // --- Exámenes tomados ---
    { id: "exam_1", icon: "📝", titleKey: "achievements.exam1.title", descriptionKey: "achievements.exam1.description", goal: 1, value: stats => stats.examsTaken },
    { id: "exam_5", icon: "🧾", titleKey: "achievements.exam5.title", descriptionKey: "achievements.exam5.description", goal: 5, value: stats => stats.examsTaken },
    { id: "exam_10", icon: "📋", titleKey: "achievements.exam10.title", descriptionKey: "achievements.exam10.description", goal: 10, value: stats => stats.examsTaken },
    { id: "exam_25", icon: "📚", titleKey: "achievements.exam25.title", descriptionKey: "achievements.exam25.description", goal: 25, value: stats => stats.examsTaken },
    { id: "exam_50", icon: "🎓", titleKey: "achievements.exam50.title", descriptionKey: "achievements.exam50.description", goal: 50, value: stats => stats.examsTaken },
    { id: "exam_100", icon: "🏛️", titleKey: "achievements.exam100.title", descriptionKey: "achievements.exam100.description", goal: 100, value: stats => stats.examsTaken },

    // --- Exámenes perfectos (calificación 100) ---
    { id: "exam_perfect_1", icon: "💯", titleKey: "achievements.examPerfect1.title", descriptionKey: "achievements.examPerfect1.description", goal: 1, value: stats => stats.examPerfectScores },
    { id: "exam_perfect_5", icon: "🌟", titleKey: "achievements.examPerfect5.title", descriptionKey: "achievements.examPerfect5.description", goal: 5, value: stats => stats.examPerfectScores },
    { id: "exam_perfect_10", icon: "✨", titleKey: "achievements.examPerfect10.title", descriptionKey: "achievements.examPerfect10.description", goal: 10, value: stats => stats.examPerfectScores },
    { id: "exam_perfect_25", icon: "👑", titleKey: "achievements.examPerfect25.title", descriptionKey: "achievements.examPerfect25.description", goal: 25, value: stats => stats.examPerfectScores },

    // --- Un examen por cada nivel ---
    { id: "exam_n5", icon: "🎯", titleKey: "achievements.examN5.title", descriptionKey: "achievements.examN5.description", goal: 1, value: stats => (stats.examCategoriesAttempted.N5 ? 1 : 0) },
    { id: "exam_n4", icon: "🎯", titleKey: "achievements.examN4.title", descriptionKey: "achievements.examN4.description", goal: 1, value: stats => (stats.examCategoriesAttempted.N4 ? 1 : 0) },
    { id: "exam_n3", icon: "🎯", titleKey: "achievements.examN3.title", descriptionKey: "achievements.examN3.description", goal: 1, value: stats => (stats.examCategoriesAttempted.N3 ? 1 : 0) },
    { id: "exam_n2", icon: "🎯", titleKey: "achievements.examN2.title", descriptionKey: "achievements.examN2.description", goal: 1, value: stats => (stats.examCategoriesAttempted.N2 ? 1 : 0) },

    // --- Tarjetas distintas repasadas al menos una vez ---
    { id: "viewed_50", icon: "👀", titleKey: "achievements.viewed50.title", descriptionKey: "achievements.viewed50.description", goal: 50, value: stats => stats.reviewedUniqueCount },
    { id: "viewed_100", icon: "🔍", titleKey: "achievements.viewed100.title", descriptionKey: "achievements.viewed100.description", goal: 100, value: stats => stats.reviewedUniqueCount },
    { id: "viewed_250", icon: "🧐", titleKey: "achievements.viewed250.title", descriptionKey: "achievements.viewed250.description", goal: 250, value: stats => stats.reviewedUniqueCount },
    { id: "viewed_500", icon: "📖", titleKey: "achievements.viewed500.title", descriptionKey: "achievements.viewed500.description", goal: 500, value: stats => stats.reviewedUniqueCount },
    { id: "viewed_750", icon: "📗", titleKey: "achievements.viewed750.title", descriptionKey: "achievements.viewed750.description", goal: 750, value: stats => stats.reviewedUniqueCount },
    { id: "viewed_all", icon: "📚", titleKey: "achievements.viewedAll.title", descriptionKey: "achievements.viewedAll.description", goal: 1194, value: stats => stats.reviewedUniqueCount },

    // --- Funciones futuras ya contempladas (aún sin implementar) ---
    { id: "google_account", icon: "🔗", titleKey: "achievements.googleAccount.title", descriptionKey: "achievements.googleAccount.description", goal: 1, value: stats => (stats.googleAccountLinked ? 1 : 0) },
    { id: "store_rating", icon: "⭐", titleKey: "achievements.storeRating.title", descriptionKey: "achievements.storeRating.description", goal: 1, value: stats => (stats.storeRated ? 1 : 0) },
    { id: "social_share", icon: "📣", titleKey: "achievements.socialShare.title", descriptionKey: "achievements.socialShare.description", goal: 1, value: stats => (stats.sharedOnSocial ? 1 : 0) },

    // --- Compra / premium ---
    { id: "premium_serious", icon: "🎌", titleKey: "achievements.premiumSerious.title", descriptionKey: "achievements.premiumSerious.description", goal: 1, value: stats => (stats.hasPurchased ? 1 : 0) },
];

export const ACHIEVEMENT_LEVELS = [
    { level: 0, name: "Atarashi gakkusei", maxPercent: 1 },
    { level: 1, name: "Shougakusei", maxPercent: 20 },
    { level: 2, name: "Chuugakusei", maxPercent: 40 },
    { level: 3, name: "Koukousei", maxPercent: 60 },
    { level: 4, name: "Daigakusei", maxPercent: 79 },
    { level: 5, name: "Sensei", maxPercent: 100 },
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

function buildCategoryMastered(dictionary, progress) {
    const result = {};
    for (const [category, total] of Object.entries(CATEGORY_TOTALS)) {
        const items = dictionary.filter(item => item.tipo === "kanji" && item.categoria === category);
        const mastered = items.filter(item => isMastered(progress[itemId(item)])).length;
        result[category] = {
            mastered,
            total,
            percent: total ? Math.min(100, Math.round((mastered / total) * 100)) : 0,
        };
    }
    return result;
}

export function buildAchievementStats({
    dictionary = [],
    progress = {},
    favorites = {},
    dailyStats = {},
    profile = {},
    examStats = {},
    now = Date.now(),
} = {}) {
    const mastery = progressStats(dictionary, progress, now);
    const practice = practiceStats(dailyStats, profile, now);
    const today = dailySummary(dailyStats, profile, now);
    const masteredItems = dictionary.filter(item => isMastered(progress[itemId(item)]));
    const normalizedExamStats = normalizeExamStats(examStats);

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
        categoryMastered: buildCategoryMastered(dictionary, progress),
        examsTaken: normalizedExamStats.examsTaken,
        examPerfectScores: normalizedExamStats.perfectScores,
        examBestScore: normalizedExamStats.bestScore,
        examCategoriesAttempted: normalizedExamStats.categoriesAttempted,
        googleAccountLinked: Boolean(profile.googleAccountLinked),
        storeRated: Boolean(profile.storeRated),
        sharedOnSocial: Boolean(profile.sharedOnSocial),
        hasPurchased: Boolean(profile.hasPurchased),
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

export function achievementPercent(summary = {}) {
    const total = Math.max(0, Number(summary.total) || 0);
    const unlocked = Math.max(0, Number(summary.unlocked) || 0);
    if (!total) return 0;
    return Math.min(100, Math.round((unlocked / total) * 100));
}

export function achievementLevel(summary = {}) {
    const percent = achievementPercent(summary);
    const level = ACHIEVEMENT_LEVELS.find(candidate => percent <= candidate.maxPercent)
        ?? ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1];
    return {
        ...level,
        percent,
    };
}
