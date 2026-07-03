export const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_REMINDER_TIME = "19:00";

function normalizeReminderTime(value = DEFAULT_REMINDER_TIME) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return DEFAULT_REMINDER_TIME;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return DEFAULT_REMINDER_TIME;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function nextReminderAtForTime(preferredTime = DEFAULT_REMINDER_TIME, now = Date.now(), skipToday = false) {
    const normalizedTime = normalizeReminderTime(preferredTime);
    const [hours, minutes] = normalizedTime.split(":").map(Number);
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);
    if (skipToday || candidate.getTime() <= now) {
        candidate.setDate(candidate.getDate() + 1);
    }
    return candidate.getTime();
}

export function emptyPracticeReminder() {
    return {
        enabled: false,
        preferredTime: DEFAULT_REMINDER_TIME,
        lastPracticeAt: 0,
        nextReminderAt: 0,
        lastNotifiedAt: 0,
    };
}

export function normalizePracticeReminder(reminder = {}) {
    const normalized = { ...emptyPracticeReminder(), ...reminder };
    normalized.enabled = Boolean(normalized.enabled);
    normalized.preferredTime = normalizeReminderTime(normalized.preferredTime);
    for (const key of ["lastPracticeAt", "nextReminderAt", "lastNotifiedAt"]) {
        normalized[key] = Number(normalized[key]) || 0;
    }
    return normalized;
}

export function enablePracticeReminder(reminder, now = Date.now()) {
    const normalized = normalizePracticeReminder(reminder);
    const lastPracticeAt = normalized.lastPracticeAt || now;
    return {
        ...normalized,
        enabled: true,
        lastPracticeAt,
        nextReminderAt: nextReminderAtForTime(normalized.preferredTime, now, true),
        lastNotifiedAt: 0,
    };
}

export function disablePracticeReminder(reminder) {
    return {
        ...normalizePracticeReminder(reminder),
        enabled: false,
    };
}

export function recordPractice(reminder, now = Date.now()) {
    const normalized = normalizePracticeReminder(reminder);
    return {
        ...normalized,
        lastPracticeAt: now,
        nextReminderAt: nextReminderAtForTime(normalized.preferredTime, now, true),
        lastNotifiedAt: 0,
    };
}

export function setPracticeReminderTime(reminder, preferredTime, now = Date.now()) {
    const normalized = normalizePracticeReminder(reminder);
    const nextPreferredTime = normalizeReminderTime(preferredTime);
    return {
        ...normalized,
        preferredTime: nextPreferredTime,
        nextReminderAt: normalized.enabled
            ? nextReminderAtForTime(nextPreferredTime, now, true)
            : normalized.nextReminderAt,
        lastNotifiedAt: 0,
    };
}

export function isPracticeReminderDue(reminder, now = Date.now()) {
    const normalized = normalizePracticeReminder(reminder);
    return normalized.enabled
        && normalized.nextReminderAt > 0
        && normalized.nextReminderAt <= now;
}

export function shouldNotifyPracticeReminder(reminder, now = Date.now()) {
    const normalized = normalizePracticeReminder(reminder);
    return isPracticeReminderDue(normalized, now)
        && normalized.lastNotifiedAt < normalized.nextReminderAt;
}

export function markPracticeReminderNotified(reminder, now = Date.now()) {
    return {
        ...normalizePracticeReminder(reminder),
        lastNotifiedAt: now,
    };
}
