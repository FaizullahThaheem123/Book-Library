/* =========================================================
   BOOK LIBRARY — INDEX PAGE JAVASCRIPT
   Version 3.0 (Theme Sync Across Pages)
========================================================= */

"use strict";

console.log("🚀 index.js V3.0 LOADED");

const CONFIG = {
    API_URL: "https://openlibrary.org/search.json",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    MAX_BOOKS: 10,
    SEARCH_PAGE: "../search/search.html",
    DETAILS_PAGE: "../book-details/book-details.html",
    FAVORITES_KEY: "bookLibraryFavorites",
    THEME_KEY: "bookLibraryTheme",
    RECENT_KEY: "bookLibraryRecent"
};

let el = {};

function getElements() {
    return {
        loader: document.getElementById("appLoader"),
        searchForm: document.getElementById("mainSearchForm"),
        searchInput: document.getElementById("mainSearchInput"),
        headerSearchBtn: document.getElementById("headerSearchBtn"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuBtn: document.getElementById("mobileMenuBtn"),
        mobileMenu: document.getElementById("mobileMenu"),
        categoryGrid: document.getElementById("categoryGrid"),
        featuredBooksGrid: document.getElementById("featuredBooksGrid"),
        popularBooksGrid: document.getElementById("popularBooksGrid"),
        recentBooksGrid: document.getElementById("recentBooksGrid"),
        recentSection: document.getElementById("recentSection"),
        totalBooksCount: document.getElementById("totalBooksCount"),
        totalAuthorsCount: document.getElementById("totalAuthorsCount"),
        currentYear: document.getElementById("currentYear"),
        toast: document.getElementById("toast"),
        toastIcon: document.getElementById("toastIcon"),
        toastMessage: document.getElementById("toastMessage")
    };
}

const categories = [
    { name: "Fiction", icon: "📖", subject: "fiction" },
    { name: "Science", icon: "🔬", subject: "science" },
    { name: "History", icon: "🏛️", subject: "history" },
    { name: "Technology", icon: "💻", subject: "technology" },
    { name: "Education", icon: "🎓", subject: "education" },
    { name: "Business", icon: "💼", subject: "business" },
    { name: "Islamic", icon: "🕌", subject: "islam" },
    { name: "Biography", icon: "👤", subject: "biography" },
    { name: "Children", icon: "🧸", subject: "children" },
    { name: "Romance", icon: "❤️", subject: "romance" },
    { name: "Mystery", icon: "🔎", subject: "mystery" },
    { name: "Programming", icon: "👨‍💻", subject: "programming" }
];

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Content Loaded");
    el = getElements();
    initializeApp();
});

function initializeApp() {
    console.log("✅ App Initializing...");
    setupHeaderEvents();
    setupCurrentYear();
    setupTheme();
    setupThemeSync();      // <-- THEME SYNC ACROSS PAGES
    setupMobileMenu();
    setupSearch();
    setupQuickSearch();
    renderCategories();
    setupBookClickHandlers();
    loadHomeBooks();
    renderRecentBooks();
    hideLoader();
    console.log("✅ App Ready!");
}

/* =========================================================
   THEME SYNC (Listen for changes from other pages)
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
   HEADER EVENTS
========================================================= */
function setupHeaderEvents() {
    if (el.headerSearchBtn) {
        el.headerSearchBtn.addEventListener("click", function() {
            window.location.href = CONFIG.SEARCH_PAGE;
        });
    }
}

/* =========================================================
   MOBILE MENU
========================================================= */
function setupMobileMenu() {
    console.log("🔊 Setting up mobile menu...");
    if (!el.mobileMenuBtn || !el.mobileMenu) {
        console.warn("Mobile menu elements not found");
        return;
    }

    el.mobileMenuBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        el.mobileMenu.classList.toggle("open");
        console.log("Menu toggled, open class:", el.mobileMenu.classList.contains("open"));
    });

    document.addEventListener("click", function(e) {
        if (el.mobileMenu.classList.contains("open") &&
            !el.mobileMenu.contains(e.target) &&
            !el.mobileMenuBtn.contains(e.target)) {
            el.mobileMenu.classList.remove("open");
            console.log("Menu closed from outside click");
        }
    });

    el.mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function() {
            el.mobileMenu.classList.remove("open");
        });
    });

    console.log("✅ Mobile menu setup complete");
}

