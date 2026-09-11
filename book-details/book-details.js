/* =========================================================
   BOOK LIBRARY — BOOK DETAILS JAVASCRIPT
   Version 11.0 (No Continue Prompt, No Zoom)
========================================================= */

"use strict";

const CONFIG = {
    API_URL: "https://openlibrary.org",
    SEARCH_URL: "https://openlibrary.org/search.json",
    ARCHIVE_URL: "https://archive.org",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    FAVORITES_KEY: "bookLibraryFavorites",
    MY_BOOKS_KEY: "bookLibraryMyBooks",
    THEME_KEY: "bookLibraryTheme",
    SEARCH_PAGE: "../search/search.html",
    RELATED_LIMIT: 5
};

const state = {
    key: "",
    book: null,
    favorite: false,
    inMyBooks: false,
    myBookStatus: "want",
    readable: false,
    ia: null,
    ebookAccess: "no_ebook",
    fullscreen: false
};

const elements = {
    loadingSection: document.getElementById("loadingSection"),
    errorSection: document.getElementById("errorSection"),
    detailsSection: document.getElementById("detailsSection"),
    errorMessage: document.getElementById("errorMessage"),
    errorBackButton: document.getElementById("errorBackButton"),
    backButton: document.getElementById("backButton"),
    bookCover: document.getElementById("bookCover"),
    coverFallback: document.getElementById("coverFallback"),
    bookTitle: document.getElementById("bookTitle"),
    bookAuthor: document.getElementById("bookAuthor"),
    bookYear: document.getElementById("bookYear"),
    bookPublisher: document.getElementById("bookPublisher"),
    bookPages: document.getElementById("bookPages"),
    bookLanguage: document.getElementById("bookLanguage"),
    bookDescription: document.getElementById("bookDescription"),
    subjectList: document.getElementById("subjectList"),
    favoriteButton: document.getElementById("favoriteButton"),
    favoriteIcon: document.getElementById("favoriteIcon"),
    favoriteText: document.getElementById("favoriteText"),
    myBooksButton: document.getElementById("myBooksButton"),
    myBooksIcon: document.getElementById("myBooksIcon"),
    myBooksText: document.getElementById("myBooksText"),
    readButton: document.getElementById("readButton"),
    openLibraryButton: document.getElementById("openLibraryButton"),
    relatedGrid: document.getElementById("relatedGrid"),
    relatedSection: document.getElementById("relatedSection"),
    themeToggle: document.getElementById("themeToggle"),
    headerSearchBtn: document.getElementById("headerSearchBtn"),
    mobileMenuButton: document.getElementById("mobileMenuButton"),
    mobileMenu: document.getElementById("mobileMenu"),
    toast: document.getElementById("toast"),
    toastIcon: document.getElementById("toastIcon"),
    toastMessage: document.getElementById("toastMessage"),
    accessMessage: document.getElementById("accessMessage"),
    readerContainer: document.getElementById("readerContainer"),
    readerIframe: document.getElementById("readerIframe"),
    readerToolbarTitle: document.getElementById("readerToolbarTitle"),
    readerCloseBtn: document.getElementById("readerCloseBtn")
};

let toastTimer = null;
let savedScrollY = 0;

document.addEventListener("DOMContentLoaded", function () {
    initializeHeaderEvents();
    initializeTheme();
    initializeMobileMenu();
    initializeNavigation();
    initializeFavorite();
    initializeMyBooks();
    initializeActions();
    initializeReader();
    setupThemeSync();
    loadBook();
});

/* ===== THEME SYNC ===== */
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
    elements.mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            elements.mobileMenu.classList.remove("open");
        });
    });
}

function initializeTheme() {
    var savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (elements.themeToggle) elements.themeToggle.textContent = "☀️";
    }
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark");
            var dark = document.body.classList.contains("dark");
            localStorage.setItem(CONFIG.THEME_KEY, dark ? "dark" : "light");
            this.textContent = dark ? "☀️" : "🌙";
        });
    }
}

function getBookKey() {
    var params = new URLSearchParams(window.location.search);
    return params.get("key") || "";
}

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function getFirstIA(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        var first = value.find(function (item) { return typeof item === "string" && item.trim(); });
        return first ? first.trim() : null;
    }
    if (typeof value === "string" && value.trim()) return value.trim();
    return null;
}

