import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseCSV } from "../js/core.js";

const ROOT = new URL("../", import.meta.url);
const DATA_PATH = new URL("datos.csv", ROOT);
const EXTRA_PATH = new URL("tools/stroke-font-extra.txt", ROOT);
const INPUT_FONT = "KanjiStrokeOrders.ttf";
const OUTPUT_FONT = "KanjiStrokeOrders.woff";
const LOCAL_FONTTOOLS = path.join(process.cwd(), ".codex-fonttools");

function addCharacters(target, text) {
    for (const character of text || "") {
        if (!/\s/u.test(character)) target.add(character);
    }
}

async function readExtraCharacters() {
    if (!existsSync(EXTRA_PATH)) return "";
    const raw = await readFile(EXTRA_PATH, "utf8");
    return raw
        .split(/\r?\n/u)
        .map(line => line.replace(/#.*/u, "").trim())
        .join("");
}

function fontToolsEnvironment() {
    if (!existsSync(LOCAL_FONTTOOLS)) return process.env;
    return {
        ...process.env,
        PYTHONPATH: [LOCAL_FONTTOOLS, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),
    };
}

const dictionary = parseCSV(await readFile(DATA_PATH, "utf8"));
const characters = new Set();

for (const item of dictionary) addCharacters(characters, item.caracter);
addCharacters(characters, await readExtraCharacters());

const textFile = path.join(tmpdir(), "kanjiflow-stroke-chars.txt");
await writeFile(textFile, [...characters].sort().join(""), "utf8");

const python = process.env.PYTHON || "python";
const args = [
    "-m",
    "fontTools.subset",
    INPUT_FONT,
    `--output-file=${OUTPUT_FONT}`,
    "--flavor=woff",
    `--text-file=${textFile}`,
    "--layout-features=*",
    "--glyph-names",
    "--symbol-cmap",
    "--legacy-cmap",
    "--notdef-glyph",
    "--notdef-outline",
    "--recommended-glyphs",
    "--name-IDs=*",
    "--name-legacy",
    "--name-languages=*",
];

console.log(`Generando ${OUTPUT_FONT} con ${characters.size} caracteres...`);

const result = spawnSync(python, args, {
    env: fontToolsEnvironment(),
    shell: false,
    stdio: "inherit",
});

if (result.status !== 0) {
    console.error("\nNo se pudo ejecutar fontTools.");
    console.error("Instala la dependencia con:");
    console.error("python -m pip install fonttools brotli");
    process.exit(result.status || 1);
}

console.log(`${OUTPUT_FONT} actualizado.`);
