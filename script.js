const TABS = document.getElementsByClassName("my-tab");
const TAB_LINKS = document.getElementsByClassName("tab-link");
const LANG_SELECT = document.getElementById("lang-select");
const NAVBAR = document.getElementById("my-navbar");

const LANGUAGES = ['en', 'sk']
const LANGUAGE_FILES = {'sk': 'sk.json', 'sk-SK': 'sk.json'}
const LANGUAGE_NAMES = {'en': '&#127468&#127463 EN', 'sk': '&#127480&#127472 SK'}

function removeHash() {
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

function openTab(tab) {
    NAVBAR.classList.remove("show");
    for (let t of TABS) {
        t.style.display = "none";
    }
    for (let l of TAB_LINKS) {
        l.parentElement.classList.remove("active");
    }
    document.getElementById("nav-" + tab).parentElement.classList.add("active");
    document.getElementById("tab-" + tab).style.display = "block";
    if (tab === "home") {
        removeHash();
    }
}

function updateTab() {
    if (window.location.hash) {
        openTab(window.location.hash.substring(1));
    } else {
        openTab("home");
    }
}

function allDescendants(element, fun) {
    for (let child of element.children) {
        fun(child);
        allDescendants(child, fun);
    }
}

function translate(lang) {
    LANG_SELECT.value = lang;
    document.getElementsByTagName("html")[0].lang = lang;
    if (lang === "en") return;
    fetch("/localization/"+LANGUAGE_FILES[lang])
        .then(response => response.json())
        .then(data => {
            allDescendants(document.body, e => {
                if (e.innerHTML.trim() in data) {
                    e.innerHTML = data[e.innerHTML.trim()];
                }
            });
        });
}

window.addEventListener("hashchange", updateTab);
updateTab();

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
} else {
    LANG_SELECT.value = "en";
}
