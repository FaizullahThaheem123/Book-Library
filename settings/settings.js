/* =========================================================
   BOOK LIBRARY — SETTINGS JAVASCRIPT
   Version 1.0.0
========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
========================================================= */

const SETTINGS_KEY = "bookLibrarySettings";

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

    loadSettings();

    setupTabs();

    setupTheme();

    setupFontSize();

    setupAnimations();

    setupReadingSettings();

    setupLibraryCounts();

    setupDataActions();

    setupMobileMenu();

    setupThemeToggle();

});


/* =========================================================
   GET SETTINGS
========================================================= */

function getSettings() {

    try {

        const saved = localStorage.getItem(SETTINGS_KEY);

        if (!saved) {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error("Settings loading error:", error);

        return { ...DEFAULT_SETTINGS };
    }
}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings(settings) {

    try {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

    } catch (error) {

        console.error("Settings saving error:", error);
    }
}


/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {

    const settings = getSettings();


    /* Theme */

    applyTheme(settings.theme);


    const themeSelect =
        document.getElementById("themeSelect");

    if (themeSelect) {
        themeSelect.value = settings.theme;
    }


    /* Font */

    applyFontSize(settings.fontSize);


    /* Animations */

    const animationsToggle =
        document.getElementById("animationsToggle");

    if (animationsToggle) {
        animationsToggle.checked =
            settings.animations;
    }


    /* Book opening */

    const bookOpening =
        document.getElementById("bookOpening");

    if (bookOpening) {
        bookOpening.value =
            settings.bookOpening;
    }


    /* Reading width */

    const readingWidth =
        document.getElementById("readingWidth");

    if (readingWidth) {
        readingWidth.value =
            settings.readingWidth;
    }


    /* Remember position */

    const rememberPosition =
        document.getElementById("rememberPosition");

    if (rememberPosition) {
        rememberPosition.checked =
            settings.rememberPosition;
    }
}


/* =========================================================
   SETTINGS TABS
========================================================= */

function setupTabs() {

    const tabs =
        document.querySelectorAll(".settings-tab");

    const panels =
        document.querySelectorAll(".settings-panel");


    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const section =
                tab.dataset.section;


            /* Remove active */

            tabs.forEach(item => {
                item.classList.remove("active");
            });

            panels.forEach(panel => {
                panel.classList.remove("active");
            });


            /* Add active */

            tab.classList.add("active");


            const target =
                document.getElementById(section);

            if (target) {
                target.classList.add("active");
            }


            /* Close mobile menu */

            const mobileMenu =
                document.getElementById("mobileMenu");

            if (mobileMenu) {
                mobileMenu.classList.remove("open");
            }

        });

    });

}


/* =========================================================
   THEME SYSTEM
========================================================= */

function setupTheme() {

    const themeSelect =
        document.getElementById("themeSelect");


    if (!themeSelect) return;


    themeSelect.addEventListener("change", () => {

        const theme =
            themeSelect.value;

        const settings =
            getSettings();

        settings.theme = theme;

        saveSettings(settings);

        applyTheme(theme);

        showToast(
            "✓",
            "Theme updated"
        );

    });


    /* System theme changes */

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    if (mediaQuery.addEventListener) {

        mediaQuery.addEventListener(
            "change",
            () => {

                const settings =
                    getSettings();

                if (settings.theme === "system") {
                    applyTheme("system");
                }

            }
        );

    }

}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    const body =
        document.body;


    body.classList.remove(
        "dark-theme"
    );


    if (theme === "dark") {

        body.classList.add(
            "dark-theme"
        );

        return;
    }


    if (theme === "system") {

        const darkMode =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;


        if (darkMode) {

            body.classList.add(
                "dark-theme"
            );

        }

    }

}


/* =========================================================
   HEADER THEME BUTTON
========================================================= */

function setupThemeToggle() {

    const button =
        document.getElementById(
            "themeToggle"
        );


    if (!button) return;


    updateThemeIcon();


    button.addEventListener(
        "click",
        () => {

            const settings =
                getSettings();


            let newTheme;


            if (settings.theme === "dark") {

                newTheme = "light";

            } else {

                newTheme = "dark";
            }


            settings.theme =
                newTheme;


            saveSettings(settings);

            applyTheme(newTheme);


            const themeSelect =
                document.getElementById(
                    "themeSelect"
                );


            if (themeSelect) {
                themeSelect.value =
                    newTheme;
            }


            updateThemeIcon();


            showToast(
                "✓",
                newTheme === "dark"
                    ? "Dark theme enabled"
                    : "Light theme enabled"
            );

        }
    );

}


