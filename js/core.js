const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export const LESSONS = [
    {
        id: "recommended",
        title: "Siguiente lección recomendada",
        description: "Avanza en orden. La app elige la primera lección que todavía no dominas.",
        test: () => true,
    },
    {
        id: "hira-basic-1",
        title: "1. Hiragana: vocales y K/S",
        description: "Empieza con あいうえお y las filas K y S.",
        test: item => item.tipo === "hiragana" && /^(a|i|u|e|o|ka|ki|ku|ke|ko|sa|shi|su|se|so)$/.test(item.romaji),
    },
    {
        id: "hira-basic-2",
        title: "2. Hiragana: T/N/H",
        description: "Continúa con las filas T, N y H.",
        test: item => item.tipo === "hiragana" && /^(ta|chi|tsu|te|to|na|ni|nu|ne|no|ha|hi|fu|he|ho)$/.test(item.romaji),
    },
    {
        id: "hira-basic-3",
        title: "3. Hiragana: M/Y/R/W",
        description: "Completa el gojūon básico y la ん.",
        test: item => item.tipo === "hiragana" && /^(ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|n)$/.test(item.romaji),
    },
    {
        id: "hira-voiced",
        title: "4. Hiragana con dakuten",
        description: "Practica los sonidos G, Z, D, B y P.",
        test: item => item.tipo === "hiragana" && item.caracter.length === 1 && /^(g|z|d|b|p|ji|zu)/.test(item.romaji),
    },
    {
        id: "hira-combinations",
        title: "5. Hiragana combinado",
        description: "Sonidos con ゃ・ゅ・ょ pequeños: きゃ, しゅ, ちょ…",
        test: item => item.tipo === "hiragana" && item.caracter.length > 1 && item.categoria !== "especial",
    },
    {
        id: "kata-basic-1",
        title: "6. Katakana: vocales y K/S",
        description: "Aprende las formas katakana de las primeras filas.",
        test: item => item.tipo === "katakana" && /^(a|i|u|e|o|ka|ki|ku|ke|ko|sa|shi|su|se|so)$/.test(item.romaji),
    },
    {
        id: "kata-basic-2",
        title: "7. Katakana: T/N/H",
        description: "Continúa con las filas T, N y H.",
        test: item => item.tipo === "katakana" && /^(ta|chi|tsu|te|to|na|ni|nu|ne|no|ha|hi|fu|he|ho)$/.test(item.romaji),
    },
    {
        id: "kata-basic-3",
        title: "8. Katakana: M/Y/R/W",
        description: "Completa el silabario katakana básico.",
        test: item => item.tipo === "katakana" && /^(ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|n)$/.test(item.romaji),
    },
    {
        id: "kata-voiced",
        title: "9. Katakana con dakuten",
        description: "Practica los sonidos G, Z, D, B y P en katakana.",
        test: item => item.tipo === "katakana" && item.caracter.length === 1 && /^(g|z|d|b|p|ji|zu)/.test(item.romaji),
    },
    {
        id: "kata-combinations",
        title: "10. Katakana combinado",
        description: "Combinaciones frecuentes en palabras extranjeras.",
        test: item => item.tipo === "katakana" && item.caracter.length > 1 && item.categoria !== "especial",
    },
    {
        id: "kana-special",
        title: "11. Reglas especiales de kana",
        description: "っ/ッ duplican consonantes; ー alarga vocales y ヴ representa el sonido «v».",
        test: item => item.categoria === "especial",
    },
    {
        id: "kanji-1",
        title: "12. Kanji: números y calendario",
        description: "Números, dinero, días y elementos básicos.",
        test: item => item.tipo === "kanji" && Number(item.id_jlpt) <= 21,
    },
    {
        id: "kanji-2",
        title: "13. Kanji: personas y escuela",
        description: "Personas, tamaños, escuela y conceptos cotidianos.",
        test: item => item.tipo === "kanji" && Number(item.id_jlpt) >= 22 && Number(item.id_jlpt) <= 40,
    },
    {
        id: "kanji-3",
        title: "14. Kanji: dirección y movimiento",
        description: "Puntos cardinales, posiciones, tiempo y acciones comunes.",
        test: item => item.tipo === "kanji" && Number(item.id_jlpt) >= 41 && Number(item.id_jlpt) <= 64,
    },
    {
        id: "kanji-4",
        title: "15. Kanji: vida diaria",
        description: "Cuerpo, colores, cantidades y vocabulario cotidiano.",
        test: item => item.tipo === "kanji" && Number(item.id_jlpt) >= 65 && Number(item.id_jlpt) <= 80,
    },
    {
        id: "kanji-n4-1",
        title: "16. Kanji N4: sociedad y acciones",
        description: "Reuniones, lugares, trabajo, preguntas y acciones frecuentes.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 81 && Number(item.id_jlpt) <= 100,
    },
    {
        id: "kanji-n4-2",
        title: "17. Kanji N4: vida diaria y pensamiento",
        description: "Casa, hábitos, comunicación, pensamiento y acciones de rutina.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 101 && Number(item.id_jlpt) <= 120,
    },
    {
        id: "kanji-n4-3",
        title: "18. Kanji N4: movimiento y acciones prácticas",
        description: "Distancias, transporte, préstamos, envíos, reuniones e inicio o cierre de actividades.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 121 && Number(item.id_jlpt) <= 140,
    },
    {
        id: "kanji-n4-4",
        title: "19. Kanji N4: ciudad y servicios",
        description: "Lugares, tiendas, estaciones, salud, viajes y objetos cotidianos.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 141 && Number(item.id_jlpt) <= 160,
    },
    {
        id: "kanji-n4-5",
        title: "20. Kanji N4: ideas y entorno",
        description: "Conceptos, cuerpo, mundo, naturaleza, tiempo, acciones y lugares de uso frecuente.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 161 && Number(item.id_jlpt) <= 200,
    },
    {
        id: "kanji-n4-final",
        title: "21. Kanji N4: cierre de nivel",
        description: "Últimos kanji N4 de la referencia: familia, clima, estaciones, comida, animales, colores y estudio.",
        test: item => item.tipo === "kanji" && item.categoria === "N4" && Number(item.id_jlpt) >= 201 && Number(item.id_jlpt) <= 250,
    },
    {
        id: "kanji-n3-1",
        title: "22. Kanji N3: sociedad y decisiones",
        description: "Política, sociedad, relaciones, decisiones y conceptos abstractos de nivel N3.",
        test: item => item.tipo === "kanji" && item.categoria === "N3" && Number(item.id_jlpt) >= 251 && Number(item.id_jlpt) <= 270,
    },
    {
        id: "all",
        title: "Todo el contenido",
        description: "Mezcla libre de todos los caracteres disponibles.",
        test: () => true,
    },
];

