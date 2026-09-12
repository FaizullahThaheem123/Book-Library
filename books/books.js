/* =========================================================
   BOOK LIBRARY — BOOKS PAGE JAVASCRIPT
   Version 8.0 (Language Filter — English Excluded)
========================================================= */

"use strict";

const CONFIG = {
    API_URL: "https://openlibrary.org/search.json",
    ARCHIVE_URL: "https://archive.org",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    PAGE_SIZE: 100,
    DEFAULT_QUERY: "best books",
    MAX_LOAD: 200,
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
    DETAILS_PAGE: "../book-details/book-details.html",
    SEARCH_PAGE: "../search/search.html"
};

const LANGUAGE_NAMES = {
    eng: "English", urd: "Urdu", ara: "Arabic", hin: "Hindi",
    fre: "French", ger: "German", spa: "Spanish", ita: "Italian",
    por: "Portuguese", rus: "Russian", chi: "Chinese", jpn: "Japanese",
    tur: "Turkish", per: "Persian"
};

const state = {
    query: "",
    page: 1,
    total: 0,
    books: [],
    sort: "relevance",
    filter: "all",
    language: "all",
    loading: false
};

const elements = {
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    booksGrid: document.getElementById("booksGrid"),
    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    loadMoreButton: document.getElementById("loadMoreButton"),
    paginationInfo: document.getElementById("paginationInfo"),
    resultsTitle: document.getElementById("resultsTitle"),
    resultsInfo: document.getElementById("resultsInfo"),
    sortSelect: document.getElementById("sortSelect"),
    resetSearch: document.getElementById("resetSearch"),
    themeToggle: document.getElementById("themeToggle"),
    mobileMenuButton: document.getElementById("mobileMenuButton"),
    mobileMenu: document.getElementById("mobileMenu"),
    randomBookButton: document.getElementById("randomBookButton"),
    headerSearchBtn: document.getElementById("headerSearchBtn"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage"),
    toastIcon: document.getElementById("toastIcon"),
    languageSelect: document.getElementById("languageSelect"),
    languageNotice: document.getElementById("languageNotice")
};

let toastTimer = null;

document.addEventListener("DOMContentLoaded", function () {
    initializeHeaderEvents();
    initializeTheme();
    initializeMobileMenu();
    initializeSearch();
    initializeQuickSearch();
    initializeFilters();
    initializeSorting();
    initializeLoadMore();
    initializeReset();
    initializeRandomBook();
    initializeLanguage();
    setupThemeSync();
    loadInitialBooks();
});

function setupThemeSync() {
    window.addEventListener("storage", function (e) {
        if (e.key === CONFIG.THEME_KEY) {
            const newTheme = e.newValue;
            if (newTheme === "dark") {
                document.body.classList.add("dark");
                if (elements.themeToggle) elements.themeToggle.textContent = "☀️";
            } else {
                document.body.classList.remove("dark");
                if (elements.themeToggle) elements.themeToggle.textContent = "🌙";
            }
        }
    });
}

function initializeHeaderEvents() {
    if (elements.headerSearchBtn) {
        elements.headerSearchBtn.addEventListener("click", function () {
            window.location.href = CONFIG.SEARCH_PAGE;
        });
    }
}

function initializeTheme() {
    const saved = localStorage.getItem(CONFIG.THEME_KEY);
    if (saved === "dark") {
        document.body.classList.add("dark");
        if (elements.themeToggle) elements.themeToggle.textContent = "☀️";
    }
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark");
            const dark = document.body.classList.contains("dark");
            localStorage.setItem(CONFIG.THEME_KEY, dark ? "dark" : "light");
            this.textContent = dark ? "☀️" : "🌙";
        });
    }
}

function initializeMobileMenu() {
    if (!elements.mobileMenuButton || !elements.mobileMenu) return;
    elements.mobileMenuButton.addEventListener("click", function (e) {
        e.stopPropagation();
        elements.mobileMenu.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
        if (elements.mobileMenu.classList.contains("open") &&
            !elements.mobileMenu.contains(e.target) &&
            !elements.mobileMenuButton.contains(e.target)) {
            elements.mobileMenu.classList.remove("open");
        }
    });
    elements.mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function () {
            elements.mobileMenu.classList.remove("open");
        });
    });
}

function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || params.get("subject") || "";
}

