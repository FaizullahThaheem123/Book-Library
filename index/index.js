/* =========================================================
   BOOK LIBRARY - HOME PAGE JAVASCRIPT
   Version 5.0 (ULTIMATE FIX - Multiple Click Handlers + Recent Fix)
========================================================= */

"use strict";

console.log("🚀 index.js V5.0 LOADED");

/* =========================================================
   CONFIGURATION
========================================================= */

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

/* =========================================================
   DOM ELEMENTS
========================================================= */

let el = {};

function getElements() {
    return {
        loader: document.getElementById("appLoader"),
        searchForm: document.getElementById("mainSearchForm"),
        searchInput: document.getElementById("mainSearchInput"),
        headerSearchButton: document.getElementById("headerSearchButton"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuButton"),
        closeMobileMenu: document.getElementById("closeMobileMenu"),
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

/* =========================================================
   CATEGORY DATA
========================================================= */

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

/* =========================================================
   APP INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Content Loaded");
    el = getElements();
    initializeApp();
});

function initializeApp() {
    console.log("✅ App Initializing...");
    setupCurrentYear();
    setupTheme();
    setupMobileMenu();
    setupSearch();
    setupQuickSearch();
    renderCategories();
    setupUltimateClickHandlers(); // New: 4-in-1 click system
    loadHomeBooks();
    renderRecentBooks();
    hideLoader();
    console.log("✅ App Ready!");
}

/* =========================================================
   ULTIMATE CLICK HANDLER SYSTEM (4 Ways)
   ========================================================= */

function setupUltimateClickHandlers() {
    console.log("🔊 Setting up ULTIMATE click handlers...");

    // 1. DOCUMENT-LEVEL DELEGATION (most reliable)
    document.addEventListener("click", function(e) {
        const card = e.target.closest(".book-card");
        if (card) {
            console.log("🖱️ [DOCUMENT] Book card clicked");
            handleBookClick(e, card);
            return;
        }
        const fav = e.target.closest(".book-favorite");
        if (fav) {
            e.stopPropagation();
            const key = fav.dataset.key;
            if (key) toggleFavorite(key, fav);
        }
    });

    // 2. GRID-LEVEL DELEGATION (backup)
    const grids = [el.featuredBooksGrid, el.popularBooksGrid, el.recentBooksGrid];
    grids.forEach(grid => {
        if (grid) {
            grid.addEventListener("click", function(e) {
                const card = e.target.closest(".book-card");
                if (card) {
                    console.log("🖱️ [GRID] Book card clicked in", this.id);
                    handleBookClick(e, card);
                }
            });
        }
    });

    // 3. MUTATION OBSERVER (for dynamic cards)
    const observer = new MutationObserver(function() {
        document.querySelectorAll(".book-card:not([data-listener])").forEach(card => {
            card.setAttribute("data-listener", "true");
            // Direct addEventListener on each card
            card.addEventListener("click", function(e) {
                if (e.target.closest(".book-favorite")) return;
                console.log("🖱️ [DIRECT] Book card clicked");
                const key = this.dataset.bookKey;
                if (key) {
                    saveRecentlyViewed(key);
                    openBookDetails(key);
                }
            });
        });
    });
    grids.forEach(grid => {
        if (grid) observer.observe(grid, { childList: true, subtree: true });
    });

    console.log("✅ Ultimate click handlers ready!");
}

/* =========================================================
   HANDLE BOOK CLICK (UNIVERSAL)
   ========================================================= */

function handleBookClick(event, card) {
    // Ignore if clicked on favorite
    if (event.target.closest(".book-favorite")) {
        console.log("⏭️ Skipping - favorite button");
        return;
    }

    const key = card.dataset.bookKey;
    console.log("📖 Book clicked, key:", key);

    if (!key || key === "") {
        showToast("This book has no ID.", "!");
        return;
    }

    // Show a quick test (remove later)
    // alert("Opening: " + key);

    saveRecentlyViewed(key);
    openBookDetails(key);
}

/* =========================================================
   OPEN BOOK DETAILS
   ========================================================= */

function openBookDetails(key) {
    const url = `${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}`;
    console.log("🚀 Navigating to:", url);
    window.location.href = url;
}

/* =========================================================
   CURRENT YEAR
   ========================================================= */

function setupCurrentYear() {
    if (el.currentYear) {
        el.currentYear.textContent = new Date().getFullYear();
    }
}

/* =========================================================
   LOADER
   ========================================================= */

function hideLoader() {
    setTimeout(() => {
        if (el.loader) {
            el.loader.classList.add("hidden");
        }
    }, 500);
}

/* =========================================================
   THEME SYSTEM
========================================================= */

function setupTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode", "dark");
        updateThemeIcon(true);
    } else {
        document.body.classList.remove("dark-mode", "dark");
        updateThemeIcon(false);
    }
    if (el.themeToggle) {
        el.themeToggle.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("dark", isDark);
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
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
    if (el.mobileMenuButton) {
        el.mobileMenuButton.addEventListener("click", openMobileMenu);
    }
    if (el.closeMobileMenu) {
        el.closeMobileMenu.addEventListener("click", closeMobileMenu);
    }
    document.addEventListener("click", function(event) {
        if (el.mobileMenu && el.mobileMenu.classList.contains("open") &&
            !el.mobileMenu.contains(event.target) &&
            !el.mobileMenuButton.contains(event.target)) {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    if (!el.mobileMenu) return;
    el.mobileMenu.classList.add("open");
    el.mobileMenu.setAttribute("aria-hidden", "false");
}

function closeMobileMenu() {
    if (!el.mobileMenu) return;
    el.mobileMenu.classList.remove("open");
    el.mobileMenu.setAttribute("aria-hidden", "true");
}

/* =========================================================
   SEARCH SYSTEM
========================================================= */

function setupSearch() {
    if (el.searchForm) {
        el.searchForm.addEventListener("submit", handleSearch);
    }
    if (el.headerSearchButton) {
        el.headerSearchButton.addEventListener("click", () => {
            el.searchInput?.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
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
    const url = `${CONFIG.SEARCH_PAGE}?q=${encodeURIComponent(query)}`;
    window.location.href = url;
}

/* =========================================================
   QUICK SEARCH
========================================================= */

function setupQuickSearch() {
    const buttons = document.querySelectorAll(".quick-search-button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const query = button.dataset.search;
            if (el.searchInput) {
                el.searchInput.value = query;
            }
            goToSearch(query);
        });
    });
}

/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {
    if (!el.categoryGrid) return;
    el.categoryGrid.innerHTML = categories.map(category => `
        <button type="button" class="category-card" data-subject="${escapeHTML(category.subject)}">
            <div class="category-icon">${category.icon}</div>
            <h3>${escapeHTML(category.name)}</h3>
            <p>Explore books</p>
        </button>
    `).join("");

    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            const subject = card.dataset.subject;
            goToSearch(subject);
        });
    });
}

/* =========================================================
   LOAD HOME BOOKS
========================================================= */

async function loadHomeBooks() {
    try {
        console.log("📚 Loading home books...");
        const [featured, popular] = await Promise.all([
            fetchBooks("best books", 1, CONFIG.MAX_BOOKS),
            fetchBooks("fiction", 1, CONFIG.MAX_BOOKS)
        ]);
        console.log("✅ Featured books:", featured?.books?.length || 0);
        console.log("✅ Popular books:", popular?.books?.length || 0);
        renderBooks(el.featuredBooksGrid, featured);
        renderBooks(el.popularBooksGrid, popular);
        updateStatistics(featured, popular);
    } catch (error) {
        console.error("❌ Book loading error:", error);
        showEmptyBooks(el.featuredBooksGrid, "Unable to load books right now.");
        showEmptyBooks(el.popularBooksGrid, "Please check your internet connection.");
    }
}

/* =========================================================
   OPEN LIBRARY API
========================================================= */

async function fetchBooks(query, page = 1, limit = 10) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i,isbn,publisher,language,subject");
    console.log("🌐 Fetching:", url.toString());
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return {
        books: data.docs || [],
        total: data.numFound || 0
    };
}

