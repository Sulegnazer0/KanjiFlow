const EPSILON = 1e-6;

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

export function pathLength(points) {
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
        total += distance(points[index - 1], points[index]);
    }
    return total;
}

export function resampleStroke(points, count) {
    if (!points || points.length === 0) return [];
    if (points.length === 1 || count <= 1) {
        return Array.from({ length: Math.max(count, 1) }, () => ({ ...points[0] }));
    }

    const cumulative = [0];
    for (let index = 1; index < points.length; index += 1) {
        cumulative.push(cumulative[index - 1] + distance(points[index - 1], points[index]));
    }
    const total = cumulative[cumulative.length - 1];

    if (total < EPSILON) {
        return Array.from({ length: count }, () => ({ ...points[0] }));
    }

    const result = [];
    let segment = 0;
    for (let step = 0; step < count; step += 1) {
        const targetDistance = (total * step) / (count - 1);
        while (segment < cumulative.length - 2 && cumulative[segment + 1] < targetDistance) {
            segment += 1;
        }
        const segmentStart = cumulative[segment];
        const segmentEnd = cumulative[segment + 1];
        const segmentLength = segmentEnd - segmentStart;
        const ratio = segmentLength < EPSILON ? 0 : (targetDistance - segmentStart) / segmentLength;
        const from = points[segment];
        const to = points[segment + 1];
        result.push({
            x: from.x + (to.x - from.x) * ratio,
            y: from.y + (to.y - from.y) * ratio,
        });
    }
    return result;
}

export function computeBoundingBox(strokes) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const stroke of strokes) {
        for (const point of stroke) {
            if (point.x < minX) minX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.x > maxX) maxX = point.x;
            if (point.y > maxY) maxY = point.y;
        }
    }

    if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    return { minX, minY, maxX, maxY };
}

export function normalizePoint(point, bbox) {
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    const span = Math.max(width, height, EPSILON);
    const offsetX = (span - width) / 2;
    const offsetY = (span - height) / 2;
    return {
        x: (point.x - bbox.minX + offsetX) / span,
        y: (point.y - bbox.minY + offsetY) / span,
    };
}

export function normalizeStrokes(strokes, bbox = computeBoundingBox(strokes)) {
    return strokes.map(stroke => stroke.map(point => normalizePoint(point, bbox)));
}

// Escala a la que los trazos KanjiVG ocupan el lienzo (0.8 = 80%, con 10% de margen por
// lado): algunos trazos llegan justo al borde del viewBox de KanjiVG y se veían cortados
// al dibujarlos a escala 1 (borde a borde). La guía visual (stroke-animation.js) y la
// normalización usada para calificar en vivo (handleStrokeEnd en app.js) comparten esta
// MISMA escala — si se cambia solo en un lado, se reintroduce el desalineamiento entre lo
// que se ve y lo que se evalúa.
export const PRACTICE_CANVAS_SCALE = 0.8;

export function toCanvasPoint(point, canvasWidth, canvasHeight, scale = PRACTICE_CANVAS_SCALE) {
    const margin = (1 - scale) / 2;
    return {
        x: (margin + point.x * scale) * canvasWidth,
        y: (margin + point.y * scale) * canvasHeight,
    };
}

export function fromCanvasPoint(point, canvasWidth, canvasHeight, scale = PRACTICE_CANVAS_SCALE) {
    const margin = (1 - scale) / 2;
    return {
        x: (point.x / canvasWidth - margin) / scale,
        y: (point.y / canvasHeight - margin) / scale,
    };
}
