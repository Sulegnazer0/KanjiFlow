import { computeBoundingBox, normalizeStrokes, resampleStroke } from "./stroke-geometry.js";

export const RESAMPLE_POINTS = 32;
export const MAX_POINT_DISTANCE = 0.35;
export const MIN_STROKE_POINTS = 3;
export const GREEN_THRESHOLD = 0.75;
export const YELLOW_THRESHOLD = 0.5;

function averageDistance(pointsA, pointsB) {
    let total = 0;
    for (let index = 0; index < pointsA.length; index += 1) {
        total += Math.hypot(pointsA[index].x - pointsB[index].x, pointsA[index].y - pointsB[index].y);
    }
    return total / pointsA.length;
}

/**
 * Compares one user-drawn stroke (already resampled+normalized to
 * RESAMPLE_POINTS in [0,1]) against the expected KanjiVG stroke.
 * Returns a similarity in [0,1]. Direction matters: a stroke drawn
 * backwards is a real kanji mistake, not a recognizer quirk to smooth over.
 */
export function compareStroke(userPoints, expectedPoints) {
    const distance = averageDistance(userPoints, expectedPoints);
    return Math.min(1, Math.max(0, 1 - distance / MAX_POINT_DISTANCE));
}

export function similarityColor(score) {
    if (score >= GREEN_THRESHOLD) return "green";
    if (score >= YELLOW_THRESHOLD) return "yellow";
    return "red";
}

/**
 * Scores a full attempt: user strokes are normalized together (so scale/
 * position on the canvas don't matter, only relative shape) and compared
 * stroke-by-stroke, in order, against the expected KanjiVG strokes. Drawing
 * more or fewer strokes than expected always lowers the score instead of
 * throwing, via a multiplicative count penalty.
 */
export function scoreAttempt(userStrokes, expectedStrokes) {
    if (userStrokes.length === 0 || expectedStrokes.length === 0) {
        return { score: 0, strokeScores: [] };
    }

    const rawUserPoints = userStrokes.map(stroke => stroke.map(point => ({ x: point.x, y: point.y })));
    const bbox = computeBoundingBox(rawUserPoints);
    const normalizedUserStrokes = normalizeStrokes(rawUserPoints, bbox).map(stroke =>
        resampleStroke(stroke, RESAMPLE_POINTS),
    );

    const pairCount = Math.min(normalizedUserStrokes.length, expectedStrokes.length);
    const strokeScores = [];
    for (let index = 0; index < pairCount; index += 1) {
        const isDegenerate = rawUserPoints[index].length < MIN_STROKE_POINTS;
        strokeScores.push(
            isDegenerate ? 0 : compareStroke(normalizedUserStrokes[index], expectedStrokes[index].points),
        );
    }

    const averageSimilarity = strokeScores.reduce((sum, value) => sum + value, 0) / pairCount;
    const countPenalty =
        Math.min(normalizedUserStrokes.length, expectedStrokes.length) /
        Math.max(normalizedUserStrokes.length, expectedStrokes.length);

    return {
        score: Math.round(averageSimilarity * countPenalty * 100),
        strokeScores,
    };
}
