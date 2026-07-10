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
        .map(([, points]) => points);
}
