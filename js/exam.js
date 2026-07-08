import { LESSONS } from "./core.js";

export const QUESTION_TYPES = ["onyomi", "kanjiFromMeaning", "meaningFromKanji"];
export const OPTION_COUNT = 4;
export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 50;
export const DEFAULT_QUESTIONS = 10;

function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

/** Lessons that make sense as an exam topic: kanji-only, excludes kana and the "recommended"/"all" pseudo-lessons. */
export function kanjiLessons(lessons = LESSONS) {
    return lessons.filter(lesson => lesson.category && lesson.category !== "kana");
}

export function buildTopicPool(dictionary, { category, lessonId, lessons = LESSONS } = {}) {
    let pool = dictionary.filter(item => item.tipo === "kanji");
    if (category && category !== "todas") {
        pool = pool.filter(item => item.categoria === category);
    }
    if (lessonId && lessonId !== "all-in-category") {
        const lesson = lessons.find(candidate => candidate.id === lessonId);
        if (lesson) pool = pool.filter(lesson.test);
    }
    return pool;
}

function pickDistractorTexts(correctItem, pool, count, textOf, random) {
    const seen = new Set([textOf(correctItem)]);
    const candidates = shuffle(pool.filter(item => item !== correctItem), random);
    const result = [];
    for (const candidate of candidates) {
        const text = textOf(candidate);
        if (!text || text === "-" || seen.has(text)) continue;
        seen.add(text);
        result.push(text);
        if (result.length === count) break;
    }
    return result;
}

function pickDistractorCharacters(correctItem, pool, count, random) {
    const seen = new Set([correctItem.caracter]);
    const candidates = shuffle(pool.filter(item => item !== correctItem), random);
    const result = [];
    for (const candidate of candidates) {
        if (seen.has(candidate.caracter)) continue;
        seen.add(candidate.caracter);
        result.push(candidate.caracter);
        if (result.length === count) break;
    }
    return result;
}

/**
 * Builds one multiple-choice question about a kanji's meaning/onyomi — never
 * about strokes. `pool` is the user's chosen topic; `fullPool` (all kanji) is
 * the fallback used only when the topic is too small to supply distinct
 * distractors, so a narrow lesson never breaks question generation.
 */
export function buildQuestion(item, pool, type, fullPool, random = Math.random) {
    const distractorCount = OPTION_COUNT - 1;

    if (type === "onyomi") {
        const textOf = candidate => candidate.onyomi;
        const eligiblePool = pool.filter(candidate => candidate.onyomi && candidate.onyomi !== "-");
        let distractors = pickDistractorTexts(item, eligiblePool, distractorCount, textOf, random);
        if (distractors.length < distractorCount) {
            const fallback = fullPool.filter(candidate => candidate.onyomi && candidate.onyomi !== "-");
            distractors = pickDistractorTexts(item, fallback, distractorCount, textOf, random);
        }
        const options = shuffle([item.onyomi, ...distractors], random);
        return { type, character: item.caracter, prompt: item.caracter, options, correctIndex: options.indexOf(item.onyomi) };
    }

    if (type === "kanjiFromMeaning") {
        let distractors = pickDistractorCharacters(item, pool, distractorCount, random);
        if (distractors.length < distractorCount) {
            distractors = pickDistractorCharacters(item, fullPool, distractorCount, random);
        }
        const options = shuffle([item.caracter, ...distractors], random);
        return { type, character: item.caracter, prompt: item.significado, options, correctIndex: options.indexOf(item.caracter) };
    }

    const textOf = candidate => candidate.significado;
    let distractors = pickDistractorTexts(item, pool, distractorCount, textOf, random);
    if (distractors.length < distractorCount) {
        distractors = pickDistractorTexts(item, fullPool, distractorCount, textOf, random);
    }
    const options = shuffle([item.significado, ...distractors], random);
    return { type, character: item.caracter, prompt: item.caracter, options, correctIndex: options.indexOf(item.significado) };
}

/**
 * Generates a full exam from the (already-localized) dictionary. Question
 * count is clamped to [MIN_QUESTIONS, min(MAX_QUESTIONS, pool.length)] so a
 * narrow topic never fails — `actualCount` tells the caller if it adjusted.
 * Question types are assigned via least-used balancing (not pure random) so
 * a run of 10 questions doesn't end up all the same type by chance, while
 * still respecting eligibility (onyomi-less kanji never get an onyomi question).
 */
export function generateExam(dictionary, { category, lessonId, questionCount = DEFAULT_QUESTIONS, lessons = LESSONS, random = Math.random } = {}) {
    const pool = buildTopicPool(dictionary, { category, lessonId, lessons });
    const fullPool = dictionary.filter(item => item.tipo === "kanji");
    const effectivePool = pool.length ? pool : fullPool;

    const requestedCount = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.round(questionCount) || DEFAULT_QUESTIONS));
    const actualCount = Math.max(0, Math.min(requestedCount, effectivePool.length));

    const subjects = shuffle(effectivePool, random).slice(0, actualCount);
    const typeUsage = Object.fromEntries(QUESTION_TYPES.map(type => [type, 0]));

    const questions = subjects.map(item => {
        const eligibleTypes = QUESTION_TYPES.filter(
            type => type !== "onyomi" || (item.onyomi && item.onyomi !== "-"),
        );
        const minUsage = Math.min(...eligibleTypes.map(type => typeUsage[type]));
        const leastUsed = eligibleTypes.filter(type => typeUsage[type] === minUsage);
        const type = leastUsed[Math.floor(random() * leastUsed.length)];
        typeUsage[type] += 1;
        return buildQuestion(item, effectivePool, type, fullPool, random);
    });

    return { questions, poolSize: effectivePool.length, requestedCount, actualCount };
}

export function scoreExam(questions, answers) {
    let correct = 0;
    questions.forEach((question, index) => {
        if (answers[index] === question.correctIndex) correct += 1;
    });
    const total = questions.length;
    return { correct, total, score: total ? Math.round((correct / total) * 100) : 0 };
}

export function emptyExamStats() {
    return {
        examsTaken: 0,
        perfectScores: 0,
        bestScore: 0,
        categoriesAttempted: {},
    };
}

export function normalizeExamStats(stats = {}) {
    const normalized = { ...emptyExamStats(), ...stats };
    normalized.examsTaken = Math.max(0, Number(normalized.examsTaken) || 0);
    normalized.perfectScores = Math.max(0, Number(normalized.perfectScores) || 0);
    normalized.bestScore = Math.max(0, Number(normalized.bestScore) || 0);
    normalized.categoriesAttempted = normalized.categoriesAttempted && typeof normalized.categoriesAttempted === "object"
        ? Object.fromEntries(Object.entries(normalized.categoriesAttempted).filter(([, value]) => value))
        : {};
    return normalized;
}

/** Called once per finished exam — tracks the counters the achievement system reads from. */
export function recordExamResult(stats, { category, score }) {
    const normalized = normalizeExamStats(stats);
    return {
        examsTaken: normalized.examsTaken + 1,
        perfectScores: normalized.perfectScores + (score >= 100 ? 1 : 0),
        bestScore: Math.max(normalized.bestScore, score),
        categoriesAttempted: {
            ...normalized.categoriesAttempted,
            ...(category && category !== "todas" ? { [category]: true } : {}),
        },
    };
}
