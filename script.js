const TABS = document.getElementsByClassName("my-tab");
const TAB_LINKS = document.getElementsByClassName("tab-link")

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

for (let l of TAB_LINKS) {
    l.addEventListener("click", () => openTab(l.id.split("-")[1]));
}

if (window.location.hash) {
    openTab(window.location.hash.substring(1));
} else {
    openTab("home");
}
