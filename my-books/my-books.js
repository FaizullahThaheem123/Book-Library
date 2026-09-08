/* =========================================================
   BOOK LIBRARY — MY BOOKS PAGE JAVASCRIPT
   Version 2.0 (Unified Header + Theme Sync)
========================================================= */

"use strict";

const CONFIG = {
    MY_BOOKS_KEY: "bookLibraryMyBooks",
    THEME_KEY: "bookLibraryTheme",
    DETAILS_PAGE: "../book-details/book-details.html",
    BOOKS_PAGE: "../books/books.html",
    COVER_URL: "https://covers.openlibrary.org/b/id",
    SEARCH_PAGE: "../search/search.html"
};

let myBooks = [];
let currentStatus = "all";
let currentBookIndex = null;
let toastTimer = null;

// DOM refs
let el = {};

function getElements() {
    return {
        booksGrid: document.getElementById("booksGrid"),
        emptyState: document.getElementById("emptyState"),
        emptyTitle: document.getElementById("emptyTitle"),
        emptyText: document.getElementById("emptyText"),
        loadingState: document.getElementById("loadingState"),
        totalBooks: document.getElementById("totalBooks"),
        wantBooks: document.getElementById("wantBooks"),
        readingBooks: document.getElementById("readingBooks"),
        finishedBooks: document.getElementById("finishedBooks"),
        statusTabs: document.getElementById("statusTabs"),
        sortBooks: document.getElementById("sortBooks"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuButton"),
        mobileMenu: document.getElementById("mobileMenu"),
        headerSearchBtn: document.getElementById("headerSearchBtn"),
        bookModal: document.getElementById("bookModal"),
        modalClose: document.getElementById("modalClose"),
        modalCover: document.getElementById("modalCover"),
        modalTitle: document.getElementById("modalTitle"),
        modalAuthor: document.getElementById("modalAuthor"),
        bookStatus: document.getElementById("bookStatus"),
        bookProgress: document.getElementById("bookProgress"),
        progressValue: document.getElementById("progressValue"),
        bookNotes: document.getElementById("bookNotes"),
        saveBookBtn: document.getElementById("saveBookBtn"),
        removeBookBtn: document.getElementById("removeBookBtn"),
        toast: document.getElementById("toast"),
        toastIcon: document.getElementById("toastIcon"),
        toastMessage: document.getElementById("toastMessage")
    };
}

document.addEventListener("DOMContentLoaded", function () {
    el = getElements();
    initializeApp();
});

function initializeApp() {
    setupHeaderEvents();
    setupTheme();
    setupMobileMenu();
    setupThemeSync();
    loadMyBooks();
    setupEvents();
    render();
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

/* =========================================================
   HEADER EVENTS (Search Button)
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

/* =========================================================
   THEME
========================================================= */
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

/* =========================================================
   DATA LOADING & SAVING
========================================================= */
function loadMyBooks() {
    try {
        var saved = localStorage.getItem(CONFIG.MY_BOOKS_KEY);
        if (!saved) { myBooks = []; return; }
        var parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) { myBooks = []; return; }
        myBooks = parsed.filter(function(b) { return b !== null && typeof b === "object"; }).map(normalizeBook);
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
    var normalized = { ...book };
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
    var filtered = getFilteredBooks();
    var sorted = sortBookList(filtered);
    if (!el.booksGrid) return;
    if (el.loadingState) el.loadingState.hidden = true;
    if (!sorted.length) {
        el.booksGrid.innerHTML = "";
        showEmptyState();
        return;
    }
    if (el.emptyState) el.emptyState.hidden = true;
    el.booksGrid.innerHTML = sorted.map(function(item) {
        return createBookCard(item.book, item.originalIndex);
    }).join("");
}

function updateStats() {
    if (el.totalBooks) el.totalBooks.textContent = myBooks.length;
    if (el.wantBooks) el.wantBooks.textContent = myBooks.filter(function(b) { return getStatus(b) === "want"; }).length;
    if (el.readingBooks) el.readingBooks.textContent = myBooks.filter(function(b) { return getStatus(b) === "reading"; }).length;
    if (el.finishedBooks) el.finishedBooks.textContent = myBooks.filter(function(b) { return getStatus(b) === "finished"; }).length;
}

function getFilteredBooks() {
    return myBooks.map(function(book, index) {
        return { book: book, originalIndex: index };
    }).filter(function(item) {
        return currentStatus === "all" || getStatus(item.book) === currentStatus;
    });
}

function sortBookList(list) {
    var sorted = list.slice();
    var sort = el.sortBooks ? el.sortBooks.value : "recent";
    if (sort === "title") {
        sorted.sort(function(a, b) { return getTitle(a.book).localeCompare(getTitle(b.book), undefined, { sensitivity: "base" }); });
    } else if (sort === "author") {
        sorted.sort(function(a, b) { return getAuthor(a.book).localeCompare(getAuthor(b.book), undefined, { sensitivity: "base" }); });
    } else if (sort === "year") {
        sorted.sort(function(a, b) { return (Number(getYear(b.book) || 0) - Number(getYear(a.book) || 0)); });
    } else {
        sorted.sort(function(a, b) { return (b.book.updatedAt || b.book.addedAt || 0) - (a.book.updatedAt || a.book.addedAt || 0); });
    }
    return sorted;
}

/* =========================================================
   BOOK CARD
========================================================= */
function createBookCard(book, index) {
    var title = getTitle(book);
    var author = getAuthor(book);
    var status = getStatus(book);
    var progress = getProgress(book);
    var cover = getCover(book);
    var year = getYear(book);
    var statusText = getStatusText(status);
    var safeIndex = String(index);

    return `
        <article class="book-card" data-index="${safeIndex}">
            <div class="book-cover">
                ${cover ? '<img src="' + escapeHTML(cover) + '" alt="' + escapeHTML(title) + '" loading="lazy" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'grid\';">' : '<div class="cover-placeholder">📚</div>'}
                <span class="status-badge">${escapeHTML(statusText)}</span>
                <button class="book-menu" type="button" title="Edit book" data-action="edit" data-index="${safeIndex}">⋮</button>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHTML(title)}</h3>
                <p class="book-author">${escapeHTML(author)}</p>
                <div class="book-meta">
                    <span>${year ? '📅 ' + escapeHTML(String(year)) : "📅 Year unknown"}</span>
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
    var book = myBooks[index];
    if (!book) { showToast("Book not found."); return; }
    var key = getBookKey(book);
    if (!key) { showToast("Book details are not available."); return; }
    window.location.href = CONFIG.DETAILS_PAGE + "?key=" + encodeURIComponent(key);
}

function openEditModal(index) {
    if (!Number.isInteger(index) || index < 0 || index >= myBooks.length) {
        showToast("Book not found.");
        return;
    }
    var book = myBooks[index];
    if (!book) { showToast("Book not found."); return; }
    currentBookIndex = index;
    if (el.modalTitle) el.modalTitle.textContent = getTitle(book);
    if (el.modalAuthor) el.modalAuthor.textContent = getAuthor(book);
    if (el.modalCover) {
        var cover = getCover(book);
        if (cover) {
            el.modalCover.src = cover;
            el.modalCover.alt = getTitle(book);
            el.modalCover.style.display = "block";
        } else {
            el.modalCover.removeAttribute("src");
            el.modalCover.alt = "";
            el.modalCover.style.display = "none";
        }
    }
    if (el.bookStatus) el.bookStatus.value = getStatus(book);
    var progress = getProgress(book);
    if (el.bookProgress) el.bookProgress.value = String(progress);
    if (el.progressValue) el.progressValue.textContent = progress + "%";
    if (el.bookNotes) el.bookNotes.value = book.notes || "";
    if (el.bookModal) {
        el.bookModal.classList.add("show");
        el.bookModal.hidden = false;
        document.body.style.overflow = "hidden";
    }
}

function closeModal() {
    if (el.bookModal) {
        el.bookModal.classList.remove("show");
        el.bookModal.hidden = true;
    }
    document.body.style.overflow = "";
    currentBookIndex = null;
}

function saveCurrentBook() {
    if (currentBookIndex === null || !Number.isInteger(currentBookIndex) || currentBookIndex < 0 || currentBookIndex >= myBooks.length) {
        showToast("No book selected.");
        return;
    }
    var book = myBooks[currentBookIndex];
    if (!book) { showToast("Book not found."); return; }
    var newStatus = el.bookStatus ? el.bookStatus.value : getStatus(book);
    if (!["want", "reading", "finished"].includes(newStatus)) newStatus = "want";
    var newProgress = el.bookProgress ? Number(el.bookProgress.value) : getProgress(book);
    if (!Number.isFinite(newProgress)) newProgress = 0;
    newProgress = Math.max(0, Math.min(100, Math.round(newProgress)));
    if (newStatus === "finished") newProgress = 100;
    if (newStatus === "want" && newProgress === 100) newProgress = 0;
    var newNotes = el.bookNotes ? el.bookNotes.value.trim() : "";
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
    var book = myBooks[currentBookIndex];
    if (!book) { showToast("Book not found."); return; }
    if (!confirm('Remove "' + getTitle(book) + '" from My Books?')) return;
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
    var key = book.key || book.workKey || book.bookKey || book.id || "";
    key = String(key).trim().replace(/^\/+/, "").replace(/^works\//i, "");
    return key;
}
function getTitle(book) { return book?.title || book?.name || "Untitled Book"; }
function getAuthor(book) {
    if (!book) return "Unknown Author";
    if (Array.isArray(book.author_name)) {
        var names = book.author_name.filter(Boolean).map(String);
        if (names.length) return names.join(", ");
    }
    if (Array.isArray(book.authors)) {
        var names2 = book.authors.map(function(a) { return typeof a === "string" ? a : a?.name || a?.author_name || ""; }).filter(Boolean);
        if (names2.length) return names2.join(", ");
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
        if (typeof book.cover === "number") return CONFIG.COVER_URL + "/" + book.cover + "-M.jpg";
    }
    var coverId = book.cover_i || book.coverId || book.cover_id || book.coverID;
    if (!coverId) return "";
    return CONFIG.COVER_URL + "/" + coverId + "-M.jpg";
}
function getStatus(book) {
    if (!book) return "want";
    var status = String(book.status || "").toLowerCase();
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
    var progress = Number(book.progress);
    if (!Number.isFinite(progress)) progress = 0;
    progress = Math.max(0, Math.min(100, Math.round(progress)));
    if (getStatus(book) === "finished") return 100;
    return progress;
}

/* =========================================================
   EMPTY STATE
========================================================= */
function showEmptyState() {
    if (!el.emptyState) return;
    el.emptyState.hidden = false;
    var titles = {
        all: ["Your library is empty", "Start adding books to build your personal reading library."],
        want: ["No books to read yet", "Books you want to read will appear here."],
        reading: ["Nothing currently reading", "Move a book to Reading when you start it."],
        finished: ["No finished books yet", "Books you complete will appear here."]
    };
    var pair = titles[currentStatus] || titles.all;
    if (el.emptyTitle) el.emptyTitle.textContent = pair[0];
    if (el.emptyText) el.emptyText.textContent = pair[1];
}

/* =========================================================
   EVENTS
========================================================= */
function setupEvents() {
    // Status tabs
    if (el.statusTabs) {
        el.statusTabs.addEventListener("click", function(e) {
            var button = e.target.closest(".tab");
            if (!button) return;
            currentStatus = button.dataset.status || "all";
            document.querySelectorAll(".tab").forEach(function(tab) {
                tab.classList.toggle("active", tab === button);
            });
            render();
        });
    }

    // Sort
    if (el.sortBooks) el.sortBooks.addEventListener("change", render);

    // Book grid events
    if (el.booksGrid) {
        el.booksGrid.addEventListener("click", function(e) {
            var button = e.target.closest("[data-action]");
            if (!button) return;
            var action = button.dataset.action;
            var index = Number(button.dataset.index);
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
    if (el.modalClose) el.modalClose.addEventListener("click", closeModal);
    if (el.bookModal) {
        el.bookModal.addEventListener("click", function(e) {
            if (e.target === el.bookModal) closeModal();
        });
    }

    // Progress slider
    if (el.bookProgress) {
        el.bookProgress.addEventListener("input", function() {
            if (el.progressValue) el.progressValue.textContent = this.value + "%";
        });
    }

    // Status change: auto-progress
    if (el.bookStatus) {
        el.bookStatus.addEventListener("change", function() {
            if (this.value === "finished") {
                if (el.bookProgress) el.bookProgress.value = "100";
                if (el.progressValue) el.progressValue.textContent = "100%";
            }
            if (this.value === "want" && el.bookProgress && Number(el.bookProgress.value) === 100) {
                el.bookProgress.value = "0";
                if (el.progressValue) el.progressValue.textContent = "0%";
            }
        });
    }

    // Save and remove
    if (el.saveBookBtn) el.saveBookBtn.addEventListener("click", saveCurrentBook);
    if (el.removeBookBtn) el.removeBookBtn.addEventListener("click", removeCurrentBook);

    // Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && el.bookModal && el.bookModal.classList.contains("show")) {
            closeModal();
        }
    });
}

/* =========================================================
   TOAST & HELPERS
========================================================= */
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

function escapeHTML(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}