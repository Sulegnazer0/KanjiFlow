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
    practiceStats,
    recordDailyPractice,
} from "../js/profile.js";

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
assert.equal(dictionary.length, 293);
assert.equal(new Set(dictionary.map(itemId)).size, dictionary.length);
assert.equal(dictionary.filter(item => item.tipo === "kanji").length, 80);
assert.equal(Object.keys(KANJI_EXAMPLES).length, 80);
assert.equal(itemId(dictionary.find(item => item.caracter === "水")), "kanji_水");

for (const item of dictionary.filter(item => item.tipo === "kanji")) {
    assert.ok(KANJI_EXAMPLES[item.caracter], `Falta ejemplo para ${item.caracter}`);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/.test(item.kunyomi) || item.kunyomi === "-", `Kunyomi no japonés: ${item.caracter}`);
}

const localeCodes = ["es", "en", "de"];
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
    for (const lessonId of ["recommended", "hira-basic-1", "kata-basic-1", "kana-special", "kanji-4", "all"]) {
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
assert.equal(stats.total, 293);
assert.equal(stats.newCount, 293);
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
const builtAchievementStats = buildAchievementStats({
    dictionary,
    progress: achievementReviewProgress,
    favorites: achievementFavorites,
    dailyStats: achievementDailyStats,
    profile: achievementProfile,
    now: achievementNow,
});
assert.equal(ACHIEVEMENT_DEFINITIONS.length, 14);
assert.equal(builtAchievementStats.totalReviews, 14);
assert.equal(builtAchievementStats.goalDays, 7);
assert.equal(builtAchievementStats.bestGoalStreak, 7);
assert.equal(builtAchievementStats.masteredCount, 30);
assert.equal(builtAchievementStats.masteredKanjiCount, 10);
assert.equal(builtAchievementStats.masteredKanaCount, 20);
assert.equal(builtAchievementStats.favoriteCount, 10);

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
]) {
    assert.ok(unlockedAchievementIds.has(achievementId), `No se desbloqueó ${achievementId}`);
}
assert.equal(unlockedAchievementIds.has("review_100"), false);
assert.equal(unlockedAchievementIds.has("mastered_50"), false);
const visibleAchievements = achievementProgress(syncedAchievements.state, builtAchievementStats);
assert.equal(visibleAchievements.find(achievement => achievement.id === "review_100").percent, 14);
assert.equal(visibleAchievements.find(achievement => achievement.id === "mastered_50").percent, 60);
assert.equal(achievementSummary(syncedAchievements.state).unlocked, syncedAchievements.newlyUnlocked.length);
assert.equal(achievementPercent({ unlocked: 0, total: ACHIEVEMENT_DEFINITIONS.length }), 0);
assert.equal(achievementLevel({ unlocked: 0, total: ACHIEVEMENT_DEFINITIONS.length }).level, 0);
assert.equal(achievementLevel({ unlocked: 1, total: ACHIEVEMENT_DEFINITIONS.length }).level, 1);
assert.equal(achievementLevel({ unlocked: 6, total: ACHIEVEMENT_DEFINITIONS.length }).level, 3);
assert.equal(achievementLevel({ unlocked: 12, total: ACHIEVEMENT_DEFINITIONS.length }).level, 5);

console.log("✓ Parser CSV con campos entrecomillados");
console.log("✓ Programación de repetición espaciada");
console.log("✓ Recordatorio de práctica con hora configurable");
console.log("✓ Meta diaria y estadísticas de perfil");
console.log("✓ Sistema de logros, progreso y traducciones");
console.log("✓ Datos únicos y 80 ejemplos de kanji");
console.log("✓ Currículo y estadísticas de progreso");
console.log("✓ Locales ES/EN/DE completos para kanji y kana especial");