/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks(container, result) {
    if (!container) {
        console.warn("⚠️ Container not found");
        return;
    }
    const books = result?.books || [];
    if (!books.length) {
        showEmptyBooks(container, "No books found.");
        return;
    }
    console.log("🖼️ Rendering", books.length, "books in", container.id);
    container.innerHTML = books.map(createBookCard).join("");
}

/* =========================================================
   BOOK CARD CREATION (with inline onclick backup)
========================================================= */

function createBookCard(book) {
    const title = book.title || "Unknown Book";
    const author = Array.isArray(book.author_name) ? book.author_name[0] : "Unknown Author";
    const year = book.first_publish_year || "Year unavailable";
    const key = book.key || "";

    let coverHTML = `<div class="book-cover-placeholder">📖</div>`;
    if (book.cover_i) {
        const coverURL = `${CONFIG.COVER_URL}/${book.cover_i}-M.jpg`;
        coverHTML = `<img src="${coverURL}" alt="${escapeHTML(title)}" loading="lazy" onerror="this.style.display='none';">`;
    }

    const isFav = isFavorite(key);
    const favIcon = isFav ? "♥" : "♡";
    const favClass = isFav ? "active" : "";

    // Inline onclick as final guarantee
    return `
        <article class="book-card" data-book-key="${escapeHTML(key)}" style="cursor:pointer;" onclick="window.handleInlineBookClick('${escapeHTML(key)}')">
            <button type="button" class="book-favorite ${favClass}" data-key="${escapeHTML(key)}" aria-label="Add to favorites">${favIcon}</button>
            <div class="book-cover">${coverHTML}</div>
            <div class="book-info">
                <h3 class="book-title">${escapeHTML(title)}</h3>
                <p class="book-author">${escapeHTML(author)}</p>
                <p class="book-year">${escapeHTML(String(year))}</p>
            </div>
        </article>
    `;
}

