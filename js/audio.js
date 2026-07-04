let japaneseVoice = null;

const JAPANESE_SEGMENT_RE = /[\u3000-\u30ff\u3400-\u9fff々〆ヵヶー]+/g;
const LATIN_READING_RE = /\([^)]*\)/g;
const OKURIGANA_RE = /([\u3040-\u30ffー]+)（([\u3040-\u30ffー]+)）/g;
const HAS_OKURIGANA_RE = /[\u3040-\u30ffー]+（[\u3040-\u30ffー]+）/;

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

export function hasOkuriganaReading(text = "") {
    return HAS_OKURIGANA_RE.test(String(text || ""));
}

export function expandOkurigana(text = "") {
    return String(text || "").replace(OKURIGANA_RE, "$1$2");
}

function cleanReadingText(text = "") {
    const value = String(text || "").trim();
    if (!value || value === "-") return "";
    return expandOkurigana(value.replace(LATIN_READING_RE, " "));
}

function japaneseSegments(text = "") {
    const clean = cleanReadingText(text);
    return clean.match(JAPANESE_SEGMENT_RE)?.filter(Boolean) ?? [];
}

function firstJapaneseSegment(text = "") {
    return japaneseSegments(text)[0] || "";
}

export function japaneseOnly(text = "", separator = "、") {
    const clean = cleanReadingText(text);
    const segments = japaneseSegments(clean);
    return segments.length ? segments.join(separator) : clean;
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
