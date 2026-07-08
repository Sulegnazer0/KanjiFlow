import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
    filterLesson,
    isDue,
    isMastered,
    itemId,
    parseCSV,
    progressStats,
    scheduleReview,
} from "../js/core.js";
import { KANJI_EXAMPLES } from "../js/kanji-examples.js";
import {
    itemPronunciation,
    japaneseOnly,
} from "../js/audio.js";
import {
    ACHIEVEMENT_DEFINITIONS,
    achievementLevel,
    achievementPercent,
    achievementProgress,
    achievementSummary,
    buildAchievementStats,
    syncAchievements,
} from "../js/achievements.js";
import {
    DEFAULT_REMINDER_TIME,
    enablePracticeReminder,
    isPracticeReminderDue,
    markPracticeReminderNotified,
    nextReminderAtForTime,
    recordPractice,
    REMINDER_INTERVAL_MS,
    setPracticeReminderTime,
    shouldNotifyPracticeReminder,
} from "../js/reminders.js";
import {
    dailyEntry,
    dailySummary,
    DEFAULT_SIMILARITY_THRESHOLD,
    emptyProfile,
    MAX_SIMILARITY_THRESHOLD,
    MIN_SIMILARITY_THRESHOLD,
    normalizeProfile,
    practiceStats,
    recordDailyPractice,
} from "../js/profile.js";
import { computeBoundingBox, normalizeStrokes, resampleStroke } from "../js/stroke-geometry.js";
import { compareStroke, recommendRating, scoreAttempt, similarityColor, YELLOW_THRESHOLD } from "../js/stroke-scoring.js";
import {
    buildQuestion,
    buildTopicPool,
    DEFAULT_QUESTIONS,
    emptyExamStats,
    generateExam,
    kanjiLessons,
    MAX_QUESTIONS,
    MIN_QUESTIONS,
    normalizeExamStats,
    QUESTION_TYPES,
    recordExamResult,
    scoreExam,
} from "../js/exam.js";

const csvSample = 'name,meaning,note\n"水","agua, líquido","dice ""mizu"""\n';
assert.deepEqual(parseCSV(csvSample), [{
    name: "水",
    meaning: "agua, líquido",
    note: 'dice "mizu"',
}]);

const now = Date.UTC(2026, 0, 1);
const firstGood = scheduleReview(undefined, "good", now);
assert.equal(firstGood.repetitions, 1);
assert.equal(firstGood.intervalDays, 1);
assert.equal(isDue(firstGood, now), false);
assert.equal(isDue(firstGood, now + 24 * 60 * 60 * 1000), true);

let mastered = undefined;
for (let index = 0; index < 5; index += 1) {
    mastered = scheduleReview(mastered, "good", now + index * 30 * 24 * 60 * 60 * 1000);
}
assert.equal(isMastered(mastered), true);

const failed = scheduleReview(mastered, "again", now);
assert.equal(failed.streak, 0);
assert.equal(failed.lapses, 1);
assert.equal(failed.repetitions, 0);

const enabledReminder = enablePracticeReminder({}, now);
assert.equal(enabledReminder.enabled, true);
assert.equal(enabledReminder.lastPracticeAt, now);
assert.equal(enabledReminder.preferredTime, DEFAULT_REMINDER_TIME);
assert.equal(new Date(enabledReminder.nextReminderAt).getHours(), 19);
assert.ok(enabledReminder.nextReminderAt > now);
assert.equal(isPracticeReminderDue(enabledReminder, enabledReminder.nextReminderAt - 1), false);
assert.equal(isPracticeReminderDue(enabledReminder, enabledReminder.nextReminderAt), true);

const practicedEarly = recordPractice(enabledReminder, now + 2 * 60 * 60 * 1000);
assert.equal(practicedEarly.lastPracticeAt, now + 2 * 60 * 60 * 1000);
assert.equal(new Date(practicedEarly.nextReminderAt).getHours(), 19);
assert.ok(practicedEarly.nextReminderAt > practicedEarly.lastPracticeAt);
assert.equal(isPracticeReminderDue(practicedEarly, practicedEarly.nextReminderAt - 1), false);
assert.equal(shouldNotifyPracticeReminder(practicedEarly, practicedEarly.nextReminderAt), true);
const notifiedReminder = markPracticeReminderNotified(practicedEarly, practicedEarly.nextReminderAt);
assert.equal(shouldNotifyPracticeReminder(notifiedReminder, practicedEarly.nextReminderAt + 60_000), false);
const customReminder = setPracticeReminderTime(enabledReminder, "08:30", now);
assert.equal(customReminder.preferredTime, "08:30");
assert.equal(customReminder.nextReminderAt, nextReminderAtForTime("08:30", now, true));
assert.equal(REMINDER_INTERVAL_MS, 24 * 60 * 60 * 1000);

