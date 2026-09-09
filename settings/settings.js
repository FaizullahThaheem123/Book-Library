/* =========================================================
   BOOK LIBRARY — SETTINGS JAVASCRIPT
   Version 3.0 (Unified Dark Class + Theme Sync)
========================================================= */

"use strict";

const CONFIG = {
    SEARCH_PAGE: "../search/search.html",
    THEME_KEY: "bookLibraryTheme",
    SETTINGS_KEY: "bookLibrarySettings"
};

const DEFAULT_SETTINGS = {
    theme: "system",
    fontSize: 100,
    animations: true,
    bookOpening: "details",
    readingWidth: "comfortable",
    rememberPosition: true
};

/* =========================================================
   DOM READY
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    // Unified header events
    setupHeaderEvents();
    setupMobileMenu();
    setupThemeToggle();

    // Existing settings logic
    loadSettings();
    setupTabs();
    setupTheme();
    setupFontSize();
    setupAnimations();
    setupReadingSettings();
    setupLibraryCounts();
    setupDataActions();
    setupThemeSync();  // <-- Listen for changes from other pages
});

/* =========================================================
   THEME SYNC (Listen for changes from other tabs/pages)
========================================================= */
function setupThemeSync() {
    window.addEventListener("storage", function(e) {
        if (e.key === CONFIG.THEME_KEY) {
            const newTheme = e.newValue;
            if (newTheme === "dark") {
                document.body.classList.add("dark");
                const toggle = document.getElementById("themeToggle");
                if (toggle) toggle.textContent = "☀️";
            } else {
                document.body.classList.remove("dark");
                const toggle = document.getElementById("themeToggle");
                if (toggle) toggle.textContent = "🌙";
            }
        }
    });
}

/* =========================================================
   HEADER EVENTS (Search Button)
========================================================= */
function setupHeaderEvents() {
    const searchBtn = document.getElementById("headerSearchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            window.location.href = CONFIG.SEARCH_PAGE;
        });
    }
}

/* =========================================================
   MOBILE MENU (SAME AS BOOKS PAGE)
========================================================= */
function setupMobileMenu() {
    const button = document.getElementById("mobileMenuButton");
    const menu = document.getElementById("mobileMenu");
    if (!button || !menu) return;

    button.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("open");
    });

    document.addEventListener("click", function (e) {
        if (menu.classList.contains("open") &&
            !menu.contains(e.target) &&
            !button.contains(e.target)) {
            menu.classList.remove("open");
        }
    });

    menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            menu.classList.remove("open");
        });
    });
}

/* =========================================================
   HEADER THEME BUTTON (Sync with settings)
========================================================= */
function setupThemeToggle() {
    const button = document.getElementById("themeToggle");
    if (!button) return;

    updateThemeIcon();

    button.addEventListener("click", function () {
        const settings = getSettings();
        let newTheme;
        if (settings.theme === "dark") {
            newTheme = "light";
        } else {
            newTheme = "dark";
        }
        settings.theme = newTheme;
        saveSettings(settings);
        applyTheme(newTheme);
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) themeSelect.value = newTheme;
        updateThemeIcon();
        showToast("✓", newTheme === "dark" ? "Dark theme enabled" : "Light theme enabled");
    });
}

function updateThemeIcon() {
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const dark = document.body.classList.contains("dark");
    button.textContent = dark ? "☀️" : "🌙";
}

/* =========================================================
   EXISTING SETTINGS LOGIC
========================================================= */

function getSettings() {
    try {
        const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (!saved) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (error) {
        console.error("Settings loading error:", error);
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Settings saving error:", error);
    }
}

function loadSettings() {
    const settings = getSettings();
    applyTheme(settings.theme);
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) themeSelect.value = settings.theme;

    applyFontSize(settings.fontSize);
    const animationsToggle = document.getElementById("animationsToggle");
    if (animationsToggle) animationsToggle.checked = settings.animations;

    const bookOpening = document.getElementById("bookOpening");
    if (bookOpening) bookOpening.value = settings.bookOpening;

    const readingWidth = document.getElementById("readingWidth");
    if (readingWidth) readingWidth.value = settings.readingWidth;

    const rememberPosition = document.getElementById("rememberPosition");
    if (rememberPosition) rememberPosition.checked = settings.rememberPosition;
}

function setupTabs() {
    const tabs = document.querySelectorAll(".settings-tab");
    const panels = document.querySelectorAll(".settings-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const section = tab.dataset.section;
            tabs.forEach(item => item.classList.remove("active"));
            panels.forEach(panel => panel.classList.remove("active"));
            tab.classList.add("active");
            const target = document.getElementById(section);
            if (target) target.classList.add("active");
            const mobileMenu = document.getElementById("mobileMenu");
            if (mobileMenu) mobileMenu.classList.remove("open");
        });
    });
}

function setupTheme() {
    const themeSelect = document.getElementById("themeSelect");
    if (!themeSelect) return;
    themeSelect.addEventListener("change", () => {
        const theme = themeSelect.value;
        const settings = getSettings();
        settings.theme = theme;
        saveSettings(settings);
        applyTheme(theme);
        updateThemeIcon();
        showToast("✓", "Theme updated");
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", () => {
            const settings = getSettings();
            if (settings.theme === "system") {
                applyTheme("system");
                updateThemeIcon();
            }
        });
    }
}

