import {
    LESSONS,
    cardState,
    chooseNext,
    filterBySession,
    filterLesson,
    isDue,
    isMastered,
    itemId,
    normalizeSearch,
    progressStats,
    scheduleReview,
} from "./core.js";
import {
    createBackup,
    loadAchievements,
    loadDailyStats,
    loadFavorites,
    loadPracticeReminder,
    loadProfile,
    loadProgress,
    loadSettings,
    parseBackup,
    replaceStoredData,
    saveDailyStats,
    saveFavorites,
    saveAchievements,
    savePracticeReminder,
    saveProfile,
    saveProgress,
    saveSettings,
} from "./storage.js";
import { createDrawingPad, createFeedbackLayer } from "./drawing.js";
import {
    compareStroke,
    MIN_STROKE_POINTS,
    recommendRating,
    RESAMPLE_POINTS,
    scoreAttempt,
    similarityColor,
} from "./stroke-scoring.js";
import { fromCanvasPoint, resampleStroke } from "./stroke-geometry.js";
import { createStrokeAnimator, GHOST_COLOR } from "./stroke-animation.js";
import { exampleJapanese, itemPronunciation, japaneseOnly, speakJapanese } from "./audio.js?v=831";
import { loadDictionary } from "./data.js";
import {
    achievementLevel,
    achievementProgress,
    achievementSummary,
    buildAchievementStats,
    syncAchievements,
} from "./achievements.js?v=831";
import {
    dailyEntry,
    dailySummary,
    practiceStats,
    recentDailySummaries,
    recordDailyPractice,
} from "./profile.js?v=831";
import {
    disablePracticeReminder,
    enablePracticeReminder,
    isPracticeReminderDue,
    markPracticeReminderNotified,
    recordPractice,
    setPracticeReminderTime,
    shouldNotifyPracticeReminder,
} from "./reminders.js?v=831";
import {
    AVAILABLE_LANGUAGES,
    applyDocumentTranslations,
    currentLanguage,
    detectInitialLanguage,
    formatRelativeTime,
    formatResultCount,
    lessonDescription,
    lessonTitle,
    loadLocale,
    localizeDictionary,
    t,
    translateCardState,
} from "./i18n.js?v=831";

const APP_VERSION = "0.8.33";
const FEEDBACK_ENDPOINT = "https://script.google.com/macros/s/AKfycbxiz6058zwMxfPTDTmIBpG8JutOPw8YBxCRJ0BeMHp-py6IXZy4zkZs2IdTqwmSSzC1jw/exec";
const SPLASH_MIN_MS = 2400;
const startupStartedAt = performance.now();

const $ = selector => document.querySelector(selector);
const elements = {
    splash: $("#pantalla-carga"),
    splashVersion: $("#splash-version"),
    connection: $("#estado-conexion"),
    progressSummary: $("#resumen-progreso"),
    progressPercent: $("#porcentaje-dominio"),
    progressBar: $("#barra-progreso"),
    statNew: $("#stat-nuevas"),
    statDue: $("#stat-repasar"),
    statMastered: $("#stat-dominadas"),
    statStreak: $("#stat-racha"),
    exportButton: $("#btn-exportar"),
    importButton: $("#btn-importar"),
    importFile: $("#archivo-importar"),
    practiceTab: $("#tab-practica"),
    studyTab: $("#tab-estudio"),
    profileTab: $("#tab-perfil"),
    practiceSection: $("#seccion-practica"),
    studySection: $("#seccion-estudio"),
    profileSection: $("#seccion-perfil"),
    categorySelect: $("#selector-categoria"),
    lessonSelect: $("#selector-leccion"),
    scriptSelect: $("#selector-modo"),
    sessionSelect: $("#selector-progreso"),
    lessonDescription: $("#descripcion-leccion"),
    typeInfo: $("#info-tipo"),
    cardState: $("#estado-tarjeta"),
    question: $("#texto-significado"),
    hint: $("#pista-romaji"),
    practiceSound: $("#btn-sonido-practica"),
    board: $("#pizarra"),
    feedbackBoard: $("#pizarra-feedback"),
    practiceGuide: $("#guia-practica"),
    practiceGuideCanvas: $("#guia-practica-trazos"),
    clearBoard: $("#btn-limpiar"),
    reveal: $("#btn-revelar"),
    answerPanel: $("#panel-respuesta"),
    ratingFieldset: document.querySelector(".rating-fieldset"),
    strokeGateNotice: $("#aviso-umbral-trazos"),
    answerCharacter: $("#resp-caracter"),
    answerSound: $("#btn-sonido-respuesta"),
    answerRomaji: $("#resp-romaji"),
    answerCategory: $("#resp-categoria"),
    rowCounterpart: $("#fila-contraparte"),
    answerCounterpart: $("#resp-contraparte"),
    rowWord: $("#fila-palabra"),
    answerWord: $("#resp-palabra"),
    rowId: $("#fila-id"),
    answerId: $("#resp-id"),
    rowOnyomi: $("#fila-onyomi"),
    answerOnyomi: $("#resp-onyomi"),
    rowKunyomi: $("#fila-kunyomi"),
    answerKunyomi: $("#resp-kunyomi"),
    rowKanjiExample: $("#fila-ejemplo-kanji"),
    answerKanjiExample: $("#resp-ejemplo-kanji"),
    search: $("#buscador-texto"),
    studyFilter: $("#filtro-nivel"),
    resultCount: $("#contador-resultados"),
    dictionary: $("#lista-diccionario"),
    modal: $("#modal-detalles"),
    modalContent: $(".modal-content"),
    favorite: $("#btn-favorito"),
    closeModal: $("#cerrar-modal"),
    modalCharacter: $("#modal-caracter"),
    modalBoard: $("#pizarra-modal"),
    strokeAnimationCanvas: $("#animacion-trazos"),
    animationSpeedButton: $("#btn-velocidad-animacion"),
    animationSpeedLabel: $("#etiqueta-velocidad-animacion"),
    toggleStrokes: $("#btn-toggle-trazos"),
    clearModalBoard: $("#btn-limpiar-modal"),
    modalRomaji: $("#modal-romaji"),
    modalMeaning: $("#modal-significado"),
    modalCategory: $("#modal-categoria"),
    modalRowCounterpart: $("#modal-fila-contraparte"),
    modalCounterpart: $("#modal-contraparte"),
    modalRowWord: $("#modal-fila-palabra"),
    modalWord: $("#modal-palabra"),
    modalRowId: $("#modal-fila-id"),
    modalId: $("#modal-id"),
    modalRowOnyomi: $("#modal-fila-onyomi"),
    modalOnyomi: $("#modal-onyomi"),
    modalRowKunyomi: $("#modal-fila-kunyomi"),
    modalKunyomi: $("#modal-kunyomi"),
    modalContext: $("#modal-contexto-kanji"),
    modalExampleWord: $("#modal-ejemplo-palabra"),
    modalExampleReading: $("#modal-ejemplo-lectura"),
    modalExampleMeaning: $("#modal-ejemplo-significado"),
    modalExampleSentence: $("#modal-ejemplo-frase"),
    modalExampleSentenceReading: $("#modal-ejemplo-frase-lectura"),
    modalExampleSentenceMeaning: $("#modal-ejemplo-frase-significado"),
    modalMainSound: $("#btn-sonido-principal"),
    modalWordSound: $("#btn-sonido-palabra"),
    modalOnyomiSound: $("#btn-sonido-onyomi"),
    modalKunyomiSound: $("#btn-sonido-kunyomi"),
    modalSentenceSound: $("#btn-sonido-frase"),
    modalPrevious: $("#btn-modal-prev"),
    modalNext: $("#btn-modal-next"),
    modalCounter: $("#contador-modal"),
    levelNotice: $("#aviso-nivel"),
    toast: $("#toast"),
    languageSelect: $("#selector-idioma"),
    reminderButton: $("#btn-recordatorio"),
    reminderIcon: $("#icono-recordatorio"),
    reminderText: $("#texto-recordatorio"),
    profileGreeting: $("#perfil-saludo"),
    profileSummary: $("#perfil-resumen"),
    profileName: $("#perfil-nombre"),
    dailyGoal: $("#meta-diaria"),
    reminderTime: $("#hora-recordatorio"),
    saveProfile: $("#btn-guardar-perfil"),
    goalChips: document.querySelectorAll("[data-goal]"),
    similarityThreshold: $("#perfil-umbral-similitud"),
    thresholdChips: document.querySelectorAll("[data-threshold]"),
    strokeEvaluatorToggle: $("#btn-evaluador-trazos"),
    strokeEvaluatorCanvasToggle: $("#btn-evaluador-lienzo"),
    strokeEvaluatorCanvasState: $("#etiqueta-evaluador-lienzo"),
    profileTodayUnique: $("#perfil-hoy-unicas"),
    profileTodayReviews: $("#perfil-hoy-repasos"),
    profileActiveDays: $("#perfil-dias-activos"),
    profileGoalDays: $("#perfil-dias-meta"),
    profileCurrentStreak: $("#perfil-racha-actual"),
    profileBestStreak: $("#perfil-mejor-racha"),
    achievementSummary: $("#resumen-logros"),
    achievementCount: $("#contador-logros"),
    achievementList: $("#lista-logros"),
    dailyHistory: $("#historial-diario"),
    profileViewedToday: $("#perfil-vistas-hoy"),
    profileFailedToday: $("#perfil-falladas-hoy"),
    profileMasteredList: $("#perfil-lista-dominadas"),
    profileUpcomingList: $("#perfil-proximas-repasar"),
    aboutButton: $("#btn-acerca"),
    aboutModal: $("#modal-acerca"),
    aboutContent: $(".about-content"),
    closeAbout: $("#cerrar-acerca"),
    appVersion: $("#app-version"),
    feedbackText: $("#feedback-texto"),
    feedbackCounter: $("#feedback-contador"),
    feedbackSend: $("#btn-enviar-feedback"),
    feedbackStatus: $("#feedback-estado"),
    onboardingModal: $("#modal-bienvenida"),
    onboardingContent: $(".onboarding-content"),
    onboardingForm: $("#form-bienvenida"),
    onboardingLanguageButtons: document.querySelectorAll("[data-onboarding-language]"),
    onboardingName: $("#onboarding-nombre"),
    onboardingReminderTime: $("#onboarding-recordatorio"),
    onboardingError: $("#onboarding-error"),
    onboardingSkipTour: $("#btn-onboarding-sin-tour"),
    onboardingStartTour: $("#btn-onboarding-tour"),
    tourOverlay: $("#tour-overlay"),
    tourPopover: $("#tour-popover"),
    tourCounter: $("#tour-contador"),
    tourTitle: $("#tour-titulo"),
    tourText: $("#tour-texto"),
    tourSkip: $("#btn-tour-saltar"),
    tourPrevious: $("#btn-tour-atras"),
    tourNext: $("#btn-tour-siguiente"),
};

