import {
    LESSONS,
    cardState,
    chooseNext,
    filterBySession,
    filterLesson,
    isDue,
    isMastered,
    isNew,
    itemId,
    normalizeSearch,
    progressStats,
    scheduleReview,
    timeUntil,
} from "./core.js";
import {
    createBackup,
    loadFavorites,
    loadProgress,
    loadSettings,
    parseBackup,
    replaceStoredData,
    saveFavorites,
    saveProgress,
    saveSettings,
} from "./storage.js";
import { createDrawingPad } from "./drawing.js";
import { exampleJapanese, itemPronunciation, japaneseOnly, speakJapanese } from "./audio.js";
import { loadDictionary } from "./data.js";

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
    practiceSection: $("#seccion-practica"),
    studySection: $("#seccion-estudio"),
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
};

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
let toastTimer = null;
let touchStartX = 0;

const practicePad = createDrawingPad(elements.board, { lineWidth: 12 });
const modalPad = createDrawingPad(elements.modalBoard, { lineWidth: 7 });

function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function setVisibility(element, visible) {
    element.classList.toggle("hidden", !visible);
}

function populateLessons() {
    const fragment = document.createDocumentFragment();
    for (const lesson of LESSONS) {
        const option = document.createElement("option");
        option.value = lesson.id;
        option.textContent = lesson.title;
        fragment.appendChild(option);
    }
    elements.lessonSelect.replaceChildren(fragment);
}

function saveCurrentSettings() {
    settings = {
        lesson: elements.lessonSelect.value,
        script: elements.scriptSelect.value,
        session: elements.sessionSelect.value,
    };
    saveSettings(settings);
}

function restoreSettings() {
    const lessonExists = LESSONS.some(lesson => lesson.id === settings.lesson);
    elements.lessonSelect.value = lessonExists ? settings.lesson : "recommended";
    elements.scriptSelect.value = settings.script || "todos";
    elements.sessionSelect.value = settings.session || "recomendado";
}

function currentLessonData() {
    return filterLesson(dictionary, elements.lessonSelect.value, progress);
}

function updateProgressUI() {
    const stats = progressStats(dictionary, progress);
    elements.statNew.textContent = stats.newCount;
    elements.statDue.textContent = stats.dueCount;
    elements.statMastered.textContent = stats.masteredCount;
    elements.statStreak.textContent = stats.bestStreak;
    elements.progressPercent.textContent = `${stats.percent}%`;
    elements.progressBar.style.width = `${stats.percent}%`;
    elements.progressSummary.textContent = stats.dueCount
        ? `${stats.dueCount} tarjeta${stats.dueCount === 1 ? "" : "s"} esperando repaso.`
        : "Estás al día. Puedes aprender tarjetas nuevas.";
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
    return { ...lessonData, items: pool };
}

function presentChallenge() {
    elements.answerPanel.classList.add("hidden");
    practicePad.clear();
    const poolData = getPracticePool();
    elements.lessonDescription.textContent = poolData.lesson.description;
    currentItem = chooseNext(poolData.items, previousItemId, progress);

    if (!currentItem) {
        elements.typeInfo.textContent = "Sin tarjetas";
        elements.cardState.textContent = "";
        elements.question.textContent = "No hay caracteres con estos filtros.";
        elements.hint.textContent = "Prueba otra lección o una sesión diferente.";
        elements.reveal.disabled = true;
        elements.recognition.disabled = true;
        return;
    }

    previousItemId = itemId(currentItem);
    const record = progress[previousItemId];
    elements.reveal.disabled = false;
    elements.recognition.disabled = !navigator.onLine;
    elements.typeInfo.textContent = `${currentItem.tipo} · ${currentItem.categoria}`;
    elements.cardState.textContent = cardState(record);
    elements.question.textContent = currentItem.tipo === "kanji"
        ? `Dibuja «${currentItem.significado}»`
        : currentItem.categoria === "especial"
            ? `Escribe «${currentItem.significado}»`
            : `Escribe el sonido «${currentItem.romaji}»`;
    elements.hint.textContent = currentItem.tipo === "kanji"
        ? "Puedes escuchar una lectura como pista."
        : currentItem.categoria === "especial"
            ? "Revisa la descripción de la lección si necesitas recordar la regla."
            : "Traza el carácter dentro de la cuadrícula.";
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
    elements.answerCategory.textContent = currentItem.categoria || "—";

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
    updateProgressUI();
    const dueText = rating === "again" ? "La veremos de nuevo en esta sesión." : `Próximo repaso ${timeUntil(nextRecord.dueAt)}.`;
    showToast(dueText);
    presentChallenge();
}