function applyTheme(theme) {
    const body = document.body;
    body.classList.remove("dark");
    if (theme === "dark") {
        body.classList.add("dark");
        localStorage.setItem(CONFIG.THEME_KEY, "dark");
        return;
    }
    if (theme === "system") {
        const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (darkMode) {
            body.classList.add("dark");
            localStorage.setItem(CONFIG.THEME_KEY, "dark");
        } else {
            localStorage.setItem(CONFIG.THEME_KEY, "light");
        }
        return;
    }
    // light theme
    localStorage.setItem(CONFIG.THEME_KEY, "light");
}

function setupFontSize() {
    const decrease = document.getElementById("fontDecrease");
    const increase = document.getElementById("fontIncrease");
    if (decrease) {
        decrease.addEventListener("click", () => changeFontSize(-10));
    }
    if (increase) {
        increase.addEventListener("click", () => changeFontSize(10));
    }
}

function changeFontSize(amount) {
    const settings = getSettings();
    let size = Number(settings.fontSize) + amount;
    if (size < 80) size = 80;
    if (size > 130) size = 130;
    settings.fontSize = size;
    saveSettings(settings);
    applyFontSize(size);
    showToast("✓", `Font size ${size}%`);
}

function applyFontSize(size) {
    document.documentElement.style.setProperty("--font-scale", size / 100);
    const display = document.getElementById("fontSizeValue");
    if (display) display.textContent = `${size}%`;
}

function setupAnimations() {
    const toggle = document.getElementById("animationsToggle");
    if (!toggle) return;
    toggle.addEventListener("change", () => {
        const settings = getSettings();
        settings.animations = toggle.checked;
        saveSettings(settings);
        applyAnimations(toggle.checked);
        showToast("✓", toggle.checked ? "Animations enabled" : "Animations disabled");
    });
}

function applyAnimations(enabled) {
    if (enabled) {
        document.body.classList.remove("no-animations");
    } else {
        document.body.classList.add("no-animations");
    }
}

function setupReadingSettings() {
    const bookOpening = document.getElementById("bookOpening");
    const readingWidth = document.getElementById("readingWidth");
    const rememberPosition = document.getElementById("rememberPosition");

    if (bookOpening) {
        bookOpening.addEventListener("change", () => {
            const settings = getSettings();
            settings.bookOpening = bookOpening.value;
            saveSettings(settings);
            showToast("✓", "Book opening preference saved");
        });
    }
    if (readingWidth) {
        readingWidth.addEventListener("change", () => {
            const settings = getSettings();
            settings.readingWidth = readingWidth.value;
            saveSettings(settings);
            showToast("✓", "Reading width saved");
        });
    }
    if (rememberPosition) {
        rememberPosition.addEventListener("change", () => {
            const settings = getSettings();
            settings.rememberPosition = rememberPosition.checked;
            saveSettings(settings);
            showToast("✓", rememberPosition.checked ? "Reading position will be remembered" : "Reading position memory disabled");
        });
    }
}

function setupLibraryCounts() {
    updateLibraryCounts();
    window.addEventListener("storage", updateLibraryCounts);
}

function updateLibraryCounts() {
    const favorites = getArrayFromStorage(["favorites", "bookLibraryFavorites"]);
    const myBooks = getArrayFromStorage(["myBooks", "bookLibraryMyBooks"]);
    const recent = getArrayFromStorage(["recentBooks", "recentlyViewed", "bookLibraryRecent"]);

    setCount("favoritesCount", favorites.length);
    setCount("myBooksCount", myBooks.length);
    setCount("recentCount", recent.length);
}

function getArrayFromStorage(keys) {
    for (const key of keys) {
        try {
            const value = localStorage.getItem(key);
            if (!value) continue;
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
        } catch (error) {
            console.warn(`Invalid storage data: ${key}`);
        }
    }
    return [];
}

function setCount(id, count) {
    const element = document.getElementById(id);
    if (element) element.textContent = count;
}

function setupDataActions() {
    const clearRecent = document.getElementById("clearRecent");
    const clearFavorites = document.getElementById("clearFavorites");
    const clearMyBooks = document.getElementById("clearMyBooks");
    const resetSettings = document.getElementById("resetSettings");

    if (clearRecent) {
        clearRecent.addEventListener("click", () => {
            if (!confirm("Are you sure you want to clear Recently Viewed?")) return;
            clearStorageKeys(["recentBooks", "recentlyViewed", "bookLibraryRecent"]);
            updateLibraryCounts();
            showToast("✓", "Recently Viewed cleared");
        });
    }
    if (clearFavorites) {
        clearFavorites.addEventListener("click", () => {
            if (!confirm("Are you sure you want to clear all Favorites?")) return;
            clearStorageKeys(["favorites", "bookLibraryFavorites"]);
            updateLibraryCounts();
            showToast("✓", "Favorites cleared");
        });
    }
    if (clearMyBooks) {
        clearMyBooks.addEventListener("click", () => {
            if (!confirm("Are you sure you want to clear My Books?")) return;
            clearStorageKeys(["myBooks", "bookLibraryMyBooks"]);
            updateLibraryCounts();
            showToast("✓", "My Books cleared");
        });
    }
    if (resetSettings) {
        resetSettings.addEventListener("click", () => {
            if (!confirm("Reset all Book Library settings to default?")) return;
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            loadSettings();
            updateThemeIcon();
            showToast("✓", "Settings restored to default");
        });
    }
}

function clearStorageKeys(keys) {
    keys.forEach(key => localStorage.removeItem(key));
}

let toastTimer = null;
function showToast(icon = "✓", message = "Done") {
    const toast = document.getElementById("toast");
    const toastIcon = document.getElementById("toastIcon");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastIcon || !toastMessage) return;

    toastIcon.textContent = icon;
    toastMessage.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}