let baseDictionary = [];
let dictionary = [];
let currentItem = null;
let previousItemId = "";
let filteredStudyItems = [];
let modalIndex = 0;
let modalTrigger = null;
let strokeOrderVisible = false;
let progress = loadProgress();
let favorites = loadFavorites();
let settings = loadSettings();
let practiceReminder = loadPracticeReminder();
let profile = loadProfile();
let dailyStats = loadDailyStats();
let achievements = loadAchievements();
let toastTimer = null;
let levelNoticeTimer = null;
let reminderTimer = null;
let touchStartX = 0;
let tourIndex = 0;
let tourHighlightedElement = null;
let expectedKanjiData = null;

const KANJIVG_SUPPORTED_LEVELS = new Set(["N5", "N4", "N3", "N2"]);
const kanjivgDataCache = new Map();
let kanjivgIndexPromise = null;

function hasKanjivgData(item) {
    return Boolean(item?.tipo === "kanji" && KANJIVG_SUPPORTED_LEVELS.has(item.categoria));
}

function loadKanjivgIndex() {
    if (!kanjivgIndexPromise) {
        kanjivgIndexPromise = fetch("data/kanjivg/index.json")
            .then(response => (response.ok ? response.json() : {}))
            .catch(() => ({}));
    }
    return kanjivgIndexPromise;
}

async function loadKanjivgData(character) {
    if (kanjivgDataCache.has(character)) return kanjivgDataCache.get(character);
    const index = await loadKanjivgIndex();
    const codepoint = index[character];
    if (!codepoint) {
        kanjivgDataCache.set(character, null);
        return null;
    }
    try {
        const response = await fetch(`data/kanjivg/${codepoint}.json`);
        const data = response.ok ? await response.json() : null;
        kanjivgDataCache.set(character, data);
        return data;
    } catch {
        kanjivgDataCache.set(character, null);
        return null;
    }
}

async function loadExpectedStrokes(item) {
    expectedKanjiData = hasKanjivgData(item) ? await loadKanjivgData(item.caracter) : null;
}

let modalExpectedKanjiData = null;
let modalKanjivgRequestId = 0;

async function loadModalExpectedStrokes(item) {
    const requestId = (modalKanjivgRequestId += 1);
    modalExpectedKanjiData = null;
    if (hasKanjivgData(item)) {
        const data = await loadKanjivgData(item.caracter);
        if (requestId !== modalKanjivgRequestId) return;
        modalExpectedKanjiData = data;
    }
    updateStrokeOrderDisplay();
}

const BASE_STROKE_DURATION_MS = 900;
const BASE_PAUSE_MS = 400;
const ANIMATION_SPEED_MULTIPLIERS = [1, 2, 4];
let animationSpeedMultiplierIndex = 0;

function currentAnimationSpeed() {
    const multiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeedMultiplierIndex];
    return { strokeDurationMs: BASE_STROKE_DURATION_MS / multiplier, pauseMs: BASE_PAUSE_MS / multiplier };
}

function updateAnimationSpeedButton() {
    const multiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeedMultiplierIndex];
    elements.animationSpeedLabel.textContent = multiplier > 1 ? `${multiplier}X` : "";
}

function cycleAnimationSpeed() {
    animationSpeedMultiplierIndex = (animationSpeedMultiplierIndex + 1) % ANIMATION_SPEED_MULTIPLIERS.length;
    updateAnimationSpeedButton();
    updateStrokeOrderDisplay();
}

// Cuando hay datos KanjiVG, el fantasma de fondo se dibuja en el propio canvas de
// animación con los MISMOS puntos que se animan (no la fuente "OrdenTrazos", que tiene
// proporciones distintas y no coincide con el trazo real) — por eso #modal-caracter se
// oculta por completo en ese caso. El fantasma se queda visible aunque "mostrar orden de
// trazos" esté apagado; solo cambian los números y el relleno animado.
function updateStrokeOrderDisplay() {
    elements.toggleStrokes.setAttribute("aria-pressed", String(strokeOrderVisible));
    elements.toggleStrokes.textContent = strokeOrderVisible
        ? t("ui.hideStrokeOrder")
        : t("ui.showStrokeOrder");

    if (modalExpectedKanjiData) {
        elements.modalCharacter.classList.add("hidden");
        elements.modalCharacter.classList.remove("stroke-order");
        elements.strokeAnimationCanvas.classList.remove("hidden");
        if (strokeOrderVisible) {
            strokeAnimator.playCharacter(modalExpectedKanjiData, currentAnimationSpeed());
        } else {
            strokeAnimator.drawStatic(modalExpectedKanjiData, { color: GHOST_COLOR, showNumbers: false });
        }
        return;
    }

    elements.modalCharacter.classList.remove("hidden");
    elements.strokeAnimationCanvas.classList.add("hidden");
    strokeAnimator.stop();
    elements.modalCharacter.classList.toggle("stroke-order", strokeOrderVisible);
}

function handleStrokeEnd(index, points) {
    if (!profile.strokeEvaluatorEnabled || !expectedKanjiData) return;
    const expectedStroke = expectedKanjiData.strokes[index];
    if (!expectedStroke) {
        feedbackLayer.paintStroke(points, "red");
        return;
    }
    if (points.length < MIN_STROKE_POINTS) {
        feedbackLayer.paintStroke(points, "red");
        return;
    }
    // Normaliza contra el lienzo fijo (no el bounding box de los trazos dibujados hasta
    // ahora): con solo 1-2 trazos ese bbox es inestable y distorsiona trazos cortos.
    // fromCanvasPoint usa la misma escala/margen (PRACTICE_CANVAS_SCALE) que la guía
    // visual dibuja — si difieren, un trazo hecho sobre la guía deja de calificar bien.
    const normalized = points.map(point => fromCanvasPoint(point, elements.board.width, elements.board.height));
    const resampled = resampleStroke(normalized, RESAMPLE_POINTS);
    const strokeScore = compareStroke(resampled, expectedStroke.points);
    feedbackLayer.paintStroke(points, similarityColor(strokeScore));
}

const practicePad = createDrawingPad(elements.board, { lineWidth: 12, onStrokeEnd: handleStrokeEnd });
const modalPad = createDrawingPad(elements.modalBoard, { lineWidth: 7 });
const feedbackLayer = createFeedbackLayer(elements.feedbackBoard);
const strokeAnimator = createStrokeAnimator(elements.strokeAnimationCanvas);
const practiceGuideAnimator = createStrokeAnimator(elements.practiceGuideCanvas);
// Pintado directo (source-over), sin mix-blend-mode: ese blend mode ya causó una vez
// que un color se volviera invisible sobre la tinta (ver feedback en vivo del evaluador,
// corregido antes) — no repetir el mismo error para la guía.
const PRACTICE_GUIDE_COLOR = "rgba(239, 68, 68, 0.35)";

const wait = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));

function hidePracticeGuide() {
    elements.practiceGuide.textContent = "";
    elements.practiceGuide.classList.add("hidden");
    practiceGuideAnimator.stop();
    elements.practiceGuideCanvas.classList.add("hidden");
}

// Cuando hay datos KanjiVG para el item actual, la guía se dibuja con esos MISMOS
// puntos y la misma normalización (PRACTICE_CANVAS_SCALE, vía stroke-geometry.js) que
// usa handleStrokeEnd para calificar — así lo que el usuario ve como referencia es
// literalmente lo que se evalúa. Sin datos KanjiVG (kana u otro kanji no cubierto) cae
// a la fuente estática.
function showPracticeGuide(character) {
    if (expectedKanjiData) {
        elements.practiceGuide.textContent = "";
        elements.practiceGuide.classList.add("hidden");
        elements.practiceGuideCanvas.classList.toggle("hidden", !character);
        if (character) practiceGuideAnimator.drawStatic(expectedKanjiData, { color: PRACTICE_GUIDE_COLOR });
        return;
    }
    elements.practiceGuideCanvas.classList.add("hidden");
    practiceGuideAnimator.stop();
    elements.practiceGuide.textContent = character || "";
    elements.practiceGuide.classList.toggle("hidden", !character);
}