/* =========================================================
   THEME SYSTEM
========================================================= */
function setupTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        updateThemeIcon(true);
    } else {
        document.body.classList.remove("dark");
        updateThemeIcon(false);
    }
    if (el.themeToggle) {
        el.themeToggle.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem(CONFIG.THEME_KEY, isDark ? "dark" : "light");
    updateThemeIcon(isDark);
    showToast(isDark ? "Dark mode enabled" : "Light mode enabled", "✓");
}

function updateThemeIcon(isDark) {
    if (el.themeToggle) {
        el.themeToggle.textContent = isDark ? "☀️" : "🌙";
    }
}

/* =========================================================
   SEARCH SYSTEM
========================================================= */
function setupSearch() {
    if (el.searchForm) {
        el.searchForm.addEventListener("submit", handleSearch);
    }
}

function handleSearch(event) {
    event.preventDefault();
    const query = el.searchInput.value.trim();
    if (!query) {
        showToast("Please enter a book name", "!");
        el.searchInput.focus();
        return;
    }
    goToSearch(query);
}

function goToSearch(query) {
    window.location.href = `${CONFIG.SEARCH_PAGE}?q=${encodeURIComponent(query)}`;
}

/* =========================================================
   QUICK SEARCH
========================================================= */
function setupQuickSearch() {
    document.querySelectorAll(".quick-search-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const query = btn.dataset.search;
            if (el.searchInput) el.searchInput.value = query;
            goToSearch(query);
        });
    });
}

/* =========================================================
   CATEGORIES
========================================================= */
function renderCategories() {
    if (!el.categoryGrid) return;
    el.categoryGrid.innerHTML = categories.map(cat => `
        <button type="button" class="category-card" data-subject="${escapeHTML(cat.subject)}">
            <div class="category-icon">${cat.icon}</div>
            <h3>${escapeHTML(cat.name)}</h3>
            <p>Explore books</p>
        </button>
    `).join("");
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            goToSearch(card.dataset.subject);
        });
    });
}

/* =========================================================
   LOAD HOME BOOKS
========================================================= */
async function loadHomeBooks() {
    try {
        const [featured, popular] = await Promise.all([
            fetchBooks("best books", 1, CONFIG.MAX_BOOKS),
            fetchBooks("fiction", 1, CONFIG.MAX_BOOKS)
        ]);
        renderBooks(el.featuredBooksGrid, featured);
        renderBooks(el.popularBooksGrid, popular);
        updateStatistics(featured, popular);
    } catch (error) {
        console.error("Book loading error:", error);
        showEmptyBooks(el.featuredBooksGrid, "Unable to load books.");
        showEmptyBooks(el.popularBooksGrid, "Check internet connection.");
    }
}

async function fetchBooks(query, page = 1, limit = 10) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i,isbn,publisher,language,subject");
    const response = await fetch(url);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return { books: data.docs || [], total: data.numFound || 0 };
}

function renderBooks(container, result) {
    if (!container) return;
    const books = result?.books || [];
    if (!books.length) {
        showEmptyBooks(container, "No books found.");
        return;
    }
    container.innerHTML = books.map(book => createBookCard(book)).join("");
}

function createBookCard(book) {
    const title = book.title || "Unknown";
    const author = Array.isArray(book.author_name) ? book.author_name[0] : "Unknown";
    const year = book.first_publish_year || "N/A";
    const key = book.key || "";
    const cover = book.cover_i ? `${CONFIG.COVER_URL}/${book.cover_i}-M.jpg` : "";
    const isFav = isFavorite(key);
    const favIcon = isFav ? "♥" : "♡";
    const favClass = isFav ? "active" : "";
    return `
        <article class="book-card" data-book-key="${escapeHTML(key)}">
            <button class="book-favorite ${favClass}" data-key="${escapeHTML(key)}">${favIcon}</button>
            <div class="book-cover">${cover ? `<img src="${cover}" alt="${escapeHTML(title)}" loading="lazy">` : "<div class='book-cover-placeholder'>📖</div>"}</div>
            <div class="book-info">
                <h3 class="book-title">${escapeHTML(title)}</h3>
                <p class="book-author">${escapeHTML(author)}</p>
                <p class="book-year">${escapeHTML(String(year))}</p>
            </div>
        </article>
    `;
}