function updateThemeIcon() {

    const button =
        document.getElementById(
            "themeToggle"
        );


    if (!button) return;


    const dark =
        document.body.classList.contains(
            "dark-theme"
        );


    button.textContent =
        dark ? "☀️" : "🌙";

}


/* =========================================================
   FONT SIZE
========================================================= */

function setupFontSize() {

    const decrease =
        document.getElementById(
            "fontDecrease"
        );

    const increase =
        document.getElementById(
            "fontIncrease"
        );


    if (decrease) {

        decrease.addEventListener(
            "click",
            () => {

                changeFontSize(-10);

            }
        );

    }


    if (increase) {

        increase.addEventListener(
            "click",
            () => {

                changeFontSize(10);

            }
        );

    }

}


/* =========================================================
   CHANGE FONT SIZE
========================================================= */

function changeFontSize(amount) {

    const settings =
        getSettings();


    let size =
        Number(settings.fontSize) + amount;


    /* Minimum */

    if (size < 80) {
        size = 80;
    }


    /* Maximum */

    if (size > 130) {
        size = 130;
    }


    settings.fontSize =
        size;


    saveSettings(settings);

    applyFontSize(size);


    showToast(
        "✓",
        `Font size ${size}%`
    );

}


/* =========================================================
   APPLY FONT SIZE
========================================================= */

function applyFontSize(size) {

    document.documentElement.style
        .setProperty(
            "--font-scale",
            size / 100
        );


    const display =
        document.getElementById(
            "fontSizeValue"
        );


    if (display) {
        display.textContent =
            `${size}%`;
    }

}


/* =========================================================
   ANIMATIONS
========================================================= */

function setupAnimations() {

    const toggle =
        document.getElementById(
            "animationsToggle"
        );


    if (!toggle) return;


    toggle.addEventListener(
        "change",
        () => {

            const settings =
                getSettings();


            settings.animations =
                toggle.checked;


            saveSettings(settings);


            applyAnimations(
                toggle.checked
            );


            showToast(
                "✓",
                toggle.checked
                    ? "Animations enabled"
                    : "Animations disabled"
            );

        }
    );

}


/* =========================================================
   APPLY ANIMATIONS
========================================================= */

function applyAnimations(enabled) {

    if (enabled) {

        document.body.classList.remove(
            "no-animations"
        );

    } else {

        document.body.classList.add(
            "no-animations"
        );

    }

}


/* =========================================================
   READING SETTINGS
========================================================= */

function setupReadingSettings() {

    const bookOpening =
        document.getElementById(
            "bookOpening"
        );

    const readingWidth =
        document.getElementById(
            "readingWidth"
        );

    const rememberPosition =
        document.getElementById(
            "rememberPosition"
        );


    if (bookOpening) {

        bookOpening.addEventListener(
            "change",
            () => {

                const settings =
                    getSettings();

                settings.bookOpening =
                    bookOpening.value;

                saveSettings(settings);

                showToast(
                    "✓",
                    "Book opening preference saved"
                );

            }
        );

    }


    if (readingWidth) {

        readingWidth.addEventListener(
            "change",
            () => {

                const settings =
                    getSettings();

                settings.readingWidth =
                    readingWidth.value;

                saveSettings(settings);

                showToast(
                    "✓",
                    "Reading width saved"
                );

            }
        );

    }


    if (rememberPosition) {

        rememberPosition.addEventListener(
            "change",
            () => {

                const settings =
                    getSettings();

                settings.rememberPosition =
                    rememberPosition.checked;

                saveSettings(settings);

                showToast(
                    "✓",
                    rememberPosition.checked
                        ? "Reading position will be remembered"
                        : "Reading position memory disabled"
                );

            }
        );

    }

}


/* =========================================================
   LIBRARY COUNTS
========================================================= */

function setupLibraryCounts() {

    updateLibraryCounts();


    /*
       Update counts when storage changes
       from another browser tab.
    */

    window.addEventListener(
        "storage",
        updateLibraryCounts
    );

}


/* =========================================================
   UPDATE COUNTS
========================================================= */

