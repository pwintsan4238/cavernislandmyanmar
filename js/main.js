/* ============================================================
   SETTINGS — edit these
   ============================================================ */
const CONFIG = {
  email: "cavernislandresort@gmail.com",
  // WhatsApp / Viber number in international format, digits only (no +).
  // Change this if bookings should go to a different phone.
  whatsapp: "959790746969",
  viber: "959790746969",
  // Optional: paste a form endpoint (e.g. https://formspree.io/f/xxxxxx) so requests
  // are delivered straight to your inbox. Leave empty to let guests send by Email / WhatsApp / Viber.
  formEndpoint: ""
};

/* ============================================================ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};

/* ---------------- i18n ---------------- */
const LANG_LABEL = { en:"EN", my:"MY", th:"TH", zh:"中文" };
let lang = "en";
const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";

function applyLang(next){
  lang = I18N[next] ? next : "en";
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(el => { const v = t(el.dataset.i18n); if (v) el.textContent = v; });
  $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $("#langCurrent").textContent = LANG_LABEL[lang];
  $$(".lang-list button").forEach(b => b.setAttribute("aria-selected", b.dataset.lang === lang));
  store.set("cir-lang", lang);
  if (!$("#bookDone").hidden) $("#doneMsg").textContent = t(doneState);
  renderCaption();
}

const langBox = $("#lang");
$("#langBtn").addEventListener("click", e => {
  e.stopPropagation();
  const open = langBox.classList.toggle("open");
  $("#langBtn").setAttribute("aria-expanded", open);
});
$$(".lang-list button").forEach(b => b.addEventListener("click", () => {
  applyLang(b.dataset.lang);
  langBox.classList.remove("open");
}));
document.addEventListener("click", () => langBox.classList.remove("open"));

/* ---------------- header + menu ---------------- */
const header = $(".site-header");
const mobileBook = $(".mobile-book");
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 60);
  const bookTop = $("#book").getBoundingClientRect().top;
  mobileBook.classList.toggle("show", y > window.innerHeight * .8 && bookTop > window.innerHeight);
};
window.addEventListener("scroll", onScroll, { passive:true });

const menuBtn = $("#menuBtn");
const toggleMenu = (force) => {
  const open = document.body.classList.toggle("menu-open", force);
  menuBtn.setAttribute("aria-expanded", open);
  $("#menu").setAttribute("aria-hidden", !open);
  $("[data-i18n='nav.menu']", menuBtn).textContent = t(open ? "nav.close" : "nav.menu") || (open ? "Close" : "Menu");
};
menuBtn.addEventListener("click", () => toggleMenu());
$$("#menu a").forEach((a, i) => { a.style.setProperty("--i", i); a.addEventListener("click", () => toggleMenu(false)); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { toggleMenu(false); closeLB(); } });

/* ---------------- hero slideshow ---------------- */
const slides = $$(".slide");
const SLIDE_MS = 6500;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let si = 0, slideTimer = null;
const pad = n => String(n).padStart(2, "0");
$("#heroTotal").textContent = pad(slides.length);
document.documentElement.style.setProperty("--slide-ms", SLIDE_MS + "ms");

function renderCaption(){
  $("#heroIdx").textContent = pad(si + 1);
  $("#heroCaption").textContent = t(slides[si].dataset.caption);
}
function restartBar(){
  const bar = $("#heroBar");
  bar.classList.remove("run"); void bar.offsetWidth;
  if (!reduceMotion) bar.classList.add("run");
}
function goTo(i){
  slides[si].classList.remove("is-active");
  si = (i + slides.length) % slides.length;
  slides[si].classList.add("is-active");
  const cap = $("#heroCaption");
  cap.classList.add("fade");
  setTimeout(() => { renderCaption(); cap.classList.remove("fade"); }, 250);
  startTimer();
}
function startTimer(){
  clearTimeout(slideTimer);
  restartBar();
  if (!reduceMotion) slideTimer = setTimeout(() => goTo(si + 1), SLIDE_MS);
}
$("#heroNext").addEventListener("click", () => goTo(si + 1));
$("#heroPrev").addEventListener("click", () => goTo(si - 1));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearTimeout(slideTimer); else startTimer();
});

