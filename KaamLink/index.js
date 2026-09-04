/* =========================================================
   KAAMLINK - MAIN JAVASCRIPT
   Version 1.0.0

   This version is frontend-only.
   Firebase, real GPS, chat, payment and verification
   will be connected in later development stages.
========================================================= */

"use strict";


/* =========================================================
   APP DATA
========================================================= */

const services = [

    {
        id: "electrician",
        name: "Electrician",
        icon: "⚡"
    },

    {
        id: "plumber",
        name: "Plumber",
        icon: "🔧"
    },

    {
        id: "ac",
        name: "AC Technician",
        icon: "❄️"
    },

    {
        id: "carpenter",
        name: "Carpenter",
        icon: "🪚"
    },

    {
        id: "painter",
        name: "Painter",
        icon: "🎨"
    },

    {
        id: "mason",
        name: "Mason",
        icon: "🧱"
    },

    {
        id: "mechanic",
        name: "Mechanic",
        icon: "🔩"
    },

    {
        id: "cleaner",
        name: "Cleaner",
        icon: "🧹"
    }

];


const workers = [

    {
        id: 1,

        name: "Ahmed Khan",

        skill: "Electrician",

        category: "electrician",

        icon: "🧑‍🔧",

        rating: 4.9,

        reviews: 126,

        distance: 1.2,

        experience: "8+ Years",

        price: "Rs. 1,000",

        status: "Available",

        verified: true,

        about:
            "Professional electrician experienced in home wiring, electrical repairs, lighting installation and maintenance.",

        skills: [
            "Home Wiring",
            "Fault Repair",
            "Lighting",
            "Fan Installation",
            "Maintenance"
        ]

    },


    {
        id: 2,

        name: "Bilal Ahmed",

        skill: "Plumber",

        category: "plumber",

        icon: "👨‍🔧",

        rating: 4.8,

        reviews: 89,

        distance: 2.1,

        experience: "6+ Years",

        price: "Rs. 800",

        status: "Available",

        verified: true,

        about:
            "Experienced plumber providing water pipe repair, bathroom fitting, leakage repair and maintenance services.",

        skills: [
            "Pipe Repair",
            "Leakage",
            "Bathroom Fitting",
            "Water Tank",
            "Maintenance"
        ]

    },


    {
        id: 3,

        name: "Usman Ali",

        skill: "AC Technician",

        category: "ac",

        icon: "🧑‍🔧",

        rating: 4.9,

        reviews: 154,

        distance: 2.8,

        experience: "9+ Years",

        price: "Rs. 1,200",

        status: "Available",

        verified: true,

        about:
            "AC technician specializing in AC installation, service, gas charging, cleaning and troubleshooting.",

        skills: [
            "AC Service",
            "Gas Charging",
            "Installation",
            "Cleaning",
            "Repair"
        ]

    },


    {
        id: 4,

        name: "Hassan Raza",

        skill: "Carpenter",

        category: "carpenter",

        icon: "👨‍🔨",

        rating: 4.7,

        reviews: 71,

        distance: 3.4,

        experience: "7+ Years",

        price: "Rs. 1,500",

        status: "Busy",

        verified: true,

        about:
            "Professional carpenter for furniture repair, doors, cabinets and custom wood work.",

        skills: [
            "Furniture",
            "Doors",
            "Cabinets",
            "Wood Repair",
            "Custom Work"
        ]

    },


    {
        id: 5,

        name: "Sajid Hussain",

        skill: "Painter",

        category: "painter",

        icon: "👨‍🎨",

        rating: 4.8,

        reviews: 63,

        distance: 4.1,

        experience: "5+ Years",

        price: "Rs. 1,300",

        status: "Available",

        verified: true,

        about:
            "Home and commercial painting professional with experience in interior and exterior finishing.",

        skills: [
            "Wall Painting",
            "Interior",
            "Exterior",
            "Texture",
            "Finishing"
        ]

    },


    {
        id: 6,

        name: "Noman Shah",

        skill: "Mechanic",

        category: "mechanic",

        icon: "👨‍🔧",

        rating: 4.6,

        reviews: 48,

        distance: 5.2,

        experience: "10+ Years",

        price: "Rs. 1,000",

        status: "Available",

        verified: true,

        about:
            "Experienced vehicle mechanic providing general repair, maintenance and troubleshooting services.",

        skills: [
            "Engine",
            "Oil Change",
            "Brakes",
            "Electrical",
            "Maintenance"
        ]

    }

];