const dailyProfile = { name: "S0", dailyGoal: 2, createdAt: now };
let dailyStats = {};
dailyStats = recordDailyPractice(dailyStats, {
    cardId: "kanji_水",
    rating: "good",
    dailyGoal: dailyProfile.dailyGoal,
    now,
});
dailyStats = recordDailyPractice(dailyStats, {
    cardId: "kanji_水",
    rating: "easy",
    dailyGoal: dailyProfile.dailyGoal,
    now,
});
let today = dailySummary(dailyStats, dailyProfile, now);
assert.equal(today.uniqueCount, 1);
assert.equal(today.reviews, 2);
assert.equal(today.goal, 2);
assert.equal(today.percent, 50);
assert.equal(today.goalReached, false);
dailyStats = recordDailyPractice(dailyStats, {
    cardId: "hiragana_あ",
    rating: "again",
    dailyGoal: dailyProfile.dailyGoal,
    now,
});
today = dailySummary(dailyStats, dailyProfile, now);
assert.equal(today.uniqueCount, 2);
assert.equal(today.reviews, 3);
assert.equal(today.correct, 2);
assert.equal(today.again, 1);
assert.equal(today.failedUniqueCount, 1);
assert.equal(today.goalReached, true);
assert.equal(dailySummary(dailyStats, { ...dailyProfile, dailyGoal: 10 }, now).goalReached, true);
const todayEntry = dailyEntry(dailyStats, now);
assert.equal(todayEntry.cards["kanji_水"].reviews, 2);
assert.equal(todayEntry.cards["kanji_水"].lastRating, "easy");
assert.equal(todayEntry.cards["hiragana_あ"].again, 1);
assert.equal(todayEntry.cards["hiragana_あ"].lastRating, "again");
const dailyPractice = practiceStats(dailyStats, dailyProfile, now);
assert.equal(dailyPractice.activeDays, 1);
assert.equal(dailyPractice.goalDays, 1);
assert.equal(dailyPractice.currentGoalStreak, 1);
assert.equal(dailyPractice.bestGoalStreak, 1);

function readPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
}

const rawData = await readFile(new URL("../datos.csv", import.meta.url), "utf8");
const dictionary = parseCSV(rawData);
assert.equal(dictionary.length, 1194);
assert.equal(new Set(dictionary.map(itemId)).size, dictionary.length);
assert.equal(dictionary.filter(item => item.tipo === "kanji").length, 981);
assert.equal(Object.keys(KANJI_EXAMPLES).length, 981);
assert.equal(itemId(dictionary.find(item => item.caracter === "水")), "kanji_水");
assert.equal(itemPronunciation(dictionary.find(item => item.caracter === "小")), "ショウ");
assert.equal(itemPronunciation(dictionary.find(item => item.caracter === "会")), "カイ");
assert.equal(japaneseOnly(dictionary.find(item => item.caracter === "会").onyomi), "カイ、エ");
assert.equal(japaneseOnly(dictionary.find(item => item.caracter === "行").kunyomi), "い、ゆ");

for (const item of dictionary.filter(item => item.tipo === "kanji")) {
    assert.ok(KANJI_EXAMPLES[item.caracter], `Falta ejemplo para ${item.caracter}`);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/.test(item.kunyomi) || item.kunyomi === "-", `Kunyomi no japonés: ${item.caracter}`);
}