/* ---------------- FAQ: one open at a time + photo crossfade ---------------- */
const faqItems = $$("#faqList details");
const faqImgs = $$("#faqMedia img");
faqItems.forEach(d => d.addEventListener("toggle", () => {
  if (!d.open) return;
  faqItems.forEach(o => { if (o !== d) o.open = false; });
  faqImgs.forEach((img, i) => img.classList.toggle("is-active", i === +d.dataset.img));
}));

/* ---------------- reveal on scroll ---------------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold:.12, rootMargin:"0px 0px -40px 0px" });
$$(".reveal").forEach(el => io.observe(el));

/* ---------------- panorama parallax ---------------- */
const pano = $(".pano-img");
const panoWrap = $(".pano");
window.addEventListener("scroll", () => {
  const r = panoWrap.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  const p = (innerHeight - r.top) / (innerHeight + r.height);
  pano.style.transform = `translateY(${-p * 23}%)`;
}, { passive:true });

/* ---------------- experiences carousel ---------------- */
const track = $("#expTrack");
const step = () => track.querySelector(".exp").offsetWidth + 24;
$("#expNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior:"smooth" }));
$("#expPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior:"smooth" }));
let drag = null;
track.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; drag = { x:e.clientX, s:track.scrollLeft }; track.classList.add("dragging"); });
window.addEventListener("pointermove", e => { if (drag) track.scrollLeft = drag.s - (e.clientX - drag.x); });
window.addEventListener("pointerup", () => { drag = null; track.classList.remove("dragging"); });

/* ---------------- lightbox ---------------- */
const lb = $("#lightbox"), lbImg = $("#lbImg");
const gal = $$("#masonry a");
let gi = 0;
const showLB = i => { gi = (i + gal.length) % gal.length; lbImg.src = gal[gi].href; lbImg.alt = $("img", gal[gi]).alt; lb.hidden = false; document.body.style.overflow = "hidden"; };
function closeLB(){ lb.hidden = true; document.body.style.overflow = ""; }
gal.forEach((a, i) => a.addEventListener("click", e => { e.preventDefault(); showLB(i); }));
$("#lbClose").addEventListener("click", closeLB);
$("#lbPrev").addEventListener("click", () => showLB(gi - 1));
$("#lbNext").addEventListener("click", () => showLB(gi + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "ArrowRight") showLB(gi + 1);
  if (e.key === "ArrowLeft") showLB(gi - 1);
});

/* ---------------- booking ---------------- */
const form = $("#bookForm");
const err = $("#formError");
const ROOM_EN = {
  "No preference":"No preference",
  hilltop:"Premium Room I · Hilltop Sea View",
  seaview:"Premium Room II · Sea View",
  forest:"Private Room · Forest Villa",
  oceanfront:"Oceanfront Room · Andaman View"
};
let doneState = "done.choose";

// message character counter
form.message.addEventListener("input", () => { $("#charCount").textContent = form.message.value.length; });

// "Enquire" links preselect the room
$$("[data-room]").forEach(a => a.addEventListener("click", () => { $("#roomSelect").value = a.dataset.room; }));

// date limits
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const today = iso(new Date());
form.checkin.min = today;
form.checkout.min = today;
form.checkin.addEventListener("change", () => {
  if (!form.checkin.value) return;
  const next = new Date(form.checkin.value); next.setDate(next.getDate() + 1);
  form.checkout.min = iso(next);
  if (!form.checkout.value || form.checkout.value <= form.checkin.value) form.checkout.value = iso(next);
});

function nights(a, b){ return Math.round((new Date(b) - new Date(a)) / 864e5); }

