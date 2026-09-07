/* =========================================================
   BOOK LIBRARY - SEARCH PAGE
   Version 1.1 (Fixed)
========================================================= */

"use strict";

const CONFIG = {
    API_URL: "https://openlibrary.org/search.json",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    DETAILS_PAGE: "../book-details/book-details.html",
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
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
let searchForm, searchInput, quickSearchButtons;
let booksGrid, loadingContainer, noResults, clearSearchBtn;
let loadMoreContainer, loadMoreBtn;
let resultsTitle, resultsInfo, sortSelect;
let themeBtn, menuBtn, mobileMenu, toast;

document.addEventListener("DOMContentLoaded", function () {
    searchForm = document.getElementById("searchForm");
    searchInput = document.getElementById("searchInput");
    quickSearchButtons = document.querySelectorAll(".quick-searches button");
    booksGrid = document.getElementById("booksGrid");
    loadingContainer = document.getElementById("loadingContainer");
    noResults = document.getElementById("noResults");
    clearSearchBtn = document.getElementById("clearSearchBtn");
    loadMoreContainer = document.getElementById("loadMoreContainer");
    loadMoreBtn = document.getElementById("loadMoreBtn");
    resultsTitle = document.getElementById("resultsTitle");
    resultsInfo = document.getElementById("resultsInfo");
    sortSelect = document.getElementById("sortSelect");
    themeBtn = document.getElementById("themeBtn");
    menuBtn = document.getElementById("menuBtn");
    mobileMenu = document.getElementById("mobileMenu");
    toast = document.getElementById("toast");

    setupEvents();
    loadTheme();
    loadQueryFromURL();
});

function setupEvents() {
    // Search form
    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) {
                showToast("Please enter a book, author or subject.");
                searchInput.focus();
                return;
            }
            performSearch(query);
        });
    }

    // Quick searches
    quickSearchButtons.forEach(button => {
        button.addEventListener("click", function () {
            const query = this.getAttribute("data-query");
            if (!query) return;
            searchInput.value = query;
            performSearch(query);
        });
    });

    // Load more
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            if (isLoading) return;
            currentPage++;
            searchBooks(currentQuery, currentPage, true);
        });
    }

    // Sort
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            currentSort = this.value;
            sortBooks();
        });
    }

    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", clearSearch);
    }

    // Theme
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // Mobile menu
    if (menuBtn) {
        menuBtn.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }
    if (mobileMenu) {
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => mobileMenu.classList.remove("open"));
        });
    }

    // Favorite buttons delegation
    if (booksGrid) {
        booksGrid.addEventListener("click", function (e) {
            const btn = e.target.closest(".favorite-btn");
            if (!btn) return;
            e.preventDefault();
            const key = btn.getAttribute("data-key");
            if (key) toggleFavorite(key);
        });
    }
}

function loadQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && query.trim()) {
        searchInput.value = query.trim();
        performSearch(query.trim(), false);
    }
}

function performSearch(query, updateURL = true) {
    query = String(query || "").trim();
    if (!query) return;
    currentQuery = query;
    currentPage = 1;
    currentSort = "relevance";
    allBooks = [];
    totalResults = 0;
    if (sortSelect) sortSelect.value = "relevance";
    if (searchInput) searchInput.value = query;
    if (updateURL) {
        const newURL = window.location.pathname + "?q=" + encodeURIComponent(query);
        window.history.pushState({ query }, "", newURL);
    }
    searchBooks(query, 1, false);
}