async function loadBook() {
    state.key = getBookKey();
    if (!state.key) {
        showError("No book was selected.");
        return;
    }
    showLoading();
    try {
        var workKey = normalizeKey(state.key);
        var response = await fetch(CONFIG.API_URL + "/works/" + workKey + ".json");
        if (!response.ok) throw new Error("Book not found.");
        var data = await response.json();
        state.book = data;

        var ia = getFirstIA(data.ia) || getFirstIA(data.ia_metadata?.identifier);
        state.ia = ia;

        await enrichBookData();

        if (!state.ia) {
            var fallback = getFirstIA(data.ia_metadata?.identifier);
            if (fallback) state.ia = fallback;
        }

        await checkFreeAccess();

        renderBook();
        updateMyBooksState();
        await loadRelatedBooks();
        hideLoading();
        showDetails();
    } catch (error) {
        console.error("Book details error:", error);
        hideLoading();
        showError("We couldn't load this book. Please try another book.");
    }
}

async function enrichBookData() {
    var book = state.book;
    if (Array.isArray(book.authors) && book.authors.length) {
        var authors = await Promise.all(book.authors.slice(0, 3).map(function (item) { return getAuthorName(item); }));
        book._authors = authors.filter(Boolean);
    }
    try {
        var url = new URL(CONFIG.SEARCH_URL);
        url.searchParams.set("title", book.title || "");
        url.searchParams.set("limit", "5");
        url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i,publisher,number_of_pages_median,language,ia,ebook_access,public_scan_b");
        var response = await fetch(url.toString());
        if (response.ok) {
            var data = await response.json();
            if (data.docs && data.docs.length) {
                var match = data.docs.find(function (item) { return normalizeText(item.title) === normalizeText(book.title); });
                if (!match) match = data.docs[0];
                book._edition = match;
                if (!state.ia) {
                    var editionIA = getFirstIA(match.ia);
                    if (editionIA) state.ia = editionIA;
                }
                if (match.ebook_access) state.ebookAccess = match.ebook_access;
            }
        }
    } catch (error) {
        console.warn("Edition enrichment unavailable:", error);
    }
}

async function getAuthorName(authorRef) {
    try {
        var key = authorRef.author.key;
        if (!key) return "";
        var response = await fetch(CONFIG.API_URL + key + ".json");
        if (!response.ok) return "";
        var data = await response.json();
        return data.name || "";
    } catch { return ""; }
}

async function checkFreeAccess() {
    state.ebookAccess = state.ebookAccess || "no_ebook";
    state.readable = false;

    if (!state.ia) {
        state.ebookAccess = "no_ebook";
        return;
    }

    if (state.ebookAccess === "public") {
        state.readable = true;
        return;
    }

    try {
        var response = await fetch(CONFIG.ARCHIVE_URL + "/metadata/" + encodeURIComponent(state.ia));
        if (!response.ok) return;
        var data = await response.json();
        var meta = data.metadata || {};
        var restricted = String(meta["access-restricted-item"] || "").toLowerCase();
        var collection = (meta.collection || "").toString().toLowerCase();
        var freeCollections = ["opensource", "americana", "toronto", "gutenberg", "cdl", "library_of_congress"];
        var isFreeCollection = freeCollections.some(function (c) { return collection.indexOf(c) !== -1; });

        if (restricted === "false" || restricted === "" || isFreeCollection) {
            var files = data.files || [];
            var hasReadableFile = files.some(function (f) {
                var name = (f.name || "").toLowerCase();
                return name.endsWith(".pdf") || name.endsWith(".epub") || name.endsWith(".txt");
            });
            if (hasReadableFile || restricted === "false" || isFreeCollection) {
                state.ebookAccess = "public";
                state.readable = true;
                return;
            }
        }
        if (restricted === "true") {
            state.ebookAccess = "borrowable";
            return;
        }
        state.ebookAccess = "printdisabled";
    } catch (error) {
        console.warn("Archive metadata check failed:", error);
    }
}

