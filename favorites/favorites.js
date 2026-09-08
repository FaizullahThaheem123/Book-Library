/* =========================================================
   BOOK LIBRARY — FAVORITES PAGE JAVASCRIPT
   Version 2.0 (Unified Header + Theme Sync)
========================================================= */

"use strict";

const CONFIG = {
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
    DETAILS_PAGE: "../book-details/book-details.html",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    SEARCH_PAGE: "../search/search.html"
};

let el = {};

function getElements() {
    return {
        booksGrid: document.getElementById("booksGrid"),
        emptyState: document.getElementById("emptyState"),
        favoritesInfo: document.getElementById("favoritesInfo"),
        clearAllBtn: document.getElementById("clearAllBtn"),
        confirmModal: document.getElementById("confirmModal"),
        cancelClearBtn: document.getElementById("cancelClearBtn"),
        confirmClearBtn: document.getElementById("confirmClearBtn"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuButton"),
        mobileMenu: document.getElementById("mobileMenu"),
        headerSearchBtn: document.getElementById("headerSearchBtn"),
        toast: document.getElementById("toast"),
        toastIcon: document.getElementById("toastIcon"),
        toastMessage: document.getElementById("toastMessage")
    };
}

document.addEventListener("DOMContentLoaded", function() {
    el = getElements();
    initializeApp();
});

function initializeApp() {
    setupHeaderEvents();
    setupTheme();
    setupMobileMenu();
    setupThemeSync();
    renderFavorites();
    setupEvents();
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

/* ===== HEADER EVENTS ===== */
function setupHeaderEvents() {
    if (el.headerSearchBtn) {
        el.headerSearchBtn.addEventListener("click", function() {
            window.location.href = CONFIG.SEARCH_PAGE;
        });
    }
}

/* ===== MOBILE MENU ===== */
function setupMobileMenu() {
    if (!el.mobileMenuButton || !el.mobileMenu) return;
    el.mobileMenuButton.addEventListener("click", function(e) {
        e.stopPropagation();
        el.mobileMenu.classList.toggle("open");
    });
    document.addEventListener("click", function(e) {
        if (el.mobileMenu.classList.contains("open") &&
            !el.mobileMenu.contains(e.target) &&
            !el.mobileMenuButton.contains(e.target)) {
            el.mobileMenu.classList.remove("open");
        }
    });
    el.mobileMenu.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
            el.mobileMenu.classList.remove("open");
        });
    });
}

/* ===== THEME ===== */
function setupTheme() {
    var savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (el.themeToggle) el.themeToggle.textContent = "☀️";
    }
    if (el.themeToggle) {
        el.themeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark");
            var dark = document.body.classList.contains("dark");
            localStorage.setItem(CONFIG.THEME_KEY, dark ? "dark" : "light");
            this.textContent = dark ? "☀️" : "🌙";
        });
    }
}

/* ===== FAVORITES ===== */
function getFavorites() {
    try {
        var saved = localStorage.getItem(CONFIG.FAVORITES_KEY);
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
    var favorites = getFavorites();
    updateFavoritesInfo(favorites.length);
    if (!el.booksGrid) return;
    el.booksGrid.innerHTML = "";
    if (favorites.length === 0) {
        if (el.emptyState) el.emptyState.style.display = "block";
        if (el.clearAllBtn) el.clearAllBtn.style.display = "none";
        return;
    }
    if (el.emptyState) el.emptyState.style.display = "none";
    if (el.clearAllBtn) el.clearAllBtn.style.display = "block";
    favorites.forEach(function(book, index) {
        var card = createFavoriteCard(book, index);
        el.booksGrid.appendChild(card);
    });
}

function createFavoriteCard(book, index) {
    var article = document.createElement("article");
    article.className = "book-card";
    var key = normalizeKey(book.key);
    var title = cleanText(book.title || "Untitled Book");
    var author = cleanText(book.author || "Unknown Author");
    var year = book.year || "—";
    var cover = getCoverURL(book.cover_i);

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

    var image = article.querySelector("img");
    image.addEventListener("error", function() {
        this.src = createPlaceholderCover(title);
    });

    var removeBtn = article.querySelector(".remove-favorite");
    removeBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        removeFavorite(key);
    });

    article.querySelector(".book-title").addEventListener("click", function() {
        openDetails(key);
    });

    return article;
}

function removeFavorite(key) {
    var favorites = getFavorites();
    var norm = normalizeKey(key);
    var filtered = favorites.filter(function(item) {
        return normalizeKey(item.key || item) !== norm;
    });
    if (filtered.length === favorites.length) return;
    saveFavorites(filtered);
    renderFavorites();
    showToast("Removed from Favorites", "✓");
}

function openClearModal() {
    if (el.confirmModal) el.confirmModal.classList.add("show");
}

function closeClearModal() {
    if (el.confirmModal) el.confirmModal.classList.remove("show");
}

function clearAllFavorites() {
    localStorage.removeItem(CONFIG.FAVORITES_KEY);
    closeClearModal();
    renderFavorites();
    showToast("All Favorites Cleared", "✓");
}

function updateFavoritesInfo(count) {
    if (!el.favoritesInfo) return;
    el.favoritesInfo.textContent = count === 0 ? "0 books saved" : count + " " + (count === 1 ? "book" : "books") + " saved";
}

function openDetails(key) {
    if (!key) return;
    window.location.href = CONFIG.DETAILS_PAGE + "?key=" + encodeURIComponent(key);
}

function getCoverURL(coverId) {
    if (!coverId) return createPlaceholderCover("Book");
    return CONFIG.COVER_URL + "/" + coverId + "-M.jpg";
}

function createPlaceholderCover(title) {
    var safeTitle = cleanText(title).slice(0,22);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">' +
        '<rect width="400" height="600" fill="#e5e7ef"/>' +
        '<rect x="40" y="40" width="320" height="520" rx="20" fill="#d6d9e6"/>' +
        '<text x="200" y="275" text-anchor="middle" font-family="Arial" font-size="25" font-weight="700" fill="#5b5ce2">' + escapeSVG(safeTitle) + '</text>' +
        '<text x="200" y="325" text-anchor="middle" font-family="Arial" font-size="18" fill="#687386">No Cover</text>' +
        '</svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function setupEvents() {
    if (el.clearAllBtn) {
        el.clearAllBtn.addEventListener("click", openClearModal);
    }
    if (el.cancelClearBtn) {
        el.cancelClearBtn.addEventListener("click", closeClearModal);
    }
    if (el.confirmClearBtn) {
        el.confirmClearBtn.addEventListener("click", clearAllFavorites);
    }
    if (el.confirmModal) {
        el.confirmModal.addEventListener("click", function(e) {
            if (e.target === this) closeClearModal();
        });
    }
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") closeClearModal();
    });
}

function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }

function escapeHTML(v) {
    return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function escapeSVG(v) {
    return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

var toastTimer = null;
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