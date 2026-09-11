/* =====================================
   SKSHOP GLOBAL LANGUAGE + ACCESSIBILITY
===================================== */


/* =====================================
   TEXT SIZE
===================================== */

function changeTextSize(size) {

    document.body.classList.remove(
        "text-small",
        "text-normal",
        "text-large"
    );

    document.body.classList.add("text-" + size);

    localStorage.setItem("textSize", size);

    updateTextSizeButton(size);
}


function updateTextSizeButton(size) {

    document.querySelectorAll(
        ".text-size-selector button"
    ).forEach(function(button) {

        button.classList.remove("active");

    });

    const activeButton = document.querySelector(
        '.text-size-selector button[data-size="' +
        size +
        '"]'
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }
}


/* =====================================
   DARK MODE
===================================== */

function applyTheme() {

    const theme =
        localStorage.getItem("theme") || "light";

    document.body.classList.toggle(
        "dark-mode",
        theme === "dark"
    );

    const button =
        document.getElementById("themeToggle");

    if (button) {

        button.innerText =
            theme === "dark" ? "☀️" : "◐";

    }
}


function toggleTheme() {

    const current =
        localStorage.getItem("theme") || "light";

    const newTheme =
        current === "light" ? "dark" : "light";

    localStorage.setItem("theme", newTheme);

    applyTheme();
}


/* =====================================
   LANGUAGE
===================================== */

function applyGlobalLanguage() {

    const language =
        localStorage.getItem("language") || "English";


    /* Normal Text */

    document.querySelectorAll(
        "[data-en][data-hi]"
    ).forEach(function(element) {

        if (language === "Hindi") {

            element.textContent =
                element.getAttribute("data-hi");

        } else {

            element.textContent =
                element.getAttribute("data-en");

        }

    });


    /* Placeholder */

    document.querySelectorAll(
        "[data-en-placeholder][data-hi-placeholder]"
    ).forEach(function(element) {

        if (language === "Hindi") {

            element.placeholder =
                element.getAttribute("data-hi-placeholder");

        } else {

            element.placeholder =
                element.getAttribute("data-en-placeholder");

        }

    });


    /* Title */

    document.querySelectorAll(
        "[data-en-title][data-hi-title]"
    ).forEach(function(element) {

        if (language === "Hindi") {

            element.title =
                element.getAttribute("data-hi-title");

        } else {

            element.title =
                element.getAttribute("data-en-title");

        }

    });


    /* HTML language */

    document.documentElement.lang =
        language === "Hindi" ? "hi" : "en";


    /* Selector */

    const selector =
        document.getElementById("globalLanguage");

    if (selector) {
        selector.value = language;
    }
}


/* =====================================
   PAGE LOAD
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /* Text Size */

        const savedSize =
            localStorage.getItem("textSize") || "normal";

        document.body.classList.add(
            "text-" + savedSize
        );

        updateTextSizeButton(savedSize);


        /* Theme */

        applyTheme();


        /* Language */

        applyGlobalLanguage();


        /* Language Selector */

        const languageSelector =
            document.getElementById("globalLanguage");

        if (languageSelector) {

            languageSelector.addEventListener(
                "change",
                function() {

                    /* Save selected language */
                    localStorage.setItem(
                        "language",
                        this.value
                    );

                    /* Immediately change page */
                    applyGlobalLanguage();

                }
            );

        }


        /* Theme Button */

        const themeButton =
            document.getElementById("themeToggle");

        if (themeButton) {

            themeButton.addEventListener(
                "click",
                toggleTheme
            );

        }

    }
);