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
    savePracticeReminder,
    saveProfile,
    saveProgress,
    saveSettings,
} from "./storage.js";
import { createDrawingPad } from "./drawing.js";
import { exampleJapanese, itemPronunciation, japaneseOnly, speakJapanese } from "./audio.js";
import { loadDictionary } from "./data.js";
import {
    dailyEntry,
    dailySummary,
    practiceStats,
    recentDailySummaries,
    recordDailyPractice,
} from "./profile.js?v=620";
import {
    disablePracticeReminder,
    enablePracticeReminder,
    isPracticeReminderDue,
    markPracticeReminderNotified,
    recordPractice,
    shouldNotifyPracticeReminder,
} from "./reminders.js?v=500";
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
} from "./i18n.js?v=620";

const APP_VERSION = "0.6.2";
const FEEDBACK_ENDPOINT = "https://script.google.com/macros/s/AKfycbxiz6058zwMxfPTDTmIBpG8JutOPw8YBxCRJ0BeMHp-py6IXZy4zkZs2IdTqwmSSzC1jw/exec";

const $ = selector => document.querySelector(selector);
const elements = {
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
    clearBoard: $("#btn-limpiar"),
    reveal: $("#btn-revelar"),
    recognition: $("#btn-evaluar-ia"),
    recognitionStatus: $("#estado-reconocimiento"),
    answerPanel: $("#panel-respuesta"),
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
    toast: $("#toast"),
    languageSelect: $("#selector-idioma"),
    reminderButton: $("#btn-recordatorio"),
    reminderIcon: $("#icono-recordatorio"),
    reminderText: $("#texto-recordatorio"),
    profileGreeting: $("#perfil-saludo"),
    profileSummary: $("#perfil-resumen"),
    profileName: $("#perfil-nombre"),
    dailyGoal: $("#meta-diaria"),
    saveProfile: $("#btn-guardar-perfil"),
    goalChips: document.querySelectorAll("[data-goal]"),
    profileTodayUnique: $("#perfil-hoy-unicas"),
    profileTodayReviews: $("#perfil-hoy-repasos"),
    profileActiveDays: $("#perfil-dias-activos"),
    profileGoalDays: $("#perfil-dias-meta"),
    profileCurrentStreak: $("#perfil-racha-actual"),
    profileBestStreak: $("#perfil-mejor-racha"),
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
let toastTimer = null;
let reminderTimer = null;
let touchStartX = 0;

const practicePad = createDrawingPad(elements.board, { lineWidth: 12 });
const modalPad = createDrawingPad(elements.modalBoard, { lineWidth: 7 });

function itemStateLabel(record) {
    return translateCardState(cardState(record));
}

function localizeLoadedDictionary() {
    dictionary = localizeDictionary(baseDictionary);
}

function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function saveReminderState(nextReminder = practiceReminder) {
    practiceReminder = nextReminder;
    savePracticeReminder(practiceReminder);
    updateReminderUI();
    scheduleReminderTimer();
}

function reminderButtonText() {
    if (!practiceReminder.enabled) return t("ui.reminderOff");
    if (isPracticeReminderDue(practiceReminder)) return t("ui.reminderDueButton");
    return t("ui.reminderOn");
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
            : t("ui.reminderOnLabel", { time: formatRelativeTime(practiceReminder.nextReminderAt) })
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

function populateLanguageSelect() {
    const fragment = document.createDocumentFragment();
    for (const language of AVAILABLE_LANGUAGES) {
        const option = document.createElement("option");
        option.value = language.code;
        option.textContent = language.label;
        fragment.appendChild(option);
    }
    elements.languageSelect.replaceChildren(fragment);
    elements.languageSelect.value = currentLanguage();
}

function populateLessons() {
    const fragment = document.createDocumentFragment();
    for (const lesson of LESSONS) {
        const option = document.createElement("option");
        option.value = lesson.id;
        option.textContent = lessonTitle(lesson);
        fragment.appendChild(option);
    }
    elements.lessonSelect.replaceChildren(fragment);
}

function saveCurrentSettings() {
    settings = {
        ...settings,
        lesson: elements.lessonSelect.value,
        script: elements.scriptSelect.value,
        session: elements.sessionSelect.value,
        language: currentLanguage(),
    };
    saveSettings(settings);
}

function restoreSettings() {
    const lessonExists = LESSONS.some(lesson => lesson.id === settings.lesson);
    elements.lessonSelect.value = lessonExists ? settings.lesson : "recommended";
    elements.scriptSelect.value = settings.script || "todos";
    elements.sessionSelect.value = settings.session || "recomendado";
}

function applyLanguageToUI() {
    applyDocumentTranslations();
    populateLanguageSelect();
    populateLessons();
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
    if (language === currentLanguage()) return;
    settings = {
        ...settings,
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
    practicePad.clear();
    const poolData = getPracticePool();
    elements.lessonDescription.textContent = lessonDescription(poolData.lesson);
    currentItem = chooseNext(poolData.items, previousItemId, progress);

    if (!currentItem) {
        elements.typeInfo.textContent = t("ui.noCardsTag");
        elements.cardState.textContent = "";
        elements.question.textContent = t("ui.noCardsQuestion");
        elements.hint.textContent = t("ui.noCardsHint");
        elements.reveal.disabled = true;
        elements.recognition.disabled = true;
        return;
    }

    previousItemId = itemId(currentItem);
    const record = progress[previousItemId];
    elements.reveal.disabled = false;
    elements.recognition.disabled = !navigator.onLine;
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
    return item.example?.reading || itemPronunciation(item);
}

function revealAnswer() {
    if (!currentItem) return;
    practicePad.overlay(currentItem.caracter);
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
    elements.answerPanel.classList.remove("hidden");
    elements.answerPanel.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
}

function rateCurrent(rating) {
    if (!currentItem) return;
    const id = itemId(currentItem);
    const nextRecord = scheduleReview(progress[id], rating);
    progress[id] = nextRecord;
    saveProgress(progress);
    const reachedDailyGoal = trackPracticeActivity(nextRecord.lastReviewedAt, id, rating);
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
    elements.goalChips.forEach(chip => {
        chip.classList.toggle("active", Number(chip.dataset.goal) === Number(profile.dailyGoal));
    });

    elements.profileTodayUnique.textContent = today.uniqueCount;
    elements.profileTodayReviews.textContent = today.reviews;
    elements.profileActiveDays.textContent = stats.activeDays;
    elements.profileGoalDays.textContent = stats.goalDays;
    elements.profileCurrentStreak.textContent = stats.currentGoalStreak;
    elements.profileBestStreak.textContent = stats.bestGoalStreak;
    renderDailyHistory();
    renderProfileLists();
}

function saveProfileFromForm() {
    profile = {
        ...profile,
        name: elements.profileName.value,
        dailyGoal: elements.dailyGoal.value,
    };
    saveProfile(profile);
    profile = loadProfile();
    updateProgressUI();
    showToast(t("ui.profileSaved"));
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
    if (filter === "N5") return item.tipo === "kanji" && item.categoria === "N5";
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dictionary-card";
    button.setAttribute(
        "aria-label",
        t("ui.openDetails", {
            character: item.caracter,
            reading: item.romaji,
            meaning: item.significado,
        }),
    );

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
    type.textContent = `${item.tipoLabel} · ${itemStateLabel(progress[itemId(item)])}`;

    button.append(character, reading, meaning, type);
    button.addEventListener("click", () => openModal(index, button));
    return button;
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
    strokeOrderVisible = false;
    elements.modalCharacter.classList.remove("stroke-order");
    elements.toggleStrokes.setAttribute("aria-pressed", "false");
    elements.toggleStrokes.textContent = t("ui.showStrokeOrder");
    modalPad.clear();

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
    modalTrigger?.focus?.();
}

function currentModalItem() {
    return filteredStudyItems[modalIndex] ?? null;
}

function toggleFavorite() {
    const item = currentModalItem();
    if (!item) return;
    const id = itemId(item);
    const wasFavorite = Boolean(favorites[id]);
    if (wasFavorite) delete favorites[id];
    else favorites[id] = true;
    saveFavorites(favorites);
    updateProgressUI();
    if (elements.studyFilter.value === "importantes" && wasFavorite) {
        renderDictionary();
        closeModal();
        elements.search.focus();
        return;
    }
    openModal(modalIndex, modalTrigger);
    if (elements.studyFilter.value === "importantes") renderDictionary();
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

function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-tesseract]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.Tesseract), { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.dataset.tesseract = "true";
        script.async = true;
        script.addEventListener("load", () => resolve(window.Tesseract), { once: true });
        script.addEventListener("error", () => reject(new Error("No se pudo descargar el reconocedor.")), { once: true });
        document.head.appendChild(script);
    });
}