/* =========================================================
   BOOK CLICK HANDLERS
========================================================= */
function setupBookClickHandlers() {
    document.addEventListener("click", function(e) {
        const card = e.target.closest(".book-card");
        if (card) {
            const key = card.dataset.bookKey;
            if (key) {
                saveRecentlyViewed(key);
                window.location.href = `${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}`;
            }
        }
        const fav = e.target.closest(".book-favorite");
        if (fav) {
            e.stopPropagation();
            const key = fav.dataset.key;
            if (key) toggleFavorite(key, fav);
        }
    });
}

/* =========================================================
   FAVORITES
========================================================= */
function normalizeKey(key) { return String(key).replace(/^\/works\//, ""); }
function getFavorites() { try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; } catch { return []; } }
function saveFavorites(fav) { localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(fav)); }
function isFavorite(key) { return getFavorites().some(item => normalizeKey(item.key || item) === normalizeKey(key)); }

function toggleFavorite(key, btn) {
    const norm = normalizeKey(key);
    let favs = getFavorites();
    const idx = favs.findIndex(item => normalizeKey(item.key || item) === norm);
    if (idx !== -1) {
        favs.splice(idx, 1);
        btn.textContent = "♡";
        btn.classList.remove("active");
        showToast("Removed from favorites", "✓");
    } else {
        favs.push({ key: norm, title: "Book", author: "", year: "" });
        btn.textContent = "♥";
        btn.classList.add("active");
        showToast("Added to favorites", "♥");
    }
    saveFavorites(favs);
}

/* =========================================================
   RECENTLY VIEWED
========================================================= */
function saveRecentlyViewed(key) {
    let recent = JSON.parse(localStorage.getItem(CONFIG.RECENT_KEY)) || [];
    recent = recent.filter(item => item !== key);
    recent.unshift(key);
    recent = recent.slice(0, 10);
    localStorage.setItem(CONFIG.RECENT_KEY, JSON.stringify(recent));
}

async function renderRecentBooks() {
    if (!el.recentBooksGrid || !el.recentSection) return;
    const recent = JSON.parse(localStorage.getItem(CONFIG.RECENT_KEY)) || [];
    if (!recent.length) { el.recentSection.style.display = "none"; return; }
    el.recentSection.style.display = "block";
    el.recentBooksGrid.innerHTML = "";
    for (const key of recent.slice(0, 5)) {
        try {
            const res = await fetch(`https://openlibrary.org/works/${normalizeKey(key)}.json`);
            if (res.ok) {
                const data = await res.json();
                el.recentBooksGrid.insertAdjacentHTML("beforeend", createBookCard({
                    key: `/works/${key}`,
                    title: data.title,
                    author_name: [],
                    first_publish_year: data.first_publish_date,
                    cover_i: data.covers ? data.covers[0] : null
                }));
            }
        } catch (e) {}
    }
}

/* =========================================================
   STATISTICS & HELPERS
========================================================= */
function updateStatistics(featured, popular) {
    if (el.totalBooksCount) el.totalBooksCount.textContent = (featured.total || 0) + (popular.total || 0);
    if (el.totalAuthorsCount) el.totalAuthorsCount.textContent = "1000+";
}

function showEmptyBooks(container, msg) {
    container.innerHTML = `<div class="books-loading"><p>${escapeHTML(msg)}</p></div>`;
}

function setupCurrentYear() {
    if (el.currentYear) el.currentYear.textContent = new Date().getFullYear();
}

function hideLoader() {
    setTimeout(() => { if (el.loader) el.loader.classList.add("hidden"); }, 500);
}

let toastTimer = null;
function showToast(message, icon = "✓") {
    if (!el.toast) return;
    el.toastMessage.textContent = message;
    el.toastIcon.textContent = icon;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2500);
}

function escapeHTML(v) {
    return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}