function clearPracticeBoard() {
    practicePad.clear();
    feedbackLayer.clear();
    hidePracticeGuide();
}

function itemStateLabel(record) {
    return translateCardState(cardState(record));
}

function localizeLoadedDictionary() {
    dictionary = localizeDictionary(baseDictionary);
}

function showToast(message, duration = 2600) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), duration);
}

function formatAchievementLevel(level) {
    return t("ui.achievementLevelLabel", {
        level: level.level,
        name: level.name,
    }, `Nivel ${level.level} · ${level.name}`);
}

function showAchievementLevelNotice() {
    if (!profile.name) return;
    const { summary } = refreshAchievements();
    const level = achievementLevel(summary);
    clearTimeout(levelNoticeTimer);
    elements.levelNotice.textContent = t("ui.achievementStartupNotice", {
        unlocked: summary.unlocked,
        total: summary.total,
        level: formatAchievementLevel(level),
        percent: level.percent,
    });
    elements.levelNotice.classList.add("visible");
    levelNoticeTimer = setTimeout(() => {
        elements.levelNotice.classList.remove("visible");
    }, 3000);
}

function announceUnlockedAchievements(unlocked = []) {
    if (!unlocked.length) return;
    if (unlocked.length === 1) {
        showToast(t("ui.achievementUnlockedToast", {
            title: t(unlocked[0].titleKey),
        }));
        return;
    }
    showToast(t("ui.achievementsUnlockedToast", { count: unlocked.length }));
}

const TOUR_STEPS = [
    {
        target: () => document.querySelector(".progress-card"),
        titleKey: "ui.tourGoalTitle",
        textKey: "ui.tourGoalText",
    },
    {
        before: () => switchTab("practice"),
        target: () => elements.lessonSelect,
        titleKey: "ui.tourLessonTitle",
        textKey: "ui.tourLessonText",
    },
    {
        before: () => switchTab("practice"),
        target: () => elements.board,
        titleKey: "ui.tourBoardTitle",
        textKey: "ui.tourBoardText",
    },
    {
        before: () => switchTab("practice"),
        target: () => elements.reveal,
        titleKey: "ui.tourRevealTitle",
        textKey: "ui.tourRevealText",
    },
    {
        before: () => {
            switchTab("practice");
            if (currentItem && elements.answerPanel.classList.contains("hidden")) revealAnswer();
        },
        target: () => document.querySelector(".rating-grid"),
        titleKey: "ui.tourRatingTitle",
        textKey: "ui.tourRatingText",
    },
    {
        before: () => switchTab("study"),
        target: () => elements.studyTab,
        titleKey: "ui.tourStudyTitle",
        textKey: "ui.tourStudyText",
    },
    {
        before: () => switchTab("study"),
        target: () => elements.search,
        titleKey: "ui.tourSearchTitle",
        textKey: "ui.tourSearchText",
    },
    {
        before: () => switchTab("study"),
        target: () => elements.dictionary,
        titleKey: "ui.tourCardsTitle",
        textKey: "ui.tourCardsText",
    },
    {
        before: () => showFavoriteTourExample(),
        target: () => elements.favorite,
        titleKey: "ui.tourFavoritesTitle",
        textKey: "ui.tourFavoritesText",
    },
    {
        before: () => {
            closeModal();
            switchTab("profile");
        },
        target: () => elements.dailyGoal,
        titleKey: "ui.tourProfileGoalTitle",
        textKey: "ui.tourProfileGoalText",
    },
    {
        before: () => {
            closeModal();
            switchTab("profile");
        },
        target: () => elements.reminderTime,
        titleKey: "ui.tourReminderTimeTitle",
        textKey: "ui.tourReminderTimeText",
    },
    {
        before: () => {
            closeModal();
            switchTab("profile");
        },
        target: () => document.querySelector(".profile-stats-grid"),
        titleKey: "ui.tourStatsTitle",
        textKey: "ui.tourStatsText",
    },
];

function showFavoriteTourExample() {
    switchTab("study");
    if (!filteredStudyItems.length) renderDictionary();
    if (filteredStudyItems.length && elements.modal.classList.contains("hidden")) {
        openModal(0, elements.studyTab);
    }
}

