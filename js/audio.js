let japaneseVoice = null;

const JAPANESE_SEGMENT_RE = /[\u3000-\u30ff\u3400-\u9fff々〆ヵヶー]+/g;

function canSpeak() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
}

function refreshVoices() {
    if (!canSpeak()) return;
    japaneseVoice = window.speechSynthesis
        .getVoices()
        .find(voice => voice.lang.toLowerCase().startsWith("ja")) ?? null;
}

if (canSpeak()) {
    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

function japaneseSegments(text = "") {
    const withoutParentheses = String(text || "").replace(/\([^)]*\)/g, " ");
    return withoutParentheses.match(JAPANESE_SEGMENT_RE)?.filter(Boolean) ?? [];
}

function firstJapaneseSegment(text = "") {
    return japaneseSegments(text)[0] || "";
}

export function japaneseOnly(text = "", separator = "、") {
    const withoutParentheses = String(text || "").replace(/\([^)]*\)/g, " ");
    const segments = japaneseSegments(withoutParentheses);
    return segments.length ? segments.join(separator) : withoutParentheses.trim();
}

export function exampleJapanese(text = "") {
    return String(text || "").split("(")[0].trim();
}

export function speakJapanese(text) {
    if (!text || !canSpeak()) return false;
    const clean = japaneseOnly(text);
    if (!clean) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "ja-JP";
    utterance.rate = 0.78;
    if (japaneseVoice) utterance.voice = japaneseVoice;
    window.speechSynthesis.speak(utterance);
    return true;
}

export function itemPronunciation(item) {
    if (!item) return "";
    if (item.tipo === "kanji") {
        return firstJapaneseSegment(item.onyomi) || firstJapaneseSegment(item.kunyomi) || item.caracter;
    }
    return item.caracter;
}