export function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"') {
            if (quoted && next === '"') {
                field += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (char === "," && !quoted) {
            row.push(field.trim());
            field = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && next === "\n") index += 1;
            row.push(field.trim());
            field = "";
            if (row.some(value => value !== "")) rows.push(row);
            row = [];
        } else {
            field += char;
        }
    }

    if (field !== "" || row.length > 0) {
        row.push(field.trim());
        if (row.some(value => value !== "")) rows.push(row);
    }

    if (rows.length < 2) return [];
    const headers = rows[0];
    return rows.slice(1).map(values =>
        Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    );
}

export function itemId(item) {
    return `${item.tipo}_${item.caracter}`;
}

export function normalizeSearch(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .trim();
}

export function emptyReviewRecord() {
    return {
        repetitions: 0,
        intervalDays: 0,
        ease: 2.5,
        dueAt: 0,
        lastReviewedAt: 0,
        correct: 0,
        incorrect: 0,
        streak: 0,
        bestStreak: 0,
        lapses: 0,
        lastRating: "",
    };
}

export function normalizeReviewRecord(record = {}) {
    const normalized = { ...emptyReviewRecord(), ...record };
    for (const key of [
        "repetitions", "intervalDays", "ease", "dueAt", "lastReviewedAt",
        "correct", "incorrect", "streak", "bestStreak", "lapses",
    ]) {
        normalized[key] = Number(normalized[key]) || 0;
    }
    normalized.ease = Math.max(1.3, normalized.ease || 2.5);
    return normalized;
}