function renderBook() {
    var book = state.book;
    var edition = book._edition || {};
    var title = cleanText(book.title || edition.title || "Unknown Title");
    var author = getDisplayedAuthor(book, edition);
    elements.bookTitle.textContent = title;
    elements.bookAuthor.textContent = author;
    elements.bookYear.textContent = getYear(book, edition);
    elements.bookPublisher.textContent = getPublisher(book, edition);
    elements.bookPages.textContent = getPages(book, edition);
    elements.bookLanguage.textContent = getLanguage(book, edition);
    renderCover(book, edition, title);
    renderDescription(book);
    renderSubjects(book);
    updateFavoriteState();
    renderReadButton();
}

function renderReadButton() {
    var readBtn = elements.readButton;
    if (!readBtn) return;

    if (state.ebookAccess === "public" && state.ia) {
        readBtn.innerHTML = '📖 <span>Read Free</span>';
        readBtn.style.opacity = '1';
        readBtn.style.cursor = 'pointer';
        readBtn.style.background = '#16a34a';
        readBtn.disabled = false;
        readBtn.onclick = function () {
            openReader();
        };
        if (elements.accessMessage) {
            elements.accessMessage.style.display = 'flex';
            elements.accessMessage.querySelector('p').innerHTML =
                '<strong>✅ Free to Read:</strong> This book is 100% free. Click "Read Free" to open the reader.';
        }
        return;
    }

    if (state.ebookAccess === "borrowable") {
        readBtn.innerHTML = '📖 <span>Borrow Only</span>';
        readBtn.style.opacity = '1';
        readBtn.style.cursor = 'pointer';
        readBtn.style.background = '#d97706';
        readBtn.disabled = false;
        readBtn.onclick = function () {
            if (state.ia) {
                window.open("https://archive.org/details/" + encodeURIComponent(state.ia), "_blank", "noopener,noreferrer");
            } else {
                showToast('Please visit Open Library to borrow this book.', '📚');
            }
        };
        if (elements.accessMessage) {
            elements.accessMessage.style.display = 'flex';
            elements.accessMessage.querySelector('p').innerHTML =
                '<strong>⚠️ Borrow Required:</strong> This book is not free. You need to borrow it from Open Library.';
        }
        return;
    }

    readBtn.innerHTML = '📖 <span>Not Available</span>';
    readBtn.style.opacity = '0.6';
    readBtn.style.cursor = 'not-allowed';
    readBtn.style.background = '#6b7280';
    readBtn.disabled = true;
    readBtn.onclick = function () {
        showToast('This book is not available for online reading.', '📚');
    };
    if (elements.accessMessage) {
        elements.accessMessage.style.display = 'flex';
        elements.accessMessage.querySelector('p').innerHTML =
            '<strong>❌ Not Available:</strong> This book is not available for online reading.';
    }
}

function getDisplayedAuthor(book, edition) {
    if (Array.isArray(book._authors) && book._authors.length) return book._authors.join(", ");
    if (Array.isArray(edition.author_name) && edition.author_name.length) return edition.author_name.slice(0, 3).join(", ");
    return "Unknown Author";
}

function getYear(book, edition) { return book.first_publish_date || edition.first_publish_year || "—"; }

function getPublisher(book, edition) {
    if (Array.isArray(edition.publisher) && edition.publisher.length) return edition.publisher.slice(0, 2).join(", ");
    if (Array.isArray(book.publishers) && book.publishers.length) return book.publishers.slice(0, 2).join(", ");
    return "—";
}

function getPages(book, edition) { return edition.number_of_pages_median || book.number_of_pages || "—"; }

function getLanguage(book, edition) {
    if (Array.isArray(edition.language) && edition.language.length) return formatLanguage(edition.language[0]);
    if (Array.isArray(book.languages) && book.languages.length) {
        var first = book.languages[0];
        if (first && first.key) return formatLanguage(first.key);
    }
    return "—";
}

function formatLanguage(code) {
    var codeStr = String(code).split("/").pop().toLowerCase();
    var map = { eng: "English", urd: "Urdu", ara: "Arabic", fas: "Persian", hin: "Hindi", spa: "Spanish", fra: "French", deu: "German", ita: "Italian", por: "Portuguese", rus: "Russian", tur: "Turkish", ben: "Bengali", ind: "Indonesian", jpn: "Japanese", kor: "Korean", chi: "Chinese" };
    return map[codeStr] || codeStr.toUpperCase();
}