const localeCodes = ["es", "en", "de", "fr", "pt"];
const kanjiIds = dictionary.filter(item => item.tipo === "kanji").map(itemId);
const specialKanaIds = dictionary.filter(item => item.categoria === "especial").map(itemId);
const kanaExampleTerms = new Set(
    dictionary
        .filter(item => item.tipo !== "kanji")
        .map(item => item.palabra_ejemplo?.match(/-\s*([^)]*)\)/)?.[1]?.trim())
        .filter(Boolean),
);
for (const code of localeCodes) {
    const locale = JSON.parse(await readFile(new URL(`../locales/${code}.json`, import.meta.url), "utf8"));
    assert.ok(locale.meta?.htmlLang, `Falta meta.htmlLang en ${code}`);
    assert.ok(locale.ui?.languageLabel, `Falta ui.languageLabel en ${code}`);
    for (const reminderKey of [
        "reminderOff",
        "reminderOn",
        "reminderDueButton",
        "reminderNotificationTitle",
        "reminderNotificationBody",
    ]) {
        assert.ok(locale.ui?.[reminderKey], `Falta ${reminderKey} en ${code}`);
    }
    for (const profileKey of [
        "profileTab",
        "onboardingTitle",
        "onboardingDescription",
        "onboardingLanguageLabel",
        "onboardingLanguageHint",
        "onboardingStartTour",
        "tourFavoritesTitle",
        "tourReminderTimeTitle",
        "dailyGoalSummary",
        "dailyGoalReachedSummary",
        "reminderTimeLabel",
        "reminderOnAt",
        "profileGreeting",
        "profileGreetingNamed",
        "profileSummary",
        "profileUniqueToday",
        "achievementsTitle",
        "achievementsSummary",
        "achievementProgress",
        "achievementUnlockedAt",
        "achievementUnlockedToast",
        "achievementsUnlockedToast",
        "achievementLevelLabel",
        "achievementStartupNotice",
        "historyTitle",
        "profileListsTitle",
        "viewedTodayTitle",
        "failedTodayTitle",
        "masteredListTitle",
        "upcomingReviewTitle",
        "emptyViewedToday",
        "emptyFailedToday",
        "emptyMastered",
        "emptyUpcoming",
        "viewedCardMeta",
        "failedCardMeta",
        "masteredCardMeta",
        "upcomingCardMeta",
        "noRating",
        "goalMet",
        "goalNotMet",
        "dataTitle",
        "aboutButton",
        "aboutVersion",
        "latestUpdates",
        "updateAchievements",
        "updateN4",
        "updateKanjiAudio",
        "updateStudyFavorites",
        "updateDirectFeedback",
        "updateReminderTime",
        "feedbackTitle",
        "feedbackPlaceholder",
        "feedbackTooShort",
        "feedbackSending",
        "feedbackSent",
        "feedbackSendError",
        "contentMastered",
    ]) {
        assert.ok(locale.ui?.[profileKey], `Falta ${profileKey} en ${code}`);
    }
    for (const lessonId of ["recommended", "hira-basic-1", "kata-basic-1", "kana-special", "kanji-4", "kanji-n4-1", "kanji-n4-2", "kanji-n4-3", "kanji-n4-4", "kanji-n4-5", "kanji-n4-final", "all"]) {
        assert.ok(locale.lessons?.[lessonId]?.title, `Falta título ${lessonId} en ${code}`);
        assert.ok(locale.lessons?.[lessonId]?.description, `Falta descripción ${lessonId} en ${code}`);
    }
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        assert.ok(readPath(locale, achievement.titleKey), `Falta título ${achievement.id} en ${code}`);
        assert.ok(readPath(locale, achievement.descriptionKey), `Falta descripción ${achievement.id} en ${code}`);
    }
    for (const id of [...kanjiIds, ...specialKanaIds]) {
        assert.ok(locale.cards?.[id]?.meaning, `Falta traducción ${id} en ${code}`);
    }
    if (code !== "es") {
        for (const term of kanaExampleTerms) {
            assert.ok(locale.exampleTerms?.[term], `Falta término de ejemplo "${term}" en ${code}`);
        }
    }
}

const progress = {};
const lesson = filterLesson(dictionary, "hira-basic-1", progress);
assert.ok(lesson.items.length > 0);
assert.ok(lesson.items.every(item => item.tipo === "hiragana"));

const stats = progressStats(dictionary, progress, now);
assert.equal(stats.total, 1194);
assert.equal(stats.newCount, 1194);
assert.equal(stats.masteredCount, 0);

