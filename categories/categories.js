/* =========================================================
   BOOK LIBRARY
   CATEGORIES PAGE
   ========================================================= */

"use strict";


/* =========================================================
   CATEGORY DATA
   ========================================================= */

const categories = [

    {
        name: "Fiction",
        subject: "fiction",
        icon: "📖",
        description: "Stories, novels and imaginative worlds."
    },

    {
        name: "Science",
        subject: "science",
        icon: "🔬",
        description: "Discover science, research and discoveries."
    },

    {
        name: "Technology",
        subject: "technology",
        icon: "💻",
        description: "Computers, software, technology and innovation."
    },

    {
        name: "History",
        subject: "history",
        icon: "🏛️",
        description: "Explore civilizations, events and the past."
    },

    {
        name: "Religion",
        subject: "religion",
        icon: "🕌",
        description: "Books about faith, spirituality and religion."
    },

    {
        name: "Psychology",
        subject: "psychology",
        icon: "🧠",
        description: "Mind, behavior, emotions and human thinking."
    },

    {
        name: "Business",
        subject: "business",
        icon: "💼",
        description: "Business, management, finance and leadership."
    },

    {
        name: "Romance",
        subject: "romance",
        icon: "❤️",
        description: "Romantic stories and unforgettable relationships."
    },

    {
        name: "Mystery",
        subject: "mystery",
        icon: "🕵️",
        description: "Mysteries, investigations and suspense."
    },

    {
        name: "Adventure",
        subject: "adventure",
        icon: "🗺️",
        description: "Exciting journeys, exploration and adventure."
    },

    {
        name: "Education",
        subject: "education",
        icon: "🎓",
        description: "Learning, teaching and educational resources."
    },

    {
        name: "Children",
        subject: "children",
        icon: "🧒",
        description: "Fun and educational books for children."
    },

    {
        name: "Biography",
        subject: "biography",
        icon: "👤",
        description: "Real lives, people and inspiring journeys."
    },

    {
        name: "Art",
        subject: "art",
        icon: "🎨",
        description: "Painting, drawing, design and visual arts."
    },

    {
        name: "Music",
        subject: "music",
        icon: "🎵",
        description: "Music history, theory, artists and instruments."
    },

    {
        name: "Travel",
        subject: "travel",
        icon: "✈️",
        description: "Travel guides, destinations and exploration."
    },

    {
        name: "Health",
        subject: "health",
        icon: "🌿",
        description: "Health, wellness and healthy living."
    },

    {
        name: "Cooking",
        subject: "cooking",
        icon: "🍳",
        description: "Recipes, food, cooking and culinary arts."
    },

    {
        name: "Poetry",
        subject: "poetry",
        icon: "✍️",
        description: "Poems, poets and beautiful written expression."
    },

    {
        name: "Philosophy",
        subject: "philosophy",
        icon: "🤔",
        description: "Ideas, wisdom, ethics and human thought."
    },

    {
        name: "Law",
        subject: "law",
        icon: "⚖️",
        description: "Law, justice, legal systems and rights."
    },

    {
        name: "Computer",
        subject: "computers",
        icon: "🖥️",
        description: "Programming, computing and computer science."
    },

    {
        name: "Mathematics",
        subject: "mathematics",
        icon: "➗",
        description: "Numbers, equations, mathematics and logic."
    },

    {
        name: "Nature",
        subject: "nature",
        icon: "🌳",
        description: "Nature, environment, plants and wildlife."
    },

    {
        name: "Animals",
        subject: "animals",
        icon: "🐾",
        description: "Animal life, wildlife and zoology."
    },

    {
        name: "Poetry & Literature",
        subject: "literature",
        icon: "📜",
        description: "Classic and modern literature."
    },

    {
        name: "Science Fiction",
        subject: "science_fiction",
        icon: "🚀",
        description: "Space, future worlds and scientific imagination."
    },

    {
        name: "Fantasy",
        subject: "fantasy",
        icon: "🐉",
        description: "Magic, mythical worlds and legendary adventures."
    },

    {
        name: "Thriller",
        subject: "thriller",
        icon: "🎭",
        description: "Suspenseful stories full of tension."
    },

    {
        name: "Drama",
        subject: "drama",
        icon: "🎬",
        description: "Dramatic stories, plays and theatre."
    },

    {
        name: "Politics",
        subject: "politics",
        icon: "🏛️",
        description: "Politics, government and society."
    },

    {
        name: "Economics",
        subject: "economics",
        icon: "📈",
        description: "Economics, markets, money and finance."
    },

    {
        name: "Geography",
        subject: "geography",
        icon: "🌍",
        description: "Countries, maps, places and Earth."
    },

    {
        name: "Language",
        subject: "language",
        icon: "🗣️",
        description: "Languages, grammar, linguistics and communication."
    },

    {
        name: "Computer Programming",
        subject: "programming",
        icon: "👨‍💻",
        description: "Programming languages and software development."
    }

];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const categoriesGrid =
    document.getElementById("categoriesGrid");

