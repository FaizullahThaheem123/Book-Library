/* =========================================================
   BOOK LIBRARY - MY BOOKS
   Version 1.4 (Fixed)
========================================================= */

"use strict";

const CONFIG = {
    MY_BOOKS_KEY: "bookLibraryMyBooks",
    THEME_KEY: "bookLibraryTheme",
    DETAILS_PAGE: "../book-details/book-details.html",
    BOOKS_PAGE: "../books/books.html",
    COVER_URL: "https://covers.openlibrary.org/b/id"
};

let myBooks = [];
let currentStatus = "all";
let currentBookIndex = null;
let toastTimer = null;

// DOM refs
let booksGrid, emptyState, emptyTitle, emptyText, loadingState;
let totalBooks, wantBooks, readingBooks, finishedBooks;
let statusTabs, sortBooks;
let themeToggle, mobileMenuBtn, mobileMenu;
let bookModal, modalClose, modalCover, modalTitle, modalAuthor;
let bookStatus, bookProgress, progressValue, bookNotes;
let saveBookBtn, removeBookBtn, toast;

document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    booksGrid = document.getElementById("booksGrid");
    emptyState = document.getElementById("emptyState");
    emptyTitle = document.getElementById("emptyTitle");
    emptyText = document.getElementById("emptyText");
    loadingState = document.getElementById("loadingState");
    totalBooks = document.getElementById("totalBooks");
    wantBooks = document.getElementById("wantBooks");
    readingBooks = document.getElementById("readingBooks");
    finishedBooks = document.getElementById("finishedBooks");
    statusTabs = document.getElementById("statusTabs");
    sortBooks = document.getElementById("sortBooks");
    themeToggle = document.getElementById("themeToggle");
    mobileMenuBtn = document.getElementById("mobileMenuBtn");
    mobileMenu = document.getElementById("mobileMenu");
    bookModal = document.getElementById("bookModal");
    modalClose = document.getElementById("modalClose");
    modalCover = document.getElementById("modalCover");
    modalTitle = document.getElementById("modalTitle");
    modalAuthor = document.getElementById("modalAuthor");
    bookStatus = document.getElementById("bookStatus");
    bookProgress = document.getElementById("bookProgress");
    progressValue = document.getElementById("progressValue");
    bookNotes = document.getElementById("bookNotes");
    saveBookBtn = document.getElementById("saveBookBtn");
    removeBookBtn = document.getElementById("removeBookBtn");
    toast = document.getElementById("toast");

    loadTheme();
    loadMyBooks();
    setupEvents();
    render();
});

function setupEvents() {
    // Theme
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

    // Mobile menu
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => mobileMenu.classList.toggle("show"));
    }

    // Status tabs
    if (statusTabs) {
        statusTabs.addEventListener("click", function (e) {
            const button = e.target.closest(".tab");
            if (!button) return;
            currentStatus = button.dataset.status || "all";
            document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
            render();
        });
    }

    // Sort
    if (sortBooks) sortBooks.addEventListener("change", render);

    // Book grid events
    if (booksGrid) {
        booksGrid.addEventListener("click", function (e) {
            const button = e.target.closest("[data-action]");
            if (!button) return;
            const action = button.dataset.action;
            const index = Number(button.dataset.index);
            if (!Number.isInteger(index) || index < 0 || index >= myBooks.length) {
                showToast("Book not found.");
                return;
            }
            if (action === "edit") {
                openEditModal(index);
            } else if (action === "details") {
                openDetails(index);
            }
        });
    }

    // Modal close
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (bookModal) bookModal.addEventListener("click", function (e) {
        if (e.target === bookModal) closeModal();
    });

    // Progress slider
    if (bookProgress) {
        bookProgress.addEventListener("input", function () {
            if (progressValue) progressValue.textContent = this.value + "%";
        });
    }

    // Status change: auto-progress
    if (bookStatus) {
        bookStatus.addEventListener("change", function () {
            if (this.value === "finished") {
                if (bookProgress) bookProgress.value = "100";
                if (progressValue) progressValue.textContent = "100%";
            }
            if (this.value === "want" && bookProgress && Number(bookProgress.value) === 100) {
                bookProgress.value = "0";
                if (progressValue) progressValue.textContent = "0%";
            }
        });
    }

    // Save and remove
    if (saveBookBtn) saveBookBtn.addEventListener("click", saveCurrentBook);
    if (removeBookBtn) removeBookBtn.addEventListener("click", removeCurrentBook);

    // Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && bookModal && bookModal.style.display !== "none") {
            closeModal();
        }
    });
}