function switchTab(tab) {
    const practice = tab === "practice";
    elements.practiceTab.classList.toggle("active", practice);
    elements.studyTab.classList.toggle("active", !practice);
    elements.practiceTab.setAttribute("aria-selected", String(practice));
    elements.studyTab.setAttribute("aria-selected", String(!practice));
    elements.practiceTab.tabIndex = practice ? 0 : -1;
    elements.studyTab.tabIndex = practice ? -1 : 0;
    setVisibility(elements.practiceSection, practice);
    setVisibility(elements.studySection, !practice);
    if (practice) {
        presentChallenge();
    } else {
        renderDictionary();
        elements.search.focus();
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
        `${item.caracter}, ${item.romaji}, ${item.significado}. Abrir detalles`,
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
    type.textContent = `${item.tipo} · ${cardState(progress[itemId(item)])}`;

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
    elements.resultCount.textContent = `${filteredStudyItems.length} resultado${filteredStudyItems.length === 1 ? "" : "s"}`;

    if (!filteredStudyItems.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No se encontraron caracteres con esos filtros.";
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
    elements.toggleStrokes.textContent = "Mostrar orden de trazos";
    modalPad.clear();

    elements.modalCharacter.textContent = item.caracter || "?";
    elements.modalRomaji.textContent = item.romaji || "—";
    elements.modalMeaning.textContent = item.significado || "—";
    elements.modalCategory.textContent = item.categoria || "—";
    elements.modalCounter.textContent = `${index + 1} / ${filteredStudyItems.length}`;

    const favorite = Boolean(favorites[itemId(item)]);
    elements.favorite.classList.toggle("active", favorite);
    elements.favorite.textContent = favorite ? "★" : "☆";
    elements.favorite.setAttribute("aria-pressed", String(favorite));
    elements.favorite.setAttribute(
        "aria-label",
        favorite ? "Quitar de favoritas" : "Añadir a favoritas",
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

function trapModalFocus(event) {
    if (event.key !== "Tab" || elements.modal.classList.contains("hidden")) return;
    const focusable = [...elements.modal.querySelectorAll(
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
        showToast("Primero dibuja un carácter.");
        return;
    }
    if (!navigator.onLine) {
        showToast("El reconocimiento necesita conexión.");
        return;
    }

    const original = elements.recognition.textContent;
    elements.recognition.disabled = true;
    elements.recognition.textContent = "Analizando…";
    elements.recognitionStatus.textContent = "Cargando el reconocimiento japonés. La primera vez puede tardar.";
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
            elements.recognitionStatus.textContent = `Reconocido como «${result.data.text.trim()}». Comprueba el orden de trazos con la guía.`;
            showToast("La forma fue reconocida.");
            revealAnswer();
        } else {
            elements.recognitionStatus.textContent = `Se detectó «${result.data.text.trim() || "nada claro"}»; se esperaba «${currentItem.caracter}».`;
            showToast("No se reconoció la forma. Puedes autoevaluarte.");
        }
    } catch (error) {
        console.error(error);
        elements.recognitionStatus.textContent = "No fue posible usar el reconocimiento. La práctica y la autoevaluación siguen disponibles.";
        showToast("Falló el reconocimiento externo.");
    } finally {
        await worker?.terminate?.();
        const beta = document.createElement("span");
        beta.className = "beta-label";
        beta.textContent = "beta";
        elements.recognition.replaceChildren("Reconocer dibujo ", beta);
        elements.recognition.disabled = !navigator.onLine;
        if (!elements.recognition.textContent.trim()) elements.recognition.textContent = original;
    }
}

function exportProgress() {
    const blob = new Blob(
        [createBackup(progress, favorites, settings)],
        { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kanjiflow-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Copia de progreso creada.");
}

async function importProgress(file) {
    try {
        const imported = parseBackup(await file.text());
        replaceStoredData(imported);
        progress = imported.progress;
        favorites = imported.favorites;
        settings = imported.settings;
        restoreSettings();
        updateProgressUI();
        presentChallenge();
        renderDictionary();
        showToast("Progreso importado correctamente.");
    } catch (error) {
        showToast(error.message || "No se pudo importar la copia.");
    } finally {
        elements.importFile.value = "";
    }
}

function updateConnection() {
    const online = navigator.onLine;
    elements.connection.textContent = online ? "En línea" : "Sin conexión";
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
    for (const tab of [elements.practiceTab, elements.studyTab]) {
        tab.addEventListener("keydown", event => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            const target = tab === elements.practiceTab ? elements.studyTab : elements.practiceTab;
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
            ? "Ocultar orden de trazos"
            : "Mostrar orden de trazos";
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
}

async function init() {
    populateLessons();
    restoreSettings();
    bindEvents();
    updateConnection();
    registerServiceWorker();

    try {
        dictionary = await loadDictionary();
        updateProgressUI();
        presentChallenge();
        renderDictionary();
    } catch (error) {
        console.error(error);
        elements.typeInfo.textContent = "Error";
        elements.question.textContent = "No se pudo cargar el contenido.";
        elements.hint.textContent = "Abre la app desde un servidor local o revisa datos.csv.";
        elements.reveal.disabled = true;
        elements.recognition.disabled = true;
    }
}

init();