const DAY_MS = 24 * 60 * 60 * 1000;
const achievementNow = Date.UTC(2026, 0, 10, 18);
const achievementProfile = { name: "S0", dailyGoal: 2, createdAt: achievementNow - 14 * DAY_MS };
const achievementCards = dictionary.slice(0, 12).map(itemId);
let achievementDailyStats = {};
for (let day = 0; day < 7; day += 1) {
    const timestamp = achievementNow - (6 - day) * DAY_MS;
    achievementDailyStats = recordDailyPractice(achievementDailyStats, {
        cardId: achievementCards[day],
        rating: "good",
        dailyGoal: achievementProfile.dailyGoal,
        now: timestamp,
    });
    achievementDailyStats = recordDailyPractice(achievementDailyStats, {
        cardId: achievementCards[day + 1],
        rating: "easy",
        dailyGoal: achievementProfile.dailyGoal,
        now: timestamp + 60_000,
    });
}

const masteredRecord = {
    repetitions: 4,
    intervalDays: 14,
    ease: 2.5,
    dueAt: achievementNow + 14 * DAY_MS,
    lastReviewedAt: achievementNow,
    correct: 4,
    incorrect: 0,
    streak: 4,
    bestStreak: 4,
    lapses: 0,
    lastRating: "good",
};
const achievementReviewProgress = {};
for (const item of [
    ...dictionary.filter(card => card.tipo === "kanji").slice(0, 10),
    ...dictionary.filter(card => card.tipo === "hiragana" || card.tipo === "katakana").slice(0, 20),
]) {
    achievementReviewProgress[itemId(item)] = masteredRecord;
}
const achievementFavorites = Object.fromEntries(dictionary.slice(0, 10).map(item => [itemId(item), true]));
const achievementExamStats = recordExamResult(
    recordExamResult(emptyExamStats(), { category: "N5", score: 100 }),
    { category: "N4", score: 80 },
);
const achievementProfileWithFlags = { ...achievementProfile, googleAccountLinked: true, hasPurchased: false };
const builtAchievementStats = buildAchievementStats({
    dictionary,
    progress: achievementReviewProgress,
    favorites: achievementFavorites,
    dailyStats: achievementDailyStats,
    profile: achievementProfileWithFlags,
    examStats: achievementExamStats,
    now: achievementNow,
});
assert.equal(ACHIEVEMENT_DEFINITIONS.length, 100);
assert.equal(new Set(ACHIEVEMENT_DEFINITIONS.map(achievement => achievement.id)).size, 100, "Los ids de logros deben ser únicos");
assert.equal(builtAchievementStats.totalReviews, 14);
assert.equal(builtAchievementStats.goalDays, 7);
assert.equal(builtAchievementStats.bestGoalStreak, 7);
assert.equal(builtAchievementStats.masteredCount, 30);
assert.equal(builtAchievementStats.masteredKanjiCount, 10);
assert.equal(builtAchievementStats.masteredKanaCount, 20);
assert.equal(builtAchievementStats.favoriteCount, 10);
assert.equal(builtAchievementStats.categoryMastered.N5.mastered, 10);
assert.equal(builtAchievementStats.categoryMastered.N5.total, 80);
assert.equal(builtAchievementStats.categoryMastered.N5.percent, 13);
assert.equal(builtAchievementStats.categoryMastered.N2.mastered, 0);
assert.equal(builtAchievementStats.examsTaken, 2);
assert.equal(builtAchievementStats.examPerfectScores, 1);
assert.equal(builtAchievementStats.examBestScore, 100);
assert.equal(builtAchievementStats.examCategoriesAttempted.N5, true);
assert.equal(builtAchievementStats.examCategoriesAttempted.N4, true);
assert.equal(Boolean(builtAchievementStats.examCategoriesAttempted.N3), false);
assert.equal(builtAchievementStats.googleAccountLinked, true);
assert.equal(builtAchievementStats.hasPurchased, false);