/* =========================================================
   APP STATE
========================================================= */

const appState = {

    currentSection: "home",

    selectedService: "all",

    selectedWorker: null,

    favorites: JSON.parse(
        localStorage.getItem("kaamlinkFavorites") || "[]"
    ),

    darkMode:
        localStorage.getItem("kaamlinkDarkMode") === "true",

    accountType:
        localStorage.getItem("kaamlinkAccountType") || null

};


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {

    body: document.body,

    menuButton:
        document.getElementById("menuButton"),

    sideMenu:
        document.getElementById("sideMenu"),

    closeMenu:
        document.getElementById("closeMenu"),

    menuOverlay:
        document.getElementById("menuOverlay"),

    serviceSearch:
        document.getElementById("serviceSearch"),

    searchButton:
        document.getElementById("searchButton"),

    servicesGrid:
        document.getElementById("servicesGrid"),

    workersList:
        document.getElementById("workersList"),

    searchWorkersList:
        document.getElementById("searchWorkersList"),

    workerSearchInput:
        document.getElementById("workerSearchInput"),

    favoritesList:
        document.getElementById("favoritesList"),

    locationText:
        document.getElementById("locationText"),

    authModal:
        document.getElementById("authModal"),

    authModalClose:
        document.getElementById("authModalClose"),

    workerModal:
        document.getElementById("workerModal"),

    workerModalClose:
        document.getElementById("workerModalClose"),

    workerProfileHeader:
        document.getElementById("workerProfileHeader"),

    workerProfileBody:
        document.getElementById("workerProfileBody"),

    customerChoice:
        document.getElementById("customerChoice"),

    workerChoice:
        document.getElementById("workerChoice"),

    authContact:
        document.getElementById("authContact"),

    continueAuthButton:
        document.getElementById("continueAuthButton"),

    toast:
        document.getElementById("toast"),

    toastMessage:
        document.getElementById("toastMessage"),

    notificationButton:
        document.getElementById("notificationButton"),

    profileButton:
        document.getElementById("profileButton"),

    changeLocationButton:
        document.getElementById("changeLocationButton"),

    becomeWorkerButton:
        document.getElementById("becomeWorkerButton"),

    loginMenuButton:
        document.getElementById("loginMenuButton"),

    profileLoginButton:
        document.getElementById("profileLoginButton"),

    themeButton:
        document.getElementById("themeButton"),

    modalChatButton:
        document.getElementById("modalChatButton"),

    modalCallButton:
        document.getElementById("modalCallButton"),

    modalRequestButton:
        document.getElementById("modalRequestButton")

};


/* =========================================================
   INITIALIZE APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    applySavedTheme();

    renderServices();

    renderWorkers();

    renderSearchWorkers();

    renderFavorites();

    setupNavigation();

    setupMenu();

    setupSearch();

    setupModals();

    setupButtons();

    setupFilterButtons();

    setupJobTabs();

    detectLocation();

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navigationButtons =
        document.querySelectorAll(
            "[data-section]"
        );

    navigationButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.section;

                    if (!section) {
                        return;
                    }

                    navigateTo(section);

                }
            );

        }
    );

}


function navigateTo(sectionName) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );

    sections.forEach(
        section => {

            section.classList.remove(
                "active"
            );

        }
    );


    const targetSection =
        document.getElementById(
            `${sectionName}Section`
        );


    if (!targetSection) {
        return;
    }


    targetSection.classList.add(
        "active"
    );


    appState.currentSection =
        sectionName;


    updateNavigationState(
        sectionName
    );


    closeSideMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sectionName === "favorites") {
        renderFavorites();
    }

    if (sectionName === "search") {
        renderSearchWorkers();
    }

}


/* =========================================================
   NAVIGATION STATE
========================================================= */

function updateNavigationState(
    sectionName
) {

    document
        .querySelectorAll(
            ".bottom-nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section === sectionName
                );

            }
        );


    document
        .querySelectorAll(
            ".side-nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section === sectionName
                );

            }
        );

}


/* =========================================================
   SIDE MENU
========================================================= */

