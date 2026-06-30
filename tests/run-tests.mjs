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

for (const item of dictionary.filter(item => item.tipo === "kanji")) {
    assert.ok(KANJI_EXAMPLES[item.caracter], `Falta ejemplo para ${item.caracter}`);
    assert.ok(/[\u3040-\u30ff\u3400-\u9fff]/.test(item.kunyomi) || item.kunyomi === "-", `Kunyomi no japonés: ${item.caracter}`);
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