async function searchBooks(query, page = 1, append = false) {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);
    if (!append) {
        hideElement(noResults);
        hideElement(loadMoreContainer);
        booksGrid.innerHTML = "";
        // Show proper message
        if (resultsInfo) resultsInfo.textContent = "Searching...";
    }

    try {
        const fields = ["key","title","author_name","first_publish_year","cover_i","edition_key","isbn","publisher","language","number_of_pages_median","subject"].join(",");
        const url = `${CONFIG.API_URL}?q=${encodeURIComponent(query)}&page=${page}&limit=${CONFIG.BOOKS_PER_PAGE}&fields=${encodeURIComponent(fields)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Search request failed.");
        const data = await response.json();
        const documents = Array.isArray(data.docs) ? data.docs : [];
        totalResults = Number(data.numFound) || 0;
        if (append) {
            allBooks = allBooks.concat(documents);
        } else {
            allBooks = documents;
        }
        updateResultsHeader(query, allBooks.length, totalResults);
        if (!allBooks.length) {
            showElement(noResults);
            hideElement(loadMoreContainer);
            booksGrid.innerHTML = "";
            // Update no results message
            const titleEl = noResults.querySelector("h3");
            const msgEl = noResults.querySelector("p");
            if (titleEl) titleEl.textContent = "No books found";
            if (msgEl) msgEl.textContent = "Try another book title, author or subject.";
            return;
        }
        hideElement(noResults);
        renderBooks();
        const loadedCount = allBooks.length;
        if (loadedCount < totalResults && documents.length === CONFIG.BOOKS_PER_PAGE) {
            showElement(loadMoreContainer);
        } else {
            hideElement(loadMoreContainer);
        }
    } catch (error) {
        console.error("Search error:", error);
        allBooks = [];
        booksGrid.innerHTML = "";
        hideElement(loadMoreContainer);
        showElement(noResults);
        const titleEl = noResults.querySelector("h3");
        const msgEl = noResults.querySelector("p");
        if (titleEl) titleEl.textContent = "Something went wrong";
        if (msgEl) msgEl.textContent = "Unable to search books right now. Please check your internet connection and try again.";
        showToast("Unable to search books.");
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

function updateResultsHeader(query, loaded, total) {
    if (resultsTitle) resultsTitle.textContent = `Results for "${query}"`;
    if (resultsInfo) {
        if (total > 0) {
            resultsInfo.textContent = `Showing ${Math.min(loaded, total).toLocaleString()} of ${total.toLocaleString()} books`;
        } else {
            resultsInfo.textContent = "No books found.";
        }
    }
}

function renderBooks() {
    if (!booksGrid) return;
    let books = [...allBooks];
    // Sort
    if (currentSort === "new") {
        books.sort((a,b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
    } else if (currentSort === "old") {
        books.sort((a,b) => (a.first_publish_year || 9999) - (b.first_publish_year || 9999));
    } else if (currentSort === "title") {
        books.sort((a,b) => cleanText(a.title).localeCompare(cleanText(b.title)));
    }
    booksGrid.innerHTML = books.map(book => createBookCard(book)).join("");
}

function createBookCard(book) {
    const key = normalizeKey(book.key);
    const title = cleanText(book.title || "Untitled Book");
    const authors = Array.isArray(book.author_name) ? book.author_name : [];
    const author = authors.length ? authors.slice(0,2).join(", ") : "Unknown Author";
    const year = book.first_publish_year || "Year unknown";
    const coverUrl = book.cover_i ? `${CONFIG.COVER_URL}/${book.cover_i}-M.jpg` : getPlaceholderCover();
    const isFavorite = isBookFavorite(key);
    const favClass = isFavorite ? "active" : "";
    const favIcon = isFavorite ? "♥" : "♡";

    return `
        <article class="book-card">
            <div class="book-cover-wrapper">
                <img class="book-cover" src="${escapeHTML(coverUrl)}" alt="${escapeHTML(title)} cover" loading="lazy" onerror="this.src='${getPlaceholderCover()}'">
                <button class="favorite-btn ${favClass}" data-key="${escapeHTML(key)}" aria-label="${isFavorite ? "Remove" : "Add"} favorites">${favIcon}</button>
            </div>
            <div class="book-card-content">
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

function sortBooks() {
    renderBooks();
}

/* =========================================================
   FAVORITES (normalized)
========================================================= */

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; } catch { return []; }
}

function isBookFavorite(key) {
    const norm = normalizeKey(key);
    return getFavorites().some(item => normalizeKey(item.key || item) === norm);
}

function toggleFavorite(key) {
    const norm = normalizeKey(key);
    let favorites = getFavorites();
    const index = favorites.findIndex(item => normalizeKey(item.key || item) === norm);
    if (index === -1) {
        // Try to find book in current results
        const book = allBooks.find(b => normalizeKey(b.key) === norm);
        favorites.push({
            key: norm,
            title: book?.title || "Untitled Book",
            author: book?.author_name ? book.author_name[0] || "Unknown Author" : "Unknown Author",
            year: book?.first_publish_year || "",
            cover_i: book?.cover_i || null
        });
        showToast("Added to Favorites ❤️");
    } else {
        favorites.splice(index, 1);
        showToast("Removed from Favorites.");
    }
    localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(favorites));
    renderBooks();
}

function clearSearch() {
    currentQuery = "";
    currentPage = 1;
    totalResults = 0;
    allBooks = [];
    currentSort = "relevance";
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "relevance";
    booksGrid.innerHTML = "";
    if (resultsTitle) resultsTitle.textContent = "Discover Books";
    if (resultsInfo) resultsInfo.textContent = "Enter a search above to find books.";
    hideElement(noResults);
    hideElement(loadMoreContainer);
    const cleanURL = window.location.pathname;
    window.history.replaceState({}, "", cleanURL);
    searchInput.focus();
}

/* =========================================================
   THEME
========================================================= */

function loadTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") document.body.classList.add("dark");
    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem(CONFIG.THEME_KEY, isDark ? "dark" : "light");
    updateThemeButton();
}

function updateThemeButton() {
    if (!themeBtn) return;
    const isDark = document.body.classList.contains("dark");
    themeBtn.textContent = isDark ? "☀️" : "🌙";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

/* =========================================================
   UI HELPERS
========================================================= */

function showLoading(show) {
    if (!loadingContainer) return;
    loadingContainer.style.display = show ? "flex" : "none";
}

function showElement(el) { if (el) el.style.display = ""; }
function hideElement(el) { if (el) el.style.display = "none"; }

function getPlaceholderCover() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
        <rect width="300" height="450" fill="#e9ecef" />
        <text x="150" y="205" text-anchor="middle" font-family="Arial" font-size="54">📚</text>
        <text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="18" fill="#777">No Cover</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }

function escapeHTML(v) { return String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}