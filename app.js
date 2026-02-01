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
  .then(res => res.json())
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

    const btns = document.createElement("div");
    btns.innerHTML = `<a href="${page.src}" target="_blank">Открыть</a>`;

    card.append(title, img, btns);
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
        e.target.removeAttribute("data-src");
        obs.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => obs.observe(img));
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

      if (!isNaN(start) && !isNaN(end)) {
        pageIndicator.textContent =
          start === end ? `Стр. ${start}` : `Стр. ${start}–${end}`;
      } else {
        pageIndicator.textContent = "Вводная часть";
      }
    });
  }, { threshold: 0.6 });

  cards.forEach(card => obs.observe(card));
}

//-------------------------------------------------------------
// SIDEBAR
//-------------------------------------------------------------
function initSidebar() {
  thumbList.innerHTML = "";

  pages.forEach(page => {
    const li = document.createElement("li");

    if (page.start !== null) {
      li.textContent =
        page.start === page.end
          ? `${page.label} · ${page.start}`
          : `${page.label} · ${page.start}–${page.end}`;
    } else {
      li.textContent = page.label;
    }

    li.onclick = () => {
      if (page.start !== null) {
        scrollToPage(String(page.start));
      } else {
        scrollToPage(page.label);
      }
    };

    thumbList.append(li);
  });
}

//-------------------------------------------------------------
// SEARCH (NUMBER + TEXT)
//-------------------------------------------------------------
function scrollToPage(query) {
  const cards = [...document.querySelectorAll(".page-card")];

  if (!isNaN(query)) {
    const num = Number(query);
    const card = cards.find(el => {
      const start = Number(el.dataset.start);
      const end = Number(el.dataset.end);
      if (isNaN(start) || isNaN(end)) return false;
      return start <= num && num <= end;
    });

    if (card) {
      card.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }

  const text = query.toLowerCase();
  const card = cards.find(el => el.dataset.label.includes(text));

  if (card) {
    card.scrollIntoView({ behavior: "smooth" });
  } else {
    alert("Страница не найдена");
  }
}

//-------------------------------------------------------------
// GOTO
//-------------------------------------------------------------
gotoBtn.onclick = () => {
  const value = gotoInput.value.trim();
  if (value) scrollToPage(value);
};

//-------------------------------------------------------------
// ZOOM
//-------------------------------------------------------------
function applyZoom() {
  viewer.style.transform = `scale(${scale})`;
  viewer.style.transformOrigin = "top center";
}

document.getElementById("zoomIn").onclick = () => {
  scale = Math.min(scale + 0.1, 2);
  applyZoom();
};

document.getElementById("zoomOut").onclick = () => {
  scale = Math.max(scale - 0.1, 0.8);
  applyZoom();
};

//-------------------------------------------------------------
// FIT WIDTH
//-------------------------------------------------------------
document.getElementById("fitWidth").onclick = () => {
  scale = 1;
  viewer.style.transform = "scale(1)";
  viewer.style.width = "100%";
};

//-------------------------------------------------------------
// THEME
//-------------------------------------------------------------
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

//-------------------------------------------------------------
// FULLSCREEN
//-------------------------------------------------------------
document.getElementById("fullscreen").onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

//-------------------------------------------------------------
// SIDEBAR TOGGLE
//-------------------------------------------------------------
document.getElementById("menuBtn").onclick = () => {
  sidebar.classList.toggle("open");
};
