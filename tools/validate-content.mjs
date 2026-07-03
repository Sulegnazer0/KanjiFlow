import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ACHIEVEMENT_DEFINITIONS } from "../js/achievements.js";
import { LESSONS, itemId, parseCSV } from "../js/core.js";
import { AVAILABLE_LANGUAGES } from "../js/i18n.js";
import { KANJI_EXAMPLES } from "../js/kanji-examples.js";

const REQUIRED_HEADERS = [
    "id_jlpt",
    "tipo",
    "categoria",
    "caracter",
    "romaji",
    "significado",
    "onyomi",
    "kunyomi",
    "contraparte",
    "palabra_ejemplo",
];
const SUPPORTED_TYPES = new Set(["hiragana", "katakana", "kanji"]);
const SUPPORTED_KANJI_LEVELS = new Set(["N5"]);
const KANA_CATEGORIES = new Set(["basico", "dakuten", "combinacion", "especial"]);
const REQUIRED_EXAMPLE_FIELDS = [
    "word",
    "reading",
    "meaning",
    "sentence",
    "sentenceReading",
    "sentenceMeaning",
];
const JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/u;
const KANJI_RE = /^[\u3400-\u9fff]$/u;

const failures = [];
const notes = [];

function fail(message) {
    failures.push(message);
}

function note(message) {
    notes.push(message);
}

function readPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
}

async function readJSON(path) {
    return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

function requireText(value, label) {
    if (!String(value || "").trim()) fail(`Falta ${label}`);
}

function validateHeaders(rawData) {
    const headers = rawData.split(/\r?\n/, 1)[0].split(",").map(header => header.trim());
    assert.deepEqual(headers, REQUIRED_HEADERS, "datos.csv no conserva los encabezados esperados");
}

function validateRows(dictionary) {
    const ids = new Set();
    for (const item of dictionary) {
        const id = itemId(item);
        if (ids.has(id)) fail(`ID duplicado: ${id}`);
        ids.add(id);

        if (!SUPPORTED_TYPES.has(item.tipo)) fail(`Tipo no soportado en ${id}: ${item.tipo}`);
        requireText(item.caracter, `caracter en ${id}`);
        requireText(item.romaji, `romaji en ${id}`);
        requireText(item.significado, `significado en ${id}`);

        if (item.tipo === "kanji") validateKanjiRow(item, id);
        else validateKanaRow(item, id);
    }
}

function validateKanaRow(item, id) {
    if (!KANA_CATEGORIES.has(item.categoria)) fail(`Categoría kana no soportada en ${id}: ${item.categoria}`);
    if (item.id_jlpt) fail(`Kana con id_jlpt inesperado en ${id}`);
    if (item.categoria !== "especial") requireText(item.contraparte, `contraparte en ${id}`);
    requireText(item.palabra_ejemplo, `palabra_ejemplo en ${id}`);
    if (!JAPANESE_RE.test(item.palabra_ejemplo)) fail(`palabra_ejemplo sin japonés en ${id}`);
    if (!/\(.+\s-\s.+\)/u.test(item.palabra_ejemplo)) {
        fail(`palabra_ejemplo debe seguir "japonés (lectura - término)" en ${id}`);
    }
}

function validateKanjiRow(item, id) {
    if (!KANJI_RE.test(item.caracter)) fail(`Kanji debe ser un solo carácter CJK en ${id}`);
    if (!SUPPORTED_KANJI_LEVELS.has(item.categoria)) {
        fail(`Nivel JLPT no soportado todavía en ${id}: ${item.categoria}. Agrega primero lecciones y traducciones para ese nivel.`);
    }
    if (!Number.isInteger(Number(item.id_jlpt)) || Number(item.id_jlpt) <= 0) {
        fail(`id_jlpt inválido en ${id}: ${item.id_jlpt}`);
    }
    requireText(item.onyomi, `onyomi en ${id}`);
    requireText(item.kunyomi, `kunyomi en ${id}`);
    if (!JAPANESE_RE.test(item.onyomi)) fail(`onyomi sin japonés en ${id}`);
    if (item.kunyomi !== "-" && !JAPANESE_RE.test(item.kunyomi)) fail(`kunyomi sin japonés en ${id}`);
}

function validateKanjiExamples(dictionary) {
    const kanji = dictionary.filter(item => item.tipo === "kanji");
    const expected = new Set(kanji.map(item => item.caracter));
    const actual = new Set(Object.keys(KANJI_EXAMPLES));

    for (const item of kanji) {
        const example = KANJI_EXAMPLES[item.caracter];
        if (!example) {
            fail(`Falta ejemplo para ${item.caracter}`);
            continue;
        }
        for (const field of REQUIRED_EXAMPLE_FIELDS) {
            requireText(example[field], `${field} del ejemplo ${item.caracter}`);
        }
        if (!JAPANESE_RE.test(example.word)) fail(`word del ejemplo ${item.caracter} no parece japonés`);
        if (!JAPANESE_RE.test(example.reading)) fail(`reading del ejemplo ${item.caracter} no parece japonés`);
        if (!JAPANESE_RE.test(example.sentence)) fail(`sentence del ejemplo ${item.caracter} no parece japonés`);
    }

    for (const extra of actual) {
        if (!expected.has(extra)) fail(`Ejemplo sobrante sin tarjeta kanji: ${extra}`);
    }
}

function validateLessonCoverage(dictionary) {
    const contentLessons = LESSONS.filter(lesson => !["recommended", "all"].includes(lesson.id));
    for (const item of dictionary) {
        if (!contentLessons.some(lesson => lesson.test(item))) {
            fail(`La tarjeta ${itemId(item)} no pertenece a ninguna lección de contenido`);
        }
    }
}

function kanaExampleTerms(dictionary) {
    return new Set(
        dictionary
            .filter(item => item.tipo !== "kanji")
            .map(item => item.palabra_ejemplo?.match(/-\s*([^)]*)\)/u)?.[1]?.trim())
            .filter(Boolean),
    );
}