function setupMenu() {

    elements.menuButton
        .addEventListener(
            "click",
            openSideMenu
        );


    elements.closeMenu
        .addEventListener(
            "click",
            closeSideMenu
        );


    elements.menuOverlay
        .addEventListener(
            "click",
            closeSideMenu
        );

}


function openSideMenu() {

    elements.sideMenu.classList.add(
        "open"
    );

    elements.menuOverlay.classList.add(
        "show"
    );

}


function closeSideMenu() {

    elements.sideMenu.classList.remove(
        "open"
    );

    elements.menuOverlay.classList.remove(
        "show"
    );

}


/* =========================================================
   SERVICES
========================================================= */

function renderServices() {

    if (!elements.servicesGrid) {
        return;
    }


    elements.servicesGrid.innerHTML =
        services
            .map(
                service => `

                <button
                    class="service-card"
                    data-service="${service.id}"
                    aria-label="${service.name}"
                >

                    <div class="service-icon">
                        ${service.icon}
                    </div>

                    <strong>
                        ${service.name}
                    </strong>

                </button>

            `
            )
            .join("");


    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        selectService(
                            card.dataset.service
                        );

                    }
                );

            }
        );

}


function selectService(
    serviceId
) {

    appState.selectedService =
        serviceId;


    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "selected",
                    card.dataset.service === serviceId
                );

            }
        );


    const service =
        services.find(
            item => item.id === serviceId
        );


    if (service) {

        showToast(
            `${service.name} selected`
        );

        renderWorkers();

    }

}


/* =========================================================
   WORKERS
========================================================= */

function renderWorkers() {

    if (!elements.workersList) {
        return;
    }


    let filteredWorkers =
        [...workers];


    if (
        appState.selectedService !== "all"
    ) {

        filteredWorkers =
            filteredWorkers.filter(
                worker =>
                    worker.category ===
                    appState.selectedService
            );

    }


    filteredWorkers =
        filteredWorkers.slice(0, 6);


    if (!filteredWorkers.length) {

        elements.workersList.innerHTML =
            createNoWorkersHTML();

        return;
    }


    elements.workersList.innerHTML =
        filteredWorkers
            .map(
                createWorkerCard
            )
            .join("");


    attachWorkerCardEvents();

}