function renderCover(book, edition, title) {
    var coverId = book.covers && book.covers.length ? book.covers[0] : null;
    if (!coverId) coverId = edition.cover_i || null;
    if (!coverId) {
        elements.bookCover.style.display = "none";
        elements.coverFallback.classList.add("show");
        return;
    }
    elements.bookCover.src = CONFIG.COVER_URL + "/" + coverId + "-L.jpg";
    elements.bookCover.alt = title;
    elements.bookCover.style.display = "block";
    elements.coverFallback.classList.remove("show");
    elements.bookCover.onerror = function () {
        this.style.display = "none";
        elements.coverFallback.classList.add("show");
    };
}

function renderDescription(book) {
    var desc = book.description;
    if (typeof desc === "object" && desc !== null) desc = desc.value;
    if (!desc) desc = "No description is available for this book yet.";
    elements.bookDescription.textContent = cleanText(desc);
}

function renderSubjects(book) {
    var subjects = Array.isArray(book.subjects) ? book.subjects : [];
    if (!subjects.length) {
        elements.subjectList.innerHTML = '<span class="subject-tag">No subjects available</span>';
        return;
    }
    var unique = [];
    var seen = {};
    subjects.forEach(function (s) {
        var cleaned = cleanText(s);
        if (cleaned && !seen[cleaned]) { seen[cleaned] = true; unique.push(cleaned); }
    });
    elements.subjectList.innerHTML = unique.slice(0, 15).map(function (s) {
        return '<span class="subject-tag">' + escapeHTML(s) + '</span>';
    }).join("");
}

/* ===== FAVORITES ===== */
function getFavorites() { try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; } catch { return []; } }
function saveFavorites(fav) { localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(fav)); }

function initializeFavorite() {
    if (elements.favoriteButton) elements.favoriteButton.addEventListener("click", toggleFavorite);
}

function toggleFavorite() {
    if (!state.book) return;
    var favorites = getFavorites();
    var normKey = normalizeKey(state.key);
    var index = favorites.findIndex(function (item) { return normalizeKey(item.key || item) === normKey; });
    if (index !== -1) {
        favorites.splice(index, 1);
        state.favorite = false;
        showToast("Removed from favorites.", "♡");
    } else {
        var edition = state.book._edition || {};
        favorites.push({
            key: normKey,
            title: state.book.title || "Unknown Title",
            author: getDisplayedAuthor(state.book, edition),
            year: getYear(state.book, edition),
            cover_i: (state.book.covers && state.book.covers[0]) || edition.cover_i || null
        });
        state.favorite = true;
        showToast("Added to favorites.", "♥");
    }
    saveFavorites(favorites);
    updateFavoriteState();
}

function updateFavoriteState() {
    state.favorite = getFavorites().some(function (item) { return normalizeKey(item.key || item) === normalizeKey(state.key); });
    if (state.favorite) {
        elements.favoriteButton.classList.add("active");
        elements.favoriteIcon.textContent = "♥";
        elements.favoriteText.textContent = "Remove from Favorites";
    } else {
        elements.favoriteButton.classList.remove("active");
        elements.favoriteIcon.textContent = "♡";
        elements.favoriteText.textContent = "Add to Favorites";
    }
}

/* ===== MY BOOKS ===== */
function getMyBooks() { try { return JSON.parse(localStorage.getItem(CONFIG.MY_BOOKS_KEY)) || []; } catch { return []; } }
function saveMyBooks(books) { localStorage.setItem(CONFIG.MY_BOOKS_KEY, JSON.stringify(books)); }

function initializeMyBooks() {
    if (elements.myBooksButton) elements.myBooksButton.addEventListener("click", toggleMyBook);
}

function updateMyBooksState() {
    var books = getMyBooks();
    var existing = books.find(function (item) { return normalizeKey(item.key || item) === normalizeKey(state.key); });
    if (existing) {
        state.inMyBooks = true;
        state.myBookStatus = normalizeStatus(existing.status);
    } else {
        state.inMyBooks = false;
        state.myBookStatus = "want";
    }
    updateMyBooksButton();
}

