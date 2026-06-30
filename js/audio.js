let japaneseVoice = null;

function refreshVoices() {
    if (!("speechSynthesis" in window)) return;
    japaneseVoice = window.speechSynthesis
        .getVoices()
        .find(voice => voice.lang.toLowerCase().startsWith("ja")) ?? null;
}

if ("speechSynthesis" in window) {
    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

export function japaneseOnly(text = "") {
    const withoutParentheses = text.replace(/\([^)]*\)/g, " ");
    const japaneseSegments = withoutParentheses.match(/[\u3000-\u30ff\u3400-\u9fff々〆ヵヶー]+/g);
    return japaneseSegments?.join(" ") || withoutParentheses.trim();
}

export function exampleJapanese(text = "") {
    return text.split("(")[0].trim();
}

export function speakJapanese(text) {
    if (!text || !("speechSynthesis" in window)) return false;
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
        return japaneseOnly(item.kunyomi) || japaneseOnly(item.onyomi) || item.caracter;
    }
    return item.caracter;
}