function loadInitialBooks() {
    const urlQuery = getQueryFromURL();
    if (urlQuery) {
        state.query = urlQuery;
        if (elements.searchInput) elements.searchInput.value = urlQuery;
        searchBooks(true);
        return;
    }
    state.query = CONFIG.DEFAULT_QUERY;
    searchBooks(true);
}

function initializeSearch() {
    if (!elements.searchForm) return;
    elements.searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = elements.searchInput.value.trim();
        if (!query) {
            showToast("Please enter a book title or author.", "!");
            return;
        }
        state.query = query;
        state.page = 1;
        updateURL(query);
        searchBooks(true);
    });
}

/* =========================================================
   LANGUAGE MATCH HELPER
========================================================= */
function getLangCode(lang) {
    if (!lang) return "";
    var str = typeof lang === "object" ? (lang.key || lang.code || "") : String(lang);
    return str.replace("/languages/", "").trim().toLowerCase();
}

function hasLanguage(book, langCode) {
    if (!Array.isArray(book.language)) return false;
    var target = langCode.toLowerCase();
    return book.language.some(function (l) { return getLangCode(l) === target; });
}

function hasEnglish(book) {
    return hasLanguage(book, "eng");
}

function isFocusedLanguage(book, langCode) {
    // ✅ Book must have the target language
    if (!hasLanguage(book, langCode)) return false;

    var target = langCode.toLowerCase();

    // ✅ If target is English — no extra filter
    if (target === "eng") return true;

    // ✅ Reject if English is present (means it's a Western work)
    if (hasEnglish(book)) return false;

    // ✅ Reject if a "Western" language is the FIRST language
    var firstLang = getLangCode(book.language[0]);
    var westernLangs = ["eng", "ger", "fre", "ita", "spa", "por", "rus", "dut", "swe"];
    if (westernLangs.indexOf(firstLang) !== -1) return false;

    return true;
}

function getLanguagePriority(book, langCode) {
    // Sort helper: higher = more focused
    if (!Array.isArray(book.language)) return 0;
    var target = langCode.toLowerCase();
    var firstLang = getLangCode(book.language[0]);
    if (firstLang === target) return 100;    // Target is first
    if (hasLanguage(book, target)) return 50; // Target somewhere
    return 0;
}

/* =========================================================
   SEARCH — with Smart Language Filtering
========================================================= */
function searchBooks(reset = false) {
    if (state.loading) return;
    state.loading = true;
    showLoading();

    if (reset) {
        state.page = 1;
        state.books = [];
        if (elements.booksGrid) elements.booksGrid.innerHTML = "";
        hideLanguageNotice();
    }

    const url = new URL(CONFIG.API_URL);

    const hasLanguageFilter = state.language && state.language !== "all";
    const hasCategoryFilter = state.filter !== "all" && state.filter !== "free";
    const categoryKeyword = hasCategoryFilter ? getFilterKeyword(state.filter) : "";

    if (hasLanguageFilter) {
        const parts = [];

        if (state.query && state.query !== CONFIG.DEFAULT_QUERY) {
            parts.push(state.query);
        }

        parts.push(`language:${state.language}`);

        if (categoryKeyword) {
            parts.push(`subject:"${categoryKeyword}"`);
        }

        url.searchParams.set("q", parts.join(" AND "));
    } else {
        url.searchParams.set("q", state.query);

        if (categoryKeyword) {
            url.searchParams.set("subject", categoryKeyword);
        }
    }

    if (state.filter === "free") {
        url.searchParams.set("has_fulltext", "true");
    }

    url.searchParams.set("page", state.page);
    url.searchParams.set("limit", hasLanguageFilter ? 200 : CONFIG.PAGE_SIZE);
    url.searchParams.set(
        "fields",
        "key,title,author_name,first_publish_year,cover_i,edition_key,publisher,subject,ia,ebook_access,public_scan_b,language"
    );

    fetch(url.toString())
        .then(response => {
            if (!response.ok) throw new Error("Unable to connect to book library.");
            return response.json();
        })
        .then(data => {
            let newBooks = Array.isArray(data.docs) ? data.docs : [];
            state.total = Number(data.numFound) || 0;

            // ✅ CLIENT-SIDE LANGUAGE FILTER
            if (hasLanguageFilter) {
                newBooks = newBooks.filter(function (book) {
                    return isFocusedLanguage(book, state.language);
                });

                // ✅ Sort by how focused the book is (target language first)
                newBooks.sort(function (a, b) {
                    return getLanguagePriority(b, state.language) - getLanguagePriority(a, state.language);
                });

                // ✅ Show only first PAGE_SIZE for "load more" pagination
                newBooks = newBooks.slice(0, CONFIG.PAGE_SIZE);
            }

            if (reset) state.books = newBooks;
            else state.books = [...state.books, ...newBooks];
            hideLoading();
            renderBooks();
            updateResultsInfo();
            updateLoadMore();
            updateLanguageNotice();
        })
        .catch(error => {
            console.error("Book search error:", error);
            hideLoading();
            if (state.books.length === 0) showEmpty();
            showToast("Books could not be loaded. Please try again.", "!");
        })
        .finally(() => state.loading = false);
}