function updateMyBooksButton() {
    if (!elements.myBooksButton) return;
    if (state.inMyBooks) {
        elements.myBooksButton.classList.add("active");
        if (elements.myBooksIcon) elements.myBooksIcon.textContent = "✓";
        if (elements.myBooksText) elements.myBooksText.textContent = getStatusText(state.myBookStatus);
    } else {
        elements.myBooksButton.classList.remove("active");
        if (elements.myBooksIcon) elements.myBooksIcon.textContent = "＋";
        if (elements.myBooksText) elements.myBooksText.textContent = "Add to My Books";
    }
}

function toggleMyBook() {
    if (!state.book) return;
    var books = getMyBooks();
    var normKey = normalizeKey(state.key);
    var existingIndex = books.findIndex(function (item) { return normalizeKey(item.key || item) === normKey; });
    if (existingIndex !== -1) {
        var current = normalizeStatus(books[existingIndex].status);
        var next = getNextStatus(current);
        books[existingIndex].status = next;
        books[existingIndex].progress = next === "finished" ? 100 : (next === "want" ? 0 : Number(books[existingIndex].progress || 0));
        books[existingIndex].updatedAt = Date.now();
        state.inMyBooks = true;
        state.myBookStatus = next;
        saveMyBooks(books);
        updateMyBooksButton();
        showToast("Book moved to " + getStatusText(next) + ".", "✓");
    } else {
        var edition = state.book._edition || {};
        var newBook = {
            key: normKey,
            id: normKey,
            title: state.book.title || "Unknown Title",
            author: getDisplayedAuthor(state.book, edition),
            year: getYear(state.book, edition),
            first_publish_year: state.book.first_publish_year || "",
            cover_i: (state.book.covers && state.book.covers[0]) || edition.cover_i || null,
            status: "want",
            progress: 0,
            notes: "",
            addedAt: Date.now(),
            updatedAt: Date.now()
        };
        books.push(newBook);
        saveMyBooks(books);
        state.inMyBooks = true;
        state.myBookStatus = "want";
        updateMyBooksButton();
        showToast("Added to My Books.", "📖");
    }
}

function getNextStatus(status) {
    switch (status) {
        case "want": return "reading";
        case "reading": return "finished";
        case "finished": return "want";
        default: return "want";
    }
}

function normalizeStatus(status) {
    if (status === "reading") return "reading";
    if (status === "finished" || status === "completed") return "finished";
    return "want";
}

function getStatusText(status) {
    switch (normalizeStatus(status)) {
        case "reading": return "📖 Reading";
        case "finished": return "✓ Finished";
        default: return "🔖 Want to Read";
    }
}

/* ===== ACTIONS ===== */
function initializeActions() {
    if (elements.openLibraryButton) {
        elements.openLibraryButton.addEventListener("click", function () {
            if (!state.key) return;
            window.open(CONFIG.API_URL + "/works/" + normalizeKey(state.key), "_blank", "noopener,noreferrer");
        });
    }
}

/* ===== RELATED BOOKS ===== */
async function loadRelatedBooks() {
    var book = state.book;
    var subjects = Array.isArray(book.subjects) ? book.subjects : [];
    var query = subjects[0] || book.title || "popular books";
    query = String(query).split(",")[0].trim();
    try {
        var url = new URL(CONFIG.SEARCH_URL);
        url.searchParams.set("q", query);
        url.searchParams.set("limit", String(CONFIG.RELATED_LIMIT + 5));
        url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year,ebook_access");
        var response = await fetch(url.toString());
        if (!response.ok) throw new Error("Related books unavailable");
        var data = await response.json();
        var books = Array.isArray(data.docs) ? data.docs : [];
        books = books.filter(function (item) { return normalizeKey(item.key) !== normalizeKey(state.key); });
        books = books.slice(0, CONFIG.RELATED_LIMIT);
        renderRelatedBooks(books);
    } catch (error) {
        console.warn("Related books error:", error);
        if (elements.relatedSection) elements.relatedSection.style.display = "none";
    }
}

function renderRelatedBooks(books) {
    if (!books.length) {
        elements.relatedSection.style.display = "none";
        return;
    }
    elements.relatedGrid.innerHTML = books.map(function (book) { return createRelatedCard(book); }).join("");
    document.querySelectorAll("[data-related-key]").forEach(function (card) {
        card.addEventListener("click", function () {
            var key = this.dataset.relatedKey;
            window.location.href = "book-details.html?key=" + encodeURIComponent(key);
        });
    });
}

