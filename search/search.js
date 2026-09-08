/* =========================================================
   BOOK LIBRARY — SEARCH PAGE JAVASCRIPT
   Version 2.0 (Unified Header + Theme Sync)
========================================================= */

"use strict";

const CONFIG = {
    API_URL: "https://openlibrary.org/search.json",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    DETAILS_PAGE: "../book-details/book-details.html",
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
    SEARCH_PAGE: "../search/search.html",
    BOOKS_PER_PAGE: 20
};

let currentQuery = "";
let currentPage = 1;
let totalResults = 0;
let allBooks = [];
let isLoading = false;
let currentSort = "relevance";
let toastTimer = null;

// DOM refs
let el = {};

function getElements() {
    return {
        searchForm: document.getElementById("searchForm"),
        searchInput: document.getElementById("searchInput"),
        booksGrid: document.getElementById("booksGrid"),
        loadingContainer: document.getElementById("loadingContainer"),
        noResults: document.getElementById("noResults"),
        clearSearchBtn: document.getElementById("clearSearchBtn"),
        loadMoreContainer: document.getElementById("loadMoreContainer"),
        loadMoreBtn: document.getElementById("loadMoreBtn"),
        resultsTitle: document.getElementById("resultsTitle"),
        resultsInfo: document.getElementById("resultsInfo"),
        sortSelect: document.getElementById("sortSelect"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuButton"),
        mobileMenu: document.getElementById("mobileMenu"),
        headerSearchBtn: document.getElementById("headerSearchBtn"),
        toast: document.getElementById("toast"),
        toastIcon: document.getElementById("toastIcon"),
        toastMessage: document.getElementById("toastMessage")
    };
}

document.addEventListener("DOMContentLoaded", function () {
    el = getElements();
    initializeApp();
});

function initializeApp() {
    setupHeaderEvents();
    setupTheme();
    setupMobileMenu();
    setupThemeSync();
    setupEvents();
    loadQueryFromURL();
}

/* =========================================================
   THEME SYNC
========================================================= */
function setupThemeSync() {
    window.addEventListener("storage", function(e) {
        if (e.key === CONFIG.THEME_KEY) {
            const newTheme = e.newValue;
            if (newTheme === "dark") {
                document.body.classList.add("dark");
                if (el.themeToggle) el.themeToggle.textContent = "☀️";
            } else {
                document.body.classList.remove("dark");
                if (el.themeToggle) el.themeToggle.textContent = "🌙";
            }
        }
    });
}

/* =========================================================
   HEADER EVENTS (Search Button - focuses on search input)
========================================================= */
function setupHeaderEvents() {
    if (el.headerSearchBtn) {
        el.headerSearchBtn.addEventListener("click", function () {
            if (el.searchInput) {
                el.searchInput.focus();
                el.searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }
}

/* =========================================================
   MOBILE MENU (SAME AS BOOKS PAGE)
========================================================= */
function setupMobileMenu() {
    if (!el.mobileMenuButton || !el.mobileMenu) return;
    el.mobileMenuButton.addEventListener("click", function (e) {
        e.stopPropagation();
        el.mobileMenu.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
        if (el.mobileMenu.classList.contains("open") &&
            !el.mobileMenu.contains(e.target) &&
            !el.mobileMenuButton.contains(e.target)) {
            el.mobileMenu.classList.remove("open");
        }
    });
    el.mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            el.mobileMenu.classList.remove("open");
        });
    });
}

/* =========================================================
   THEME
========================================================= */
function setupTheme() {
    var savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (el.themeToggle) el.themeToggle.textContent = "☀️";
    }
    if (el.themeToggle) {
        el.themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark");
            var dark = document.body.classList.contains("dark");
            localStorage.setItem(CONFIG.THEME_KEY, dark ? "dark" : "light");
            this.textContent = dark ? "☀️" : "🌙";
        });
    }
}

/* =========================================================
   EVENTS
========================================================= */
function setupEvents() {
    // Search form
    if (el.searchForm) {
        el.searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var query = el.searchInput.value.trim();
            if (!query) {
                showToast("Please enter a book, author or subject.", "!");
                el.searchInput.focus();
                return;
            }
            performSearch(query);
        });
    }

    // Quick searches
    document.querySelectorAll(".quick-searches button").forEach(function (button) {
        button.addEventListener("click", function () {
            var query = this.getAttribute("data-query");
            if (!query) return;
            el.searchInput.value = query;
            performSearch(query);
        });
    });

    // Load more
    if (el.loadMoreBtn) {
        el.loadMoreBtn.addEventListener("click", function () {
            if (isLoading) return;
            currentPage++;
            searchBooks(currentQuery, currentPage, true);
        });
    }

    // Sort
    if (el.sortSelect) {
        el.sortSelect.addEventListener("change", function () {
            currentSort = this.value;
            renderBooks();
        });
    }

    // Clear search
    if (el.clearSearchBtn) {
        el.clearSearchBtn.addEventListener("click", clearSearch);
    }

    // Favorite buttons delegation
    if (el.booksGrid) {
        el.booksGrid.addEventListener("click", function (e) {
            var btn = e.target.closest(".favorite-btn");
            if (!btn) return;
            e.preventDefault();
            var key = btn.getAttribute("data-key");
            if (key) toggleFavorite(key);
        });
    }
}