async function validateLocales(dictionary) {
    const localeCodes = AVAILABLE_LANGUAGES.map(language => language.code);
    const kanjiIds = dictionary.filter(item => item.tipo === "kanji").map(itemId);
    const specialKanaIds = dictionary.filter(item => item.categoria === "especial").map(itemId);
    const categories = [...new Set(dictionary.map(item => item.categoria))];
    const types = [...new Set(dictionary.map(item => item.tipo))];
    const exampleTerms = kanaExampleTerms(dictionary);

    for (const code of localeCodes) {
        const locale = await readJSON(`../locales/${code}.json`);
        requireText(locale.meta?.htmlLang, `meta.htmlLang en ${code}`);
        requireText(locale.meta?.title, `meta.title en ${code}`);
        requireText(locale.ui?.languageLabel, `ui.languageLabel en ${code}`);

        for (const type of types) requireText(locale.types?.[type], `types.${type} en ${code}`);
        for (const category of categories) requireText(locale.categories?.[category], `categories.${category} en ${code}`);

        for (const lesson of LESSONS) {
            requireText(locale.lessons?.[lesson.id]?.title, `lessons.${lesson.id}.title en ${code}`);
            requireText(locale.lessons?.[lesson.id]?.description, `lessons.${lesson.id}.description en ${code}`);
        }

        for (const achievement of ACHIEVEMENT_DEFINITIONS) {
            requireText(readPath(locale, achievement.titleKey), `${achievement.titleKey} en ${code}`);
            requireText(readPath(locale, achievement.descriptionKey), `${achievement.descriptionKey} en ${code}`);
        }

        for (const id of [...kanjiIds, ...specialKanaIds]) {
            requireText(locale.cards?.[id]?.meaning, `cards.${id}.meaning en ${code}`);
            if (id.startsWith("kanji_")) {
                requireText(locale.cards?.[id]?.exampleMeaning, `cards.${id}.exampleMeaning en ${code}`);
                requireText(locale.cards?.[id]?.sentenceMeaning, `cards.${id}.sentenceMeaning en ${code}`);
            }
        }

        if (code !== "es") {
            for (const term of exampleTerms) requireText(locale.exampleTerms?.[term], `exampleTerms.${term} en ${code}`);
        }
    }
}

const rawData = await readFile(new URL("../datos.csv", import.meta.url), "utf8");
validateHeaders(rawData);
const dictionary = parseCSV(rawData);

validateRows(dictionary);
validateKanjiExamples(dictionary);
validateLessonCoverage(dictionary);
await validateLocales(dictionary);

note(`${dictionary.length} tarjetas validadas`);
note(`${dictionary.filter(item => item.tipo === "kanji").length} kanji con ejemplos completos`);
note(`${AVAILABLE_LANGUAGES.length} idiomas activos validados: ${AVAILABLE_LANGUAGES.map(language => language.code).join(", ")}`);

if (failures.length) {
    console.error("Validación de contenido falló:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    for (const message of notes) console.log(`✓ ${message}`);
}