const syncedAchievements = syncAchievements({}, builtAchievementStats, achievementNow);
const unlockedAchievementIds = new Set(syncedAchievements.newlyUnlocked.map(achievement => achievement.id));
for (const achievementId of [
    "first_review",
    "first_daily_goal",
    "daily_goal_7",
    "streak_7",
    "first_mastered",
    "mastered_10",
    "first_kanji",
    "kanji_10",
    "kana_20",
    "first_favorite",
    "favorites_10",
    "exam_1",
    "exam_perfect_1",
    "exam_n5",
    "exam_n4",
    "google_account",
]) {
    assert.ok(unlockedAchievementIds.has(achievementId), `No se desbloqueó ${achievementId}`);
}
assert.equal(unlockedAchievementIds.has("review_100"), false);
assert.equal(unlockedAchievementIds.has("mastered_50"), false);
assert.equal(unlockedAchievementIds.has("exam_5"), false);
assert.equal(unlockedAchievementIds.has("exam_10"), false);
assert.equal(unlockedAchievementIds.has("exam_n3"), false);
assert.equal(unlockedAchievementIds.has("n5_25"), false);
assert.equal(unlockedAchievementIds.has("store_rating"), false);
assert.equal(unlockedAchievementIds.has("premium_serious"), false);
const visibleAchievements = achievementProgress(syncedAchievements.state, builtAchievementStats);
assert.equal(visibleAchievements.find(achievement => achievement.id === "review_100").percent, 14);
assert.equal(visibleAchievements.find(achievement => achievement.id === "mastered_50").percent, 60);
assert.equal(achievementSummary(syncedAchievements.state).unlocked, syncedAchievements.newlyUnlocked.length);
assert.equal(achievementPercent({ unlocked: 0, total: ACHIEVEMENT_DEFINITIONS.length }), 0);
assert.equal(achievementLevel({ unlocked: 0, total: ACHIEVEMENT_DEFINITIONS.length }).level, 0);
assert.equal(achievementLevel({ unlocked: 10, total: ACHIEVEMENT_DEFINITIONS.length }).level, 1);
assert.equal(achievementLevel({ unlocked: 45, total: ACHIEVEMENT_DEFINITIONS.length }).level, 3);
assert.equal(achievementLevel({ unlocked: 90, total: ACHIEVEMENT_DEFINITIONS.length }).level, 5);

assert.deepEqual(emptyExamStats(), { examsTaken: 0, perfectScores: 0, bestScore: 0, categoriesAttempted: {} });
const normalizedExamStats = normalizeExamStats({ examsTaken: "3", bestScore: -5, categoriesAttempted: { N5: true, N4: false } });
assert.equal(normalizedExamStats.examsTaken, 3);
assert.equal(normalizedExamStats.bestScore, 0);
assert.deepEqual(normalizedExamStats.categoriesAttempted, { N5: true });
const firstExamResult = recordExamResult(emptyExamStats(), { category: "N3", score: 100 });
assert.equal(firstExamResult.examsTaken, 1);
assert.equal(firstExamResult.perfectScores, 1);
assert.equal(firstExamResult.bestScore, 100);
assert.deepEqual(firstExamResult.categoriesAttempted, { N3: true });
const mixedCategoryResult = recordExamResult(firstExamResult, { category: "todas", score: 40 });
assert.equal(mixedCategoryResult.examsTaken, 2);
assert.equal(mixedCategoryResult.perfectScores, 1);
assert.equal(mixedCategoryResult.bestScore, 100);
assert.deepEqual(mixedCategoryResult.categoriesAttempted, { N3: true }, "Un examen de categoría 'todas' no debe marcar ningún nivel específico como intentado");

const straightLine = resampleStroke([{ x: 0, y: 0 }, { x: 10, y: 0 }], 5);
assert.equal(straightLine.length, 5);
assert.deepEqual(straightLine.map(point => point.x), [0, 2.5, 5, 7.5, 10]);
assert.ok(straightLine.every(point => point.y === 0));

const singlePointResample = resampleStroke([{ x: 3, y: 4 }], 4);
assert.equal(singlePointResample.length, 4);
assert.ok(singlePointResample.every(point => point.x === 3 && point.y === 4));

const bbox = computeBoundingBox([[{ x: 0, y: 100 }, { x: 200, y: 100 }], [{ x: 100, y: 0 }, { x: 100, y: 200 }]]);
assert.deepEqual(bbox, { minX: 0, minY: 0, maxX: 200, maxY: 200 });
const normalized = normalizeStrokes([[{ x: 0, y: 100 }, { x: 200, y: 100 }]], bbox);
assert.deepEqual(normalized[0], [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }]);

function horizontalStroke(count) {
    return resampleStroke([{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }], count);
}
const expectedHorizontal = horizontalStroke(32);

const identicalScore = compareStroke(horizontalStroke(32), expectedHorizontal);
assert.ok(identicalScore > 0.99, `Trazo idéntico debería puntuar casi 1, dio ${identicalScore}`);
assert.equal(similarityColor(identicalScore), "green");

