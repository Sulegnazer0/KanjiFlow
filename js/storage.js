import { emptyReviewRecord, normalizeReviewRecord } from "./core.js";
import { emptyProfile, normalizeDailyStats, normalizeProfile } from "./profile.js";
import { emptyPracticeReminder, normalizePracticeReminder } from "./reminders.js";

const PROGRESS_KEY = "kanjiflow_progress_v2";
const FAVORITES_KEY = "kanjiflow_favorites_v2";
const SETTINGS_KEY = "kanjiflow_settings_v2";
const REMINDER_KEY = "kanjiflow_practice_reminder_v1";
const PROFILE_KEY = "kanjiflow_profile_v1";
const DAILY_STATS_KEY = "kanjiflow_daily_stats_v1";

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value && typeof value === "object" ? value : fallback;
    } catch {
        return fallback;
    }
}

function migrateLegacyProgress() {
    const legacy = readJSON("progreso_japones", {});
    const migrated = {};
    const now = Date.now();

    for (const [id, state] of Object.entries(legacy)) {
        if (state === "sabe") {
            migrated[id] = {
                ...emptyReviewRecord(),
                repetitions: 2,
                intervalDays: 3,
                ease: 2.5,
                dueAt: now,
                lastReviewedAt: now - 24 * 60 * 60 * 1000,
                correct: 1,
                streak: 1,
                bestStreak: 1,
                lastRating: "good",
            };
        } else {
            migrated[id] = {
                ...emptyReviewRecord(),
                dueAt: now,
                lastReviewedAt: now - 60 * 1000,
                incorrect: 1,
                lapses: 1,
                lastRating: "again",
            };
        }
    }
    return migrated;
}

function migrateLegacyFavorites() {
    return readJSON("favoritos_japones", {});
}

export function loadProgress() {
    const current = readJSON(PROGRESS_KEY, null);
    if (current) {
        return Object.fromEntries(
            Object.entries(current).map(([id, record]) => [id, normalizeReviewRecord(record)]),
        );
    }
    const migrated = migrateLegacyProgress();
    if (Object.keys(migrated).length) saveProgress(migrated);
    return migrated;
}

export function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadFavorites() {
    const current = readJSON(FAVORITES_KEY, null);
    if (current) return current;
    const migrated = migrateLegacyFavorites();
    if (Object.keys(migrated).length) saveFavorites(migrated);
    return migrated;
}

export function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function loadSettings() {
    return readJSON(SETTINGS_KEY, {
        lesson: "recommended",
        script: "todos",
        session: "recomendado",
        language: "es",
    });
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadProfile() {
    return normalizeProfile(readJSON(PROFILE_KEY, emptyProfile()));
}

export function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)));
}

export function loadDailyStats() {
    return normalizeDailyStats(readJSON(DAILY_STATS_KEY, {}));
}

export function saveDailyStats(stats) {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(normalizeDailyStats(stats)));
}

export function loadPracticeReminder() {
    return normalizePracticeReminder(readJSON(REMINDER_KEY, emptyPracticeReminder()));
}

export function savePracticeReminder(reminder) {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(normalizePracticeReminder(reminder)));
}

export function createBackup(
    progress,
    favorites,
    settings,
    reminder = emptyPracticeReminder(),
    profile = emptyProfile(),
    dailyStats = {},
) {
    return JSON.stringify({
        app: "KanjiFlow",
        version: 2,
        exportedAt: new Date().toISOString(),
        progress,
        favorites,
        settings,
        reminder: normalizePracticeReminder(reminder),
        profile: normalizeProfile(profile),
        dailyStats: normalizeDailyStats(dailyStats),
    }, null, 2);
}

export function parseBackup(text) {
    const data = JSON.parse(text);
    if (data?.app !== "KanjiFlow" || Number(data?.version) !== 2) {
        throw new Error("El archivo no es una copia compatible de KanjiFlow.");
    }
    if (!data.progress || !data.favorites || !data.settings) {
        throw new Error("La copia está incompleta.");
    }
    return {
        progress: Object.fromEntries(
            Object.entries(data.progress).map(([id, record]) => [id, normalizeReviewRecord(record)]),
        ),
        favorites: data.favorites,
        settings: data.settings,
        reminder: normalizePracticeReminder(data.reminder),
        profile: normalizeProfile(data.profile),
        dailyStats: normalizeDailyStats(data.dailyStats),
    };
}

export function replaceStoredData({ progress, favorites, settings, reminder, profile, dailyStats }) {
    saveProgress(progress);
    saveFavorites(favorites);
    saveSettings(settings);
    savePracticeReminder(reminder);
    saveProfile(profile);
    saveDailyStats(dailyStats);
}
