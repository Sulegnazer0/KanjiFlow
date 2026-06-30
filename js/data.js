import { parseCSV } from "./core.js";
import { KANJI_EXAMPLES } from "./kanji-examples.js";

export async function loadDictionary() {
    const response = await fetch("datos.csv");
    if (!response.ok) {
        throw new Error(`No se pudo cargar datos.csv (${response.status}).`);
    }
    const text = await response.text();
    return parseCSV(text).map(item => ({
        ...item,
        tipo: item.tipo.toLocaleLowerCase("es"),
        example: KANJI_EXAMPLES[item.caracter] ?? null,
    }));
}