async function recognizeDrawing() {
    if (!currentItem || !practicePad.hasDrawing()) {
        showToast(t("ui.drawFirst"));
        return;
    }
    if (!navigator.onLine) {
        showToast(t("ui.recognitionNeedsConnection"));
        return;
    }

    const original = elements.recognition.textContent;
    elements.recognition.disabled = true;
    elements.recognition.textContent = t("ui.recognitionAnalyzing");
    elements.recognitionStatus.textContent = t("ui.recognitionLoading");
    let worker;

    try {
        const tesseract = await loadTesseract();
        worker = await tesseract.createWorker("jpn");
        await worker.setParameters({
            tessedit_pageseg_mode: currentItem.caracter.length > 1 ? "8" : "10",
        });
        const result = await worker.recognize(practicePad.recognitionDataURL());
        const detected = result.data.text.replace(/\s+/g, "");
        const expected = currentItem.caracter.replace(/\s+/g, "");
        if (detected.includes(expected)) {
            elements.recognitionStatus.textContent = t("ui.recognitionMatched", {
                detected: result.data.text.trim(),
            });
            showToast(t("ui.recognitionMatchedToast"));
            revealAnswer();
        } else {
            elements.recognitionStatus.textContent = t("ui.recognitionMissed", {
                detected: result.data.text.trim() || t("ui.recognitionNothing"),
                expected: currentItem.caracter,
            });
            showToast(t("ui.recognitionMissedToast"));
        }
    } catch (error) {
        console.error(error);
        elements.recognitionStatus.textContent = t("ui.recognitionError");
        showToast(t("ui.recognitionErrorToast"));
    } finally {
        await worker?.terminate?.();
        const label = document.createElement("span");
        label.dataset.i18n = "ui.recognizeDrawing";
        label.textContent = t("ui.recognizeDrawing");
        const beta = document.createElement("span");
        beta.className = "beta-label";
        beta.textContent = "beta";
        elements.recognition.replaceChildren(label, " ", beta);
        elements.recognition.disabled = !navigator.onLine;
        if (!elements.recognition.textContent.trim()) elements.recognition.textContent = original;
    }
}

