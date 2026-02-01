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

// overlay
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

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
    title.style.fontWeight = "600";
    title.style.marginBottom = "6px";

    if (page.start !== null) {
      title.textContent =
        page.start === page.end
          ? `${page.label} · Стр. ${page.start}`
          : `${page.label} · Стр. ${page.start}–${page.end}`;
    } else {
      title.textContent = page.label;
    }

    const img = document.createElement("img");
    img.dataset.src = page.src;

    const btn = document.createElement("a");
    btn.textContent = "Открыть";
    btn.href = page.src;
    btn.target = "_blank";

    card.append(title, img, btn);
    viewer.append(card);
  });

  lazyLoadImages();
}

//-------------------------------------------------------------
// LAZY LOAD
//-------------------------------------------------------------
function lazyLoadImages() {
  const imgs = document.querySelectorAll("img[data-src]");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        obs.unobserve(e.target);
      }
    });
  });
  imgs.forEach(i => obs.observe(i));
}

//-------------------------------------------------------------
// INDICATOR
//-------------------------------------------------------------
function observePages() {
  const cards = document.querySelectorAll(".page-card");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const start = Number(e.target.dataset.start);
      const end = Number(e.target.dataset.end);

      if (!isNaN(start)) {
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

  pages.forEach(page => {
    const li = document.createElement("li");
    li.textContent =
      page.start !== null
        ? `${page.label} · ${page.start}–${page.end}`
        : page.label;

    li.onclick = () => {
      scrollToPage(page.start ?? page.label);
      closeSidebar();
    };

    thumbList.append(li);
  });
}

//-------------------------------------------------------------
// SEARCH
//-------------------------------------------------------------
function scrollToPage(query) {
  const cards = [...document.querySelectorAll(".page-card")];

  if (!isNaN(query)) {
    const num = Number(query);
    const card = cards.find(c => {
      const s = Number(c.dataset.start);
      const e = Number(c.dataset.end);
      return !isNaN(s) && s <= num && num <= e;
    });
    if (card) return card.scrollIntoView({ behavior: "smooth" });
  }

  const text = String(query).toLowerCase();
  const card = cards.find(c => c.dataset.label.includes(text));
  if (card) card.scrollIntoView({ behavior: "smooth" });
}

//-------------------------------------------------------------
// BUTTONS
//-------------------------------------------------------------
gotoBtn.onclick = () => {
  if (gotoInput.value.trim()) scrollToPage(gotoInput.value.trim());
};

document.getElementById("menuBtn").onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = closeSidebar;

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

//-------------------------------------------------------------
// ZOOM
//-------------------------------------------------------------
document.getElementById("zoomIn").onclick = () => setZoom(scale + 0.1);
document.getElementById("zoomOut").onclick = () => setZoom(scale - 0.1);
document.getElementById("fitWidth").onclick = () => {
  scale = 1;
  viewer.style.transform = "";
};

function setZoom(s) {
  scale = Math.min(Math.max(s, 0.6), 2);
  viewer.style.transform = `scale(${scale})`;
  viewer.style.transformOrigin = "top center";
}

//-------------------------------------------------------------
// THEME
//-------------------------------------------------------------
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};
