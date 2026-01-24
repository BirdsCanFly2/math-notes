//-------------------------------------------------------------
// GLOBALS
//-------------------------------------------------------------
let pages = [];
let scale = 1;
let currentPage = 1;

// DOM elements
const viewer = document.getElementById("viewer");
const pageIndicator = document.getElementById("pageIndicator");
const sidebar = document.getElementById("sidebar");
const thumbList = document.getElementById("thumbList");

//-------------------------------------------------------------
// LOAD PAGES.JSON
//-------------------------------------------------------------
fetch("pages.json")
    .then(res => res.json())
    .then(data => {
        document.getElementById("bookTitle").textContent = data.title;

        pages = data.pages;
        initViewer();
        initSidebar();
        observePages();
    });

//-------------------------------------------------------------
// BUILD PAGE VIEW
//-------------------------------------------------------------
function initViewer() {
    viewer.innerHTML = "";

    pages.forEach((src, index) => {
        const card = document.createElement("div");
        card.className = "page-card";
        card.id = "page-" + (index + 1);

        const num = document.createElement("div");
        num.textContent = "Страница " + (index + 1);

        const img = document.createElement("img");
        img.dataset.src = src;   // lazy loading

        const btns = document.createElement("div");
        btns.innerHTML = `<a href="${src}" target="_blank">Открыть</a>`;

        card.append(num, img, btns);
        viewer.append(card);
    });

    lazyLoadImages();
    updateIndicator(1);
}

//-------------------------------------------------------------
// LAZY LOADING
//-------------------------------------------------------------
function lazyLoadImages() {
    const imgs = document.querySelectorAll("img[data-src]");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.src = e.target.dataset.src;
                e.target.removeAttribute("data-src");
                obs.unobserve(e.target);
            }
        });
    });

    imgs.forEach(img => observer.observe(img));
}

//-------------------------------------------------------------
// PAGE OBSERVER → update current page indicator
//-------------------------------------------------------------
function observePages() {
    const cards = document.querySelectorAll(".page-card");

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                currentPage = Number(e.target.id.split("-")[1]);
                updateIndicator(currentPage);
            }
        });
    }, { threshold: 0.6 });

    cards.forEach(card => obs.observe(card));
}

function updateIndicator(n) {
    pageIndicator.textContent = `Стр. ${n} / ${pages.length}`;
}

//-------------------------------------------------------------
// SIDEBAR (thumbnails)
//-------------------------------------------------------------
function initSidebar() {
    thumbList.innerHTML = "";

    pages.forEach((src, i) => {
        const li = document.createElement("li");
        li.textContent = "Страница " + (i + 1);
        li.onclick = () => scrollToPage(i + 1);
        thumbList.append(li);
    });
}

//-------------------------------------------------------------
// GOTO PAGE
//-------------------------------------------------------------
function scrollToPage(n) {
    const el = document.getElementById("page-" + n);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

//-------------------------------------------------------------
// ZOOM + FIT WIDTH
//-------------------------------------------------------------
document.getElementById("zoomIn").onclick = () => setZoom(scale + 0.1);
document.getElementById("zoomOut").onclick = () => setZoom(scale - 0.1);
document.getElementById("fitWidth").onclick = fitWidth;

function setZoom(s) {
    scale = Math.min(Math.max(s, 0.5), 2);
    viewer.style.transform = `scale(${scale})`;
    viewer.style.transformOrigin = "top center";
}

function fitWidth() {
    viewer.style.transform = "";
    scale = 1;
}

//-------------------------------------------------------------
// FULLSCREEN
//-------------------------------------------------------------
document.getElementById("fullscreen").onclick = () => {
    if (!document.fullscreenElement)
        document.documentElement.requestFullscreen();
    else
        document.exitFullscreen();
};

//-------------------------------------------------------------
// THEME
//-------------------------------------------------------------
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

//-------------------------------------------------------------
// SIDEBAR TOGGLE
//-------------------------------------------------------------
document.getElementById("menuBtn").onclick = () => {
    sidebar.classList.toggle("open");
};

//-------------------------------------------------------------
// GOTO BUTTON
//-------------------------------------------------------------
document.getElementById("gotoBtn").onclick = () => {
    const n = Number(document.getElementById("gotoPage").value);
    if (n >= 1 && n <= pages.length) scrollToPage(n);
};
