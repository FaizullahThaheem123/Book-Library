/* =========================================================
   BOOK LIBRARY — BOOK DETAILS JAVASCRIPT
   Version 3.3 (Final - Honest & Clear)
========================================================= */

"use strict";

const CONFIG = {
    API_URL: "https://openlibrary.org",
    SEARCH_URL: "https://openlibrary.org/search.json",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    FAVORITES_KEY: "bookLibraryFavorites",
    MY_BOOKS_KEY: "bookLibraryMyBooks",
    THEME_KEY: "bookLibraryTheme",
    RELATED_LIMIT: 5
};

const state = {
    key: "",
    book: null,
    favorite: false,
    inMyBooks: false,
    myBookStatus: "want",
    readable: false,
    ia: null
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
    mobileMenuButton: document.getElementById("mobileMenuButton"),
    mobileMenu: document.getElementById("mobileMenu"),
    toast: document.getElementById("toast"),
    toastIcon: document.getElementById("toastIcon"),
    toastMessage: document.getElementById("toastMessage"),
    readerContainer: document.getElementById("readerContainer"),
    readerIframe: document.getElementById("readerIframe"),
    accessMessage: document.getElementById("accessMessage")
};

let toastTimer = null;

document.addEventListener("DOMContentLoaded", function () {
    initializeTheme();
    initializeMobileMenu();
    initializeNavigation();
    initializeFavorite();
    initializeMyBooks();
    initializeActions();
    loadBook();
});

function getBookKey() {
    const params = new URLSearchParams(window.location.search);
    return params.get("key") || "";
}

