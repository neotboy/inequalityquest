// =====================================================================
//  WHERE STUDENT WORK GOES
//  Every activity that turns in work uses this one file.
//
//  Paste your Google Apps Script web-app address between the quotes.
//  It looks like: https://script.google.com/macros/s/AKfy.../exec
//  While it is empty, work keeps going to the old site, so nothing breaks.
// =====================================================================
const GOOGLE_SAVER_URL = "https://script.google.com/macros/s/AKfycbwWV93yudtLuny7OwiCluP5nyF7OZ4lJ5c7RBD1vDTYl_ezOYFAXx00XJLctKTdzZmENw/exec";

(function () {
  "use strict";

  // --- Names: first name + last initial, like "Jordan M." -------------
  function shortName(raw) {
    const words = String(raw || "").replace(/[^\p{L}\p{M}'.\- ]/gu, " ").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
    const first = cap(words[0].replace(/\.+$/, ""));
    if (words.length === 1) return first;
    const last = words[words.length - 1].replace(/[^\p{L}]/gu, "");
    return last ? first + " " + last.charAt(0).toUpperCase() + "." : first;
  }
  window.classShortName = shortName;

  const NAME_HELP = "Type your first name and last initial, like Jordan M.";

  function fakeResponse(status, data) {
    return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  }

  // Some older activities did not include an id; fill it in from the address.
  function fillMissingId(url, body) {
    if (body.assignmentId) return;
    if (/sociology-theory-showdown/.test(url)) {
      body.assignmentId = /video-progress/.test(url) ? "sociology-theory-casebook-video" : "sociology-theory-casebook";
      if (/video-progress/.test(url)) body.kind = "progress";
    }
  }


  // --- First-try score -----------------------------------------------------------
  // Pages call classFirstTry.wrong() on a miss and classFirstTry.right("item-id") when a
  // question is answered correctly. Each item counts once, even after a refresh.
  // classTurnIn() then adds "First-try correct: X of Y" to the turn-in automatically.
  window.classFirstTry = (function () {
    const key = "firsttry:" + location.pathname;
    let st;
    try { st = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    if (!st || typeof st !== "object" || !st.done) st = { done: {}, miss: false };
    const save = () => { try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {} };
    return {
      wrong() { st.miss = true; save(); },
      right(id) { id = String(id); if (!(id in st.done)) st.done[id] = !st.miss; st.miss = false; save(); },
      count() { const v = Object.values(st.done); return { right: v.filter(Boolean).length, total: v.length }; },
      text() { const c = this.count(); return c.right + " of " + c.total; },
      reset() { st = { done: {}, miss: false }; save(); }
    };
  })();

  // Activities call classTurnIn(oldAddress, fetchOptions) instead of fetch().
  window.classTurnIn = async function (oldUrl, options) {
    let body;
    try { body = JSON.parse(options && options.body || "{}"); } catch (e) { body = {}; }

    // Add the first-try score (second, right after the standard) if the page tracked one.
    if (body.answers && typeof body.answers === "object" && !Array.isArray(body.answers) && !("First-try correct" in body.answers)) {
      const c = window.classFirstTry.count();
      if (c.total) {
        const out = {};
        if ("Standard" in body.answers) out.Standard = body.answers.Standard;
        out["First-try correct"] = c.right + " of " + c.total;
        Object.keys(body.answers).forEach(k => { if (!(k in out)) out[k] = body.answers[k]; });
        body.answers = out;
      }
    }

    const name = shortName(body.studentName);
    if (!name || !/ [A-Z]\.$/.test(name)) return fakeResponse(400, { error: NAME_HELP });
    body.studentName = name;

    // Old site: same as before, just with the shorter name.
    if (!GOOGLE_SAVER_URL) {
      const res = await fetch(oldUrl, Object.assign({}, options, { body: JSON.stringify(body) }));
      if (res.status === 400) {
        const data = await res.clone().json().catch(() => ({}));
        // The old site only knows older activities. Say so plainly instead of "Unknown assignment."
        if (/unknown assignment/i.test(data.error || "")) {
          return fakeResponse(400, { error: "Turn-in for this activity isn't switched on yet. Keep this page open and tell your teacher." });
        }
      }
      return res;
    }

    // Google Sheet saver.
    fillMissingId(oldUrl, body);
    const meta = (window.CLASS_ASSIGNMENTS || {})[body.assignmentId];
    body.action = "submit";
    body.course = window.classCourseFor ? window.classCourseFor(body.assignmentId) : "";
    if (!body.assignmentTitle && meta) body.assignmentTitle = meta.title;
    body.page = location.pathname;

    try {
      const res = await fetch(GOOGLE_SAVER_URL, {
        method: "POST",
        // text/plain keeps the browser from blocking the request to Google.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
        redirect: "follow"
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.ok) return fakeResponse(200, data);
      return fakeResponse(400, { error: (data && data.error) || "Your work did not save. Try again." });
    } catch (e) {
      return fakeResponse(503, { error: "Could not reach the turn-in system. Check your internet and try again." });
    }
  };

  // --- Make name boxes ask for first name + last initial ---------------
  function fixNameBoxes() {
    document.querySelectorAll("input").forEach(input => {
      const tag = (input.id + " " + input.name + " " + (input.placeholder || "")).toLowerCase();
      if (!/student.?name|your name|^name | name$|first and last/.test(tag) && input.id.toLowerCase() !== "name") return;
      if (input.type && !/text|search/.test(input.type)) return;
      input.placeholder = "First name + last initial (like Jordan M.)";
      input.setAttribute("autocomplete", "off");
      input.addEventListener("blur", () => {
        const fixed = shortName(input.value);
        if (fixed && fixed !== input.value) {
          input.value = fixed;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });
  }

  // --- Outside pictures that don't load (blocked by a school filter, site down) ----
  // Show a short note with a link instead of a broken-image icon.
  function isOutside(img) {
    try { return img.currentSrc || img.src ? new URL(img.currentSrc || img.src, location.href).origin !== location.origin : false; }
    catch (e) { return false; }
  }
  function noteFor(img) {
    let note = img.nextElementSibling;
    if (note && note.classList.contains("img-fallback")) return note;
    note = document.createElement("p");
    note.className = "img-fallback";
    note.setAttribute("role", "note");
    note.style.cssText = "margin:8px 0;padding:10px 12px;border:2px dashed #b9ad97;border-radius:10px;background:#fffdf8;color:#22313b;font:600 .95rem/1.4 system-ui,Segoe UI,Arial,sans-serif;text-align:left";
    img.insertAdjacentElement("afterend", note);
    return note;
  }
  function showFallback(img) {
    if (!(img instanceof HTMLImageElement) || !isOutside(img)) return;
    const src = img.currentSrc || img.src, note = noteFor(img);
    note.textContent = "Picture didn't load" + (img.alt ? " (" + img.alt.slice(0, 90) + ")" : "") + ". ";
    const a = document.createElement("a");
    a.href = src; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open it here ↗";
    note.appendChild(a);
    img.dataset.fallbackHidden = "1";
    img.style.display = "none";
    note.hidden = false;
  }
  document.addEventListener("error", e => { if (e.target && e.target.tagName === "IMG") showFallback(e.target); }, true);
  document.addEventListener("load", e => {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fallbackHidden !== "1") return;
    img.style.display = ""; delete img.dataset.fallbackHidden;
    const note = img.nextElementSibling;
    if (note && note.classList.contains("img-fallback")) note.hidden = true;
  }, true);
  // Same idea when an image's address changes later and it was hidden before.
  function checkAll() { document.querySelectorAll("img").forEach(img => { if (img.complete && img.src && !img.naturalWidth) showFallback(img); }); }
  if (document.readyState === "complete") checkAll(); else window.addEventListener("load", checkAll);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixNameBoxes);
  else fixNameBoxes();
})();
