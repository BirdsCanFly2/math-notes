//-------------------------------------------------------------
// GLOBALS
//-------------------------------------------------------------
let pages = [];
let scale = 1;

// DOM
const viewer = document.getElementById("viewer");
const pageIndicator = document.getElementById("pageIndicator");
const sidebar = document.getElementById("sidebar");
const thumbList = document.getElementById("thumbList");
const gotoInput = document.getElementById("gotoPage");
const gotoBtn = document.getElementById("gotoBtn");

//-------------------------------------------------------------
// LOAD JSON
//-------------------------------------------------------------
fetch("pages.json")
  .then(r => r.json())
  .then(data => {
    document.getElementById("bookTitle").textContent = data.title;
    pages = data.pages;
    initViewer();
    initSidebar();
    observePages();
  });

//-------------------------------------------------------------
// VIEWER
//-------------------------------------------------------------
function initViewer() {
  viewer.innerHTML = "";

  pages.forEach(page => {
    const card = document.createElement("div");
    card.className = "page-card";
    card.dataset.start = page.start;
    card.dataset.end = page.end;
    card.dataset.label = page.label.toLowerCase();

    const title = document.createElement("div");
    title.className = "page-title";

    if (page.start !== null) {
      title.textContent =
        page.start === page.end
          ? `${page.label} · Стр. ${page.start}`
          : `${page.label} · Стр. ${page.start}–${page.end}`;
    } else {
      title.textContent = page.label;
    }

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = page.src;

    const link = document.createElement("a");
    link.href = page.src;
    link.target = "_blank";
    link.textContent = "Открыть";

    card.append(title, img, link);
    viewer.append(card);
  });
}

//-------------------------------------------------------------
// PAGE INDICATOR
//-------------------------------------------------------------
function observePages() {
  const cards = document.querySelectorAll(".page-card");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const start = Number(e.target.dataset.start);
      const end = Number(e.target.dataset.end);

      if (!isNaN(start) && !isNaN(end)) {
        pageIndicator.textContent =
          start === end ? `Стр. ${start}` : `Стр. ${start}–${end}`;
      } else {
        pageIndicator.textContent = "Вводная часть";
      }
    });
  }, { threshold: 0.6 });

  cards.forEach(c => obs.observe(c));
}

//-------------------------------------------------------------
// SIDEBAR
//-------------------------------------------------------------
function initSidebar() {
  thumbList.innerHTML = "";

  pages.forEach(p => {
    const li = document.createElement("li");
    li.textContent =
      p.start === null
        ? p.label
        : p.start === p.end
        ? `${p.label} · ${p.start}`
        : `${p.label} · ${p.start}–${p.end}`;

    li.onclick = () => scrollToPage(p.start ?? p.label);
    thumbList.append(li);
  });
}

//-------------------------------------------------------------
// SEARCH
//-------------------------------------------------------------
function scrollToPage(query) {
  const cards = [...document.querySelectorAll(".page-card")];

  // number
  if (!isNaN(query)) {
    const num = Number(query);
    const card = cards.find(el => {
      const s = Number(el.dataset.start);
      const e = Number(el.dataset.end);
      return !isNaN(s) && !isNaN(e) && s <= num && num <= e;
    });
    if (card) return card.scrollIntoView({ behavior: "smooth" });
  }

  // text
  const text = query.toLowerCase();
  const card = cards.find(el => el.dataset.label.includes(text));
  if (card) card.scrollIntoView({ behavior: "smooth" });
  else alert("Страница не найдена");
}

gotoBtn.onclick = () => {
  const v = gotoInput.value.trim();
  if (v) scrollToPage(v);
};

//-------------------------------------------------------------
// ZOOM (DESKTOP ONLY)
//-------------------------------------------------------------
const isMobile = window.innerWidth <= 768;

if (!isMobile) {
  document.getElementById("zoomIn").onclick = () => setZoom(scale + 0.1);
  document.getElementById("zoomOut").onclick = () => setZoom(scale - 0.1);
  document.getElementById("fitWidth").onclick = fitWidth;
} else {
  ["zoomIn","zoomOut","fitWidth"].forEach(id =>
    document.getElementById(id).style.display = "none"
  );
}

function setZoom(v) {
  scale = Math.min(Math.max(v, 0.6), 2);
  viewer.style.transform = `scale(${scale})`;
  viewer.style.transformOrigin = "top center";
}

function fitWidth() {
  scale = 1;
  viewer.style.transform = "";
}

//-------------------------------------------------------------
// FULLSCREEN
//-------------------------------------------------------------
document.getElementById("fullscreen").onclick = () => {
  document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
};

//-------------------------------------------------------------
// THEME
//-------------------------------------------------------------
const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light");
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

//-------------------------------------------------------------
// SIDEBAR TOGGLE
//-------------------------------------------------------------
document.getElementById("menuBtn").onclick = () =>
  sidebar.classList.toggle("open");