/* =========================================================
   SEARCH LOGIC
========================================================= */
function loadQueryFromURL() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && query.trim()) {
        el.searchInput.value = query.trim();
        performSearch(query.trim(), false);
    }
}

function performSearch(query, updateURL) {
    updateURL = updateURL !== undefined ? updateURL : true;
    query = String(query || "").trim();
    if (!query) return;
    currentQuery = query;
    currentPage = 1;
    currentSort = "relevance";
    allBooks = [];
    totalResults = 0;
    if (el.sortSelect) el.sortSelect.value = "relevance";
    if (el.searchInput) el.searchInput.value = query;
    if (updateURL) {
        var newURL = window.location.pathname + "?q=" + encodeURIComponent(query);
        window.history.pushState({ query: query }, "", newURL);
    }
    searchBooks(query, 1, false);
}

async function searchBooks(query, page, append) {
    append = append || false;
    if (isLoading) return;
    isLoading = true;
    showLoading(true);
    if (!append) {
        hideElement(el.noResults);
        hideElement(el.loadMoreContainer);
        if (el.booksGrid) el.booksGrid.innerHTML = "";
        if (el.resultsInfo) el.resultsInfo.textContent = "Searching...";
    }

    try {
        var fields = ["key","title","author_name","first_publish_year","cover_i","edition_key","isbn","publisher","language","number_of_pages_median","subject"].join(",");
        var url = CONFIG.API_URL + "?q=" + encodeURIComponent(query) + "&page=" + page + "&limit=" + CONFIG.BOOKS_PER_PAGE + "&fields=" + encodeURIComponent(fields);
        var response = await fetch(url);
        if (!response.ok) throw new Error("Search request failed.");
        var data = await response.json();
        var documents = Array.isArray(data.docs) ? data.docs : [];
        totalResults = Number(data.numFound) || 0;
        if (append) {
            allBooks = allBooks.concat(documents);
        } else {
            allBooks = documents;
        }
        updateResultsHeader(query, allBooks.length, totalResults);
        if (!allBooks.length) {
            showElement(el.noResults);
            hideElement(el.loadMoreContainer);
            if (el.booksGrid) el.booksGrid.innerHTML = "";
            var titleEl = el.noResults ? el.noResults.querySelector("h3") : null;
            var msgEl = el.noResults ? el.noResults.querySelector("p") : null;
            if (titleEl) titleEl.textContent = "No books found";
            if (msgEl) msgEl.textContent = "Try another book title, author or subject.";
            return;
        }
        hideElement(el.noResults);
        renderBooks();
        var loadedCount = allBooks.length;
        if (loadedCount < totalResults && documents.length === CONFIG.BOOKS_PER_PAGE) {
            showElement(el.loadMoreContainer);
        } else {
            hideElement(el.loadMoreContainer);
        }
    } catch (error) {
        console.error("Search error:", error);
        allBooks = [];
        if (el.booksGrid) el.booksGrid.innerHTML = "";
        hideElement(el.loadMoreContainer);
        showElement(el.noResults);
        var titleEl2 = el.noResults ? el.noResults.querySelector("h3") : null;
        var msgEl2 = el.noResults ? el.noResults.querySelector("p") : null;
        if (titleEl2) titleEl2.textContent = "Something went wrong";
        if (msgEl2) msgEl2.textContent = "Unable to search books right now. Please check your internet connection and try again.";
        showToast("Unable to search books.", "!");
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

function updateResultsHeader(query, loaded, total) {
    if (el.resultsTitle) el.resultsTitle.textContent = 'Results for "' + query + '"';
    if (el.resultsInfo) {
        if (total > 0) {
            el.resultsInfo.textContent = "Showing " + Math.min(loaded, total).toLocaleString() + " of " + total.toLocaleString() + " books";
        } else {
            el.resultsInfo.textContent = "No books found.";
        }
    }
}

function renderBooks() {
    if (!el.booksGrid) return;
    var books = allBooks.slice();
    if (currentSort === "new") {
        books.sort(function(a, b) { return (b.first_publish_year || 0) - (a.first_publish_year || 0); });
    } else if (currentSort === "old") {
        books.sort(function(a, b) { return (a.first_publish_year || 9999) - (b.first_publish_year || 9999); });
    } else if (currentSort === "title") {
        books.sort(function(a, b) { return cleanText(a.title).localeCompare(cleanText(b.title)); });
    }
    el.booksGrid.innerHTML = books.map(function(book) { return createBookCard(book); }).join("");
}

function createBookCard(book) {
    var key = normalizeKey(book.key);
    var title = cleanText(book.title || "Untitled Book");
    var authors = Array.isArray(book.author_name) ? book.author_name : [];
    var author = authors.length ? authors.slice(0,2).join(", ") : "Unknown Author";
    var year = book.first_publish_year || "Year unknown";
    var coverUrl = book.cover_i ? CONFIG.COVER_URL + "/" + book.cover_i + "-M.jpg" : getPlaceholderCover();
    var isFavorite = isBookFavorite(key);
    var favClass = isFavorite ? "active" : "";
    var favIcon = isFavorite ? "♥" : "♡";

    return `
        <article class="book-card">
            <div class="book-cover">
                <img src="${escapeHTML(coverUrl)}" alt="${escapeHTML(title)} cover" loading="lazy" onerror="this.src='${getPlaceholderCover()}'">
                <button class="favorite-btn ${favClass}" data-key="${escapeHTML(key)}" aria-label="${isFavorite ? "Remove" : "Add"} favorites">${favIcon}</button>
            </div>
            <div class="book-info">
                <h3 class="book-title" title="${escapeHTML(title)}">${escapeHTML(title)}</h3>
                <p class="book-author" title="${escapeHTML(author)}">${escapeHTML(author)}</p>
                <div class="book-meta">
                    <span class="book-year">📅 ${escapeHTML(String(year))}</span>
                </div>
                <a class="details-btn" href="${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}">View Details</a>
            </div>
        </article>
    `;
}

/* =========================================================
   FAVORITES
========================================================= */
function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; } catch { return []; }
}