function createWorkerCard(
    worker
) {

    const isFavorite =
        appState.favorites.includes(
            worker.id
        );


    const statusHTML =
        worker.status === "Available"
            ? `
                <span class="worker-status">
                    🟢 Available
                </span>
              `
            : `
                <span
                    class="worker-status"
                    style="
                        color:#b67800;
                        background:#fff6df;
                    "
                >
                    🟠 Busy
                </span>
              `;


    return `

        <article
            class="worker-card"
            data-worker-id="${worker.id}"
        >

            <div class="worker-avatar">
                ${worker.icon}
            </div>


            <div class="worker-information">

                <div class="worker-name-row">

                    <h3>
                        ${worker.name}
                    </h3>

                    ${
                        worker.verified
                            ? `
                                <span
                                    class="verified-badge"
                                    title="Verified worker"
                                >
                                    ✓
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="worker-skill">
                    ${worker.skill}
                </div>


                <div class="worker-meta">

                    <span class="worker-rating">
                        ⭐ ${worker.rating}
                    </span>

                    <span>
                        ${worker.reviews} reviews
                    </span>

                    <span class="worker-distance">
                        📍 ${worker.distance} km
                    </span>

                </div>


                <div class="worker-price">

                    Starting from
                    <strong>
                        ${worker.price}
                    </strong>

                </div>

            </div>


            ${statusHTML}


            <button
                class="worker-favorite ${
                    isFavorite ? "active" : ""
                }"
                data-favorite-id="${worker.id}"
                aria-label="Favorite worker"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

        </article>

    `;

}


function createNoWorkersHTML() {

    return `

        <div class="empty-state"
             style="grid-column:1/-1;">

            <div class="empty-icon">
                🔍
            </div>

            <h3>
                No workers found
            </h3>

            <p>
                Try selecting another service.
            </p>

        </div>

    `;

}


function attachWorkerCardEvents() {

    document
        .querySelectorAll(
            ".worker-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                ".worker-favorite"
                            )
                        ) {
                            return;
                        }


                        const workerId =
                            Number(
                                card.dataset.workerId
                            );


                        openWorkerModal(
                            workerId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".worker-favorite"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const workerId =
                            Number(
                                button.dataset.favoriteId
                            );


                        toggleFavorite(
                            workerId
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    elements.searchButton
        .addEventListener(
            "click",
            performHomeSearch
        );


    elements.serviceSearch
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    performHomeSearch();

                }

            }
        );


    elements.workerSearchInput
        .addEventListener(
            "input",
            () => {

                renderSearchWorkers(
                    elements.workerSearchInput.value
                );

            }
        );

}


function performHomeSearch() {

    const query =
        elements.serviceSearch.value
            .trim()
            .toLowerCase();


    if (!query) {

        showToast(
            "Please enter a service"
        );

        return;

    }


    navigateTo("search");


    elements.workerSearchInput.value =
        query;


    renderSearchWorkers(
        query
    );

}


function renderSearchWorkers(
    query = ""
) {

    if (!elements.searchWorkersList) {
        return;
    }


    const normalizedQuery =
        query.trim().toLowerCase();


    let results =
        workers.filter(
            worker => {

                if (!normalizedQuery) {
                    return true;
                }


                return (

                    worker.name
                        .toLowerCase()
                        .includes(normalizedQuery)

                    ||

                    worker.skill
                        .toLowerCase()
                        .includes(normalizedQuery)

                    ||

                    worker.skills.some(
                        skill =>
                            skill
                                .toLowerCase()
                                .includes(normalizedQuery)
                    )

                );

            }
        );


    if (!results.length) {

        elements.searchWorkersList.innerHTML =
            createNoWorkersHTML();

        return;

    }


    elements.searchWorkersList.innerHTML =
        results
            .map(createWorkerCard)
            .join("");


    attachWorkerCardEvents();

}


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(
    workerId
) {

    const index =
        appState.favorites.indexOf(
            workerId
        );


    if (index === -1) {

        appState.favorites.push(
            workerId
        );

        showToast(
            "Worker added to favorites ❤️"
        );

    } else {

        appState.favorites.splice(
            index,
            1
        );

        showToast(
            "Worker removed from favorites"
        );

    }


    localStorage.setItem(
        "kaamlinkFavorites",
        JSON.stringify(
            appState.favorites
        )
    );


    renderWorkers();

    renderSearchWorkers();

    renderFavorites();

}


function renderFavorites() {

    if (!elements.favoritesList) {
        return;
    }


    const favoriteWorkers =
        workers.filter(
            worker =>
                appState.favorites.includes(
                    worker.id
                )
        );


    if (!favoriteWorkers.length) {

        elements.favoritesList.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >

                <div class="empty-icon">
                    ❤️
                </div>

                <h3>
                    No favorite workers
                </h3>

                <p>
                    Save workers here for quick access.
                </p>

                <button
                    class="primary-button"
                    data-section="search"
                >
                    Find Workers
                </button>

            </div>

        `;


        elements.favoritesList
            .querySelector(
                "[data-section]"
            )
            ?.addEventListener(
                "click",
                () => navigateTo("search")
            );


        return;

    }


    elements.favoritesList.innerHTML =
        favoriteWorkers
            .map(createWorkerCard)
            .join("");


    attachWorkerCardEvents();

}


/* =========================================================
   WORKER PROFILE MODAL
========================================================= */

function openWorkerModal(
    workerId
) {

    const worker =
        workers.find(
            item => item.id === workerId
        );


    if (!worker) {
        return;
    }


    appState.selectedWorker =
        worker;


    elements.workerProfileHeader.innerHTML = `

        <div class="worker-modal-avatar">
            ${worker.icon}
        </div>

        <div class="worker-modal-name">

            <h2>

                ${worker.name}

                ${
                    worker.verified
                        ? `
                            <span
                                class="verified-badge"
                            >
                                ✓
                            </span>
                          `
                        : ""
                }

            </h2>

            <p>
                ${worker.skill}
                • 📍 ${worker.distance} km away
            </p>

        </div>

    `;


    elements.workerProfileBody.innerHTML = `

        <div class="profile-stat-grid">

            <div class="profile-stat">

                <strong>
                    ⭐ ${worker.rating}
                </strong>

                <span>
                    Rating
                </span>

            </div>


            <div class="profile-stat">

                <strong>
                    ${worker.reviews}
                </strong>

                <span>
                    Reviews
                </span>

            </div>


            <div class="profile-stat">

                <strong>
                    ${worker.experience}
                </strong>

                <span>
                    Experience
                </span>

            </div>

        </div>


        <h3 class="worker-about-title">
            About
        </h3>

        <p class="worker-about">
            ${worker.about}
        </p>


        <h3 class="worker-about-title">
            Skills & Services
        </h3>

        <div class="skill-list">

            ${worker.skills
                .map(
                    skill =>
                        `
                            <span class="skill-tag">
                                ${skill}
                            </span>
                        `
                )
                .join("")}

        </div>

    `;


    elements.workerModal.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";

}


