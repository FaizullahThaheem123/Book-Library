/* =========================================================
   BOOK LIBRARY - FAVORITES PAGE
   Version 1.1 (Fixed)
========================================================= */

"use strict";

const CONFIG = {
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
    DETAILS_PAGE: "../book-details/book-details.html",
    COVER_URL: "https://covers.openlibrary.org/b/id"
};

// DOM refs
const booksGrid = document.getElementById("booksGrid");
const emptyState = document.getElementById("emptyState");
const favoritesInfo = document.getElementById("favoritesInfo");
const clearAllBtn = document.getElementById("clearAllBtn");
const confirmModal = document.getElementById("confirmModal");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const searchBtn = document.getElementById("searchBtn");
const toast = document.getElementById("toast");

let toastTimer = null;

document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    renderFavorites();
    setupEvents();
});

function setupEvents() {
    themeBtn.addEventListener("click", toggleTheme);
    menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("show"));
    searchBtn.addEventListener("click", () => window.location.href = "../search/search.html");
    clearAllBtn.addEventListener("click", openClearModal);
    cancelClearBtn.addEventListener("click", closeClearModal);
    confirmClearBtn.addEventListener("click", clearAllFavorites);
    confirmModal.addEventListener("click", function (e) {
        if (e.target === this) closeClearModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeClearModal();
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => mobileMenu.classList.remove("show"));
    });
}

function getFavorites() {
    try {
        const saved = localStorage.getItem(CONFIG.FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
}

function saveFavorites(fav) {
    localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(fav));
}

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function renderFavorites() {
    const favorites = getFavorites();
    updateFavoritesInfo(favorites.length);
    booksGrid.innerHTML = "";
    if (favorites.length === 0) {
        emptyState.style.display = "block";
        clearAllBtn.style.display = "none";
        return;
    }
    emptyState.style.display = "none";
    clearAllBtn.style.display = "block";
    favorites.forEach((book, index) => {
        const card = createFavoriteCard(book, index);
        booksGrid.appendChild(card);
    });
}

function createFavoriteCard(book, index) {
    const article = document.createElement("article");
    article.className = "book-card";
    const key = normalizeKey(book.key);
    const title = cleanText(book.title || "Untitled Book");
    const author = cleanText(book.author || "Unknown Author");
    const year = book.year || "—";
    const cover = getCoverURL(book.cover_i);

    article.innerHTML = `
        <div class="book-cover">
            <img src="${cover}" alt="${escapeHTML(title)}" loading="lazy">
            <button class="remove-favorite" data-key="${escapeHTML(key)}" aria-label="Remove from favorites">♥</button>
        </div>
        <div class="book-info">
            <h3 class="book-title">${escapeHTML(title)}</h3>
            <p class="book-author">${escapeHTML(author)}</p>
            <div class="book-meta">
                <span>📅 ${escapeHTML(String(year))}</span>
                <span class="book-year">Favorite</span>
            </div>
            <a class="details-btn" href="${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}">View Details →</a>
        </div>
    `;

    const image = article.querySelector("img");
    image.addEventListener("error", function () {
        this.src = createPlaceholderCover(title);
    });

    const removeBtn = article.querySelector(".remove-favorite");
    removeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeFavorite(key);
    });

    article.querySelector(".book-title").addEventListener("click", function () {
        openDetails(key);
    });

    return article;
}

function removeFavorite(key) {
    let favorites = getFavorites();
    const norm = normalizeKey(key);
    const filtered = favorites.filter(item => normalizeKey(item.key || item) !== norm);
    if (filtered.length === favorites.length) return;
    saveFavorites(filtered);
    renderFavorites();
    showToast("Removed from Favorites");
}

function openClearModal() {
    confirmModal.classList.add("show");
}

function closeClearModal() {
    confirmModal.classList.remove("show");
}

function clearAllFavorites() {
    localStorage.removeItem(CONFIG.FAVORITES_KEY);
    closeClearModal();
    renderFavorites();
    showToast("All Favorites Cleared");
}

function updateFavoritesInfo(count) {
    favoritesInfo.textContent = count === 0 ? "0 books saved" : `${count} ${count === 1 ? "book" : "books"} saved`;
}

function openDetails(key) {
    if (!key) return;
    window.location.href = `${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}`;
}

function getCoverURL(coverId) {
    if (!coverId) return createPlaceholderCover("Book");
    return `${CONFIG.COVER_URL}/${coverId}-M.jpg`;
}

function createPlaceholderCover(title) {
    const safeTitle = cleanText(title).slice(0,22);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
        <rect width="400" height="600" fill="#e5e7ef"/>
        <rect x="40" y="40" width="320" height="520" rx="20" fill="#d6d9e6"/>
        <text x="200" y="275" text-anchor="middle" font-family="Arial" font-size="25" font-weight="700" fill="#5b5ce2">${escapeSVG(safeTitle)}</text>
        <text x="200" y="325" text-anchor="middle" font-family="Arial" font-size="18" fill="#687386">No Cover</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function loadTheme() {
    const saved = localStorage.getItem(CONFIG.THEME_KEY);
    if (saved === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeBtn.textContent = "🌙";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem(CONFIG.THEME_KEY, isDark ? "dark" : "light");
    themeBtn.textContent = isDark ? "☀️" : "🌙";
}

function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
function escapeHTML(v) { return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function escapeSVG(v) { return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"); }

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}