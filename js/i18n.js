import { itemId } from "./core.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const FALLBACK_LANGUAGE = "es";
const LOCALE_VERSION = "700";

export const AVAILABLE_LANGUAGES = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
];

const STATE_KEYS = new Map([
    ["Nueva", "new"],
    ["Por repasar", "due"],
    ["Dominada", "mastered"],
    ["Aprendiendo", "learning"],
]);

let activeLanguage = FALLBACK_LANGUAGE;
let activeLocale = {};

function readPath(source, path) {
    return path.split(".").reduce((value, part) => value?.[part], source);
}

function interpolate(template, values = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) =>
        Object.hasOwn(values, key) ? values[key] : `{${key}}`,
    );
}

export function normalizeLanguage(language) {
    const value = String(language || "").slice(0, 2).toLowerCase();
    return AVAILABLE_LANGUAGES.some(candidate => candidate.code === value)
        ? value
        : FALLBACK_LANGUAGE;
}

export function detectInitialLanguage(settingsLanguage = "") {
    return normalizeLanguage(settingsLanguage || navigator.language || FALLBACK_LANGUAGE);
}

export async function loadLocale(language) {
    const normalized = normalizeLanguage(language);
    const response = await fetch(`locales/${normalized}.json?v=${LOCALE_VERSION}`);
    if (!response.ok) {
        if (normalized !== FALLBACK_LANGUAGE) return loadLocale(FALLBACK_LANGUAGE);
        throw new Error(`No se pudo cargar el idioma ${normalized}.`);
    }
    activeLanguage = normalized;
    activeLocale = await response.json();
    return activeLocale;
}

export function currentLanguage() {
    return activeLanguage;
}

export function languageLabel(language = activeLanguage) {
    return AVAILABLE_LANGUAGES.find(candidate => candidate.code === language)?.label ?? language;
}

export function t(key, values = {}, fallback = key) {
    const value = readPath(activeLocale, key);
    if (typeof value !== "string") return interpolate(fallback, values);
    return interpolate(value, values);
}

export function applyDocumentTranslations(root = document) {
    document.documentElement.lang = activeLocale.meta?.htmlLang || activeLanguage;
    document.title = t("meta.title", {}, "KanjiFlow");
    document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", t("meta.description", {}, ""));

    root.querySelectorAll("[data-i18n]").forEach(element => {
        element.textContent = t(element.dataset.i18n, {}, element.textContent);
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        element.setAttribute(
            "placeholder",
            t(element.dataset.i18nPlaceholder, {}, element.getAttribute("placeholder") || ""),
        );
    });
    root.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
        element.setAttribute(
            "aria-label",
            t(element.dataset.i18nAriaLabel, {}, element.getAttribute("aria-label") || ""),
        );
    });
    root.querySelectorAll("[data-i18n-title]").forEach(element => {
        element.setAttribute(
            "title",
            t(element.dataset.i18nTitle, {}, element.getAttribute("title") || ""),
        );
    });
}

export function lessonTitle(lesson) {
    return t(`lessons.${lesson.id}.title`, {}, lesson.title);
}

export function lessonDescription(lesson) {
    return t(`lessons.${lesson.id}.description`, {}, lesson.description);
}

export function translateType(type) {
    return t(`types.${type}`, {}, type);
}

export function translateCategory(category) {
    return t(`categories.${category}`, {}, category);
}

export function translateCardState(state) {
    return t(`states.${STATE_KEYS.get(state) || "learning"}`, {}, state);
}

export function formatRelativeTime(timestamp, now = Date.now()) {
    const difference = Math.max(0, timestamp - now);
    if (difference < 2 * MINUTE_MS) return t("time.inOneMinute", {}, "en 1 min");
    if (difference < DAY_MS) {
        return t("time.inHours", { count: Math.ceil(difference / (60 * MINUTE_MS)) }, "en {count} h");
    }
    return t("time.inDays", { count: Math.ceil(difference / DAY_MS) }, "en {count} d");
}

export function formatResultCount(count) {
    return count === 1
        ? t("ui.resultCountOne", { count }, "{count} resultado")
        : t("ui.resultCountMany", { count }, "{count} resultados");
}

function translateKanaMeaning(item, card) {
    if (card?.meaning) return card.meaning;
    if (/^Letra\s+/i.test(item.significado)) {
        return t("content.kanaLetter", { romaji: item.romaji.toUpperCase() }, item.significado);
    }
    return item.significado;
}

function translateExampleText(text = "") {
    const match = text.match(/^(.+?)\s*\((.+?)\s*-\s*(.+?)\)$/u);
    if (!match) return text;
    const [, japanese, reading, spanishTerm] = match;
    const translatedTerm = activeLocale.exampleTerms?.[spanishTerm.trim()] ?? spanishTerm.trim();
    return `${japanese.trim()} (${reading.trim()} - ${translatedTerm})`;
}

export function localizeItem(item) {
    const id = itemId(item);
    const card = activeLocale.cards?.[id] ?? {};
    const kanji = item.tipo === "kanji";
    const meaning = kanji
        ? card.meaning ?? item.significado
        : translateKanaMeaning(item, card);

    return {
        ...item,
        cardId: id,
        significadoOriginal: item.significadoOriginal ?? item.significado,
        palabraEjemploOriginal: item.palabraEjemploOriginal ?? item.palabra_ejemplo,
        significado: meaning,
        categoriaLabel: translateCategory(item.categoria),
        tipoLabel: translateType(item.tipo),
        palabra_ejemplo: translateExampleText(item.palabra_ejemplo),
        example: item.example
            ? {
                ...item.example,
                meaning: card.exampleMeaning ?? item.example.meaning,
                sentenceMeaning: card.sentenceMeaning ?? item.example.sentenceMeaning,
            }
            : null,
    };
}

export function localizeDictionary(items) {
    return items.map(localizeItem);
}
