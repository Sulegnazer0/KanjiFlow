const PATH_TAG_RE = /<path\b[^>]*\/>/g;
const CLIP_PATH_ATTR_RE = /clip-path="url\(#z\d+c(\d+)[a-z]?\)"/;
const D_ATTR_RE = /\bd="([^"]+)"/;

/**
 * AnimCJK's guide/animation paths are plain polylines: "M x,y x,y x,y ..."
 * (an initial moveto followed by implicit linetos) -- no curves to flatten.
 */
export function parsePolyline(d) {
    const cleaned = d.replace(/^\s*M\s*/, "").trim();
    return cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map(pair => {
            const [x, y] = pair.split(",").map(Number);
            return { x, y };
        });
}

function catmullRomPoint(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
}

/**
 * AnimCJK's guide polylines are sparse (as few as 3-4 points for a whole stroke) --
 * connecting them with straight segments looks polygonal/crude, unlike KanjiVG's dense
 * bezier sampling. Fits a Catmull-Rom spline through the existing points (which already
 * encode the correct path/direction, just coarsely) and densely resamples it, giving a
 * smooth curve that still passes through every original guide point.
 */
export function smoothPolyline(points, samplesPerSegment = 12) {
    if (points.length < 3) return points;
    const result = [];
    for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        for (let s = 0; s < samplesPerSegment; s += 1) {
            result.push(catmullRomPoint(p0, p1, p2, p3, s / samplesPerSegment));
        }
    }
    result.push(points[points.length - 1]);
    return result;
}

/**
 * Extracts one polyline per stroke, in stroke order. AnimCJK sometimes splits a single
 * visual stroke into overlapping fill pieces ("d2a"/"d2b"/"d2c" for stroke 2) so a
 * self-intersecting ink shape renders correctly -- their animation guide paths repeat the
 * SAME real points for every piece, except the non-"a" pieces prefix them with an
 * off-canvas lead-in (coordinates far outside the 0-1024 viewBox) purely for their reveal
 * timing. Since stroke numbers appear in increasing order and the "a" (or unsuffixed)
 * piece always appears first for a given number, keeping only the first occurrence per
 * stroke number gives the real on-canvas path and skips the off-canvas duplicates.
 */
export function extractStrokePolylines(svg) {
    const tags = svg.match(PATH_TAG_RE) || [];
    const byStroke = new Map();
    for (const tag of tags) {
        const clipMatch = tag.match(CLIP_PATH_ATTR_RE);
        if (!clipMatch) continue;
        const strokeNumber = Number(clipMatch[1]);
        if (byStroke.has(strokeNumber)) continue;
        const dMatch = tag.match(D_ATTR_RE);
        if (!dMatch) continue;
        byStroke.set(strokeNumber, parsePolyline(dMatch[1]));
    }
    return [...byStroke.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, points]) => smoothPolyline(points));
}