function closeWorkerModal() {

    elements.workerModal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   AUTH MODAL
========================================================= */

function openAuthModal(
    accountType = null
) {

    elements.authModal.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";


    if (accountType === "worker") {

        selectAccountType(
            "worker"
        );

    } else if (accountType === "customer") {

        selectAccountType(
            "customer"
        );

    }

}


function closeAuthModal() {

    elements.authModal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


function selectAccountType(
    type
) {

    appState.accountType =
        type;


    elements.customerChoice
        .classList.toggle(
            "selected",
            type === "customer"
        );


    elements.workerChoice
        .classList.toggle(
            "selected",
            type === "worker"
        );

}


function setupModals() {

    elements.authModalClose
        .addEventListener(
            "click",
            closeAuthModal
        );


    elements.workerModalClose
        .addEventListener(
            "click",
            closeWorkerModal
        );


    elements.authModal
        .addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    elements.authModal
                ) {

                    closeAuthModal();

                }

            }
        );


    elements.workerModal
        .addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    elements.workerModal
                ) {

                    closeWorkerModal();

                }

            }
        );


    elements.customerChoice
        .addEventListener(
            "click",
            () =>
                selectAccountType(
                    "customer"
                )
        );


    elements.workerChoice
        .addEventListener(
            "click",
            () =>
                selectAccountType(
                    "worker"
                )
        );


    elements.continueAuthButton
        .addEventListener(
            "click",
            continueAuth
        );


    elements.modalChatButton
        .addEventListener(
            "click",
            () => {

                if (!appState.selectedWorker) {
                    return;
                }

                closeWorkerModal();

                navigateTo(
                    "messages"
                );

                showToast(
                    "Chat will be connected in the next stage"
                );

            }
        );


    elements.modalCallButton
        .addEventListener(
            "click",
            () => {

                showToast(
                    "Calling will be connected in the next stage"
                );

            }
        );


    elements.modalRequestButton
        .addEventListener(
            "click",
            () => {

                if (!appState.selectedWorker) {
                    return;
                }


                closeWorkerModal();


                showToast(
                    `Request started for ${appState.selectedWorker.name}`
                );


                setTimeout(
                    () => {

                        navigateTo(
                            "jobs"
                        );

                    },
                    600
                );

            }
        );

}


