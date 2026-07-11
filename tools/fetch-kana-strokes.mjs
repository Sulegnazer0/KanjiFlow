import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseCSV } from "../js/core.js";

const ROOT = new URL("../", import.meta.url);
const DATA_PATH = new URL("datos.csv", ROOT);
const OUTPUT_DIR = new URL("vendor/animcjk-kana-svg/", ROOT);
const BASE_URL = "https://raw.githubusercontent.com/parsimonhi/animCJK/master/svgsJaKana/";

const LICENSE_TEXT = `Datos de trazos: AnimCJK (https://github.com/parsimonhi/animCJK)
Copyright (C) 2016-2026 FM-SH.
Los archivos SVG de kana (carpeta svgsJaKana del repositorio original) se
distribuyen bajo la GNU Lesser General Public License (LGPL), version 3 o
posterior (https://www.gnu.org/licenses/lgpl-3.0.html) -- el propio proyecto
aclara que estos archivos de kana NO se derivan de fuentes Arphic, por lo que
no les aplica la licencia Arphic que sí cubre sus archivos de kanji/hanzi.

Estos archivos SVG son una copia sin modificar de los ficheros
"svgsJaKana/<codepoint decimal>.svg" del repositorio original, filtrados a los
caracteres de hiragana/katakana usados en este proyecto. Cualquier dato
derivado de estos archivos (por ejemplo data/kana-strokes/*.json) conserva la
misma licencia LGPL.
`;

function codepointDecimal(character) {
    return character.codePointAt(0).toString(10);
}

async function main() {
    const csv = await readFile(DATA_PATH, "utf8");
    const dictionary = parseCSV(csv);
    const supportedKana = dictionary.filter(item => item.tipo === "hiragana" || item.tipo === "katakana");

    if (supportedKana.length === 0) {
        console.error("No se encontraron hiragana/katakana en datos.csv");
        process.exit(1);
    }

    if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

    // 拗音 combinations (きゃ, キャ, ...) are two Unicode characters in one `caracter` field --
    // fetch each individual character (base + small kana) so the build step can compose them,
    // since AnimCJK only has files for single codepoints.
    const individualChars = new Set();
    for (const item of supportedKana) {
        for (const char of item.caracter) individualChars.add(char);
    }
    console.log(`Descargando ${individualChars.size} SVG de AnimCJK (kana, incluye componentes de combinaciones)...`);

    let downloaded = 0;
    let skipped = 0;
    const failures = [];

    for (const char of individualChars) {
        const decimal = codepointDecimal(char);
        const fileName = `${decimal}.svg`;
        const outputPath = new URL(fileName, OUTPUT_DIR);

        if (existsSync(outputPath)) {
            skipped += 1;
            continue;
        }

        const response = await fetch(`${BASE_URL}${fileName}`);
        if (!response.ok) {
            failures.push({ character: char, decimal, status: response.status });
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
