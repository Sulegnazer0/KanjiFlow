import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseCSV } from "../js/core.js";
import { computeBoundingBox, normalizeStrokes, resampleStroke } from "../js/stroke-geometry.js";
import { samplePath } from "./lib/svg-path.mjs";

const ROOT = new URL("../", import.meta.url);
const DATA_PATH = new URL("datos.csv", ROOT);
const SVG_DIR = new URL("vendor/kanjivg-svg/", ROOT);
const OUTPUT_DIR = new URL("data/kanjivg/", ROOT);
const RESAMPLE_POINTS = 32;
const DENSE_SAMPLES_PER_CURVE = 24;
const LICENSE = "CC BY-SA 3.0 (KanjiVG, Ulrich Apel — https://kanjivg.tagaini.net/)";

const PATH_RE = /<path\b[^>]*\bid="kvg:[0-9a-f]+-s(\d+)"[^>]*\bd="([^"]+)"/g;

function codepointHex(character) {
    return character.codePointAt(0).toString(16).padStart(5, "0");
}

function extractStrokePaths(svg) {
    const strokes = [];
    let match;
    PATH_RE.lastIndex = 0;
    while ((match = PATH_RE.exec(svg))) {
        strokes.push({ order: Number(match[1]), d: match[2] });
    }
    strokes.sort((a, b) => a.order - b.order);
    return strokes;
}

async function buildKanji(item) {
    const hex = codepointHex(item.caracter);
    const svgPath = new URL(`${hex}.svg`, SVG_DIR);
    if (!existsSync(svgPath)) {
        throw new Error(`Falta vendor/kanjivg-svg/${hex}.svg para ${item.caracter} — corre npm run fetch:kanjivg`);
    }

    const svg = await readFile(svgPath, "utf8");
    const strokePaths = extractStrokePaths(svg);
    if (strokePaths.length === 0) {
        throw new Error(`No se encontraron trazos <path kvg:...-sN> en ${hex}.svg`);
    }

    const denseStrokes = strokePaths.map(stroke => samplePath(stroke.d, DENSE_SAMPLES_PER_CURVE));
    const bbox = computeBoundingBox(denseStrokes);
    const normalizedStrokes = normalizeStrokes(denseStrokes, bbox);
    const resampledStrokes = normalizedStrokes.map(stroke => resampleStroke(stroke, RESAMPLE_POINTS));

    const data = {
        character: item.caracter,
        codepoint: hex,
        source: "KanjiVG",
        license: LICENSE,
        strokeCount: resampledStrokes.length,
        strokes: resampledStrokes.map((points, index) => ({
            index,
            points: points.map(point => ({
                x: Math.round(point.x * 10000) / 10000,
                y: Math.round(point.y * 10000) / 10000,
            })),
        })),
    };

    await writeFile(new URL(`${hex}.json`, OUTPUT_DIR), JSON.stringify(data), "utf8");
    return { character: item.caracter, hex, strokeCount: data.strokeCount };
}

async function main() {
    const csv = await readFile(DATA_PATH, "utf8");
    const dictionary = parseCSV(csv);
    const n5Kanji = dictionary.filter(entry => entry.tipo === "kanji" && entry.categoria === "N5");

    if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

    const index = {};
    let built = 0;
    for (const item of n5Kanji) {
        const result = await buildKanji(item);
        index[result.character] = result.hex;
        built += 1;
    }

    await writeFile(new URL("index.json", OUTPUT_DIR), JSON.stringify(index), "utf8");
    console.log(`Generados ${built} archivos data/kanjivg/*.json + index.json`);
}

await main();