/* =========================================================
   DATA LOADING & SAVING
========================================================= */

function loadMyBooks() {
    try {
        const saved = localStorage.getItem(CONFIG.MY_BOOKS_KEY);
        if (!saved) { myBooks = []; return; }
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) { myBooks = []; return; }
        myBooks = parsed.filter(b => b !== null && typeof b === "object").map(normalizeBook);
        // Save normalized back
        try { localStorage.setItem(CONFIG.MY_BOOKS_KEY, JSON.stringify(myBooks)); } catch (e) {}
    } catch (error) {
        console.error("Could not load My Books:", error);
        myBooks = [];
    }
}

function saveMyBooks() {
    try {
        localStorage.setItem(CONFIG.MY_BOOKS_KEY, JSON.stringify(myBooks));
        return true;
    } catch (error) {
        console.error("Could not save My Books:", error);
        showToast("Could not save book.");
        return false;
    }
}

function normalizeBook(book) {
    const normalized = { ...book };
    normalized.status = getStatus(book);
    normalized.progress = getProgress(book);
    if (!normalized.addedAt) normalized.addedAt = Date.now();
    if (!normalized.updatedAt) normalized.updatedAt = normalized.addedAt;
    return normalized;
}

/* =========================================================
   RENDER
========================================================= */

function render() {
    updateStats();
    const filtered = getFilteredBooks();
    const sorted = sortBookList(filtered);
    if (!booksGrid) return;
    if (loadingState) loadingState.hidden = true;
    if (!sorted.length) {
        booksGrid.innerHTML = "";
        showEmptyState();
        return;
    }
    if (emptyState) emptyState.hidden = true;
    booksGrid.innerHTML = sorted.map(item => createBookCard(item.book, item.originalIndex)).join("");
}

function updateStats() {
    if (totalBooks) totalBooks.textContent = myBooks.length;
    if (wantBooks) wantBooks.textContent = myBooks.filter(b => getStatus(b) === "want").length;
    if (readingBooks) readingBooks.textContent = myBooks.filter(b => getStatus(b) === "reading").length;
    if (finishedBooks) finishedBooks.textContent = myBooks.filter(b => getStatus(b) === "finished").length;
}

function getFilteredBooks() {
    return myBooks.map((book, index) => ({ book, originalIndex: index }))
        .filter(item => currentStatus === "all" || getStatus(item.book) === currentStatus);
}

function sortBookList(list) {
    const sorted = [...list];
    const sort = sortBooks ? sortBooks.value : "recent";
    if (sort === "title") {
        sorted.sort((a, b) => getTitle(a.book).localeCompare(getTitle(b.book), undefined, { sensitivity: "base" }));
    } else if (sort === "author") {
        sorted.sort((a, b) => getAuthor(a.book).localeCompare(getAuthor(b.book), undefined, { sensitivity: "base" }));
    } else if (sort === "year") {
        sorted.sort((a, b) => (Number(getYear(b.book) || 0) - Number(getYear(a.book) || 0)));
    } else { // recent
        sorted.sort((a, b) => (b.book.updatedAt || b.book.addedAt || 0) - (a.book.updatedAt || a.book.addedAt || 0));
    }
    return sorted;
}

/* =========================================================
   BOOK CARD
========================================================= */