export function scheduleReview(record, rating, now = Date.now()) {
    const next = normalizeReviewRecord(record);
    next.lastReviewedAt = now;
    next.lastRating = rating;

    if (rating === "again") {
        next.repetitions = 0;
        next.intervalDays = 0;
        next.ease = Math.max(1.3, next.ease - 0.2);
        next.dueAt = now + MINUTE_MS;
        next.incorrect += 1;
        next.lapses += 1;
        next.streak = 0;
    } else {
        next.correct += 1;
        next.repetitions += 1;
        next.streak += 1;
        next.bestStreak = Math.max(next.bestStreak, next.streak);

        if (rating === "hard") {
            next.ease = Math.max(1.3, next.ease - 0.15);
            next.intervalDays = next.intervalDays < 1 ? 0.25 : Math.max(1, next.intervalDays * 1.2);
        } else if (rating === "good") {
            if (next.repetitions === 1) next.intervalDays = 1;
            else if (next.repetitions === 2) next.intervalDays = 3;
            else next.intervalDays = Math.max(1, next.intervalDays * next.ease);
        } else if (rating === "easy") {
            next.ease += 0.15;
            if (next.repetitions === 1) next.intervalDays = 4;
            else next.intervalDays = Math.max(4, next.intervalDays * next.ease * 1.3);
        }

        next.intervalDays = Math.round(next.intervalDays * 100) / 100;
        next.dueAt = now + next.intervalDays * DAY_MS;
    }

    return next;
}

export function isNew(record) {
    return !record || !normalizeReviewRecord(record).lastReviewedAt;
}

export function isDue(record, now = Date.now()) {
    if (isNew(record)) return false;
    return normalizeReviewRecord(record).dueAt <= now;
}

export function isMastered(record) {
    if (isNew(record)) return false;
    const value = normalizeReviewRecord(record);
    return value.repetitions >= 4 && value.intervalDays >= 14 && value.streak >= 3;
}

export function cardState(record, now = Date.now()) {
    if (isNew(record)) return "Nueva";
    if (isDue(record, now)) return "Por repasar";
    if (isMastered(record)) return "Dominada";
    return "Aprendiendo";
}

export function chooseRecommendedLesson(items, progress) {
    const orderedLessons = LESSONS.filter(lesson =>
        !["recommended", "all"].includes(lesson.id),
    );
    for (const lesson of orderedLessons) {
        const lessonItems = items.filter(lesson.test);
        if (!lessonItems.length) continue;
        const mastered = lessonItems.filter(item => isMastered(progress[itemId(item)])).length;
        if (mastered / lessonItems.length < 0.8) return lesson;
    }
    return LESSONS.find(lesson => lesson.id === "all");
}

export function filterLesson(items, lessonId, progress = {}) {
    let lesson = LESSONS.find(candidate => candidate.id === lessonId);
    if (!lesson || lesson.id === "recommended") {
        lesson = chooseRecommendedLesson(items, progress);
    }
    return {
        lesson,
        items: items.filter(lesson.test),
    };
}

export function filterBySession(items, mode, progress, favorites, now = Date.now()) {
    if (mode === "repasar") return items.filter(item => isDue(progress[itemId(item)], now));
    if (mode === "nuevas") return items.filter(item => isNew(progress[itemId(item)]));
    if (mode === "aprendiendo") {
        return items.filter(item => !isNew(progress[itemId(item)]) && !isMastered(progress[itemId(item)]));
    }
    if (mode === "dominadas") return items.filter(item => isMastered(progress[itemId(item)]));
    if (mode === "favoritos") return items.filter(item => favorites[itemId(item)]);
    if (mode === "recomendado") {
        const due = items.filter(item => isDue(progress[itemId(item)], now));
        if (due.length) return due;
        const newItems = items.filter(item => isNew(progress[itemId(item)]));
        if (newItems.length) return newItems;
        return items.filter(item => !isMastered(progress[itemId(item)]));
    }
    return items;
}

export function chooseNext(items, previousId, progress, now = Date.now()) {
    if (!items.length) return null;
    const candidates = items.length > 1
        ? items.filter(item => itemId(item) !== previousId)
        : items;
    const due = candidates.filter(item => isDue(progress[itemId(item)], now));
    const pool = due.length ? due : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function progressStats(items, progress, now = Date.now()) {
    const records = items.map(item => progress[itemId(item)]);
    const newCount = records.filter(isNew).length;
    const dueCount = records.filter(record => isDue(record, now)).length;
    const masteredCount = records.filter(isMastered).length;
    const bestStreak = records.reduce(
        (maximum, record) => Math.max(maximum, normalizeReviewRecord(record).bestStreak),
        0,
    );
    return {
        total: items.length,
        newCount,
        dueCount,
        masteredCount,
        bestStreak,
        percent: items.length ? Math.round((masteredCount / items.length) * 100) : 0,
    };
}

export function timeUntil(timestamp, now = Date.now()) {
    const difference = Math.max(0, timestamp - now);
    if (difference < 2 * MINUTE_MS) return "en 1 min";
    if (difference < DAY_MS) return `en ${Math.ceil(difference / (60 * MINUTE_MS))} h`;
    return `en ${Math.ceil(difference / DAY_MS)} d`;
}