function updateURL(query) {
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url);
}

function renderBooks() {
    let books = [...state.books];
    books = applyFilter(books);
    books = applySort(books);

    if (!books.length) {
        showEmpty();
        return;
    }
    hideEmpty();
    elements.booksGrid.innerHTML = books.map((book, index) => createBookCard(book, index)).join("");
    attachBookEvents();
}

function getAccessBadge(book) {
    if (book.ebook_access === "public" || book.public_scan_b === true) {
        return { text: "🟢 Free", cls: "free" };
    }
    if (book.ebook_access === "borrowable") {
        return { text: "🟡 Borrow", cls: "borrow" };
    }
    return { text: "⚪ Info", cls: "info" };
}

/* =========================================================
   CARD — Show selected language first
========================================================= */
function createBookCard(book, index) {
    const title = cleanText(book.title || "Unknown Title");
    const author = cleanText(getAuthor(book));
    const year = book.first_publish_year || "Year unknown";
    const cover = getCover(book);
    const key = normalizeKey(book.key);
    const favorite = isFavorite(key);
    const delay = Math.min(index * 0.025, 0.5);
    const badge = getAccessBadge(book);

    // ✅ Language display — selected language first
    let langText = "";
    if (Array.isArray(book.language) && book.language.length) {
        var langs = book.language.map(getLangCode).filter(Boolean);
        var uniqueLangs = [];
        langs.forEach(function (l) {
            if (uniqueLangs.indexOf(l) === -1) uniqueLangs.push(l);
        });

        if (state.language && state.language !== "all") {
            var target = state.language.toLowerCase();
            // Selected language ko front pe rakho
            var ordered = [];
            if (uniqueLangs.indexOf(target) !== -1) ordered.push(target);
            uniqueLangs.forEach(function (l) {
                if (l !== target) ordered.push(l);
            });
            var display = ordered.slice(0, 2)
                .map(function (l) { return LANGUAGE_NAMES[l] || l.toUpperCase(); });
            langText = display.join(", ");
        } else {
            langText = uniqueLangs.slice(0, 2)
                .map(function (l) { return LANGUAGE_NAMES[l] || l.toUpperCase(); })
                .join(", ");
        }
    }

    return `
        <article class="book-card" data-key="${escapeHTML(key)}" style="animation-delay:${delay}s">
            <div class="book-cover">
                <img src="${escapeHTML(cover)}" alt="${escapeHTML(title)}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('cover-error');">
                <span class="access-badge ${badge.cls}">${badge.text}</span>
                <button class="favorite-button ${favorite ? "active" : ""}" data-favorite="${escapeHTML(key)}" title="${favorite ? "Remove from favorites" : "Add to favorites"}">${favorite ? "♥" : "♡"}</button>
            </div>
            <div class="book-content">
                <h3 class="book-title">${escapeHTML(title)}</h3>
                <p class="book-author">${escapeHTML(author)}</p>
                <div class="book-meta">
                    <span class="book-year">${escapeHTML(String(year))}${langText ? " · " + escapeHTML(langText) : ""}</span>
                    <button class="book-details-btn" data-details="${escapeHTML(key)}">Details →</button>
                </div>
            </div>
        </article>
    `;
}

function getAuthor(book) {
    if (Array.isArray(book.author_name) && book.author_name.length) {
        return book.author_name.slice(0, 2).join(", ");
    }
    return "Unknown Author";
}

function getCover(book) {
    if (book.cover_i) {
        return `${CONFIG.COVER_URL}/${book.cover_i}-M.jpg`;
    }
    return createCoverFallback(book.title || "Book");
}