function createBookCard(book, index) {
    const title = getTitle(book);
    const author = getAuthor(book);
    const status = getStatus(book);
    const progress = getProgress(book);
    const cover = getCover(book);
    const year = getYear(book);
    const statusText = getStatusText(status);
    const safeIndex = String(index);

    return `
        <article class="book-card" data-index="${safeIndex}">
            <div class="book-cover">
                ${cover ? `<img src="${escapeHTML(cover)}" alt="${escapeHTML(title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">` : `<div class="cover-placeholder">📚</div>`}
                <span class="status-badge">${escapeHTML(statusText)}</span>
                <button class="book-menu" type="button" title="Edit book" data-action="edit" data-index="${safeIndex}">⋮</button>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHTML(title)}</h3>
                <p class="book-author">${escapeHTML(author)}</p>
                <div class="book-meta">
                    <span>${year ? `📅 ${escapeHTML(String(year))}` : "📅 Year unknown"}</span>
                    <span>${escapeHTML(statusText)}</span>
                </div>
                <div class="progress-wrap">
                    <div class="progress-top"><span>Reading Progress</span><strong>${progress}%</strong></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                </div>
                <div class="card-actions">
                    <button class="card-btn primary" type="button" data-action="details" data-index="${safeIndex}">Details</button>
                    <button class="card-btn" type="button" data-action="edit" data-index="${safeIndex}">Edit</button>
                </div>
            </div>
        </article>
    `;
}

/* =========================================================
   DETAILS & EDIT
========================================================= */

function openDetails(index) {
    const book = myBooks[index];
    if (!book) { showToast("Book not found."); return; }
    const key = getBookKey(book);
    if (!key) { showToast("Book details are not available."); return; }
    window.location.href = `${CONFIG.DETAILS_PAGE}?key=${encodeURIComponent(key)}`;
}