// Global inline click function
window.handleInlineBookClick = function(key) {
    console.log("🖱️ [INLINE] Book clicked with key:", key);
    if (!key) {
        showToast("No book ID.", "!");
        return;
    }
    saveRecentlyViewed(key);
    openBookDetails(key);
};

/* =========================================================
   FAVORITES
========================================================= */

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(key) {
    const norm = normalizeKey(key);
    return getFavorites().some(item => normalizeKey(item.key || item) === norm);
}

function toggleFavorite(key, button) {
    const norm = normalizeKey(key);
    let favorites = getFavorites();
    const index = favorites.findIndex(item => normalizeKey(item.key || item) === norm);
    if (index === -1) {
        favorites.push({ key: norm, title: "Book", author: "Author", year: "" });
        button.textContent = "♥";
        button.classList.add("active");
        showToast("Added to favorites", "♥");
    } else {
        favorites.splice(index, 1);
        button.textContent = "♡";
        button.classList.remove("active");
        showToast("Removed from favorites", "✓");
    }
    saveFavorites(favorites);
}

/* =========================================================
   RECENTLY VIEWED (FIXED)
========================================================= */

function saveRecentlyViewed(key) {
    // Ensure key is a string
    const keyStr = String(key || "").trim();
    if (!keyStr) return;

    let recent = getRecentBooks();
    // Filter out any invalid entries and the same key
    recent = recent.filter(item => typeof item === "string" && item && item !== keyStr);
    recent.unshift(keyStr);
    recent = recent.slice(0, 10);
    localStorage.setItem(CONFIG.RECENT_KEY, JSON.stringify(recent));
}

function getRecentBooks() {
    try {
        const data = JSON.parse(localStorage.getItem(CONFIG.RECENT_KEY));
        if (Array.isArray(data)) {
            return data.filter(item => typeof item === "string" && item.trim() !== "");
        }
        return [];
    } catch {
        return [];
    }
}

async function renderRecentBooks() {
    if (!el.recentBooksGrid || !el.recentSection) return;

    const recent = getRecentBooks();
    if (!recent.length) {
        el.recentSection.style.display = "none";
        return;
    }

    el.recentSection.style.display = "block";
    el.recentBooksGrid.innerHTML = "";

    // Only try to fetch valid keys (non-empty strings)
    const validKeys = recent.slice(0, 5).filter(k => typeof k === "string" && k.trim() !== "");
    for (const key of validKeys) {
        try {
            const result = await fetchBookByKey(key);
            if (result) {
                el.recentBooksGrid.insertAdjacentHTML("beforeend", createBookCard(result));
            }
        } catch (error) {
            console.warn("Recent book error for key:", key, error);
        }
    }
}

async function fetchBookByKey(key) {
    const cleanKey = normalizeKey(key);
    if (!cleanKey) return null;
    const url = `https://openlibrary.org/works/${cleanKey}.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return {
        key: `/works/${cleanKey}`,
        title: data.title || "Unknown Book",
        author_name: [],
        first_publish_year: data.first_publish_date || "",
        cover_i: Array.isArray(data.covers) ? data.covers[0] : null
    };
}

/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics(featured, popular) {
    if (el.totalBooksCount) {
        const total = Math.max(featured?.total || 0, popular?.total || 0);
        el.totalBooksCount.textContent = formatNumber(total);
    }
    if (el.totalAuthorsCount) {
        const authors = new Set([
            ...(featured?.books || []),
            ...(popular?.books || [])
        ].flatMap(book => book.author_name || []));
        el.totalAuthorsCount.textContent = formatNumber(authors.size);
    }
}

function formatNumber(number) {
    if (!Number.isFinite(number)) return "0";
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyBooks(container, message) {
    if (!container) return;
    container.innerHTML = `
        <div class="books-loading">
            <div style="font-size:40px;">📚</div>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}

/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message, icon = "✓") {
    if (!el.toast || !el.toastMessage) return;
    el.toastMessage.textContent = message;
    if (el.toastIcon) el.toastIcon.textContent = icon;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.toast.classList.remove("show");
    }, 2500);
}

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* =========================================================
   GLOBAL ERROR HANDLING
========================================================= */

window.addEventListener("error", event => {
    console.error("❌ Application error:", event.error);
});

window.addEventListener("unhandledrejection", event => {
    console.error("❌ Unhandled promise:", event.reason);
});

console.log("✅ index.js V5.0 loaded successfully!");