import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseCSV } from "../js/core.js";
import { computeBoundingBox, normalizeStrokes, resampleStroke } from "../js/stroke-geometry.js";
import { extractStrokePolylines } from "./lib/animcjk-path.mjs";

const ROOT = new URL("../", import.meta.url);
const DATA_PATH = new URL("datos.csv", ROOT);
const SVG_DIR = new URL("vendor/animcjk-kana-svg/", ROOT);
const OUTPUT_DIR = new URL("data/kana-strokes/", ROOT);
const RESAMPLE_POINTS = 32;
const LICENSE = "LGPL (AnimCJK, FM-SH — https://github.com/parsimonhi/animCJK)";
const VIEWBOX_MARGIN = 100; // generous slack around AnimCJK's 0-1024 viewBox for the off-canvas sanity check

// 拗音 (youon) combinations like きゃ are written with the small kana in the bottom-right
// quadrant of the same character cell as the base kana, per standard genkouyoushi
// convention -- not as two side-by-side full-size characters.
const SMALL_KANA_SCALE = 0.55;
const SMALL_KANA_OFFSET = 1 - SMALL_KANA_SCALE;

function codepointDecimal(character) {
    return character.codePointAt(0).toString(10);
}

function assertOnCanvas(strokes, label) {
    for (const stroke of strokes) {
        for (const point of stroke) {
            if (point.x < -VIEWBOX_MARGIN || point.x > 1024 + VIEWBOX_MARGIN || point.y < -VIEWBOX_MARGIN || point.y > 1024 + VIEWBOX_MARGIN) {
                throw new Error(
                    `${label} tiene un punto fuera de lienzo (${point.x}, ${point.y}) -- ` +
                    "probablemente se coló una variante 'b'/'c' fuera de pantalla en vez de la real. Revisar extractStrokePolylines.",
                );
            }
        }
    }
}

async function loadRawStrokes(character) {
    const decimal = codepointDecimal(character);
    const svgPath = new URL(`${decimal}.svg`, SVG_DIR);
    if (!existsSync(svgPath)) {
        throw new Error(`Falta vendor/animcjk-kana-svg/${decimal}.svg para ${character} — corre npm run fetch:kana`);
    }
    const svg = await readFile(svgPath, "utf8");
    const strokes = extractStrokePolylines(svg);
    if (strokes.length === 0) throw new Error(`No se encontraron trazos en ${decimal}.svg (${character})`);
    assertOnCanvas(strokes, `${character} (${decimal}.svg)`);
    return strokes;
}

function normalizedStrokesFor(rawStrokes) {
    const bbox = computeBoundingBox(rawStrokes);
    return normalizeStrokes(rawStrokes, bbox);
}

async function buildSingle(character) {
    const rawStrokes = await loadRawStrokes(character);
    return normalizedStrokesFor(rawStrokes);
}

async function buildCombo(fullCharacter) {
    const [baseChar, smallChar] = [...fullCharacter];
    const baseStrokes = normalizedStrokesFor(await loadRawStrokes(baseChar));
    const smallStrokesRaw = normalizedStrokesFor(await loadRawStrokes(smallChar));
    const smallStrokesPlaced = smallStrokesRaw.map(stroke =>
        stroke.map(point => ({
            x: point.x * SMALL_KANA_SCALE + SMALL_KANA_OFFSET,
            y: point.y * SMALL_KANA_SCALE + SMALL_KANA_OFFSET,
        })),
    );
    // Base kana is written first, then the small kana -- keep that stroke order.
    return [...baseStrokes, ...smallStrokesPlaced];
}

async function buildKana(item) {
    const isCombo = [...item.caracter].length > 1;
    const normalizedStrokes = isCombo ? await buildCombo(item.caracter) : await buildSingle(item.caracter);
    const resampledStrokes = normalizedStrokes.map(stroke => resampleStroke(stroke, RESAMPLE_POINTS));

    const decimal = [...item.caracter].map(char => char.codePointAt(0)).join("-");
    const data = {
        character: item.caracter,
        codepoint: decimal,
        source: "AnimCJK",
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

    await writeFile(new URL(`${decimal}.json`, OUTPUT_DIR), JSON.stringify(data), "utf8");
    return { character: item.caracter, decimal, strokeCount: data.strokeCount };
}

async function main() {
    const csv = await readFile(DATA_PATH, "utf8");
    const dictionary = parseCSV(csv);
    const supportedKana = dictionary.filter(entry => entry.tipo === "hiragana" || entry.tipo === "katakana");
    const uniqueKana = [...new Map(supportedKana.map(item => [item.caracter, item])).values()];

    if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

    const index = {};
    let built = 0;
    for (const item of uniqueKana) {
        const result = await buildKana(item);
        index[result.character] = result.decimal;
        built += 1;
    }

    await writeFile(new URL("index.json", OUTPUT_DIR), JSON.stringify(index), "utf8");
    console.log(`Generados ${built} archivos data/kana-strokes/*.json + index.json`);
}

await main();
