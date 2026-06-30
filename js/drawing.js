function drawPaper(context, canvas, lineWidth) {
    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#fca5a5";
    context.lineWidth = 1.5;
    context.setLineDash([6, 6]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "#172033";
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.restore();
}

export function createDrawingPad(canvas, { lineWidth = 12 } = {}) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let dirty = false;

    function position(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height),
        };
    }

    function start(event) {
        drawing = true;
        dirty = true;
        const point = position(event);
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = "#172033";
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(point.x, point.y);
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    }

    function move(event) {
        if (!drawing) return;
        const point = position(event);
        context.lineTo(point.x, point.y);
        context.stroke();
        event.preventDefault();
    }

    function end(event) {
        if (!drawing) return;
        drawing = false;
        context.closePath();
        if (event?.pointerId !== undefined && canvas.hasPointerCapture?.(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
    }

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    function clear() {
        dirty = false;
        drawPaper(context, canvas, lineWidth);
    }

    function overlay(character) {
        context.save();
        context.globalCompositeOperation = "multiply";
        context.fillStyle = "rgba(239, 68, 68, 0.24)";
        context.font = `${character.length > 1 ? 140 : 205}px "Yu Gothic", sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(character, canvas.width / 2, canvas.height / 2 + 3);
        context.restore();
    }

    function recognitionDataURL() {
        const output = document.createElement("canvas");
        output.width = canvas.width;
        output.height = canvas.height;
        const outputContext = output.getContext("2d");
        outputContext.fillStyle = "#ffffff";
        outputContext.fillRect(0, 0, output.width, output.height);
        outputContext.drawImage(canvas, 0, 0);
        return output.toDataURL("image/png");
    }

    clear();
    return {
        clear,
        overlay,
        recognitionDataURL,
        hasDrawing: () => dirty,
    };
}
