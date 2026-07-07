const DEFAULT_STROKE_DURATION_MS = 900;
const DEFAULT_PAUSE_MS = 400;
const DEFAULT_COLOR = "rgba(220, 38, 38, 0.75)";
const DEFAULT_LINE_WIDTH = 10;
// Escala 1 = el trazo esperado ocupa el lienzo completo, igual que la normalización
// usada para calificar en handleStrokeEnd (js/app.js). Cualquier escala menor desalinea
// la guía visual del punto real que se está evaluando (o, en Estudio, del área natural
// de calcado), aunque visualmente parezca "cerca".
const DEFAULT_SCALE = 1;
const NUMBER_COLOR = "rgba(100, 116, 139, 0.75)";
const NUMBER_FONT = "bold 13px sans-serif";
const NUMBER_OFFSET = 9;

export function createStrokeAnimator(canvas) {
    const context = canvas.getContext("2d");
    let rafId = null;

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        clear();
    }

    function toCanvasPoint(point, scale) {
        const margin = (1 - scale) / 2;
        return {
            x: (margin + point.x * scale) * canvas.width,
            y: (margin + point.y * scale) * canvas.height,
        };
    }

    function drawStrokeProgress(points, progress, scale) {
        const lastIndex = points.length - 1;
        const target = lastIndex * progress;
        const whole = Math.floor(target);
        const first = toCanvasPoint(points[0], scale);
        context.beginPath();
        context.moveTo(first.x, first.y);
        for (let index = 1; index <= whole; index += 1) {
            const point = toCanvasPoint(points[index], scale);
            context.lineTo(point.x, point.y);
        }
        const fraction = target - whole;
        if (fraction > 0 && whole + 1 <= lastIndex) {
            const from = points[whole];
            const to = points[whole + 1];
            const point = toCanvasPoint(
                { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction },
                scale,
            );
            context.lineTo(point.x, point.y);
        }
        context.stroke();
    }

    function drawStrokeNumbers(strokes, scale) {
        context.save();
        context.fillStyle = NUMBER_COLOR;
        context.font = NUMBER_FONT;
        context.textAlign = "center";
        context.textBaseline = "middle";
        strokes.forEach((stroke, index) => {
            const start = toCanvasPoint(stroke.points[0], scale);
            context.fillText(String(index + 1), start.x - NUMBER_OFFSET, start.y - NUMBER_OFFSET);
        });
        context.restore();
    }

    function playCharacter(kanjiData, options = {}) {
        const strokeDurationMs = options.strokeDurationMs ?? DEFAULT_STROKE_DURATION_MS;
        const pauseMs = options.pauseMs ?? DEFAULT_PAUSE_MS;
        const color = options.color ?? DEFAULT_COLOR;
        const scale = options.scale ?? DEFAULT_SCALE;
        stop();

        const strokes = kanjiData?.strokes ?? [];
        if (strokes.length === 0) return;

        context.lineCap = "round";
        context.lineJoin = "round";

        let strokeIndex = 0;
        let strokeStart = null;

        function step(timestamp) {
            if (strokeStart === null) strokeStart = timestamp;
            const elapsed = timestamp - strokeStart;

            clear();
            drawStrokeNumbers(strokes, scale);
            context.strokeStyle = color;
            context.lineWidth = DEFAULT_LINE_WIDTH * scale;
            for (let index = 0; index < strokeIndex; index += 1) drawStrokeProgress(strokes[index].points, 1, scale);
            drawStrokeProgress(strokes[strokeIndex].points, Math.min(1, elapsed / strokeDurationMs), scale);

            if (elapsed >= strokeDurationMs + pauseMs) {
                strokeIndex += 1;
                strokeStart = timestamp;
                if (strokeIndex >= strokes.length) return;
            }

            rafId = requestAnimationFrame(step);
        }

        rafId = requestAnimationFrame(step);
    }

    function drawStatic(kanjiData, options = {}) {
        stop();
        const strokes = kanjiData?.strokes ?? [];
        if (strokes.length === 0) return;

        const color = options.color ?? DEFAULT_COLOR;
        const scale = options.scale ?? DEFAULT_SCALE;
        const showNumbers = options.showNumbers ?? true;

        context.lineCap = "round";
        context.lineJoin = "round";
        context.globalCompositeOperation = options.compositeOperation ?? "source-over";
        if (showNumbers) drawStrokeNumbers(strokes, scale);
        context.strokeStyle = color;
        context.lineWidth = (options.lineWidth ?? DEFAULT_LINE_WIDTH) * scale;
        strokes.forEach(stroke => drawStrokeProgress(stroke.points, 1, scale));
        context.globalCompositeOperation = "source-over";
    }

    return { playCharacter, drawStatic, stop };
}