function createRelatedCard(book) {
    var title = cleanText(book.title || "Unknown Title");
    var author = Array.isArray(book.author_name) && book.author_name.length ? book.author_name.slice(0, 1).join(", ") : "Unknown Author";
    var cover = book.cover_i ? CONFIG.COVER_URL + "/" + book.cover_i + "-M.jpg" : "";
    var coverHTML = cover ? '<img src="' + escapeHTML(cover) + '" alt="' + escapeHTML(title) + '" loading="lazy">' : '<div style="height:100%;display:grid;place-items:center;font-size:35px;">📚</div>';
    var badge = '';
    if (book.ebook_access === "public") badge = '<span class="related-free-badge">🟢 Free</span>';
    return '<article class="related-card" data-related-key="' + escapeHTML(book.key || "") + '">' +
        '<div class="related-cover">' + coverHTML + badge + '</div>' +
        '<div class="related-content">' +
        '<h3 class="related-title">' + escapeHTML(title) + '</h3>' +
        '<p class="related-author">' + escapeHTML(author) + '</p>' +
        '</div>' +
        '</article>';
}

/* ===== NAVIGATION ===== */
function initializeNavigation() {
    if (elements.backButton) {
        elements.backButton.addEventListener("click", function () {
            if (document.referrer && document.referrer.includes("/books/")) {
                window.history.back();
            } else {
                window.location.href = "../books/books.html";
            }
        });
    }
    if (elements.errorBackButton) {
        elements.errorBackButton.addEventListener("click", function () {
            window.location.href = "../books/books.html";
        });
    }
}

/* =========================================================
   READER (Simple — No Prompt, No Native Fullscreen)
========================================================= */
function openReader() {
    if (!state.ia) return;

    var container = elements.readerContainer;
    var iframe = elements.readerIframe;
    if (!container || !iframe) return;

    if (elements.readerToolbarTitle) {
        elements.readerToolbarTitle.textContent = cleanText(state.book.title || "Reading");
    }

    // Build Archive.org embed URL
    var embedUrl = "https://archive.org/embed/" + encodeURIComponent(state.ia);
    embedUrl += "?ui=embed&view=theater";

    iframe.src = embedUrl;

    // On mobile → CSS-only fullscreen (NO native fullscreen API)
    if (window.innerWidth < 800) {
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.classList.add("reader-fullscreen");
        state.fullscreen = true;
    } else {
        // Desktop → inline
        container.classList.add("show");
        setTimeout(function () {
            container.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
    }
}

function closeReader() {
    var container = elements.readerContainer;
    var iframe = elements.readerIframe;

    if (container) container.classList.remove("show");
    if (state.fullscreen) {
        document.body.classList.remove("reader-fullscreen");
        state.fullscreen = false;
        setTimeout(function () {
            window.scrollTo(0, savedScrollY);
        }, 50);
    }

    if (iframe) {
        setTimeout(function () { iframe.src = "about:blank"; }, 300);
    }

    showToast("Reader closed.", "✓");
}

function initializeReader() {
    if (elements.readerCloseBtn) {
        elements.readerCloseBtn.addEventListener("click", closeReader);
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (elements.readerContainer && elements.readerContainer.classList.contains("show")) {
                closeReader();
                return;
            }
            if (state.fullscreen) {
                closeReader();
            }
        }
    });
}

/* ===== SHOW / HIDE ===== */
function showLoading() {
    elements.loadingSection.style.display = "flex";
    elements.detailsSection.classList.remove("show");
    elements.errorSection.classList.remove("show");
}
function hideLoading() { elements.loadingSection.style.display = "none"; }
function showDetails() { elements.detailsSection.classList.add("show"); }
function showError(message) {
    elements.loadingSection.style.display = "none";
    elements.detailsSection.classList.remove("show");
    elements.errorMessage.textContent = message;
    elements.errorSection.classList.add("show");
}

/* ===== TOAST ===== */
function showToast(message, icon) {
    icon = icon || "✓";
    if (!elements.toast) return;
    elements.toastMessage.textContent = message;
    elements.toastIcon.textContent = icon;
    elements.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        elements.toast.classList.remove("show");
    }, 2600);
}

/* ===== HELPERS ===== */
function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
function normalizeText(v) { return cleanText(v).toLowerCase(); }
function escapeHTML(v) {
    return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}