function continueAuth() {

    const contact =
        elements.authContact.value
            .trim();


    if (!appState.accountType) {

        showToast(
            "Please choose Customer or Worker"
        );

        return;

    }


    if (!contact) {

        showToast(
            "Please enter your email or phone"
        );

        elements.authContact.focus();

        return;

    }


    localStorage.setItem(
        "kaamlinkAccountType",
        appState.accountType
    );


    closeAuthModal();


    const typeText =
        appState.accountType === "worker"
            ? "Worker"
            : "Customer";


    showToast(
        `${typeText} account selected successfully`
    );


    if (
        appState.accountType === "worker"
    ) {

        setTimeout(
            () => {

                showToast(
                    "Worker registration will be added next"
                );

            },
            1200
        );

    }

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    elements.notificationButton
        .addEventListener(
            "click",
            () => {

                showToast(
                    "No new notifications"
                );

            }
        );


    elements.profileButton
        .addEventListener(
            "click",
            () => {

                navigateTo(
                    "profile"
                );

            }
        );


    elements.changeLocationButton
        .addEventListener(
            "click",
            detectLocation
        );


    elements.becomeWorkerButton
        .addEventListener(
            "click",
            () => {

                openAuthModal(
                    "worker"
                );

            }
        );


    elements.loginMenuButton
        .addEventListener(
            "click",
            () => {

                closeSideMenu();

                openAuthModal();

            }
        );


    elements.profileLoginButton
        .addEventListener(
            "click",
            () => {

                openAuthModal();

            }
        );


    elements.themeButton
        .addEventListener(
            "click",
            toggleDarkMode
        );


    document
        .getElementById(
            "allServicesButton"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "All service categories will be added"
                );

            }
        );


    document
        .getElementById(
            "viewWorkersButton"
        )
        ?.addEventListener(
            "click",
            () => {

                navigateTo(
                    "search"
                );

            }
        );


    document
        .getElementById(
            "mapButton"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Full map will be connected later"
                );

            }
        );

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilterButtons() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    const text =
                        button.textContent
                            .trim()
                            .toLowerCase();


                    let results =
                        [...workers];


                    if (
                        text.includes(
                            "top rated"
                        )
                    ) {

                        results.sort(
                            (a, b) =>
                                b.rating - a.rating
                        );

                    }


                    if (
                        text.includes(
                            "nearby"
                        )
                    ) {

                        results.sort(
                            (a, b) =>
                                a.distance - b.distance
                        );

                    }


                    if (
                        text.includes(
                            "available"
                        )
                    ) {

                        results =
                            results.filter(
                                worker =>
                                    worker.status ===
                                    "Available"
                            );

                    }


                    elements.searchWorkersList.innerHTML =
                        results
                            .map(
                                createWorkerCard
                            )
                            .join("");


                    attachWorkerCardEvents();

                }
            );

        }
    );

}


/* =========================================================
   JOB TABS
========================================================= */

function setupJobTabs() {

    document
        .querySelectorAll(
            ".job-tab"
        )
        .forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".job-tab"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        tab.classList.add(
                            "active"
                        );


                        showToast(
                            `${tab.textContent.trim()} jobs`
                        );

                    }
                );

            }
        );

}


/* =========================================================
   LOCATION
========================================================= */

function detectLocation() {

    if (
        !navigator.geolocation
    ) {

        elements.locationText.textContent =
            "Location unavailable";

        return;

    }


    elements.locationText.textContent =
        "Detecting location...";


    navigator.geolocation.getCurrentPosition(

        position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            /*
             * For this first frontend version,
             * we do not send coordinates anywhere.
             *
             * Later this will connect to:
             * - Google Maps / Mapbox
             * - Firebase
             * - Nearby worker search
             */

            elements.locationText.textContent =
                `Location detected (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;

            showToast(
                "Your location was detected"
            );

        },

        () => {

            elements.locationText.textContent =
                "Location permission not granted";

            showToast(
                "Location permission is needed for nearby workers"
            );

        },

        {
            enableHighAccuracy: false,

            timeout: 8000,

            maximumAge: 300000

        }

    );

}


/* =========================================================
   DARK MODE
========================================================= */

function applySavedTheme() {

    if (
        appState.darkMode
    ) {

        elements.body.classList.add(
            "dark-mode"
        );

        updateThemeButton();

    }

}


function toggleDarkMode() {

    appState.darkMode =
        !appState.darkMode;


    elements.body.classList.toggle(
        "dark-mode",
        appState.darkMode
    );


    localStorage.setItem(
        "kaamlinkDarkMode",
        String(
            appState.darkMode
        )
    );


    updateThemeButton();


    showToast(
        appState.darkMode
            ? "Dark mode enabled"
            : "Light mode enabled"
    );

}


function updateThemeButton() {

    if (!elements.themeButton) {
        return;
    }


    elements.themeButton.innerHTML =
        appState.darkMode

            ? `
                <span>☀️</span>
                Light Mode
              `

            : `
                <span>🌙</span>
                Dark Mode
              `;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    elements.toastMessage.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   KEYBOARD / ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeSideMenu();

            closeAuthModal();

            closeWorkerModal();

        }

    }
);


/* =========================================================
   INITIAL SERVICE STATE
========================================================= */

function resetServiceSelection() {

    appState.selectedService =
        "all";


    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            card =>
                card.classList.remove(
                    "selected"
                )
        );


    renderWorkers();

}


/* =========================================================
   DEBUG HELPER
========================================================= */

window.KaamLink = {

    state: appState,

    workers,

    services,

    navigateTo,

    showToast,

    openWorkerModal,

    toggleFavorite

};


/* =========================================================
   END
========================================================= */