const reversedStroke = resampleStroke([{ x: 1, y: 0.5 }, { x: 0, y: 0.5 }], 32);
const reversedScore = compareStroke(reversedStroke, expectedHorizontal);
assert.ok(reversedScore < identicalScore, "Un trazo invertido no debería puntuar igual que uno correcto");

const perpendicularStroke = resampleStroke([{ x: 0.5, y: 0 }, { x: 0.5, y: 1 }], 32);
const perpendicularScore = compareStroke(perpendicularStroke, expectedHorizontal);
assert.ok(perpendicularScore < YELLOW_THRESHOLD, "Un trazo perpendicular debería puntuar bajo");
assert.equal(similarityColor(perpendicularScore), "red");

function capturedLine(x0, y0, x1, y1, points = 16) {
    return Array.from({ length: points }, (_, index) => ({
        x: x0 + ((x1 - x0) * index) / (points - 1),
        y: y0 + ((y1 - y0) * index) / (points - 1),
    }));
}

const singleStrokeExpected = [{ index: 0, points: expectedHorizontal }];
const perfectAttempt = scoreAttempt([capturedLine(0, 160, 320, 160)], singleStrokeExpected);
assert.equal(perfectAttempt.score, 100);

const twoStrokeExpected = [
    { index: 0, points: expectedHorizontal },
    { index: 1, points: expectedHorizontal },
];
const missingStrokeAttempt = scoreAttempt([capturedLine(0, 160, 320, 160)], twoStrokeExpected);
assert.equal(missingStrokeAttempt.score, 50, "Dibujar la mitad de los trazos esperados debe penalizar a la mitad");

const tapAttempt = scoreAttempt([[{ x: 10, y: 10 }, { x: 10, y: 10 }]], singleStrokeExpected);
assert.equal(tapAttempt.score, 0, "Un trazo degenerado (tap) debe puntuar 0");

const emptyAttempt = scoreAttempt([], singleStrokeExpected);
assert.equal(emptyAttempt.score, 0);

assert.equal(recommendRating(95), "easy");
assert.equal(recommendRating(90), "easy");
assert.equal(recommendRating(89), "good");
assert.equal(recommendRating(75), "good");
assert.equal(recommendRating(74), "hard");
assert.equal(recommendRating(50), "hard");

assert.equal(emptyProfile(now).strokeEvaluatorEnabled, false);
assert.equal(emptyProfile(now).similarityThreshold, DEFAULT_SIMILARITY_THRESHOLD);
assert.equal(normalizeProfile({ similarityThreshold: 75 }, now).similarityThreshold, 75);
assert.equal(normalizeProfile({ similarityThreshold: 5 }, now).similarityThreshold, MIN_SIMILARITY_THRESHOLD);
assert.equal(normalizeProfile({ similarityThreshold: 500 }, now).similarityThreshold, MAX_SIMILARITY_THRESHOLD);
assert.equal(normalizeProfile({ similarityThreshold: "not-a-number" }, now).similarityThreshold, DEFAULT_SIMILARITY_THRESHOLD);
assert.equal(normalizeProfile({ strokeEvaluatorEnabled: true }, now).strokeEvaluatorEnabled, true);
assert.equal(normalizeProfile({ strokeEvaluatorEnabled: "yes" }, now).strokeEvaluatorEnabled, true);
assert.equal(normalizeProfile({}, now).strokeEvaluatorEnabled, false);

