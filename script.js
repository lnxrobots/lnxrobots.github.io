const TABS = document.getElementsByClassName("my-tab");
const TAB_LINKS = document.getElementsByClassName("tab-link");
const LANG_SELECT = document.getElementById("lang-select");
const NAVBAR = document.getElementById("my-navbar");

const LANGUAGES = ['en', 'sk']
const LANGUAGE_FILES = {'sk': 'sk.json', 'sk-SK': 'sk.json'}
const LANGUAGE_NAMES = {'en': '🇬🇧 EN', 'sk': '🇸🇰 SK'}

function removeHash() {
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

function openTab(tab) {
    for (let t of TABS) {
        t.style.display = "none";
    }
    for (let l of TAB_LINKS) {
        l.parentElement.classList.remove("active");
    }
    document.getElementById("nav-" + tab).parentElement.classList.add("active");
    document.getElementById("tab-" + tab).style.display = "block";
    window.location.hash = tab;
    if (tab === "home") {
        removeHash();
    }
}

function translate(lang) {
    LANG_SELECT.value = lang;
    document.getElementsByTagName("html")[0].lang = lang;
    if (lang === "en") return;
    fetch("/localization/"+LANGUAGE_FILES[lang])
        .then(response => response.json())
        .then(data => {
            for(let e of document.getElementsByTagName("*")) {
                if (e.innerHTML.trim() in data) {
                    e.innerHTML = data[e.innerHTML.trim()];
                }
            }
        });
}

for (let l of TAB_LINKS) {
    l.addEventListener("click", () => {
        openTab(l.id.split("-")[1]);
        NAVBAR.classList.remove("show");
    });
}

if (window.location.hash) {
    openTab(window.location.hash.substring(1));
} else {
    openTab("home");
}

for (let l of LANGUAGES) {
    let opt = document.createElement("option");
    opt.value = l;
    opt.innerHTML = LANGUAGE_NAMES[l];
    LANG_SELECT.appendChild(opt);
}
LANG_SELECT.addEventListener("change", () => {
    localStorage.setItem("lang", LANG_SELECT.value);
    translate(LANG_SELECT.value);
    if (LANG_SELECT.value === "en") {
        window.location.reload();
    } else {
        NAVBAR.classList.remove("show");
    }
})

if (localStorage.getItem("lang") != null) {
    translate(localStorage.getItem("lang"));
} else if (navigator.language in LANGUAGE_FILES) {
    translate(navigator.language);
}