function createCoverFallback(title) {
    const safeTitle = String(title).slice(0, 30);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="740" viewBox="0 0 500 740">
        <rect width="500" height="740" fill="#eceef5" />
        <rect x="45" y="45" width="410" height="650" rx="25" fill="#ffffff" />
        <text x="250" y="300" text-anchor="middle" font-family="Arial" font-size="42" fill="#5b5ce2">📚</text>
        <text x="250" y="380" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#182033">${escapeHTML(safeTitle)}</text>
        <text x="250" y="650" text-anchor="middle" font-family="Arial" font-size="16" fill="#9299aa">Book Library</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function attachBookEvents() {
    document.querySelectorAll("[data-favorite]").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const key = this.dataset.favorite;
            toggleFavorite(key, this);
        });
    });
    document.querySelectorAll("[data-details]").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const key = this.dataset.details;
            const book = state.books.find(b => normalizeKey(b.key) === normalizeKey(key));
            openBookDetails(key, book);
        });
    });
    document.querySelectorAll(".book-card").forEach(card => {
        card.addEventListener("click", function () {
            const key = this.dataset.key;
            const book = state.books.find(b => normalizeKey(b.key) === normalizeKey(key));
            openBookDetails(key, book);
        });
    });
}

function openBookDetails(key, book) {
    if (!key) return;
    saveRecentBook(key);
    let url = `${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}`;

    if (book && Array.isArray(book.ia) && book.ia.length) {
        const ia = book.ia.find(function (x) { return typeof x === "string" && x.trim(); });
        if (ia) url += `&ia=${encodeURIComponent(ia)}`;
    }

    if (state.language && state.language !== "all") {
        url += `&lang=${encodeURIComponent(state.language)}`;
    }

    window.location.href = url;
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; }
    catch { return []; }
}
function saveFavorites(fav) {
    localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(fav));
}
function isFavorite(key) {
    const norm = normalizeKey(key);
    return getFavorites().some(item => normalizeKey(item.key || item) === norm);
}

function toggleFavorite(key, button) {
    const norm = normalizeKey(key);
    let favorites = getFavorites();
    const index = favorites.findIndex(item => normalizeKey(item.key || item) === norm);
    if (index !== -1) {
        favorites.splice(index, 1);
        button.classList.remove("active");
        button.textContent = "♡";
        showToast("Removed from favorites.", "✓");
    } else {
        const book = state.books.find(b => normalizeKey(b.key) === norm);
        favorites.push({
            key: norm,
            title: book?.title || "Unknown",
            author: book ? getAuthor(book) : "Unknown",
            year: book?.first_publish_year || "",
            cover_i: book?.cover_i || null
        });
        button.classList.add("active");
        button.textContent = "♥";
        showToast("Added to favorites.", "♥");
    }
    saveFavorites(favorites);
}

function saveRecentBook(key) {
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem("bookLibraryRecent")) || []; } catch {}
    recent = recent.filter(item => item.key !== key);
    recent.unshift({ key, viewedAt: Date.now() });
    recent = recent.slice(0, 20);
    localStorage.setItem("bookLibraryRecent", JSON.stringify(recent));
}

function initializeFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            state.filter = this.dataset.filter;
            state.page = 1;
            searchBooks(true);
        });
    });
}

function applyFilter(books) {
    if (state.filter === "free") {
        return books.filter(function (b) {
            return b.ebook_access === "public" || b.public_scan_b === true;
        });
    }
    return books;
}

function getFilterKeyword(filter) {
    const map = {
        fiction: "fiction",
        history: "history",
        science: "science",
        religion: "religion",
        technology: "technology"
    };
    return map[filter] || "";
}

function initializeSorting() {
    if (!elements.sortSelect) return;
    elements.sortSelect.addEventListener("change", function () {
        state.sort = this.value;
        renderBooks();
    });
}

function applySort(books) {
    switch (state.sort) {
        case "new":
            return books.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
        case "old":
            return books.sort((a, b) => (a.first_publish_year || 9999) - (b.first_publish_year || 9999));
        case "title":
            return books.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
        default:
            return books;
    }
}

function initializeLanguage() {
    if (!elements.languageSelect) return;
    elements.languageSelect.addEventListener("change", function () {
        state.language = this.value;
        state.page = 1;
        searchBooks(true);
    });
}

