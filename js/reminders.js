export const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function emptyPracticeReminder() {
    return {
        enabled: false,
        lastPracticeAt: 0,
        nextReminderAt: 0,
        lastNotifiedAt: 0,
    };
}

export function normalizePracticeReminder(reminder = {}) {
    const normalized = { ...emptyPracticeReminder(), ...reminder };
    normalized.enabled = Boolean(normalized.enabled);
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
        nextReminderAt: lastPracticeAt + REMINDER_INTERVAL_MS,
    };
}

export function disablePracticeReminder(reminder) {
    return {
        ...normalizePracticeReminder(reminder),
        enabled: false,
    };
}

export function recordPractice(reminder, now = Date.now()) {
    return {
        ...normalizePracticeReminder(reminder),
        lastPracticeAt: now,
        nextReminderAt: now + REMINDER_INTERVAL_MS,
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