function openEditModal(index) {
    if (!Number.isInteger(index) || index < 0 || index >= myBooks.length) {
        showToast("Book not found.");
        return;
    }
    const book = myBooks[index];
    if (!book) { showToast("Book not found."); return; }
    currentBookIndex = index;
    if (modalTitle) modalTitle.textContent = getTitle(book);
    if (modalAuthor) modalAuthor.textContent = getAuthor(book);
    if (modalCover) {
        const cover = getCover(book);
        if (cover) {
            modalCover.src = cover;
            modalCover.alt = getTitle(book);
            modalCover.style.display = "block";
        } else {
            modalCover.removeAttribute("src");
            modalCover.alt = "";
            modalCover.style.display = "none";
        }
    }
    if (bookStatus) bookStatus.value = getStatus(book);
    const progress = getProgress(book);
    if (bookProgress) bookProgress.value = String(progress);
    if (progressValue) progressValue.textContent = progress + "%";
    if (bookNotes) bookNotes.value = book.notes || "";
    if (bookModal) {
        bookModal.hidden = false;
        bookModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function closeModal() {
    if (bookModal) {
        bookModal.hidden = true;
        bookModal.style.display = "none";
    }
    document.body.style.overflow = "";
    currentBookIndex = null;
}

function saveCurrentBook() {
    if (currentBookIndex === null || !Number.isInteger(currentBookIndex) || currentBookIndex < 0 || currentBookIndex >= myBooks.length) {
        showToast("No book selected.");
        return;
    }
    const book = myBooks[currentBookIndex];
    if (!book) { showToast("Book not found."); return; }
    let newStatus = bookStatus ? bookStatus.value : getStatus(book);
    if (!["want", "reading", "finished"].includes(newStatus)) newStatus = "want";
    let newProgress = bookProgress ? Number(bookProgress.value) : getProgress(book);
    if (!Number.isFinite(newProgress)) newProgress = 0;
    newProgress = Math.max(0, Math.min(100, Math.round(newProgress)));
    if (newStatus === "finished") newProgress = 100;
    if (newStatus === "want" && newProgress === 100) newProgress = 0;
    const newNotes = bookNotes ? bookNotes.value.trim() : "";
    book.status = newStatus;
    book.progress = newProgress;
    book.notes = newNotes;
    book.updatedAt = Date.now();
    if (!saveMyBooks()) return;
    render();
    closeModal();
    showToast("Book updated successfully.");
}

function removeCurrentBook() {
    if (currentBookIndex === null || !Number.isInteger(currentBookIndex) || currentBookIndex < 0 || currentBookIndex >= myBooks.length) {
        showToast("No book selected.");
        return;
    }
    const book = myBooks[currentBookIndex];
    if (!book) { showToast("Book not found."); return; }
    if (!confirm(`Remove "${getTitle(book)}" from My Books?`)) return;
    myBooks.splice(currentBookIndex, 1);
    if (!saveMyBooks()) return;
    render();
    closeModal();
    showToast("Book removed from My Books.");
}

/* =========================================================
   GETTER FUNCTIONS
========================================================= */

function getBookKey(book) {
    if (!book) return "";
    let key = book.key || book.workKey || book.bookKey || book.id || "";
    key = String(key).trim().replace(/^\/+/, "").replace(/^works\//i, "");
    return key;
}

function getTitle(book) { return book?.title || book?.name || "Untitled Book"; }
function getAuthor(book) {
    if (!book) return "Unknown Author";
    if (Array.isArray(book.author_name)) {
        const names = book.author_name.filter(Boolean).map(String);
        if (names.length) return names.join(", ");
    }
    if (Array.isArray(book.authors)) {
        const names = book.authors.map(a => typeof a === "string" ? a : a?.name || a?.author_name || "").filter(Boolean);
        if (names.length) return names.join(", ");
    }
    if (book.author) return String(book.author);
    return "Unknown Author";
}
function getYear(book) { return book?.year || book?.first_publish_year || book?.firstPublishYear || ""; }

function getCover(book) {
    if (!book) return "";
    if (book.coverUrl) return String(book.coverUrl);
    if (book.cover) {
        if (typeof book.cover === "string") return book.cover;
        if (typeof book.cover === "number") return `${CONFIG.COVER_URL}/${book.cover}-M.jpg`;
    }
    const coverId = book.cover_i || book.coverId || book.cover_id || book.coverID;
    if (!coverId) return "";
    return `${CONFIG.COVER_URL}/${coverId}-M.jpg`;
}

function getStatus(book) {
    if (!book) return "want";
    const status = String(book.status || "").toLowerCase();
    if (status === "want" || status === "reading" || status === "finished") return status;
    if (["to-read", "to_read", "toread", "wishlist", "planned"].includes(status)) return "want";
    if (["currently-reading", "currently_reading", "in-progress", "in_progress"].includes(status)) return "reading";
    if (["completed", "complete", "done", "finished-reading"].includes(status)) return "finished";
    return "want";
}

function getStatusText(status) {
    switch (status) {
        case "reading": return "📖 Reading";
        case "finished": return "✓ Finished";
        default: return "🔖 Want to Read";
    }
}

function getProgress(book) {
    if (!book) return 0;
    let progress = Number(book.progress);
    if (!Number.isFinite(progress)) progress = 0;
    progress = Math.max(0, Math.min(100, Math.round(progress)));
    if (getStatus(book) === "finished") return 100;
    return progress;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState() {
    if (!emptyState) return;
    emptyState.hidden = false;
    const titles = {
        all: ["Your library is empty", "Start adding books to build your personal reading library."],
        want: ["No books to read yet", "Books you want to read will appear here."],
        reading: ["Nothing currently reading", "Move a book to Reading when you start it."],
        finished: ["No finished books yet", "Books you complete will appear here."]
    };
    const [title, text] = titles[currentStatus] || titles.all;
    if (emptyTitle) emptyTitle.textContent = title;
    if (emptyText) emptyText.textContent = text;
}

/* =========================================================
   THEME
========================================================= */

function loadTheme() {
    let saved = localStorage.getItem(CONFIG.THEME_KEY);
    if (saved === "dark") {
        document.body.classList.add("dark");
        if (themeToggle) themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        if (themeToggle) themeToggle.textContent = "🌙";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    localStorage.setItem(CONFIG.THEME_KEY, dark ? "dark" : "light");
    if (themeToggle) themeToggle.textContent = dark ? "☀️" : "🌙";
}

/* =========================================================
   TOAST & HELPERS
========================================================= */

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function escapeHTML(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}