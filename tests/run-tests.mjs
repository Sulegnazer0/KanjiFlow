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
    for (const lessonId of ["recommended", "hira-basic-1", "kata-basic-1", "kana-special", "kanji-4", "all"]) {
        assert.ok(locale.lessons?.[lessonId]?.title, `Falta título ${lessonId} en ${code}`);
        assert.ok(locale.lessons?.[lessonId]?.description, `Falta descripción ${lessonId} en ${code}`);
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

console.log("✓ Parser CSV con campos entrecomillados");
console.log("✓ Programación de repetición espaciada");
console.log("✓ Datos únicos y 80 ejemplos de kanji");
console.log("✓ Currículo y estadísticas de progreso");
console.log("✓ Locales ES/EN/DE completos para kanji y kana especial");