function exportProgress() {
    const blob = new Blob(
        [createBackup(progress, favorites, settings, practiceReminder, profile, dailyStats)],
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
        restoreSettings();
        saveReminderState(practiceReminder);
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
    if (currentItem) elements.recognition.disabled = !online;
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
    elements.goalChips.forEach(chip => {
        chip.addEventListener("click", () => {
            elements.dailyGoal.value = chip.dataset.goal;
            saveProfileFromForm();
        });
    });
    elements.aboutButton.addEventListener("click", openAboutModal);
    elements.closeAbout.addEventListener("click", closeAboutModal);
    elements.aboutModal.addEventListener("click", event => {
        if (event.target === elements.aboutModal) closeAboutModal();
    });
    elements.feedbackText.addEventListener("input", updateFeedbackCounter);
    elements.feedbackSend.addEventListener("click", sendFeedback);

    elements.clearBoard.addEventListener("click", practicePad.clear);
    elements.reveal.addEventListener("click", revealAnswer);
    elements.recognition.addEventListener("click", recognizeDrawing);
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
        elements.modalCharacter.classList.toggle("stroke-order", strokeOrderVisible);
        elements.toggleStrokes.setAttribute("aria-pressed", String(strokeOrderVisible));
        elements.toggleStrokes.textContent = strokeOrderVisible
            ? t("ui.hideStrokeOrder")
            : t("ui.showStrokeOrder");
    });
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
    applyDocumentTranslations();
    populateLanguageSelect();
    populateLessons();
    restoreSettings();
    bindEvents();
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
        elements.recognition.disabled = true;
    }
}

init();