function updateLibraryCounts() {

    const favorites =
        getArrayFromStorage([
            "favorites",
            "bookLibraryFavorites"
        ]);


    const myBooks =
        getArrayFromStorage([
            "myBooks",
            "bookLibraryMyBooks"
        ]);


    const recent =
        getArrayFromStorage([
            "recentBooks",
            "recentlyViewed",
            "bookLibraryRecent"
        ]);


    setCount(
        "favoritesCount",
        favorites.length
    );


    setCount(
        "myBooksCount",
        myBooks.length
    );


    setCount(
        "recentCount",
        recent.length
    );

}


/* =========================================================
   GET ARRAY FROM STORAGE
========================================================= */

function getArrayFromStorage(keys) {

    for (const key of keys) {

        try {

            const value =
                localStorage.getItem(key);


            if (!value) continue;


            const parsed =
                JSON.parse(value);


            if (Array.isArray(parsed)) {
                return parsed;
            }

        } catch (error) {

            console.warn(
                `Invalid storage data: ${key}`
            );

        }

    }


    return [];

}


/* =========================================================
   SET COUNT
========================================================= */

function setCount(id, count) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent =
            count;
    }

}


/* =========================================================
   DATA ACTIONS
========================================================= */

function setupDataActions() {

    const clearRecent =
        document.getElementById(
            "clearRecent"
        );

    const clearFavorites =
        document.getElementById(
            "clearFavorites"
        );

    const clearMyBooks =
        document.getElementById(
            "clearMyBooks"
        );

    const resetSettings =
        document.getElementById(
            "resetSettings"
        );


    /* Clear recent */

    if (clearRecent) {

        clearRecent.addEventListener(
            "click",
            () => {

                if (
                    !confirm(
                        "Are you sure you want to clear Recently Viewed?"
                    )
                ) {
                    return;
                }


                clearStorageKeys([
                    "recentBooks",
                    "recentlyViewed",
                    "bookLibraryRecent"
                ]);


                updateLibraryCounts();


                showToast(
                    "✓",
                    "Recently Viewed cleared"
                );

            }
        );

    }


    /* Clear favorites */

    if (clearFavorites) {

        clearFavorites.addEventListener(
            "click",
            () => {

                if (
                    !confirm(
                        "Are you sure you want to clear all Favorites?"
                    )
                ) {
                    return;
                }


                clearStorageKeys([
                    "favorites",
                    "bookLibraryFavorites"
                ]);


                updateLibraryCounts();


                showToast(
                    "✓",
                    "Favorites cleared"
                );

            }
        );

    }


    /* Clear My Books */

    if (clearMyBooks) {

        clearMyBooks.addEventListener(
            "click",
            () => {

                if (
                    !confirm(
                        "Are you sure you want to clear My Books?"
                    )
                ) {
                    return;
                }


                clearStorageKeys([
                    "myBooks",
                    "bookLibraryMyBooks"
                ]);


                updateLibraryCounts();


                showToast(
                    "✓",
                    "My Books cleared"
                );

            }
        );

    }


    /* Reset settings */

    if (resetSettings) {

        resetSettings.addEventListener(
            "click",
            () => {

                if (
                    !confirm(
                        "Reset all Book Library settings to default?"
                    )
                ) {
                    return;
                }


                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(
                        DEFAULT_SETTINGS
                    )
                );


                loadSettings();


                updateThemeIcon();


                showToast(
                    "✓",
                    "Settings restored to default"
                );

            }
        );

    }

}


/* =========================================================
   CLEAR STORAGE KEYS
========================================================= */

function clearStorageKeys(keys) {

    keys.forEach(key => {

        localStorage.removeItem(key);

    });

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const menu =
        document.getElementById(
            "mobileMenu"
        );


    if (!button || !menu) return;


    button.addEventListener(
        "click",
        () => {

            menu.classList.toggle(
                "open"
            );


            const isOpen =
                menu.classList.contains(
                    "open"
                );


            button.textContent =
                isOpen ? "✕" : "☰";

        }
    );


    /* Close when clicking outside */

    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(event.target) &&
                !button.contains(event.target)
            ) {

                menu.classList.remove(
                    "open"
                );

                button.textContent =
                    "☰";

            }

        }
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    icon = "✓",
    message = "Done"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastIcon ||
        !toastMessage
    ) {
        return;
    }


    toastIcon.textContent =
        icon;

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(toastTimer);


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
   KEEP THEME ICON UPDATED
========================================================= */

const themeObserver =
    new MutationObserver(
        () => {
            updateThemeIcon();
        }
    );


themeObserver.observe(
    document.body,
    {
        attributes: true,
        attributeFilter: ["class"]
    }
);