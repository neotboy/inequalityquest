// =====================================================================
//  UNIT GAME ENGINE  (used by the online-course day games)
//  One scene at a time, one step at a time, in order. No skipping.
//  Wrong answer = short hint, choices lock for a few seconds, then reshuffle.
//  Progress saves on this device. Turn-in goes through shared/turnin.js.
//
//  A page calls UnitGame.start({...}) with its scenes. Block types:
//    {type:"note",  html}                         - info box
//    {type:"event", id, html, choices:[{label, result, fx:{...}}]}  - a choice with consequences
//    {type:"q", id, prompt, options:[CORRECT, wrong, wrong, wrong], hint, why, label}
//  In "q" blocks the FIRST option is the right one; the screen always shuffles them.
// =====================================================================
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

  window.UnitGame = {
    start(cfg) {
      const LOCK = cfg.lockSeconds || 6;
      const KEY = cfg.key;
      const fresh = () => ({ name: "", scene: -1, step: 0, picks: {}, wrong: {}, done: {}, fx: Object.assign({}, cfg.startFx || {}), writing: {}, turnedIn: false });
      let st;
      try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!st || typeof st !== "object" || !st.picks) st = fresh();
      const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
      let locked = false;

      const allQs = [];
      cfg.scenes.forEach(s => s.blocks.forEach(b => { if (b.type === "q") allQs.push(b); }));
      const app = $("app");

      function hud() {
        const doneN = allQs.filter(q => st.done[q.id]).length;
        if ($("progressText")) $("progressText").textContent = doneN + " of " + allQs.length + " checks done";
        if ($("progressFill")) $("progressFill").style.width = Math.round(doneN / allQs.length * 100) + "%";
        if (cfg.hud) cfg.hud(st);
      }
      function applyFx(fx) { Object.keys(fx || {}).forEach(k => { st.fx[k] = (st.fx[k] || 0) + fx[k]; }); if (cfg.clampFx) cfg.clampFx(st.fx); }

      // ---------- Intro ----------
      function intro() {
        app.innerHTML = `<section class="card intro">${cfg.introHtml}
          <label for="nameBox">Your name: first name + last initial (like Jordan M.)</label>
          <input id="nameBox" maxlength="60" autocomplete="off" placeholder="First name + last initial (like Jordan M.)" value="${esc(st.name)}">
          <p id="introMsg" class="msg" role="status"></p>
          <button type="button" class="go" id="startBtn">${esc(cfg.startLabel || "Start")} →</button></section>`;
        $("startBtn").onclick = () => {
          const fixed = window.classShortName ? window.classShortName($("nameBox").value) : $("nameBox").value.trim();
          if (!/^\S+ [A-Z]\.$/.test(fixed)) { $("introMsg").textContent = "Type your first name and last initial, like Jordan M."; $("introMsg").className = "msg bad"; $("nameBox").focus(); return; }
          st.name = fixed; st.scene = 0; st.step = 0; save(); render(); window.scrollTo(0, 0);
        };
      }

      // ---------- One block ----------
      function blockEl(b, isCurrent) {
        const wrap = document.createElement("div");
        wrap.className = "block " + b.type + (isCurrent ? " current" : " past");
        if (b.type === "note") { wrap.innerHTML = b.html; return wrap; }

        if (b.type === "event") {
          wrap.innerHTML = `<div class="event-body">${b.html}</div>`;
          const pick = st.picks[b.id];
          if (pick != null) {
            const c = b.choices[pick];
            wrap.insertAdjacentHTML("beforeend", `<p class="picked">You chose: <b>${esc(c.label)}</b></p><div class="result">${c.result}</div>`);
            return wrap;
          }
          const row = document.createElement("div"); row.className = "choices";
          b.choices.forEach((c, i) => {
            const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice"; btn.textContent = c.label;
            btn.onclick = () => { st.picks[b.id] = i; applyFx(c.fx); st.step++; save(); render(true); };
            row.appendChild(btn);
          });
          wrap.appendChild(row);
          return wrap;
        }

        // q
        const label = b.label ? `<p class="qlabel">${esc(b.label)}</p>` : "";
        wrap.innerHTML = `${label}<h3>${b.prompt}</h3>`;
        if (st.done[b.id]) {
          wrap.insertAdjacentHTML("beforeend", `<p class="answered">✓ ${esc(b.options[0])}</p><p class="why">${b.why}</p>`);
          return wrap;
        }
        const area = document.createElement("div"); area.className = "choices";
        const fb = document.createElement("p"); fb.className = "msg"; fb.setAttribute("aria-live", "polite");
        function draw() {
          area.replaceChildren();
          shuffle(b.options.map((t, n) => ({ t, n }))).forEach(o => {
            const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice"; btn.textContent = o.t;
            btn.onclick = () => {
              if (locked) return;
              if (o.n === 0) {
                st.done[b.id] = true; if (window.classFirstTry) window.classFirstTry.right(b.id);
                st.step++; save(); render(true);
              } else {
                st.wrong[b.id] = (st.wrong[b.id] || 0) + 1; if (window.classFirstTry) window.classFirstTry.wrong();
                applyFx(cfg.wrongFx); save(); hud();
                locked = true; area.querySelectorAll("button").forEach(x => x.disabled = true);
                let left = LOCK;
                const tick = () => {
                  fb.textContent = "Not quite. " + b.hint + " The choices will mix up. Try again in " + left + "…";
                  fb.className = "msg bad";
                  if (left-- <= 0) { locked = false; fb.textContent = "Not quite. " + b.hint + " Try again."; draw(); return; }
                  setTimeout(tick, 1000);
                };
                tick();
              }
            };
            area.appendChild(btn);
          });
        }
        draw();
        wrap.appendChild(area); wrap.appendChild(fb);
        return wrap;
      }

      // ---------- A scene ----------
      function sceneView(scrollToNew) {
        const s = cfg.scenes[st.scene];
        app.innerHTML = `<section class="card scene"><p class="kicker">${esc(s.kicker || "")}</p><h2>${esc(s.title)}</h2>${s.teach ? `<div class="teach">${s.teach}</div>` : ""}<div id="blocks"></div><div id="sceneEnd"></div></section>`;
        const box = $("blocks");
        const shown = Math.min(st.step, s.blocks.length - 1);
        // notes auto-advance; show everything up to the current step
        for (let i = 0; i <= shown; i++) box.appendChild(blockEl(s.blocks[i], i === st.step));
        // auto-advance past a note
        if (st.step < s.blocks.length && s.blocks[st.step].type === "note") {
          const btn = document.createElement("button"); btn.type = "button"; btn.className = "go"; btn.textContent = "Got it →";
          btn.onclick = () => { st.step++; save(); render(true); };
          box.appendChild(btn);
        }
        if (st.step >= s.blocks.length) {
          const last = st.scene === cfg.scenes.length - 1;
          const btn = document.createElement("button"); btn.type = "button"; btn.className = "go"; btn.textContent = last ? "Finish →" : "Next: " + cfg.scenes[st.scene + 1].title + " →";
          btn.onclick = () => { st.scene = last ? cfg.scenes.length : st.scene + 1; st.step = 0; save(); render(); window.scrollTo(0, 0); };
          $("sceneEnd").appendChild(btn);
        }
        if (scrollToNew) {
          const cur = app.querySelector(".block.current") || $("sceneEnd").firstChild;
          if (cur && cur.scrollIntoView) cur.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      // ---------- Finish + turn in ----------
      function finish() {
        const prompts = cfg.finale.prompts;
        app.innerHTML = `<section class="card finale"><p class="kicker">Last step</p><h2>${esc(cfg.finale.title)}</h2>${cfg.finale.report ? cfg.finale.report(st) : ""}
          ${prompts.map(p => `<label for="w_${p.id}">${p.label}</label><p class="stem">${esc(p.stem)}</p><textarea id="w_${p.id}" rows="3">${esc(st.writing[p.id] || "")}</textarea>`).join("")}
          <button type="button" class="go" id="sendBtn">${st.turnedIn ? "Turn in again" : "Turn in"}</button>
          <p id="sendMsg" class="msg" role="status" aria-live="polite">${st.turnedIn ? "You already turned this in. You can fix your writing and turn it in again." : ""}</p></section>`;
        prompts.forEach(p => { $("w_" + p.id).addEventListener("input", e => { st.writing[p.id] = e.target.value; save(); }); });
        $("sendBtn").onclick = async () => {
          const msg = $("sendMsg");
          for (const p of prompts) {
            const v = ($("w_" + p.id).value || "").trim();
            if (v.length < (p.min || 40)) { msg.textContent = "Write a little more for: " + p.short + " (1–2 full sentences)."; msg.className = "msg bad"; $("w_" + p.id).focus(); return; }
            if (/_{2,}/.test(v)) { msg.textContent = "Fill in the blanks with your own words for: " + p.short + "."; msg.className = "msg bad"; $("w_" + p.id).focus(); return; }
            const stemWords = new Set(String(p.stem || "").toLowerCase().match(/[a-z']+/g) || []);
            const fresh = new Set((v.toLowerCase().match(/[a-z']{3,}/g) || []).filter(w => !stemWords.has(w)));
            if (fresh.size < (p.newWords || 6)) { msg.textContent = "Add more of your own ideas for: " + p.short + ". Use details from today."; msg.className = "msg bad"; $("w_" + p.id).focus(); return; }
            const groups = p.mustAll || (p.mustInclude ? [p.mustInclude] : []);
            if (groups.some(g => !g.some(w => new RegExp("\\b" + w, "i").test(v)))) { msg.textContent = p.mustMsg; msg.className = "msg bad"; $("w_" + p.id).focus(); return; }
          }
          const answers = { "Standard": cfg.standard };
          const right = allQs.filter(q => !st.wrong[q.id]).length;
          answers["First-try correct"] = right + " of " + allQs.length;
          const byStd = {};
          allQs.forEach(q => { if (!q.std) return; byStd[q.std] = byStd[q.std] || [0, 0]; byStd[q.std][1]++; if (!st.wrong[q.id]) byStd[q.std][0]++; });
          if (Object.keys(byStd).length) answers["First-try by standard"] = Object.keys(byStd).sort().map(k => k + ": " + byStd[k][0] + " of " + byStd[k][1]).join(" · ");
          prompts.forEach(p => { answers["Writing: " + p.short] = ($("w_" + p.id).value || "").trim(); });
          cfg.scenes.forEach(s => s.blocks.forEach(b => {
            if (b.type === "event" && st.picks[b.id] != null) answers["Choice · " + (b.short || b.id)] = b.choices[st.picks[b.id]].label;
            if (b.type === "q") answers[(b.short || b.id)] = b.options[0] + (st.wrong[b.id] ? " (after " + st.wrong[b.id] + " wrong " + (st.wrong[b.id] === 1 ? "try" : "tries") + ")" : " (first try)");
          }));
          if (cfg.extraAnswers) Object.assign(answers, cfg.extraAnswers(st));
          $("sendBtn").disabled = true; msg.textContent = "Sending your work…"; msg.className = "msg";
          try {
            const res = await window.classTurnIn(cfg.oldApi, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentName: st.name, assignmentId: cfg.assignmentId, assignmentTitle: cfg.title, answers }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Your work did not save. Try again.");
            st.turnedIn = true; save();
            msg.textContent = "Turned in! Your teacher can see your work. You're done."; msg.className = "msg good";
            $("sendBtn").textContent = "Turned in ✓";
          } catch (err) { msg.textContent = err.message || "Could not turn in. Try again."; msg.className = "msg bad"; $("sendBtn").disabled = false; }
        };
      }

      let firstRender = true;
      function render(scrollToNew) {
        if (!firstRender && $("welcome")) $("welcome").hidden = true;
        firstRender = false;
        hud();
        if (st.scene < 0) return intro();
        if (st.scene >= cfg.scenes.length) return finish();
        sceneView(scrollToNew);
      }

      if ($("restartBtn")) $("restartBtn").onclick = () => {
        if (!confirm("Start over? This clears your work on this device.")) return;
        const name = st.name; st = fresh(); st.name = name;
        if (window.classFirstTry) window.classFirstTry.reset();
        save(); render(); window.scrollTo(0, 0);
      };
      if (st.scene >= 0 && $("welcome")) { $("welcome").textContent = "Welcome back, " + st.name + " — you're right where you left off."; $("welcome").hidden = false; }
      render();
    }
  };
})();