function updateLanguageNotice() {
    const notice = elements.languageNotice;
    if (!notice) return;

    if (state.language && state.language !== "all") {
        const langName = LANGUAGE_NAMES[state.language] || state.language;

        if (state.books.length === 0) {
            notice.className = "language-notice show warning";
            notice.innerHTML =
                `⚠️ <strong>${langName}</strong> mein koi book nahi mili is search ke liye.<br>` +
                `Doosri zuban try karo ya <strong>"All Languages"</strong> select karo.`;
        } else {
            notice.className = "language-notice show success";
            notice.innerHTML =
                `✅ <strong>${state.books.length}</strong> book(s) mili <strong>${langName}</strong> mein.`;
        }
        return;
    }

    if (state.books.length > 0) {
        const availableLangs = getAvailableLanguages(state.books);
        if (availableLangs.length > 1) {
            const langList = availableLangs
                .map(code => LANGUAGE_NAMES[code] || code)
                .join(", ");
            notice.className = "language-notice show info";
            notice.innerHTML =
                `🌐 Ye books in zubano mein available hain: <strong>${langList}</strong>`;
        } else {
            hideLanguageNotice();
        }
    }
}

function getAvailableLanguages(books) {
    const langs = new Set();
    books.forEach(book => {
        if (Array.isArray(book.language)) {
            book.language.forEach(l => {
                const code = getLangCode(l);
                if (code) langs.add(code);
            });
        }
    });
    return Array.from(langs);
}

function hideLanguageNotice() {
    if (elements.languageNotice) {
        elements.languageNotice.className = "language-notice";
        elements.languageNotice.innerHTML = "";
    }
}

function initializeLoadMore() {
    if (!elements.loadMoreButton) return;
    elements.loadMoreButton.addEventListener("click", function () {
        if (state.loading) return;
        state.page++;
        searchBooks(false);
    });
}

function updateLoadMore() {
    const loaded = state.books.length;
    if (loaded >= state.total || loaded >= CONFIG.MAX_LOAD || !state.total) {
        elements.loadMoreButton.classList.add("hidden");
    } else {
        elements.loadMoreButton.classList.remove("hidden");
    }
    elements.paginationInfo.textContent =
        `Showing ${loaded.toLocaleString()} books from the available results`;
}

function initializeQuickSearch() {
    document.querySelectorAll("[data-search]").forEach(btn => {
        btn.addEventListener("click", function () {
            const query = this.dataset.search;
            if (elements.searchInput) elements.searchInput.value = query;
            state.query = query;
            state.page = 1;
            updateURL(query);
            searchBooks(true);
        });
    });
}

function initializeReset() {
    if (!elements.resetSearch) return;
    elements.resetSearch.addEventListener("click", function () {
        if (elements.searchInput) elements.searchInput.value = "";
        state.query = CONFIG.DEFAULT_QUERY;
        state.page = 1;
        state.filter = "all";
        state.language = "all";
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add("active");
        if (elements.languageSelect) elements.languageSelect.value = "all";
        updateURL(CONFIG.DEFAULT_QUERY);
        searchBooks(true);
    });
}

function initializeRandomBook() {
    if (!elements.randomBookButton) return;
    elements.randomBookButton.addEventListener("click", function () {
        const topics = [
            "classic literature", "adventure", "science", "history",
            "philosophy", "fiction", "technology", "poetry",
            "islamic books", "biography"
        ];
        const random = topics[Math.floor(Math.random() * topics.length)];
        if (elements.searchInput) elements.searchInput.value = random;
        state.query = random;
        state.page = 1;
        updateURL(random);
        searchBooks(true);
    });
}

function updateResultsInfo() {
    if (!elements.resultsTitle || !elements.resultsInfo) return;
    if (state.query) {
        elements.resultsTitle.textContent = `Results for "${state.query}"`;
        elements.resultsInfo.textContent = `${state.total.toLocaleString()} books found`;
    } else {
        elements.resultsTitle.textContent = "Explore Books";
    }
}

function showLoading() {
    if (elements.loadingState) elements.loadingState.classList.add("show");
    if (elements.emptyState) elements.emptyState.classList.remove("show");
}
function hideLoading() {
    if (elements.loadingState) elements.loadingState.classList.remove("show");
}
function showEmpty() {
    if (elements.emptyState) elements.emptyState.classList.add("show");
    if (elements.booksGrid) elements.booksGrid.innerHTML = "";
    if (elements.loadMoreButton) elements.loadMoreButton.classList.add("hidden");
}
function hideEmpty() {
    if (elements.emptyState) elements.emptyState.classList.remove("show");
}

function showToast(message, icon = "✓") {
    if (!elements.toast) return;
    elements.toastMessage.textContent = message;
    elements.toastIcon.textContent = icon;
    elements.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function cleanText(text) {
    return String(text).replace(/\s+/g, " ").trim();
}
function escapeHTML(v) {
    return String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}