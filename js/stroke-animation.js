const DEFAULT_STROKE_DURATION_MS = 450;
const DEFAULT_PAUSE_MS = 200;
const DEFAULT_COLOR = "rgba(220, 38, 38, 0.75)";
const DEFAULT_LINE_WIDTH = 10;

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

    function drawStrokeProgress(points, progress) {
        const lastIndex = points.length - 1;
        const target = lastIndex * progress;
        const whole = Math.floor(target);
        context.beginPath();
        context.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
        for (let index = 1; index <= whole; index += 1) {
            context.lineTo(points[index].x * canvas.width, points[index].y * canvas.height);
        }
        const fraction = target - whole;
        if (fraction > 0 && whole + 1 <= lastIndex) {
            const from = points[whole];
            const to = points[whole + 1];
            context.lineTo(
                (from.x + (to.x - from.x) * fraction) * canvas.width,
                (from.y + (to.y - from.y) * fraction) * canvas.height,
            );
        }
        context.stroke();
    }

    function playCharacter(kanjiData, options = {}) {
        const strokeDurationMs = options.strokeDurationMs ?? DEFAULT_STROKE_DURATION_MS;
        const pauseMs = options.pauseMs ?? DEFAULT_PAUSE_MS;
        const color = options.color ?? DEFAULT_COLOR;
        stop();

        const strokes = kanjiData?.strokes ?? [];
        if (strokes.length === 0) return;

        context.strokeStyle = color;
        context.lineWidth = DEFAULT_LINE_WIDTH;
        context.lineCap = "round";
        context.lineJoin = "round";

        let strokeIndex = 0;
        let strokeStart = null;

        function step(timestamp) {
            if (strokeStart === null) strokeStart = timestamp;
            const elapsed = timestamp - strokeStart;

            clear();
            for (let index = 0; index < strokeIndex; index += 1) drawStrokeProgress(strokes[index].points, 1);
            drawStrokeProgress(strokes[strokeIndex].points, Math.min(1, elapsed / strokeDurationMs));

            if (elapsed >= strokeDurationMs + pauseMs) {
                strokeIndex += 1;
                strokeStart = timestamp;
                if (strokeIndex >= strokes.length) return;
            }

            rafId = requestAnimationFrame(step);
        }

        rafId = requestAnimationFrame(step);
    }

    return { playCharacter, stop };
}
