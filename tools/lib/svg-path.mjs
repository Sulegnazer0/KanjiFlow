const TOKEN_RE = /[MCSLmcsl]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g;

function tokenize(d) {
    return d.match(TOKEN_RE) || [];
}

function cubicPoint(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const c = 3 * mt * t * t;
    const e = t * t * t;
    return {
        x: a * p0.x + b * p1.x + c * p2.x + e * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + e * p3.y,
    };
}

const SMOOTH_PREDECESSORS = new Set(["C", "c", "S", "s"]);

/**
 * Interprets an SVG path `d` attribute restricted to the commands KanjiVG
 * actually emits (M, C, S, and their lowercase relative forms) and returns
 * a dense polyline sampling every cubic Bézier segment.
 */
export function samplePath(d, samplesPerCurve = 24) {
    const tokens = tokenize(d);
    let index = 0;
    let current = { x: 0, y: 0 };
    let lastControl = null;
    let lastCommand = null;
    const points = [];

    function readNumber() {
        return parseFloat(tokens[index++]);
    }

    function reflectControl() {
        if (!lastControl || !SMOOTH_PREDECESSORS.has(lastCommand)) return { ...current };
        return { x: 2 * current.x - lastControl.x, y: 2 * current.y - lastControl.y };
    }

    function sampleCubic(p0, p1, p2, p3) {
        for (let step = 1; step <= samplesPerCurve; step += 1) {
            points.push(cubicPoint(p0, p1, p2, p3, step / samplesPerCurve));
        }
    }

    while (index < tokens.length) {
        const token = tokens[index];
        let command = lastCommand;
        if (/[A-Za-z]/.test(token)) {
            command = token;
            index += 1;
        } else if (!command) {
            throw new Error(`Path SVG sin comando inicial: ${d}`);
        } else if (command === "M") {
            command = "L";
        } else if (command === "m") {
            command = "l";
        }

        if (command === "M" || command === "L") {
            current = { x: readNumber(), y: readNumber() };
            points.push({ ...current });
        } else if (command === "m" || command === "l") {
            current = { x: current.x + readNumber(), y: current.y + readNumber() };
            points.push({ ...current });
        } else if (command === "C") {
            const p1 = { x: readNumber(), y: readNumber() };
            const p2 = { x: readNumber(), y: readNumber() };
            const end = { x: readNumber(), y: readNumber() };
            sampleCubic(current, p1, p2, end);
            lastControl = p2;
            current = end;
        } else if (command === "c") {
            const p1 = { x: current.x + readNumber(), y: current.y + readNumber() };
            const p2 = { x: current.x + readNumber(), y: current.y + readNumber() };
            const end = { x: current.x + readNumber(), y: current.y + readNumber() };
            sampleCubic(current, p1, p2, end);
            lastControl = p2;
            current = end;
        } else if (command === "S") {
            const p1 = reflectControl();
            const p2 = { x: readNumber(), y: readNumber() };
            const end = { x: readNumber(), y: readNumber() };
            sampleCubic(current, p1, p2, end);
            lastControl = p2;
            current = end;
        } else if (command === "s") {
            const p1 = reflectControl();
            const p2 = { x: current.x + readNumber(), y: current.y + readNumber() };
            const end = { x: current.x + readNumber(), y: current.y + readNumber() };
            sampleCubic(current, p1, p2, end);
            lastControl = p2;
            current = end;
        } else {
            throw new Error(`Comando SVG no soportado "${command}" en: ${d}`);
        }

        lastCommand = command;
    }

    return points;
}