function isBookFavorite(key) {
    var norm = normalizeKey(key);
    return getFavorites().some(function(item) { return normalizeKey(item.key || item) === norm; });
}

function toggleFavorite(key) {
    var norm = normalizeKey(key);
    var favorites = getFavorites();
    var index = favorites.findIndex(function(item) { return normalizeKey(item.key || item) === norm; });
    if (index === -1) {
        var book = allBooks.find(function(b) { return normalizeKey(b.key) === norm; });
        favorites.push({
            key: norm,
            title: book?.title || "Untitled Book",
            author: book?.author_name ? book.author_name[0] || "Unknown Author" : "Unknown Author",
            year: book?.first_publish_year || "",
            cover_i: book?.cover_i || null
        });
        showToast("Added to Favorites", "♥");
    } else {
        favorites.splice(index, 1);
        showToast("Removed from Favorites", "✓");
    }
    localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(favorites));
    renderBooks();
}

/* =========================================================
   CLEAR SEARCH
========================================================= */
function clearSearch() {
    currentQuery = "";
    currentPage = 1;
    totalResults = 0;
    allBooks = [];
    currentSort = "relevance";
    if (el.searchInput) el.searchInput.value = "";
    if (el.sortSelect) el.sortSelect.value = "relevance";
    if (el.booksGrid) el.booksGrid.innerHTML = "";
    if (el.resultsTitle) el.resultsTitle.textContent = "Discover Books";
    if (el.resultsInfo) el.resultsInfo.textContent = "Enter a search above to find books.";
    hideElement(el.noResults);
    hideElement(el.loadMoreContainer);
    var cleanURL = window.location.pathname;
    window.history.replaceState({}, "", cleanURL);
    if (el.searchInput) el.searchInput.focus();
}

/* =========================================================
   UI HELPERS
========================================================= */
function showLoading(show) {
    if (!el.loadingContainer) return;
    el.loadingContainer.style.display = show ? "flex" : "none";
}

function showElement(el2) { if (el2) el2.style.display = ""; }
function hideElement(el2) { if (el2) el2.style.display = "none"; }

function getPlaceholderCover() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">' +
        '<rect width="300" height="450" fill="#e9ecef" />' +
        '<text x="150" y="205" text-anchor="middle" font-family="Arial" font-size="54">📚</text>' +
        '<text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="18" fill="#777">No Cover</text>' +
        '</svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }

function escapeHTML(v) {
    return String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

/* =========================================================
   TOAST
========================================================= */
function showToast(message, icon) {
    icon = icon || "✓";
    if (!el.toast) return;
    el.toastMessage.textContent = message;
    if (el.toastIcon) el.toastIcon.textContent = icon;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
        el.toast.classList.remove("show");
    }, 2500);
}