function buildSummary(d){
  return [
    "BOOKING REQUEST — The Cavern Island Resort",
    "",
    `Name: ${d.name}`,
    `Country of residence: ${d.country}`,
    `Phone: ${d.phone}`,
    d.email ? `Email: ${d.email}` : null,
    `Preferred contact: ${d.contactVia}`,
    "",
    `Check-in: ${d.checkin}`,
    `Check-out: ${d.checkout} (${nights(d.checkin, d.checkout)} night${nights(d.checkin, d.checkout) > 1 ? "s" : ""})`,
    `Guests: ${d.adults} adult(s), ${d.children || 0} child(ren)`,
    `Room: ${ROOM_EN[d.room] || d.room}`,
    `Boat transfer from Kawthaung: ${d.transfer ? "Yes" : "No"}`,
    d.message ? `\nSpecial requests:\n${d.message}` : null,
    "",
    `Website language: ${lang.toUpperCase()}`
  ].filter(l => l !== null).join("\n");
}

function setInvalid(names){
  $$(".field", form).forEach(f => f.classList.remove("invalid"));
  names.forEach(n => form[n] && form[n].closest(".field").classList.add("invalid"));
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  err.textContent = "";
  const d = Object.fromEntries(new FormData(form).entries());
  d.transfer = form.transfer.checked;
  Object.keys(d).forEach(k => { if (typeof d[k] === "string") d[k] = d[k].trim(); });
  d.name = [d.firstName, d.lastName].filter(Boolean).join(" ");

  const missing = ["firstName", "phone", "country", "checkin", "checkout"].filter(k => !d[k]);
  if (missing.length){ setInvalid(missing); err.textContent = t("err.required"); return; }
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)){ setInvalid(["email"]); err.textContent = t("err.email"); return; }
  if (d.checkout <= d.checkin){ setInvalid(["checkout"]); err.textContent = t("err.dates"); return; }
  setInvalid([]);

  const summary = buildSummary(d);
  const subject = `Booking request – ${d.name} – ${d.checkin} to ${d.checkout}`;
  $("#summary").textContent = summary;
  $("#sendEmail").href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
  $("#sendWA").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(summary)}`;
  $("#sendViber").href = `viber://chat?number=%2B${CONFIG.viber}`;

  let sent = false;
  if (CONFIG.formEndpoint){
    const btn = $("#submitBtn");
    btn.disabled = true; btn.textContent = t("form.sending");
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ ...d, _subject: subject, summary })
      });
      sent = res.ok;
    } catch(_) { sent = false; }
    btn.disabled = false; btn.textContent = t("form.submit");
  }

  doneState = sent ? "done.sent" : (CONFIG.formEndpoint ? "err.send" : "done.choose");
  $("#doneMsg").textContent = t(doneState);
  $("#doneActions").hidden = sent;
  form.hidden = true;
  $("#bookDone").hidden = false;
  $("#book").scrollIntoView({ behavior:"smooth", block:"start" });
});

// Viber can't prefill a message to a number, so copy the text first
$("#sendViber").addEventListener("click", () => copySummary());
$("#copyBtn").addEventListener("click", () => copySummary(true));
async function copySummary(flash){
  const text = $("#summary").textContent;
  try { await navigator.clipboard.writeText(text); }
  catch(_) {
    const r = document.createRange(); r.selectNodeContents($("#summary"));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    try { document.execCommand("copy"); } catch(e){}
  }
  if (flash){
    const b = $("#copyBtn"); b.textContent = t("done.copied");
    setTimeout(() => b.textContent = t("done.copy"), 1800);
  }
}

$("#againBtn").addEventListener("click", () => {
  form.reset();
  $("#charCount").textContent = "0";
  form.hidden = false;
  $("#bookDone").hidden = true;
});

/* ---------------- init ---------------- */
$("#year").textContent = new Date().getFullYear();
const urlLang = new URLSearchParams(location.search).get("lang");
applyLang(urlLang || store.get("cir-lang") || "en");
onScroll();
startTimer();