function fakeRandom(seed = 1) {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

const examFixture = [
    { tipo: "kanji", categoria: "N5", id_jlpt: "1", caracter: "一", onyomi: "イチ (ichi)", significado: "Uno" },
    { tipo: "kanji", categoria: "N5", id_jlpt: "2", caracter: "二", onyomi: "ニ (ni)", significado: "Dos" },
    { tipo: "kanji", categoria: "N5", id_jlpt: "3", caracter: "三", onyomi: "サン (san)", significado: "Tres" },
    { tipo: "kanji", categoria: "N5", id_jlpt: "4", caracter: "四", onyomi: "シ (shi)", significado: "Cuatro" },
    { tipo: "kanji", categoria: "N5", id_jlpt: "5", caracter: "五", onyomi: "ゴ (go)", significado: "Cinco" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "81", caracter: "働", onyomi: "-", significado: "Trabajar" },
    { tipo: "hiragana", categoria: "basico", id_jlpt: "", caracter: "あ", onyomi: "", significado: "" },
];

assert.equal(buildTopicPool(examFixture, { category: "N5" }).length, 5);
assert.equal(buildTopicPool(examFixture, {}).length, 6, "Sin categoría, el pool debe ser todos los kanji (no kana)");
assert.ok(kanjiLessons().every(lesson => lesson.category && lesson.category !== "kana"), "kanjiLessons() no debe incluir lecciones de kana");
assert.ok(!kanjiLessons().some(lesson => ["recommended", "all"].includes(lesson.id)), "kanjiLessons() no debe incluir los pseudo-ids recommended/all");

const onyomiQuestion = buildQuestion(examFixture[0], examFixture.slice(0, 5), "onyomi", examFixture, fakeRandom(1));
assert.equal(onyomiQuestion.options.length, 4);
assert.equal(new Set(onyomiQuestion.options).size, 4, "Las opciones de onyomi no deben repetirse");
assert.equal(onyomiQuestion.options[onyomiQuestion.correctIndex], "イチ (ichi)");

const meaningQuestion = buildQuestion(examFixture[1], examFixture.slice(0, 5), "meaningFromKanji", examFixture, fakeRandom(2));
assert.equal(new Set(meaningQuestion.options).size, 4, "Las opciones de significado no deben repetirse");
assert.equal(meaningQuestion.options[meaningQuestion.correctIndex], "Dos");

const kanjiQuestion = buildQuestion(examFixture[2], examFixture.slice(0, 5), "kanjiFromMeaning", examFixture, fakeRandom(3));
assert.equal(new Set(kanjiQuestion.options).size, 4, "Las opciones de kanji no deben repetirse");
assert.equal(kanjiQuestion.options[kanjiQuestion.correctIndex], "三");
assert.equal(kanjiQuestion.prompt, "Tres");

const onyomiLessKanji = examFixture[5];
const fallbackQuestion = buildQuestion(onyomiLessKanji, [onyomiLessKanji], "meaningFromKanji", examFixture, fakeRandom(4));
assert.equal(fallbackQuestion.options.length, 4, "Con un pool de un solo kanji, debe caer al pool completo para distractores");

// Regresión: un kanji con lectura múltiple ("コウ / ク") no debe ofrecerse como
// distractor de un kanji cuya lectura correcta es una de esas dos ("コウ"),
// porque ambas opciones lucirían "correctas" al usuario (bug real reportado).
const collisionFixture = [
    { tipo: "kanji", categoria: "N4", id_jlpt: "1", caracter: "高", onyomi: "コウ (kou)", significado: "Alto" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "2", caracter: "行", onyomi: "コウ / ク (kou / ku)", significado: "Ir" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "3", caracter: "分", onyomi: "ブン / フン (bun / fun)", significado: "Parte / Minuto" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "4", caracter: "多", onyomi: "タ (ta)", significado: "Mucho" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "5", caracter: "大", onyomi: "ダイ / タイ (dai / tai)", significado: "Grande" },
    { tipo: "kanji", categoria: "N4", id_jlpt: "6", caracter: "小", onyomi: "ショウ (shou)", significado: "Pequeño" },
];
for (let seed = 1; seed <= 50; seed += 1) {
    const collisionQuestion = buildQuestion(collisionFixture[0], collisionFixture, "onyomi", collisionFixture, fakeRandom(seed));
    const correctText = collisionQuestion.options[collisionQuestion.correctIndex];
    const correctTokens = new Set(correctText.split("(")[0].split("/").map(token => token.trim()));
    collisionQuestion.options.forEach((optionText, index) => {
        if (index === collisionQuestion.correctIndex) return;
        const optionTokens = optionText.split("(")[0].split("/").map(token => token.trim());
        assert.ok(
            optionTokens.every(token => !correctTokens.has(token)),
            `El distractor "${optionText}" comparte lectura con la respuesta correcta "${correctText}" (semilla ${seed})`,
        );
    });
}

// Mismo problema puede darse en significados con formato "A / B".
const meaningCollisionFixture = [
    { tipo: "kanji", categoria: "N3", id_jlpt: "1", caracter: "党", onyomi: "-", significado: "Partido / Facción" },
    { tipo: "kanji", categoria: "N3", id_jlpt: "2", caracter: "派", onyomi: "-", significado: "Facción / Grupo" },
    { tipo: "kanji", categoria: "N3", id_jlpt: "3", caracter: "水", onyomi: "-", significado: "Agua" },
    { tipo: "kanji", categoria: "N3", id_jlpt: "4", caracter: "火", onyomi: "-", significado: "Fuego" },
    { tipo: "kanji", categoria: "N3", id_jlpt: "5", caracter: "木", onyomi: "-", significado: "Árbol" },
    { tipo: "kanji", categoria: "N3", id_jlpt: "6", caracter: "土", onyomi: "-", significado: "Tierra" },
];
for (let seed = 1; seed <= 50; seed += 1) {
    const meaningCollisionQuestion = buildQuestion(meaningCollisionFixture[0], meaningCollisionFixture, "meaningFromKanji", meaningCollisionFixture, fakeRandom(seed));
    const correctText = meaningCollisionQuestion.options[meaningCollisionQuestion.correctIndex];
    const correctTokens = new Set(correctText.split("/").map(token => token.trim().toLowerCase()));
    meaningCollisionQuestion.options.forEach((optionText, index) => {
        if (index === meaningCollisionQuestion.correctIndex) return;
        const optionTokens = optionText.split("/").map(token => token.trim().toLowerCase());
        assert.ok(
            optionTokens.every(token => !correctTokens.has(token)),
            `El distractor "${optionText}" comparte significado con la respuesta correcta "${correctText}" (semilla ${seed})`,
        );
    });
}

const smallExam = generateExam(examFixture, { category: "N5", questionCount: 50, random: fakeRandom(5) });
assert.equal(smallExam.poolSize, 5);
assert.equal(smallExam.requestedCount, MAX_QUESTIONS);
assert.equal(smallExam.actualCount, 5, "El conteo pedido debe ajustarse al tamaño del pool disponible");
assert.equal(smallExam.questions.length, 5);
assert.ok(smallExam.questions.every(question => QUESTION_TYPES.includes(question.type)));

const onyomiEligibleExam = generateExam(examFixture, { category: "N4", questionCount: 5, random: fakeRandom(6) });
assert.ok(
    onyomiEligibleExam.questions.every(question => question.type !== "onyomi"),
    "Un kanji sin onyomi (\"-\") nunca debe recibir una pregunta de tipo onyomi",
);

const belowMinimum = generateExam(examFixture, { category: "N5", questionCount: 1, random: fakeRandom(7) });
assert.equal(belowMinimum.requestedCount, MIN_QUESTIONS, "El conteo pedido nunca debe bajar de MIN_QUESTIONS");

const perfectScore = scoreExam(smallExam.questions, smallExam.questions.map(question => question.correctIndex));
assert.equal(perfectScore.score, 100);
assert.equal(perfectScore.correct, 5);
const halfScore = scoreExam(smallExam.questions, smallExam.questions.map((question, index) => index % 2 === 0 ? question.correctIndex : (question.correctIndex + 1) % 4));
assert.equal(halfScore.score, 60);
assert.equal(scoreExam([], []).score, 0);

const realN5Pool = buildTopicPool(dictionary, { category: "N5" });
assert.equal(realN5Pool.length, 80, "El pool real de N5 debe tener 80 kanji");
const realExam = generateExam(dictionary, { category: "N3", lessonId: "kanji-n3-1", questionCount: 10, random: fakeRandom(8) });
assert.equal(realExam.actualCount, 10);
assert.ok(realExam.questions.every(question => question.options.length === 4 && question.correctIndex >= 0 && question.correctIndex < 4));
assert.equal(DEFAULT_QUESTIONS, 10);

console.log("✓ Parser CSV con campos entrecomillados");
console.log("✓ Programación de repetición espaciada");
console.log("✓ Recordatorio de práctica con hora configurable");
console.log("✓ Meta diaria y estadísticas de perfil");
console.log("✓ Sistema de logros, progreso y traducciones");
console.log("✓ Datos únicos y 981 ejemplos de kanji");
console.log("✓ Currículo y estadísticas de progreso");
console.log("✓ Locales activos completos para kanji y kana especial");
console.log("✓ Geometría de trazos y algoritmo de comparación KanjiVG");
console.log("✓ Motor de examen: generación de preguntas, distractores y calificación");
