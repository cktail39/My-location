const view = document.getElementById("view");
const search = document.getElementById("search");
let posts = [];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function load() {
  try {
    const r = await fetch("posts.json", { cache: "no-store" });
    posts = await r.json();
  } catch (e) {
    view.innerHTML = '<p class="msg">تعذّر تحميل التدوينات.</p>';
    return;
  }
  route();
}

function renderList(q = "") {
  const list = posts.filter(p =>
    (p.title + " " + p.text + " " + (p.tag || "")).includes(q));
  if (!list.length) { view.innerHTML = '<p class="msg">لا توجد نتائج.</p>'; return; }
  view.innerHTML = list.map(p => `
    <a class="card" href="#post-${esc(p.id)}">
      <h2>${esc(p.title)}</h2>
      <span class="date">${esc(p.date)}</span>
      ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
      <p>${esc(p.text).slice(0, 110)}...</p>
    </a>`).join("");
}

function renderPost(id) {
  const p = posts.find(x => String(x.id) === id);
  if (!p) { view.innerHTML = '<p class="msg">التدوينة غير موجودة.</p>'; return; }
  document.title = p.title + " - مدونتي";
  view.innerHTML = `
    <a class="back" href="#">→ الرئيسية</a>
    <article>
      <h1>${esc(p.title)}</h1>
      <span class="date">${esc(p.date)}</span>
      ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
      ${esc(p.text).split("\n").map(t => `<p>${t}</p>`).join("")}
    </article>`;
  window.scrollTo(0, 0);
}

function route() {
  const h = location.hash;
  if (h.startsWith("#post-")) renderPost(h.slice(6));
  else { document.title = "مدونتي"; renderList(search.value.trim()); }
}

search.addEventListener("input", () => {
  if (location.hash) location.hash = "";
  renderList(search.value.trim());
});
window.addEventListener("hashchange", route);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
load();