function normalizeKey(key) {
    if (!key) return "";
    return String(key).replace(/^\/works\//, "").replace(/^works\//, "");
}

function getFirstIA(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        const first = value.find(item => typeof item === "string" && item.trim());
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
        const workKey = normalizeKey(state.key);
        const response = await fetch(`${CONFIG.API_URL}/works/${workKey}.json`);
        if (!response.ok) throw new Error("Book not found.");
        const data = await response.json();
        state.book = data;

        let ia = getFirstIA(data.ia) || getFirstIA(data.ia_metadata?.identifier);
        state.ia = ia;

        await enrichBookData();

        if (!state.ia) {
            const fallback = getFirstIA(data.ia_metadata?.identifier);
            if (fallback) state.ia = fallback;
        }

        state.readable = !!state.ia;

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
    const book = state.book;
    if (Array.isArray(book.authors) && book.authors.length) {
        const authors = await Promise.all(book.authors.slice(0,3).map(item => getAuthorName(item)));
        book._authors = authors.filter(Boolean);
    }
    try {
        const url = new URL(CONFIG.SEARCH_URL);
        url.searchParams.set("title", book.title || "");
        url.searchParams.set("limit", "5");
        url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i,publisher,number_of_pages_median,language,ia");
        const response = await fetch(url.toString());
        if (response.ok) {
            const data = await response.json();
            if (data.docs && data.docs.length) {
                let match = data.docs.find(item => normalizeText(item.title) === normalizeText(book.title));
                if (!match) match = data.docs[0];
                book._edition = match;
                if (!state.ia) {
                    const editionIA = getFirstIA(match.ia);
                    if (editionIA) {
                        state.ia = editionIA;
                        state.readable = true;
                    }
                }
            }
        }
    } catch (error) {
        console.warn("Edition enrichment unavailable:", error);
    }
}

async function getAuthorName(authorRef) {
    try {
        const key = authorRef.author.key;
        if (!key) return "";
        const response = await fetch(`${CONFIG.API_URL}${key}.json`);
        if (!response.ok) return "";
        const data = await response.json();
        return data.name || "";
    } catch { return ""; }
}

function renderBook() {
    const book = state.book;
    const edition = book._edition || {};
    const title = cleanText(book.title || edition.title || "Unknown Title");
    const author = getDisplayedAuthor(book, edition);
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

    // ========== READER / AVAILABILITY LOGIC (HONEST) ==========
    const readBtn = elements.readButton;
    const readerContainer = elements.readerContainer;
    const readerIframe = elements.readerIframe;
    const accessMsg = elements.accessMessage;

    if (state.ia) {
        // Book is readable
        readBtn.innerHTML = '📖 <span>Read Now</span>';
        readBtn.style.opacity = '1';
        readBtn.style.cursor = 'pointer';
        readBtn.onclick = function() {
            const embedUrl = `https://archive.org/embed/${encodeURIComponent(state.ia)}`;
            readerIframe.src = embedUrl;
            readerContainer.style.display = 'block';
            readerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        if (accessMsg) {
            accessMsg.style.display = 'flex';
            accessMsg.querySelector('p').textContent =
                '✅ This book is available to read online. Click "Read Now" to start reading.';
        }
    } else {
        // Book is NOT readable
        readBtn.innerHTML = '📖 <span>Not Available</span>';
        readBtn.style.opacity = '0.6';
        readBtn.style.cursor = 'not-allowed';
        readBtn.onclick = function() {
            showToast('This book is not available for online reading.', '📚');
        };
        if (accessMsg) {
            accessMsg.style.display = 'flex';
            accessMsg.querySelector('p').textContent =
                '❌ This book is not available for online reading. You can still add it to your library and track your reading progress.';
        }
        if (readerContainer) readerContainer.style.display = 'none';
        if (readerIframe) readerIframe.src = '';
    }
}

function getDisplayedAuthor(book, edition) {
    if (Array.isArray(book._authors) && book._authors.length) return book._authors.join(", ");
    if (Array.isArray(edition.author_name) && edition.author_name.length) return edition.author_name.slice(0,3).join(", ");
    return "Unknown Author";
}

function getYear(book, edition) {
    return book.first_publish_date || edition.first_publish_year || "—";
}
function getPublisher(book, edition) {
    if (Array.isArray(edition.publisher) && edition.publisher.length) return edition.publisher.slice(0,2).join(", ");
    if (Array.isArray(book.publishers) && book.publishers.length) return book.publishers.slice(0,2).join(", ");
    return "—";
}
function getPages(book, edition) {
    return edition.number_of_pages_median || book.number_of_pages || "—";
}
function getLanguage(book, edition) {
    if (Array.isArray(edition.language) && edition.language.length) return formatLanguage(edition.language[0]);
    if (Array.isArray(book.languages) && book.languages.length) {
        const first = book.languages[0];
        if (first && first.key) return formatLanguage(first.key);
    }
    return "—";
}

function formatLanguage(code) {
    const codeStr = String(code).split("/").pop().toLowerCase();
    const map = { eng:"English", urd:"Urdu", ara:"Arabic", fas:"Persian", hin:"Hindi", spa:"Spanish", fra:"French", deu:"German", ita:"Italian", por:"Portuguese", rus:"Russian", tur:"Turkish", ben:"Bengali", ind:"Indonesian", jpn:"Japanese", kor:"Korean", chi:"Chinese" };
    return map[codeStr] || codeStr.toUpperCase();
}

function renderCover(book, edition, title) {
    let coverId = book.covers && book.covers.length ? book.covers[0] : null;
    if (!coverId) coverId = edition.cover_i || null;
    if (!coverId) {
        elements.bookCover.style.display = "none";
        elements.coverFallback.classList.add("show");
        return;
    }
    elements.bookCover.src = `${CONFIG.COVER_URL}/${coverId}-L.jpg`;
    elements.bookCover.alt = title;
    elements.bookCover.style.display = "block";
    elements.coverFallback.classList.remove("show");
    elements.bookCover.onerror = function () {
        this.style.display = "none";
        elements.coverFallback.classList.add("show");
    };
}

function renderDescription(book) {
    let desc = book.description;
    if (typeof desc === "object" && desc !== null) desc = desc.value;
    if (!desc) desc = "No description is available for this book yet.";
    elements.bookDescription.textContent = cleanText(desc);
}

function renderSubjects(book) {
    const subjects = Array.isArray(book.subjects) ? book.subjects : [];
    if (!subjects.length) {
        elements.subjectList.innerHTML = `<span class="subject-tag">No subjects available</span>`;
        return;
    }
    const unique = [...new Set(subjects.map(s => cleanText(s)).filter(Boolean))];
    elements.subjectList.innerHTML = unique.slice(0,15).map(s => `<span class="subject-tag">${escapeHTML(s)}</span>`).join("");
}

/* =========================================================
   FAVORITES
========================================================= */

function getFavorites() {
    try { return JSON.parse(localStorage.getItem(CONFIG.FAVORITES_KEY)) || []; } catch { return []; }
}

function saveFavorites(fav) { localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(fav)); }

function initializeFavorite() {
    if (elements.favoriteButton) {
        elements.favoriteButton.addEventListener("click", toggleFavorite);
    }
}

function toggleFavorite() {
    if (!state.book) return;
    let favorites = getFavorites();
    const normKey = normalizeKey(state.key);
    const index = favorites.findIndex(item => normalizeKey(item.key || item) === normKey);
    if (index !== -1) {
        favorites.splice(index, 1);
        state.favorite = false;
        showToast("Removed from favorites.", "♡");
    } else {
        const edition = state.book._edition || {};
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
    state.favorite = getFavorites().some(item => normalizeKey(item.key || item) === normalizeKey(state.key));
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

/* =========================================================
   MY BOOKS
========================================================= */

function getMyBooks() {
    try { return JSON.parse(localStorage.getItem(CONFIG.MY_BOOKS_KEY)) || []; } catch { return []; }
}

function saveMyBooks(books) { localStorage.setItem(CONFIG.MY_BOOKS_KEY, JSON.stringify(books)); }

function initializeMyBooks() {
    if (elements.myBooksButton) {
        elements.myBooksButton.addEventListener("click", toggleMyBook);
    }
}

function updateMyBooksState() {
    const books = getMyBooks();
    const existing = books.find(item => normalizeKey(item.key || item) === normalizeKey(state.key));
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
    let books = getMyBooks();
    const normKey = normalizeKey(state.key);
    const existingIndex = books.findIndex(item => normalizeKey(item.key || item) === normKey);
    if (existingIndex !== -1) {
        const current = normalizeStatus(books[existingIndex].status);
        const next = getNextStatus(current);
        books[existingIndex].status = next;
        books[existingIndex].progress = next === "finished" ? 100 : (next === "want" ? 0 : Number(books[existingIndex].progress || 0));
        books[existingIndex].updatedAt = Date.now();
        state.inMyBooks = true;
        state.myBookStatus = next;
        saveMyBooks(books);
        updateMyBooksButton();
        showToast(`Book moved to ${getStatusText(next)}.`, "✓");
    } else {
        const edition = state.book._edition || {};
        const newBook = {
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

/* =========================================================
   ACTIONS
========================================================= */

function initializeActions() {
    if (elements.openLibraryButton) {
        elements.openLibraryButton.addEventListener("click", function () {
            if (!state.key) return;
            window.open(`${CONFIG.API_URL}/works/${normalizeKey(state.key)}`, "_blank", "noopener,noreferrer");
        });
    }
}

/* =========================================================
   RELATED BOOKS
========================================================= */

async function loadRelatedBooks() {
    const book = state.book;
    const subjects = Array.isArray(book.subjects) ? book.subjects : [];
    let query = subjects[0] || book.title || "popular books";
    query = String(query).split(",")[0].trim();
    try {
        const url = new URL(CONFIG.SEARCH_URL);
        url.searchParams.set("q", query);
        url.searchParams.set("limit", String(CONFIG.RELATED_LIMIT + 5));
        url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year");
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Related books unavailable");
        const data = await response.json();
        let books = Array.isArray(data.docs) ? data.docs : [];
        books = books.filter(item => normalizeKey(item.key) !== normalizeKey(state.key));
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
    elements.relatedGrid.innerHTML = books.map(book => createRelatedCard(book)).join("");
    document.querySelectorAll("[data-related-key]").forEach(card => {
        card.addEventListener("click", function () {
            const key = this.dataset.relatedKey;
            window.location.href = `book-details.html?key=${encodeURIComponent(key)}`;
        });
    });
}

function createRelatedCard(book) {
    const title = cleanText(book.title || "Unknown Title");
    const author = Array.isArray(book.author_name) && book.author_name.length ? book.author_name.slice(0,1).join(", ") : "Unknown Author";
    const cover = book.cover_i ? `${CONFIG.COVER_URL}/${book.cover_i}-M.jpg` : "";
    const coverHTML = cover ? `<img src="${escapeHTML(cover)}" alt="${escapeHTML(title)}" loading="lazy">` : `<div style="height:100%;display:grid;place-items:center;font-size:35px;">📚</div>`;
    return `
        <article class="related-card" data-related-key="${escapeHTML(book.key || "")}">
            <div class="related-cover">${coverHTML}</div>
            <div class="related-content">
                <h3 class="related-title">${escapeHTML(title)}</h3>
                <p class="related-author">${escapeHTML(author)}</p>
            </div>
        </article>
    `;
}

/* =========================================================
   NAVIGATION
========================================================= */

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
   THEME
========================================================= */

function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    if (savedTheme === "dark") {
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

/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {
    if (!elements.mobileMenuButton || !elements.mobileMenu) return;
    elements.mobileMenuButton.addEventListener("click", function () {
        elements.mobileMenu.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
        if (!elements.mobileMenu.contains(e.target) && !elements.mobileMenuButton.contains(e.target)) {
            elements.mobileMenu.classList.remove("open");
        }
    });
}

/* =========================================================
   LOADING / ERROR
========================================================= */

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

/* =========================================================
   TOAST
========================================================= */

function showToast(message, icon = "✓") {
    if (!elements.toast) return;
    elements.toastMessage.textContent = message;
    elements.toastIcon.textContent = icon;
    elements.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

/* =========================================================
   HELPERS
========================================================= */

function cleanText(v) { return String(v || "").replace(/\s+/g, " ").trim(); }
function normalizeText(v) { return cleanText(v).toLowerCase(); }
function escapeHTML(v) { return String(v || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }