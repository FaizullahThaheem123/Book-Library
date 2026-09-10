/* =========================================================
   BOOK LIBRARY — CATEGORIES PAGE JAVASCRIPT
   Version 2.1 (Category Search Removed + Theme Sync)
========================================================= */

"use strict";

const CONFIG = {
    BOOKS_PAGE: "../books/books.html",
    SEARCH_PAGE: "../search/search.html",
    THEME_KEY: "bookLibraryTheme"
};

const categories = [
    { name: "Fiction", subject: "fiction", icon: "📖", description: "Stories, novels and imaginative worlds." },
    { name: "Science", subject: "science", icon: "🔬", description: "Discover science, research and discoveries." },
    { name: "Technology", subject: "technology", icon: "💻", description: "Computers, software, technology and innovation." },
    { name: "History", subject: "history", icon: "🏛️", description: "Explore civilizations, events and the past." },
    { name: "Religion", subject: "religion", icon: "🕌", description: "Books about faith, spirituality and religion." },
    { name: "Psychology", subject: "psychology", icon: "🧠", description: "Mind, behavior, emotions and human thinking." },
    { name: "Business", subject: "business", icon: "💼", description: "Business, management, finance and leadership." },
    { name: "Romance", subject: "romance", icon: "❤️", description: "Romantic stories and unforgettable relationships." },
    { name: "Mystery", subject: "mystery", icon: "🕵️", description: "Mysteries, investigations and suspense." },
    { name: "Adventure", subject: "adventure", icon: "🗺️", description: "Exciting journeys, exploration and adventure." },
    { name: "Education", subject: "education", icon: "🎓", description: "Learning, teaching and educational resources." },
    { name: "Children", subject: "children", icon: "🧒", description: "Fun and educational books for children." },
    { name: "Biography", subject: "biography", icon: "👤", description: "Real lives, people and inspiring journeys." },
    { name: "Art", subject: "art", icon: "🎨", description: "Painting, drawing, design and visual arts." },
    { name: "Music", subject: "music", icon: "🎵", description: "Music history, theory, artists and instruments." },
    { name: "Travel", subject: "travel", icon: "✈️", description: "Travel guides, destinations and exploration." },
    { name: "Health", subject: "health", icon: "🌿", description: "Health, wellness and healthy living." },
    { name: "Cooking", subject: "cooking", icon: "🍳", description: "Recipes, food, cooking and culinary arts." },
    { name: "Poetry", subject: "poetry", icon: "✍️", description: "Poems, poets and beautiful written expression." },
    { name: "Philosophy", subject: "philosophy", icon: "🤔", description: "Ideas, wisdom, ethics and human thought." },
    { name: "Law", subject: "law", icon: "⚖️", description: "Law, justice, legal systems and rights." },
    { name: "Computer", subject: "computers", icon: "🖥️", description: "Programming, computing and computer science." },
    { name: "Mathematics", subject: "mathematics", icon: "➗", description: "Numbers, equations, mathematics and logic." },
    { name: "Nature", subject: "nature", icon: "🌳", description: "Nature, environment, plants and wildlife." },
    { name: "Animals", subject: "animals", icon: "🐾", description: "Animal life, wildlife and zoology." },
    { name: "Poetry & Literature", subject: "literature", icon: "📜", description: "Classic and modern literature." },
    { name: "Science Fiction", subject: "science_fiction", icon: "🚀", description: "Space, future worlds and scientific imagination." },
    { name: "Fantasy", subject: "fantasy", icon: "🐉", description: "Magic, mythical worlds and legendary adventures." },
    { name: "Thriller", subject: "thriller", icon: "🎭", description: "Suspenseful stories full of tension." },
    { name: "Drama", subject: "drama", icon: "🎬", description: "Dramatic stories, plays and theatre." },
    { name: "Politics", subject: "politics", icon: "🏛️", description: "Politics, government and society." },
    { name: "Economics", subject: "economics", icon: "📈", description: "Economics, markets, money and finance." },
    { name: "Geography", subject: "geography", icon: "🌍", description: "Countries, maps, places and Earth." },
    { name: "Language", subject: "language", icon: "🗣️", description: "Languages, grammar, linguistics and communication." },
    { name: "Computer Programming", subject: "programming", icon: "👨‍💻", description: "Programming languages and software development." }
];

let el = {};

function getElements() {
    return {
        categoriesGrid: document.getElementById("categoriesGrid"),
        categoryList: document.getElementById("categoryList"),
        categoryCount: document.getElementById("categoryCount"),
        noResults: document.getElementById("noResults"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuButton"),
        mobileMenu: document.getElementById("mobileMenu"),
        headerSearchBtn: document.getElementById("headerSearchBtn"),
        toast: document.getElementById("toast"),
        toastMessage: document.getElementById("toastMessage"),
        toastIcon: document.getElementById("toastIcon")
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
    renderCategories(categories);
    renderCategoryList(categories);
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

/* ===== RENDER CATEGORIES ===== */
function renderCategories(data) {
    if (!el.categoriesGrid) return;
    el.categoriesGrid.innerHTML = "";
    if (el.categoryCount) el.categoryCount.textContent = data.length + " Categories";
    if (data.length === 0) {
        if (el.noResults) el.noResults.style.display = "block";
        return;
    }
    if (el.noResults) el.noResults.style.display = "none";
    data.forEach(function(category) {
        var card = document.createElement("article");
        card.className = "category-card";
        card.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3>${escapeHTML(category.name)}</h3>
            <p>${escapeHTML(category.description)}</p>
            <span class="category-arrow">→</span>
        `;
        card.addEventListener("click", function() {
            window.location.href = CONFIG.BOOKS_PAGE + "?subject=" + encodeURIComponent(category.subject);
        });
        el.categoriesGrid.appendChild(card);
    });
}

function renderCategoryList(data) {
    if (!el.categoryList) return;
    el.categoryList.innerHTML = "";
    data.forEach(function(category) {
        var item = document.createElement("a");
        item.className = "category-list-item";
        item.href = CONFIG.BOOKS_PAGE + "?subject=" + encodeURIComponent(category.subject);
        item.innerHTML = "<span>" + category.icon + "</span><span>" + escapeHTML(category.name) + "</span>";
        el.categoryList.appendChild(item);
    });
}

/* ===== TOAST ===== */
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

function escapeHTML(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

