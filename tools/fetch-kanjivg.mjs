import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseCSV } from "../js/core.js";

const ROOT = new URL("../", import.meta.url);
const DATA_PATH = new URL("datos.csv", ROOT);
const OUTPUT_DIR = new URL("vendor/kanjivg-svg/", ROOT);
const BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const SUPPORTED_LEVELS = new Set(["N5", "N4", "N3", "N2"]);

const LICENSE_TEXT = `Datos de trazos: KanjiVG (https://kanjivg.tagaini.net/)
Copyright (C) Ulrich Apel.
Distribuido bajo los términos de la licencia Creative Commons
Attribution-Share Alike 3.0 (https://creativecommons.org/licenses/by-sa/3.0/).

Estos archivos SVG son una copia sin modificar de los ficheros "kanji/0XXXX.svg"
del repositorio https://github.com/KanjiVG/kanjivg, filtrados a los caracteres
kanji de nivel N5/N4/N3/N2 usados en este proyecto. Cualquier dato derivado de estos
archivos (por ejemplo data/kanjivg/*.json) conserva la misma licencia.
`;

function codepointHex(character) {
    return character.codePointAt(0).toString(16).padStart(5, "0");
}

async function main() {
    const csv = await readFile(DATA_PATH, "utf8");
    const dictionary = parseCSV(csv);
    const supportedKanji = dictionary.filter(item => item.tipo === "kanji" && SUPPORTED_LEVELS.has(item.categoria));

    if (supportedKanji.length === 0) {
        console.error("No se encontraron kanji N5/N4/N3/N2 en datos.csv");
        process.exit(1);
    }

    if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

    console.log(`Descargando ${supportedKanji.length} SVG de KanjiVG (kanji N5/N4/N3/N2)...`);

    let downloaded = 0;
    let skipped = 0;
    const failures = [];

    for (const item of supportedKanji) {
        const hex = codepointHex(item.caracter);
        const fileName = `${hex}.svg`;
        const outputPath = new URL(fileName, OUTPUT_DIR);

        if (existsSync(outputPath)) {
            skipped += 1;
            continue;
        }

        const response = await fetch(`${BASE_URL}${fileName}`);
        if (!response.ok) {
            failures.push({ character: item.caracter, hex, status: response.status });
            continue;
        }

        const svg = await response.text();
        await writeFile(outputPath, svg, "utf8");
        downloaded += 1;
    }

    await writeFile(new URL("LICENSE", OUTPUT_DIR), LICENSE_TEXT, "utf8");

    console.log(`Descargados: ${downloaded}, ya existentes: ${skipped}, fallidos: ${failures.length}`);
    if (failures.length > 0) {
        console.error("No se pudieron descargar:", failures);
        process.exit(1);
    }
}

await main();