const categoryList =
    document.getElementById("categoryList");

const categorySearch =
    document.getElementById("categorySearch");

const categoryCount =
    document.getElementById("categoryCount");

const noResults =
    document.getElementById("noResults");

const themeBtn =
    document.getElementById("themeBtn");

const menuBtn =
    document.getElementById("menuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const searchBtn =
    document.getElementById("searchBtn");

const toast =
    document.getElementById("toast");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        renderCategories(
            categories
        );

        renderCategoryList(
            categories
        );

        setupEvents();

    }
);


/* =========================================================
   RENDER POPULAR CATEGORY CARDS
   ========================================================= */

function renderCategories(data) {

    if (!categoriesGrid) {
        return;
    }

    categoriesGrid.innerHTML = "";

    categoryCount.textContent =
        `${data.length} Categories`;

    if (data.length === 0) {

        noResults.style.display =
            "block";

        return;
    }

    noResults.style.display =
        "none";


    data.forEach(category => {

        const card =
            document.createElement("article");

        card.className =
            "category-card";

        card.dataset.subject =
            category.subject;

        card.innerHTML = `

            <div class="category-icon">
                ${category.icon}
            </div>

            <h3>
                ${escapeHTML(category.name)}
            </h3>

            <p>
                ${escapeHTML(category.description)}
            </p>

            <span class="category-arrow">
                →
            </span>

        `;

        card.addEventListener(
            "click",
            () => {
                openCategory(
                    category
                );
            }
        );

        categoriesGrid.appendChild(card);

    });

}


/* =========================================================
   RENDER ALL CATEGORY LIST
   ========================================================= */

function renderCategoryList(data) {

    if (!categoryList) {
        return;
    }

    categoryList.innerHTML = "";


    data.forEach(category => {

        const item =
            document.createElement("a");

        item.className =
            "category-list-item";

        item.href =
            getBooksURL(category.subject);

        item.innerHTML = `

            <span>
                ${category.icon}
            </span>

            <span>
                ${escapeHTML(category.name)}
            </span>

        `;

        categoryList.appendChild(item);

    });

}


/* =========================================================
   OPEN CATEGORY
   ========================================================= */

function openCategory(category) {

    const url =
        getBooksURL(
            category.subject
        );

    window.location.href =
        url;
}


/* =========================================================
   BOOKS PAGE URL
   ========================================================= */

function getBooksURL(subject) {

    return (
        "../books/books.html?subject=" +
        encodeURIComponent(subject)
    );

}


/* =========================================================
   SEARCH CATEGORIES
   ========================================================= */

function filterCategories() {

    const query =
        categorySearch.value
            .trim()
            .toLowerCase();


    if (!query) {

        renderCategories(
            categories
        );

        renderCategoryList(
            categories
        );

        return;
    }


    const filtered =
        categories.filter(
            category => {

                return (

                    category.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    category.subject
                        .toLowerCase()
                        .includes(query)

                    ||

                    category.description
                        .toLowerCase()
                        .includes(query)

                );

            }
        );


    renderCategories(
        filtered
    );

    renderCategoryList(
        filtered
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {


    /* Category Search */

    if (categorySearch) {

        categorySearch.addEventListener(
            "input",
            filterCategories
        );

    }


    /* Theme */

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            toggleTheme
        );

    }


    /* Mobile Menu */

    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            () => {

                mobileMenu.classList.toggle(
                    "show"
                );

            }
        );

    }


    /* Search Button */

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../books/books.html";

            }
        );

    }


    /* Close mobile menu after link click */

    if (mobileMenu) {

        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove(
                            "show"
                        );

                    }
                );

            });

    }

}


/* =========================================================
   THEME SYSTEM
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "bookLibraryTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        if (themeBtn) {
            themeBtn.textContent =
                "☀️";
        }

    } else {

        document.body.classList.remove(
            "dark"
        );

        if (themeBtn) {
            themeBtn.textContent =
                "🌙";
        }

    }

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "bookLibraryTheme",
        isDark ? "dark" : "light"
    );


    if (themeBtn) {

        themeBtn.textContent =
            isDark
                ? "☀️"
                : "🌙";

    }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

// In categories.js, modify filterCategories to also filter the list:
function filterCategories() {
    const query = categorySearch.value.trim().toLowerCase();
    if (!query) {
        renderCategories(categories);
        renderCategoryList(categories);
        return;
    }
    const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
    renderCategories(filtered);
    renderCategoryList(filtered);
}