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

function updateDates(lang) {
    document.querySelectorAll('.localdate').forEach(e => e.remove());
    for (let d of document.getElementsByClassName("date")) {
        let d2 = document.createElement("span");
        d2.innerText = new Date(d.innerHTML).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        d2.className = "localdate";
        d.parentElement.insertBefore(d2, d);
    }
}

function translate(lang, target=document.body, do_gallery=true) {
    LANG_SELECT.value = lang;
    updateDates(lang);
    document.getElementsByTagName("html")[0].lang = lang;
    if (lang === "en") {
        if (do_gallery) makeGallery();
        return;
    }
    fetch("/localization/"+LANGUAGE_FILES[lang])
        .then(response => response.json())
        .then(data => {
            if (do_gallery) makeGallery(data);
            allDescendants(target, e => {
                if (e.innerHTML.trim() in data) {
                    e.innerHTML = data[e.innerHTML.trim()];
                    e.dataset.translated = "true"
                }
            });
        });
}

function autoTranslate(target=document.body, do_gallery=true) {
    if (localStorage.getItem("lang") != null) {
        translate(localStorage.getItem("lang"), target, do_gallery);
    } else if (navigator.language in LANGUAGE_FILES) {
        translate(navigator.language, target, do_gallery);
    } else {
        LANG_SELECT.value = "en";
        updateDates("en");
        if (do_gallery) makeGallery();
    }
}

function makeGallery(lang_data={}) {
    let origdata = JSON.parse(gallery_json);
    let galleriesContainer = document.getElementById("galleries")
    galleriesContainer.innerText = "";
    for (let g_data of origdata["dataSource"]) {
        let card = document.createElement("div");
        card.className = "card my-card";
        let name = document.createElement("h2");
        name.innerText = g_data["name"];
        let galleryContainer = document.createElement("div");
        galleryContainer.style.height = "500px";

        card.appendChild(name);
        card.appendChild(galleryContainer);
        galleriesContainer.appendChild(card);

        data = {...origdata}
        data["dataSource"] = g_data["data"];
        for (let i = 0; i < data["dataSource"].length; i++) {
            let img = data["dataSource"][i]["image"]
            if (img) {
                data["dataSource"][i]["image"] = data["image_folder"] + img;
                data["dataSource"][i]["thumb"] = data["thumbnail_folder"] + img;
            }
            for (let key of ["title", "description"]) {
                if (data["dataSource"][i][key] in lang_data) {
                    data["dataSource"][i][key] = lang_data[data["dataSource"][i][key]];
                }
            }
        }
        Galleria.run(galleryContainer, data);
    }
}

function choose(choices) {
    let index = Math.floor(Math.random() * choices.length);
    return choices[index];
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
});
autoTranslate(document.body, false);

let gallery_json = "";
Galleria.loadTheme("https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/themes/folio/galleria.folio.min.js");
fetch("/gallery.json")
    .then(response => response.text())
    .then(data => {
        gallery_json = data
        autoTranslate();
    });

fetch("/lnx.txt")
    .then(response => response.text())
    .then(data => {
        let acronym = []
        for (let words of data.split("\n\n")) {
            let list = words.split("\n").map(e => e.trim());
            acronym.push(choose(list));
        }
        document.querySelectorAll('.acronym').forEach(e => e.innerText = acronym.join(" "))
    });