function createUserId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `kf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureExistingProfileIdentity() {
    if (!profile.name || profile.userId) return;
    profile = {
        ...profile,
        userId: createUserId(),
        onboardedAt: profile.onboardedAt || profile.createdAt || Date.now(),
    };
    saveProfile(profile);
    profile = loadProfile();
}

async function sendAppEvent(type, payload = {}) {
    if (typeof fetch !== "function") return;
    try {
        await fetch(FEEDBACK_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            body: new URLSearchParams({
                type,
                app: "KanjiFlow",
                version: APP_VERSION,
                language: currentLanguage(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...payload,
            }),
        });
    } catch (error) {
        console.warn(`No se pudo enviar evento ${type}.`, error);
    }
}

function sendUserSignup(tourAccepted) {
    const createdAt = profile.createdAt ? new Date(profile.createdAt).toISOString() : "";
    const onboardedAt = profile.onboardedAt ? new Date(profile.onboardedAt).toISOString() : "";
    return sendAppEvent("user_signup", {
        sheet: "Usuarios",
        notification: "false",
        email: "false",
        subject: "KanjiFlow user signup",
        userId: profile.userId,
        userName: profile.name,
        dailyGoal: String(profile.dailyGoal),
        reminderTime: practiceReminder.preferredTime,
        createdAt,
        onboardedAt,
        tourAccepted: String(Boolean(tourAccepted)),
        comment: `Nuevo usuario: ${profile.name}`,
    });
}

async function finishSplashAndMaybeOnboard() {
    await wait(SPLASH_MIN_MS - (performance.now() - startupStartedAt));
    elements.splash?.classList.add("hidden");
    if (!profile.name) {
        openOnboardingModal();
        return;
    }
    showAchievementLevelNotice();
}

function openOnboardingModal() {
    elements.onboardingName.value = profile.name || "";
    elements.onboardingReminderTime.value = practiceReminder.preferredTime || "19:00";
    elements.onboardingError.textContent = "";
    elements.onboardingModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => elements.onboardingName.focus(), 80);
}

function closeOnboardingModal() {
    elements.onboardingModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function saveOnboardingProfile(startTour) {
    const name = elements.onboardingName.value.trim();
    if (!name) {
        elements.onboardingError.textContent = t("ui.onboardingNameRequired");
        elements.onboardingName.focus();
        return false;
    }

    const now = Date.now();
    profile = {
        ...profile,
        userId: profile.userId || createUserId(),
        name,
        onboardedAt: profile.onboardedAt || now,
        tourSkippedAt: startTour ? profile.tourSkippedAt : now,
    };
    saveProfile(profile);
    profile = loadProfile();
    saveReminderTime(elements.onboardingReminderTime.value);
    updateProgressUI();
    sendUserSignup(startTour);
    return true;
}

function completeOnboarding(startTour) {
    if (!saveOnboardingProfile(startTour)) return;
    closeOnboardingModal();
    if (startTour) {
        startTourGuide();
        return;
    }
    showToast(t("ui.onboardingReadyToast"));
    showAchievementLevelNotice();
}

function clearTourHighlight() {
    tourHighlightedElement?.classList.remove("tour-highlight");
    tourHighlightedElement = null;
    elements.modal.classList.remove("tour-modal");
}

async function showTourStep(index) {
    const nextIndex = Math.max(0, index);
    if (nextIndex >= TOUR_STEPS.length) {
        finishTour(true);
        return;
    }

    tourIndex = nextIndex;
    clearTourHighlight();
    const step = TOUR_STEPS[tourIndex];
    step.before?.();
    await wait(90);

    const target = step.target?.();
    if (!target) {
        showTourStep(tourIndex + 1);
        return;
    }

    tourHighlightedElement = target;
    tourHighlightedElement.classList.add("tour-highlight");
    if (tourHighlightedElement.closest(".modal")) elements.modal.classList.add("tour-modal");
    tourHighlightedElement.scrollIntoView?.({ behavior: "smooth", block: "center", inline: "center" });

    elements.tourCounter.textContent = t("ui.tourStepCounter", {
        current: tourIndex + 1,
        total: TOUR_STEPS.length,
    }, `${tourIndex + 1} / ${TOUR_STEPS.length}`);
    elements.tourTitle.textContent = t(step.titleKey);
    elements.tourText.textContent = t(step.textKey);
    elements.tourPrevious.disabled = tourIndex === 0;
    elements.tourNext.textContent = tourIndex === TOUR_STEPS.length - 1
        ? t("ui.tourFinish")
        : t("ui.next");
    elements.tourOverlay.classList.remove("hidden");
    elements.tourPopover.classList.remove("hidden");
    elements.tourPopover.focus?.();
}

function startTourGuide() {
    closeAboutModal();
    closeModal();
    showTourStep(0);
}

function finishTour(completed = false) {
    clearTourHighlight();
    elements.tourOverlay.classList.add("hidden");
    elements.tourPopover.classList.add("hidden");
    closeModal();
    const now = Date.now();
    profile = {
        ...profile,
        tourCompletedAt: completed ? now : profile.tourCompletedAt,
        tourSkippedAt: completed ? profile.tourSkippedAt : now,
    };
    saveProfile(profile);
    profile = loadProfile();
    switchTab("practice");
    showToast(completed ? t("ui.tourDoneToast") : t("ui.tourSkippedToast"));
}

function saveReminderState(nextReminder = practiceReminder) {
    practiceReminder = nextReminder;
    savePracticeReminder(practiceReminder);
    updateReminderUI();
    scheduleReminderTimer();
}

function formatReminderDateTime(timestamp) {
    if (!timestamp) return practiceReminder.preferredTime || "";
    return new Intl.DateTimeFormat(currentLanguage(), {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

function saveReminderTime(value) {
    saveReminderState(setPracticeReminderTime(practiceReminder, value));
}

function reminderButtonText() {
    if (!practiceReminder.enabled) return t("ui.reminderOff");
    if (isPracticeReminderDue(practiceReminder)) return t("ui.reminderDueButton");
    return t("ui.reminderOnAt", { time: practiceReminder.preferredTime }, practiceReminder.preferredTime);
}

function updateReminderUI() {
    const due = isPracticeReminderDue(practiceReminder);
    elements.reminderButton.classList.toggle("active", practiceReminder.enabled && !due);
    elements.reminderButton.classList.toggle("due", due);
    elements.reminderButton.setAttribute("aria-pressed", String(practiceReminder.enabled));
    elements.reminderIcon.textContent = practiceReminder.enabled ? "🔔" : "🔕";
    elements.reminderText.textContent = reminderButtonText();
    const label = practiceReminder.enabled
        ? due
            ? t("ui.reminderDueLabel")
            : t("ui.reminderOnLabel", { time: formatReminderDateTime(practiceReminder.nextReminderAt) })
        : t("ui.reminderOffLabel");
    elements.reminderButton.setAttribute("aria-label", label);
    elements.reminderButton.title = label;
}

async function showSystemReminderNotification() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const title = t("ui.reminderNotificationTitle");
    const options = {
        body: t("ui.reminderNotificationBody"),
        tag: "kanjiflow-practice-reminder",
        renotify: true,
    };
    try {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, options);
            return;
        }
        new Notification(title, options);
    } catch (error) {
        console.warn("No se pudo mostrar el recordatorio.", error);
    }
}

function checkPracticeReminder({ notify = false } = {}) {
    updateReminderUI();
    if (!shouldNotifyPracticeReminder(practiceReminder)) return;
    showToast(t("ui.reminderDueToast"));
    if (notify) showSystemReminderNotification();
    saveReminderState(markPracticeReminderNotified(practiceReminder));
}

function scheduleReminderTimer() {
    clearTimeout(reminderTimer);
    if (!practiceReminder.enabled || !practiceReminder.nextReminderAt) return;
    const delay = Math.max(0, practiceReminder.nextReminderAt - Date.now());
    reminderTimer = setTimeout(
        () => checkPracticeReminder({ notify: true }),
        Math.min(delay, 2_147_483_647),
    );
}

async function togglePracticeReminder() {
    if (practiceReminder.enabled) {
        saveReminderState(disablePracticeReminder(practiceReminder));
        showToast(t("ui.reminderDisabledToast"));
        return;
    }

    let notificationStatus = "unsupported";
    if ("Notification" in window) {
        notificationStatus = Notification.permission;
        if (notificationStatus === "default") {
            notificationStatus = await Notification.requestPermission();
        }
    }

    saveReminderState(enablePracticeReminder(practiceReminder));
    showToast(notificationStatus === "granted"
        ? t("ui.reminderEnabledToastWithNotifications")
        : t("ui.reminderEnabledToast"));
    checkPracticeReminder({ notify: false });
}

function trackPracticeActivity(now = Date.now(), cardId = "", rating = "") {
    const before = dailySummary(dailyStats, profile, now);
    dailyStats = recordDailyPractice(dailyStats, {
        cardId,
        rating,
        dailyGoal: profile.dailyGoal,
        now,
    });
    saveDailyStats(dailyStats);
    saveReminderState(recordPractice(practiceReminder, now));
    return !before.goalReached && dailySummary(dailyStats, profile, now).goalReached;
}

function setVisibility(element, visible) {
    element.classList.toggle("hidden", !visible);
}

function syncLanguageControls() {
    elements.languageSelect.value = currentLanguage();
    elements.onboardingLanguageButtons.forEach(button => {
        const active = button.dataset.onboardingLanguage === currentLanguage();
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function populateLanguageSelect() {
    const fragment = document.createDocumentFragment();
    for (const language of AVAILABLE_LANGUAGES) {
        const option = document.createElement("option");
        option.value = language.code;
        option.textContent = language.label;
        fragment.appendChild(option);
    }
    elements.languageSelect.replaceChildren(fragment);
    syncLanguageControls();
}

function lessonsForCategory(category) {
    if (!category || category === "todas") return LESSONS;
    return LESSONS.filter(lesson => lesson.category === category);
}

const SUBCATEGORY_LABEL_KEYS = {
    hiragana: "ui.subcategoryHiragana",
    katakana: "ui.subcategoryKatakana",
    especial: "ui.subcategoryEspecial",
};

function appendLessonOption(container, lesson) {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = lessonTitle(lesson);
    container.appendChild(option);
}

function populateLessons() {
    const category = elements.categorySelect.value || "todas";
    const fragment = document.createDocumentFragment();
    const groups = new Map();
    const ungrouped = [];

    for (const lesson of lessonsForCategory(category)) {
        if (lesson.subcategory) {
            if (!groups.has(lesson.subcategory)) groups.set(lesson.subcategory, []);
            groups.get(lesson.subcategory).push(lesson);
        } else {
            ungrouped.push(lesson);
        }
    }

    for (const lesson of ungrouped) appendLessonOption(fragment, lesson);
    for (const [key, groupLessons] of groups) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = t(SUBCATEGORY_LABEL_KEYS[key] || key);
        for (const lesson of groupLessons) appendLessonOption(optgroup, lesson);
        fragment.appendChild(optgroup);
    }

    elements.lessonSelect.replaceChildren(fragment);
}

function saveCurrentSettings() {
    settings = {
        ...settings,
        category: elements.categorySelect.value,
        lesson: elements.lessonSelect.value,
        script: elements.scriptSelect.value,
        session: elements.sessionSelect.value,
        language: currentLanguage(),
    };
    saveSettings(settings);
}

function restoreSettings() {
    const categoryExists = ["todas", "kana", "N5", "N4", "N3", "N2"].includes(settings.category);
    elements.categorySelect.value = categoryExists ? settings.category : "todas";
    populateLessons();
    const availableLessons = lessonsForCategory(elements.categorySelect.value);
    const lessonExists = availableLessons.some(lesson => lesson.id === settings.lesson);
    elements.lessonSelect.value = lessonExists ? settings.lesson : (availableLessons[0]?.id ?? "recommended");
    elements.scriptSelect.value = settings.script || "todos";
    elements.sessionSelect.value = settings.session || "recomendado";
}

function applyLanguageToUI() {
    applyDocumentTranslations();
    populateLanguageSelect();
    restoreSettings();
    updateConnection();
    updateReminderUI();
    renderProfile();
    updateFeedbackCounter();
    if (baseDictionary.length) {
        localizeLoadedDictionary();
        updateProgressUI();
        presentChallenge();
        renderDictionary();
        if (!elements.modal.classList.contains("hidden")) openModal(modalIndex, modalTrigger);
    }
}

async function changeLanguage(language) {
    if (language === currentLanguage()) {
        syncLanguageControls();
        return;
    }
    settings = {
        ...settings,
        category: elements.categorySelect.value || settings.category,
        lesson: elements.lessonSelect.value || settings.lesson,
        script: elements.scriptSelect.value || settings.script,
        session: elements.sessionSelect.value || settings.session,
        language,
    };
    saveSettings(settings);
    try {
        await loadLocale(language);
        applyLanguageToUI();
    } catch (error) {
        console.error(error);
        syncLanguageControls();
        showToast(t("ui.loadErrorQuestion"));
    }
}

function currentLessonData() {
    return filterLesson(dictionary, elements.lessonSelect.value, progress);
}

function todayPracticeEntry(now = Date.now()) {
    return dailyEntry(dailyStats, now);
}

function updateProgressUI() {
    const mastery = progressStats(dictionary, progress);
    const today = dailySummary(dailyStats, profile);
    const practice = practiceStats(dailyStats, profile);
    elements.statNew.textContent = today.uniqueCount;
    elements.statDue.textContent = today.reviews;
    elements.statMastered.textContent = mastery.masteredCount;
    elements.statStreak.textContent = practice.currentGoalStreak;
    elements.progressPercent.textContent = `${today.percent}%`;
    elements.progressBar.style.width = `${today.percent}%`;
    elements.progressSummary.textContent = today.goalReached
        ? t("ui.dailyGoalReachedSummary", { count: today.uniqueCount, goal: today.goal })
        : t("ui.dailyGoalSummary", { count: today.uniqueCount, goal: today.goal });
    renderProfile();
}

function avoidUnneededRepeats(pool) {
    if (elements.sessionSelect.value !== "recomendado" || pool.length < 2) return pool;
    const today = todayPracticeEntry();
    const viewedToday = new Set(today.uniqueCards);
    if (!viewedToday.size) return pool;

    const preferred = pool.filter(item => {
        const id = itemId(item);
        if (!viewedToday.has(id)) return true;
        const record = progress[id];
        const todayCard = today.cards[id];
        return isDue(record) || todayCard?.lastRating === "again";
    });
    return preferred.length ? preferred : pool;
}

function getPracticePool() {
    const lessonData = currentLessonData();
    let pool = lessonData.items;
    if (elements.scriptSelect.value !== "todos") {
        pool = pool.filter(item => item.tipo === elements.scriptSelect.value);
    }
    pool = filterBySession(
        pool,
        elements.sessionSelect.value,
        progress,
        favorites,
    );
    pool = avoidUnneededRepeats(pool);
    return { ...lessonData, items: pool };
}

function presentChallenge() {
    elements.answerPanel.classList.add("hidden");
    clearPracticeBoard();
    const poolData = getPracticePool();
    elements.lessonDescription.textContent = lessonDescription(poolData.lesson);
    currentItem = chooseNext(poolData.items, previousItemId, progress);
    loadExpectedStrokes(currentItem);

    if (!currentItem) {
        elements.typeInfo.textContent = t("ui.noCardsTag");
        elements.cardState.textContent = "";
        elements.question.textContent = t("ui.noCardsQuestion");
        elements.hint.textContent = t("ui.noCardsHint");
        elements.reveal.disabled = true;
        return;
    }

    previousItemId = itemId(currentItem);
    const record = progress[previousItemId];
    elements.reveal.disabled = false;
    elements.typeInfo.textContent = `${currentItem.tipoLabel} · ${currentItem.categoriaLabel}`;
    elements.cardState.textContent = itemStateLabel(record);
    elements.question.textContent = currentItem.tipo === "kanji"
        ? t("ui.drawMeaning", { meaning: currentItem.significado })
        : currentItem.categoria === "especial"
            ? t("ui.writeMeaning", { meaning: currentItem.significado })
            : t("ui.writeSound", { romaji: currentItem.romaji });
    elements.hint.textContent = currentItem.tipo === "kanji"
        ? t("ui.kanjiHint")
        : currentItem.categoria === "especial"
            ? t("ui.specialHint")
            : t("ui.kanaHint");
}

function answerAudioText(item = currentItem) {
    if (!item) return "";
    return itemPronunciation(item);
}

function revealAnswer() {
    if (!currentItem) return;
    showPracticeGuide(currentItem.caracter);
    elements.answerCharacter.textContent = currentItem.caracter;
    elements.answerRomaji.textContent = currentItem.romaji || "—";
    elements.answerCategory.textContent = currentItem.categoriaLabel || "—";

    const kanji = currentItem.tipo === "kanji";
    setVisibility(elements.rowCounterpart, !kanji);
    setVisibility(elements.rowWord, !kanji);
    setVisibility(elements.rowId, kanji);
    setVisibility(elements.rowOnyomi, kanji);
    setVisibility(elements.rowKunyomi, kanji);
    setVisibility(elements.rowKanjiExample, kanji);

    if (kanji) {
        elements.answerId.textContent = currentItem.id_jlpt || "—";
        elements.answerOnyomi.textContent = currentItem.onyomi || "—";
        elements.answerKunyomi.textContent = currentItem.kunyomi || "—";
        elements.answerKanjiExample.textContent = currentItem.example
            ? `${currentItem.example.word}（${currentItem.example.reading}）— ${currentItem.example.meaning}`
            : "—";
    } else {
        elements.answerCounterpart.textContent = currentItem.contraparte || "—";
        elements.answerWord.textContent = currentItem.palabra_ejemplo || "—";
    }

    const gate = evaluateStrokeGate();
    setVisibility(elements.ratingFieldset, !gate.gated);
    setVisibility(elements.strokeGateNotice, gate.active);
    elements.strokeGateNotice.classList.toggle("stroke-gate-blocked", gate.active && gate.gated);
    elements.strokeGateNotice.classList.toggle("stroke-gate-passed", gate.active && !gate.gated);
    clearRatingRecommendation();
    if (gate.active && gate.gated) {
        elements.strokeGateNotice.textContent = t("ui.strokeGateMessage", {
            score: gate.score,
            threshold: profile.similarityThreshold,
        });
    } else if (gate.active) {
        const recommended = recommendRating(gate.score);
        elements.strokeGateNotice.textContent = t("ui.strokeRecommendMessage", {
            score: gate.score,
            rating: t(RATING_LABEL_KEYS[recommended]),
        });
        highlightRecommendedRating(recommended);
    }

    elements.answerPanel.classList.remove("hidden");
    elements.answerPanel.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
}

function evaluateStrokeGate() {
    const active = Boolean(profile.strokeEvaluatorEnabled && expectedKanjiData);
    if (!active) return { active, gated: false, score: 100 };
    const result = scoreAttempt(practicePad.getStrokes(), expectedKanjiData.strokes);
    return { active, gated: result.score < profile.similarityThreshold, score: result.score };
}

const RATING_LABEL_KEYS = { hard: "ui.ratingHard", good: "ui.ratingGood", easy: "ui.ratingEasy" };

function clearRatingRecommendation() {
    elements.ratingFieldset.querySelectorAll("[data-rating]").forEach(button => {
        button.classList.remove("recommended");
    });
}

function highlightRecommendedRating(rating) {
    elements.ratingFieldset.querySelectorAll("[data-rating]").forEach(button => {
        button.classList.toggle("recommended", button.dataset.rating === rating);
    });
}

function rateCurrent(rating) {
    if (!currentItem) return;
    const id = itemId(currentItem);
    const nextRecord = scheduleReview(progress[id], rating);
    progress[id] = nextRecord;
    saveProgress(progress);
    const reachedDailyGoal = trackPracticeActivity(nextRecord.lastReviewedAt, id, rating);
    refreshAchievements({ announce: true });
    updateProgressUI();
    const dueText = rating === "again"
        ? t("ui.dueAgain")
        : t("ui.nextReview", { time: formatRelativeTime(nextRecord.dueAt) });
    showToast(dueText);
    if (reachedDailyGoal) {
        setTimeout(() => showToast(t("ui.dailyGoalReachedToast")), 850);
    }
    presentChallenge();
}

function switchTab(tab) {
    const tabs = {
        practice: [elements.practiceTab, elements.practiceSection],
        study: [elements.studyTab, elements.studySection],
        profile: [elements.profileTab, elements.profileSection],
    };
    for (const [name, [button, section]] of Object.entries(tabs)) {
        const active = name === tab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        setVisibility(section, active);
    }
    if (tab === "practice") {
        presentChallenge();
    } else if (tab === "study") {
        renderDictionary();
        elements.search.focus();
    } else {
        renderProfile();
    }
}

function dateFromKey(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatDateKey(dateKey, options = { weekday: "short", day: "numeric", month: "short" }) {
    return new Intl.DateTimeFormat(currentLanguage(), options).format(dateFromKey(dateKey));
}

function renderDailyHistory() {
    const fragment = document.createDocumentFragment();
    for (const day of recentDailySummaries(dailyStats, profile, 7)) {
        const dayElement = document.createElement("div");
        dayElement.className = "history-day";
        dayElement.classList.toggle("goal-met", day.goalReached);
        dayElement.title = day.goalReached
            ? t("ui.goalMet", {
                count: day.uniqueCount,
                goal: day.goal,
                date: formatDateKey(day.dateKey, { dateStyle: "medium" }),
            })
            : t("ui.goalNotMet", {
                count: day.uniqueCount,
                goal: day.goal,
                date: formatDateKey(day.dateKey, { dateStyle: "medium" }),
            });

        const label = document.createElement("span");
        label.textContent = formatDateKey(day.dateKey, { weekday: "short" });
        const check = document.createElement("strong");
        check.className = "history-check";
        check.textContent = day.goalReached ? "✓" : "•";
        const amount = document.createElement("small");
        amount.textContent = `${day.uniqueCount}/${day.goal}`;
        dayElement.append(label, check, amount);
        fragment.appendChild(dayElement);
    }
    elements.dailyHistory.replaceChildren(fragment);
}

function cardById(id) {
    return dictionary.find(item => itemId(item) === id) ?? null;
}

function ratingLabel(rating) {
    const keys = {
        again: "ui.ratingAgain",
        hard: "ui.ratingHard",
        good: "ui.ratingGood",
        easy: "ui.ratingEasy",
    };
    return keys[rating] ? t(keys[rating]) : t("ui.noRating");
}

function openProfileCard(item, trigger) {
    filteredStudyItems = [item];
    openModal(0, trigger);
}

function makeProfileListItem({ item, meta, badge }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile-list-item";

    const character = document.createElement("span");
    character.className = "profile-list-character";
    character.textContent = item.caracter;

    const body = document.createElement("span");
    body.className = "profile-list-body";
    const title = document.createElement("strong");
    title.textContent = `${item.romaji || "—"} · ${item.significado || "—"}`;
    const detail = document.createElement("small");
    detail.textContent = meta;
    body.append(title, detail);

    const status = document.createElement("span");
    status.className = "profile-list-badge";
    status.textContent = badge;

    button.append(character, body, status);
    button.addEventListener("click", () => openProfileCard(item, button));
    return button;
}

function renderProfileList(container, entries, emptyKey) {
    if (!container) return;
    if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "profile-list-empty";
        empty.textContent = t(emptyKey);
        container.replaceChildren(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
        fragment.appendChild(makeProfileListItem(entry));
    }
    container.replaceChildren(fragment);
}

function renderProfileLists() {
    const today = todayPracticeEntry();
    const viewedEntries = [...today.uniqueCards]
        .sort((left, right) =>
            (today.cards[right]?.lastReviewedAt || 0) - (today.cards[left]?.lastReviewedAt || 0))
        .map(id => {
            const item = cardById(id);
            if (!item) return null;
            const card = today.cards[id];
            return {
                item,
                badge: t("ui.cardViewedBadge"),
                meta: t("ui.viewedCardMeta", {
                    rating: ratingLabel(card?.lastRating),
                    count: card?.reviews || 0,
                }),
            };
        })
        .filter(Boolean);

    const failedEntries = Object.values(today.cards)
        .filter(card => card.again > 0)
        .sort((left, right) => right.lastReviewedAt - left.lastReviewedAt)
        .map(card => {
            const item = cardById(card.cardId);
            return item
                ? {
                    item,
                    badge: t("ui.cardFailedBadge"),
                    meta: t("ui.failedCardMeta", { count: card.again }),
                }
                : null;
        })
        .filter(Boolean);

    const masteredEntries = dictionary
        .filter(item => isMastered(progress[itemId(item)]))
        .sort((left, right) =>
            (progress[itemId(right)]?.lastReviewedAt || 0) - (progress[itemId(left)]?.lastReviewedAt || 0))
        .map(item => {
            const record = progress[itemId(item)];
            return {
                item,
                badge: t("ui.cardMasteredBadge"),
                meta: record?.dueAt
                    ? t("ui.masteredCardMeta", { time: formatRelativeTime(record.dueAt) })
                    : itemStateLabel(record),
            };
        });

    const upcomingEntries = dictionary
        .map(item => ({ item, record: progress[itemId(item)] }))
        .filter(({ record }) => record?.lastReviewedAt && record.dueAt > Date.now() && !isDue(record))
        .sort((left, right) => left.record.dueAt - right.record.dueAt)
        .map(({ item, record }) => ({
            item,
            badge: t("ui.cardUpcomingBadge"),
            meta: t("ui.upcomingCardMeta", { time: formatRelativeTime(record.dueAt) }),
        }));

    renderProfileList(elements.profileViewedToday, viewedEntries, "ui.emptyViewedToday");
    renderProfileList(elements.profileFailedToday, failedEntries, "ui.emptyFailedToday");
    renderProfileList(elements.profileMasteredList, masteredEntries, "ui.emptyMastered");
    renderProfileList(elements.profileUpcomingList, upcomingEntries, "ui.emptyUpcoming");
}

function currentAchievementStats() {
    return buildAchievementStats({
        dictionary,
        progress,
        favorites,
        dailyStats,
        profile,
    });
}

function refreshAchievements({ announce = false } = {}) {
    const stats = currentAchievementStats();
    const result = syncAchievements(achievements, stats);
    if (result.changed) {
        achievements = result.state;
        saveAchievements(achievements);
    }
    if (announce) announceUnlockedAchievements(result.newlyUnlocked);
    return {
        stats,
        items: achievementProgress(achievements, stats),
        summary: achievementSummary(achievements),
    };
}

function formatAchievementDate(timestamp) {
    return new Intl.DateTimeFormat(currentLanguage(), {
        day: "numeric",
        month: "short",
    }).format(new Date(timestamp));
}

function makeAchievementCard(achievement) {
    const card = document.createElement("article");
    card.className = "achievement-card";
    card.classList.toggle("unlocked", achievement.unlocked);
    card.classList.toggle("locked", !achievement.unlocked);

    const icon = document.createElement("span");
    icon.className = "achievement-icon";
    icon.textContent = achievement.icon;
    icon.setAttribute("aria-hidden", "true");

    const body = document.createElement("span");
    body.className = "achievement-body";

    const title = document.createElement("strong");
    title.textContent = t(achievement.titleKey);

    const description = document.createElement("small");
    description.textContent = t(achievement.descriptionKey);

    const progressLine = document.createElement("span");
    progressLine.className = "achievement-progress-text";
    progressLine.textContent = achievement.unlocked
        ? t("ui.achievementUnlockedAt", { date: formatAchievementDate(achievement.unlockedAt) })
        : t("ui.achievementProgress", {
            count: achievement.clampedValue,
            goal: achievement.goal,
        });

    const bar = document.createElement("span");
    bar.className = "achievement-track";
    const fill = document.createElement("span");
    fill.style.width = `${achievement.percent}%`;
    bar.appendChild(fill);

    body.append(title, description, progressLine, bar);
    card.append(icon, body);
    return card;
}

function renderAchievements() {
    const { items, summary } = refreshAchievements();
    elements.achievementSummary.textContent = t("ui.achievementsSummary", {
        unlocked: summary.unlocked,
        total: summary.total,
    });
    elements.achievementCount.textContent = `${summary.unlocked}/${summary.total}`;

    const fragment = document.createDocumentFragment();
    for (const achievement of items) {
        fragment.appendChild(makeAchievementCard(achievement));
    }
    elements.achievementList.replaceChildren(fragment);
}

function renderProfile() {
    const today = dailySummary(dailyStats, profile);
    const stats = practiceStats(dailyStats, profile);
    elements.profileGreeting.textContent = profile.name
        ? t("ui.profileGreetingNamed", { name: profile.name })
        : t("ui.profileGreeting");
    elements.profileSummary.textContent = t("ui.profileSummary", {
        count: today.uniqueCount,
        goal: today.goal,
        reviews: today.reviews,
    });

    if (document.activeElement !== elements.profileName) elements.profileName.value = profile.name;
    if (document.activeElement !== elements.dailyGoal) elements.dailyGoal.value = profile.dailyGoal;
    if (document.activeElement !== elements.reminderTime) {
        elements.reminderTime.value = practiceReminder.preferredTime || "19:00";
    }
    elements.goalChips.forEach(chip => {
        chip.classList.toggle("active", Number(chip.dataset.goal) === Number(profile.dailyGoal));
    });

    if (document.activeElement !== elements.similarityThreshold) {
        elements.similarityThreshold.value = profile.similarityThreshold;
    }
    elements.thresholdChips.forEach(chip => {
        chip.classList.toggle("active", Number(chip.dataset.threshold) === Number(profile.similarityThreshold));
    });
    elements.strokeEvaluatorToggle.setAttribute("aria-pressed", String(profile.strokeEvaluatorEnabled));
    elements.strokeEvaluatorToggle.textContent = profile.strokeEvaluatorEnabled
        ? t("ui.strokeEvaluatorDisable")
        : t("ui.strokeEvaluatorEnable");
    elements.strokeEvaluatorCanvasToggle.setAttribute("aria-pressed", String(profile.strokeEvaluatorEnabled));
    elements.strokeEvaluatorCanvasState.textContent = profile.strokeEvaluatorEnabled
        ? t("ui.toggleOn")
        : t("ui.toggleOff");

    elements.profileTodayUnique.textContent = today.uniqueCount;
    elements.profileTodayReviews.textContent = today.reviews;
    elements.profileActiveDays.textContent = stats.activeDays;
    elements.profileGoalDays.textContent = stats.goalDays;
    elements.profileCurrentStreak.textContent = stats.currentGoalStreak;
    elements.profileBestStreak.textContent = stats.bestGoalStreak;
    renderAchievements();
    renderDailyHistory();
    renderProfileLists();
}

function saveProfileFromForm() {
    profile = {
        ...profile,
        name: elements.profileName.value,
        dailyGoal: elements.dailyGoal.value,
        similarityThreshold: elements.similarityThreshold.value,
    };
    saveProfile(profile);
    profile = loadProfile();
    saveReminderTime(elements.reminderTime.value);
    updateProgressUI();
    showToast(t("ui.profileSaved"));
}

function toggleStrokeEvaluator() {
    profile = { ...profile, strokeEvaluatorEnabled: !profile.strokeEvaluatorEnabled };
    saveProfile(profile);
    profile = loadProfile();
    renderProfile();
    showToast(profile.strokeEvaluatorEnabled
        ? t("ui.strokeEvaluatorEnabledToast", { threshold: profile.similarityThreshold })
        : t("ui.strokeEvaluatorDisabledToast"), 4200);
}

function openAboutModal() {
    elements.appVersion.textContent = `v${APP_VERSION}`;
    updateFeedbackCounter();
    elements.aboutModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    elements.aboutContent.focus();
}

function closeAboutModal() {
    if (elements.aboutModal.classList.contains("hidden")) return;
    elements.aboutModal.classList.add("hidden");
    document.body.style.overflow = "";
    elements.aboutButton.focus();
}

function updateFeedbackCounter() {
    const count = elements.feedbackText.value.length;
    elements.feedbackCounter.textContent = t("ui.feedbackCounter", { count, max: 500 }, `${count} / 500`);
}

async function sendFeedback() {
    const message = elements.feedbackText.value.trim();
    if (message.length < 10) {
        elements.feedbackStatus.textContent = t("ui.feedbackTooShort");
        return;
    }
    if (message.length > 500) {
        elements.feedbackStatus.textContent = t("ui.feedbackTooLong");
        return;
    }

    elements.feedbackSend.disabled = true;
    elements.feedbackStatus.textContent = t("ui.feedbackSending");

    try {
        await fetch(FEEDBACK_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            body: new URLSearchParams({
                comment: message,
                language: currentLanguage(),
                version: APP_VERSION,
                userName: profile.name,
                url: window.location.href,
                userAgent: navigator.userAgent,
            }),
        });
        elements.feedbackText.value = "";
        updateFeedbackCounter();
        elements.feedbackStatus.textContent = t("ui.feedbackSent");
    } catch (error) {
        console.warn("No se pudo enviar la recomendación.", error);
        elements.feedbackStatus.textContent = t("ui.feedbackSendError");
    } finally {
        elements.feedbackSend.disabled = false;
    }
}

function matchesStudyFilter(item) {
    const filter = elements.studyFilter.value;
    if (filter === "todos") return true;
    if (filter === "kana") return item.tipo === "hiragana" || item.tipo === "katakana";
    if (filter === "importantes") return Boolean(favorites[itemId(item)]);
    if (filter === "dominadas") return isMastered(progress[itemId(item)]);
    if (/^N\d$/u.test(filter)) return item.tipo === "kanji" && item.categoria === filter;
    return item.tipo === filter;
}

function matchesSearch(item, query, includeContext = true) {
    if (!query) return true;
    const primaryValues = [
        item.caracter,
        item.romaji,
        item.significado,
        item.onyomi,
        item.kunyomi,
    ];
    const contextValues = [
        item.contraparte,
        item.palabra_ejemplo,
        item.example?.word,
        item.example?.reading,
        item.example?.meaning,
        item.example?.sentence,
        item.example?.sentenceMeaning,
    ];
    const values = includeContext ? [...primaryValues, ...contextValues] : primaryValues;
    const latinQuery = /^[a-z0-9 ]+$/.test(query);
    return values.some(value => {
        const normalized = normalizeSearch(value);
        if (!latinQuery || query.includes(" ")) return normalized.includes(query);
        return normalized
            .split(/[^a-z0-9]+/)
            .filter(Boolean)
            .some(word => word.startsWith(query));
    });
}

function makeDictionaryCard(item, index) {
    const id = itemId(item);
    const record = progress[id];
    const favorite = Boolean(favorites[id]);
    const mastered = isMastered(record);
    const statusLabels = [
        favorite ? t("ui.studyFavoriteBadge") : "",
        mastered ? t("ui.studyMasteredBadge") : "",
    ].filter(Boolean);
    const card = document.createElement("article");
    card.className = "dictionary-card";
    card.classList.toggle("is-favorite", favorite);
    card.classList.toggle("is-mastered", mastered);

    const favoriteToggle = document.createElement("button");
    favoriteToggle.type = "button";
    favoriteToggle.className = "dictionary-favorite-toggle";
    favoriteToggle.classList.toggle("active", favorite);
    favoriteToggle.textContent = favorite ? "★" : "☆";
    favoriteToggle.setAttribute("aria-pressed", String(favorite));
    favoriteToggle.setAttribute("aria-label", favorite ? t("ui.removeFavorite") : t("ui.addFavorite"));
    favoriteToggle.title = favorite ? t("ui.removeFavorite") : t("ui.addFavorite");
    favoriteToggle.addEventListener("click", () => toggleFavoriteForItem(item));

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "dictionary-card-main";
    detailsButton.setAttribute(
        "aria-label",
        `${t("ui.openDetails", {
            character: item.caracter,
            reading: item.romaji,
            meaning: item.significado,
        })}${statusLabels.length ? `. ${statusLabels.join(", ")}` : ""}`,
    );

    const badges = document.createElement("span");
    badges.className = "dictionary-badges";
    badges.setAttribute("aria-hidden", "true");
    if (mastered) {
        const masteredBadge = document.createElement("span");
        masteredBadge.className = "dictionary-badge mastered";
        masteredBadge.title = t("ui.studyMasteredBadge");
        masteredBadge.textContent = "✓";
        badges.appendChild(masteredBadge);
    }
    const character = document.createElement("span");
    character.className = "dictionary-character";
    character.textContent = item.caracter;
    const reading = document.createElement("span");
    reading.className = "dictionary-reading";
    reading.textContent = item.romaji;
    const meaning = document.createElement("span");
    meaning.className = "dictionary-meaning";
    meaning.textContent = item.significado;
    const type = document.createElement("span");
    type.className = "dictionary-type";
    type.textContent = `${item.tipoLabel} · ${itemStateLabel(record)}`;

    detailsButton.append(character, reading, meaning, type);
    detailsButton.addEventListener("click", () => openModal(index, detailsButton));
    card.append(favoriteToggle, badges, detailsButton);
    return card;
}

function renderDictionary() {
    const query = normalizeSearch(elements.search.value);
    const baseItems = dictionary.filter(matchesStudyFilter);
    const primaryMatches = query
        ? baseItems.filter(item => matchesSearch(item, query, false))
        : baseItems;
    filteredStudyItems = primaryMatches.length
        ? primaryMatches
        : baseItems.filter(item => matchesSearch(item, query, true));
    elements.resultCount.textContent = formatResultCount(filteredStudyItems.length);

    if (!filteredStudyItems.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = t("ui.emptyResults");
        elements.dictionary.replaceChildren(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    filteredStudyItems.forEach((item, index) =>
        fragment.appendChild(makeDictionaryCard(item, index)),
    );
    elements.dictionary.replaceChildren(fragment);
}

function setModalRow(row, visible) {
    row.classList.toggle("hidden", !visible);
}

function openModal(index, trigger = modalTrigger) {
    const item = filteredStudyItems[index];
    if (!item) return;
    modalIndex = index;
    modalTrigger = trigger;
    strokeOrderVisible = true;
    modalPad.clear();
    loadModalExpectedStrokes(item);
    updateStrokeOrderDisplay();

    elements.modalCharacter.textContent = item.caracter || "?";
    elements.modalRomaji.textContent = item.romaji || "—";
    elements.modalMeaning.textContent = item.significado || "—";
    elements.modalCategory.textContent = item.categoriaLabel || "—";
    elements.modalCounter.textContent = `${index + 1} / ${filteredStudyItems.length}`;

    const favorite = Boolean(favorites[itemId(item)]);
    elements.favorite.classList.toggle("active", favorite);
    elements.favorite.textContent = favorite ? "★" : "☆";
    elements.favorite.setAttribute("aria-pressed", String(favorite));
    elements.favorite.setAttribute(
        "aria-label",
        favorite ? t("ui.removeFavorite") : t("ui.addFavorite"),
    );

    const kanji = item.tipo === "kanji";
    setModalRow(elements.modalRowCounterpart, !kanji);
    setModalRow(elements.modalRowWord, !kanji);
    setModalRow(elements.modalRowId, kanji);
    setModalRow(elements.modalRowOnyomi, kanji);
    setModalRow(elements.modalRowKunyomi, kanji);
    setVisibility(elements.modalContext, kanji && Boolean(item.example));

    if (kanji) {
        elements.modalId.textContent = item.id_jlpt || "—";
        elements.modalOnyomi.textContent = item.onyomi || "—";
        elements.modalKunyomi.textContent = item.kunyomi || "—";
        if (item.example) {
            elements.modalExampleWord.textContent = item.example.word;
            elements.modalExampleReading.textContent = item.example.reading;
            elements.modalExampleMeaning.textContent = item.example.meaning;
            elements.modalExampleSentence.textContent = item.example.sentence;
            elements.modalExampleSentenceReading.textContent = item.example.sentenceReading;
            elements.modalExampleSentenceMeaning.textContent = item.example.sentenceMeaning;
        }
    } else {
        elements.modalCounterpart.textContent = item.contraparte || "—";
        elements.modalWord.textContent = item.palabra_ejemplo || "—";
    }

    elements.modalPrevious.disabled = index === 0;
    elements.modalNext.disabled = index === filteredStudyItems.length - 1;
    elements.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    elements.modalContent.focus();
}

function closeModal() {
    if (elements.modal.classList.contains("hidden")) return;
    elements.modal.classList.add("hidden");
    document.body.style.overflow = "";
    strokeAnimator.stop();
    modalTrigger?.focus?.();
}

function currentModalItem() {
    return filteredStudyItems[modalIndex] ?? null;
}

function toggleFavoriteForItem(item, { keepModalOpen = false } = {}) {
    if (!item) return;
    const id = itemId(item);
    const wasFavorite = Boolean(favorites[id]);
    if (wasFavorite) delete favorites[id];
    else favorites[id] = true;
    saveFavorites(favorites);
    refreshAchievements({ announce: true });
    updateProgressUI();
    renderDictionary();
    if (elements.studyFilter.value === "importantes" && wasFavorite) {
        if (keepModalOpen) {
            closeModal();
            elements.search.focus();
        }
        return;
    }
    if (keepModalOpen) openModal(modalIndex, modalTrigger);
}

function toggleFavorite() {
    toggleFavoriteForItem(currentModalItem(), { keepModalOpen: true });
}

function trapModalFocus(event, modal = elements.modal) {
    if (event.key !== "Tab" || modal.classList.contains("hidden")) return;
    const focusable = [...modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter(element => !element.classList.contains("hidden"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function exportProgress() {
    const blob = new Blob(
        [createBackup(progress, favorites, settings, practiceReminder, profile, dailyStats, achievements)],
        { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kanjiflow-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(t("ui.backupCreated"));
}

async function importProgress(file) {
    try {
        const imported = parseBackup(await file.text());
        replaceStoredData(imported);
        progress = imported.progress;
        favorites = imported.favorites;
        settings = imported.settings;
        practiceReminder = imported.reminder;
        profile = imported.profile;
        dailyStats = imported.dailyStats;
        achievements = imported.achievements;
        restoreSettings();
        saveReminderState(practiceReminder);
        refreshAchievements();
        updateProgressUI();
        renderProfile();
        presentChallenge();
        renderDictionary();
        showToast(t("ui.backupImported"));
    } catch (error) {
        showToast(error.message || t("ui.backupInvalid"));
    } finally {
        elements.importFile.value = "";
    }
}

function updateConnection() {
    const online = navigator.onLine;
    elements.connection.textContent = online ? t("ui.online") : t("ui.offline");
    elements.connection.classList.toggle("offline", !online);
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("service-worker.js").catch(error => {
            console.warn("No se pudo activar el modo sin conexión.", error);
        });
    }
}

function bindEvents() {
    elements.practiceTab.addEventListener("click", () => switchTab("practice"));
    elements.studyTab.addEventListener("click", () => switchTab("study"));
    elements.profileTab.addEventListener("click", () => switchTab("profile"));
    elements.languageSelect.addEventListener("change", () => changeLanguage(elements.languageSelect.value));
    elements.onboardingLanguageButtons.forEach(button => {
        button.addEventListener("click", () => changeLanguage(button.dataset.onboardingLanguage));
    });
    elements.reminderButton.addEventListener("click", togglePracticeReminder);
    const tabs = [elements.practiceTab, elements.studyTab, elements.profileTab];
    for (const tab of tabs) {
        tab.addEventListener("keydown", event => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const target = tabs[(tabs.indexOf(tab) + direction + tabs.length) % tabs.length];
            target.click();
            target.focus();
        });
    }

    elements.categorySelect.addEventListener("change", () => {
        populateLessons();
        saveCurrentSettings();
        presentChallenge();
    });

    for (const select of [elements.lessonSelect, elements.scriptSelect, elements.sessionSelect]) {
        select.addEventListener("change", () => {
            saveCurrentSettings();
            presentChallenge();
        });
    }

    elements.saveProfile.addEventListener("click", saveProfileFromForm);
    elements.profileName.addEventListener("keydown", event => {
        if (event.key === "Enter") saveProfileFromForm();
    });
    elements.dailyGoal.addEventListener("keydown", event => {
        if (event.key === "Enter") saveProfileFromForm();
    });
    elements.reminderTime.addEventListener("keydown", event => {
        if (event.key === "Enter") saveProfileFromForm();
    });
    elements.goalChips.forEach(chip => {
        chip.addEventListener("click", () => {
            elements.dailyGoal.value = chip.dataset.goal;
            saveProfileFromForm();
        });
    });
    elements.similarityThreshold.addEventListener("keydown", event => {
        if (event.key === "Enter") saveProfileFromForm();
    });
    elements.thresholdChips.forEach(chip => {
        chip.addEventListener("click", () => {
            elements.similarityThreshold.value = chip.dataset.threshold;
            saveProfileFromForm();
        });
    });
    elements.strokeEvaluatorToggle.addEventListener("click", toggleStrokeEvaluator);
    elements.strokeEvaluatorCanvasToggle.addEventListener("click", toggleStrokeEvaluator);
    elements.aboutButton.addEventListener("click", openAboutModal);
    elements.closeAbout.addEventListener("click", closeAboutModal);
    elements.aboutModal.addEventListener("click", event => {
        if (event.target === elements.aboutModal) closeAboutModal();
    });
    elements.feedbackText.addEventListener("input", updateFeedbackCounter);
    elements.feedbackSend.addEventListener("click", sendFeedback);
    elements.onboardingForm.addEventListener("submit", event => {
        event.preventDefault();
        completeOnboarding(true);
    });
    elements.onboardingSkipTour.addEventListener("click", () => completeOnboarding(false));
    elements.onboardingName.addEventListener("input", () => {
        elements.onboardingError.textContent = "";
    });
    elements.tourSkip.addEventListener("click", () => finishTour(false));
    elements.tourPrevious.addEventListener("click", () => showTourStep(tourIndex - 1));
    elements.tourNext.addEventListener("click", () => showTourStep(tourIndex + 1));

    elements.clearBoard.addEventListener("click", clearPracticeBoard);
    elements.reveal.addEventListener("click", revealAnswer);
    elements.practiceSound.addEventListener("click", () => speakJapanese(itemPronunciation(currentItem)));
    elements.answerSound.addEventListener("click", () => speakJapanese(answerAudioText()));
    document.querySelectorAll("[data-rating]").forEach(button => {
        button.addEventListener("click", () => rateCurrent(button.dataset.rating));
    });

    elements.search.addEventListener("input", renderDictionary);
    elements.studyFilter.addEventListener("change", renderDictionary);

    elements.closeModal.addEventListener("click", closeModal);
    elements.modal.addEventListener("click", event => {
        if (event.target === elements.modal) closeModal();
    });
    elements.favorite.addEventListener("click", toggleFavorite);
    elements.clearModalBoard.addEventListener("click", modalPad.clear);
    elements.toggleStrokes.addEventListener("click", () => {
        strokeOrderVisible = !strokeOrderVisible;
        updateStrokeOrderDisplay();
    });
    elements.animationSpeedButton.addEventListener("click", cycleAnimationSpeed);
    elements.modalPrevious.addEventListener("click", () => openModal(modalIndex - 1, modalTrigger));
    elements.modalNext.addEventListener("click", () => openModal(modalIndex + 1, modalTrigger));

    elements.modalMainSound.addEventListener("click", () => speakJapanese(answerAudioText(currentModalItem())));
    elements.modalWordSound.addEventListener("click", () => speakJapanese(exampleJapanese(currentModalItem()?.palabra_ejemplo)));
    elements.modalOnyomiSound.addEventListener("click", () => speakJapanese(japaneseOnly(currentModalItem()?.onyomi)));
    elements.modalKunyomiSound.addEventListener("click", () => speakJapanese(japaneseOnly(currentModalItem()?.kunyomi)));
    elements.modalSentenceSound.addEventListener("click", () => speakJapanese(currentModalItem()?.example?.sentence));

    elements.modal.addEventListener("touchstart", event => {
        if (event.target === elements.modalBoard) return;
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });
    elements.modal.addEventListener("touchend", event => {
        if (event.target === elements.modalBoard || !touchStartX) return;
        const difference = event.changedTouches[0].screenX - touchStartX;
        if (difference < -60 && !elements.modalNext.disabled) elements.modalNext.click();
        if (difference > 60 && !elements.modalPrevious.disabled) elements.modalPrevious.click();
        touchStartX = 0;
    }, { passive: true });

    document.addEventListener("keydown", event => {
        if (!elements.tourPopover.classList.contains("hidden")) {
            if (event.key === "Escape") finishTour(false);
            return;
        }
        if (!elements.onboardingModal.classList.contains("hidden")) {
            trapModalFocus(event, elements.onboardingModal);
            return;
        }
        if (!elements.aboutModal.classList.contains("hidden")) {
            if (event.key === "Escape") closeAboutModal();
            trapModalFocus(event, elements.aboutModal);
            return;
        }
        if (elements.modal.classList.contains("hidden")) return;
        if (event.key === "Escape") closeModal();
        else if (event.key === "ArrowLeft" && !elements.modalPrevious.disabled) elements.modalPrevious.click();
        else if (event.key === "ArrowRight" && !elements.modalNext.disabled) elements.modalNext.click();
        trapModalFocus(event);
    });

    elements.exportButton.addEventListener("click", exportProgress);
    elements.importButton.addEventListener("click", () => elements.importFile.click());
    elements.importFile.addEventListener("change", () => {
        const [file] = elements.importFile.files;
        if (file) importProgress(file);
    });

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    window.addEventListener("focus", () => checkPracticeReminder({ notify: false }));
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) checkPracticeReminder({ notify: false });
    });
}

async function init() {
    settings = {
        ...settings,
        language: detectInitialLanguage(settings.language),
    };
    await loadLocale(settings.language);
    saveSettings(settings);
    ensureExistingProfileIdentity();
    applyDocumentTranslations();
    populateLanguageSelect();
    populateLessons();
    restoreSettings();
    bindEvents();
    elements.splashVersion.textContent = `v${APP_VERSION}`;
    elements.appVersion.textContent = `v${APP_VERSION}`;
    renderProfile();
    updateFeedbackCounter();
    updateConnection();
    updateReminderUI();
    scheduleReminderTimer();
    registerServiceWorker();

    try {
        baseDictionary = await loadDictionary();
        localizeLoadedDictionary();
        refreshAchievements();
        updateProgressUI();
        presentChallenge();
        renderDictionary();
        setTimeout(() => checkPracticeReminder({ notify: false }), 700);
    } catch (error) {
        console.error(error);
        elements.typeInfo.textContent = t("ui.loadErrorTag");
        elements.question.textContent = t("ui.loadErrorQuestion");
        elements.hint.textContent = t("ui.loadErrorHint");
        elements.reveal.disabled = true;
    } finally {
        finishSplashAndMaybeOnboard();
    }
}

init();
