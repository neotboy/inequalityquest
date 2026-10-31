// =====================================================================
//  CLASS ARENA  (live class leaderboard + head-to-head moves)
//  Lets classmates playing the same game at the same time see each other
//  and send moves (like "steal" or "attack ad") to each other.
//
//  Uses the same Google Apps Script as turn-ins (GOOGLE_SAVER_URL in turnin.js).
//  If the script hasn't been updated yet, Arena runs in "offline" mode:
//  Arena.live stays false and games should use computer rivals instead.
//
//  Use:
//    Arena.join({ game: "gov-unit2-day2-signal-break", name: "Jordan M.", room: "",   // room optional
//                 onBoard: (players, live) => {...},   // players: [{name, score, stage, extra, me}]
//                 onEvent: ev => {...} })              // ev: {from, kind, data, t}
//    Arena.update({ score: 12000, stage: "Round 3", extra: { credibility: 70 } })
//    Arena.send("Sam R.", "steal", { amount: 3000 })
//    Arena.players()  -> latest board,  Arena.live -> true when connected
// =====================================================================
(function () {
  "use strict";
  const POLL_MS = 7000;
  const url = () => { try { return typeof GOOGLE_SAVER_URL === "string" ? GOOGLE_SAVER_URL : ""; } catch (e) { return ""; } };
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const clean = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);

  let cfg = null, timer = null, since = 0, board = [], pending = null, lastPost = 0, failures = 0;
  const A = window.Arena = {
    live: false,
    players: () => board.slice(),
    room: () => cfg ? cfg.room : "",
    join(c) {
      cfg = Object.assign({ onBoard() {}, onEvent() {} }, c);
      cfg.room = today() + (clean(c.room) ? "-" + clean(c.room) : "");
      cfg.me = { score: 0, stage: "", extra: {} };
      if (!url()) { A.live = false; cfg.onBoard([], false); return A; }
      tick(true);
      return A;
    },
    update(state) {
      if (!cfg) return;
      Object.assign(cfg.me, state || {});
      pending = true;
      if (Date.now() - lastPost > 2500) tick(false);
    },
    send(to, kind, data) {
      if (!cfg || !A.live) return Promise.resolve({ ok: false });
      return call({ action: "arena_event", game: cfg.game, room: cfg.room, from: cfg.name, to: to, kind: kind, data: data || {} }).catch(() => ({ ok: false }));
    },
    stop() { clearTimeout(timer); timer = null; }
  };

  async function call(body) {
    const res = await fetch(url(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), redirect: "follow" });
    return res.json();
  }

  async function tick(first) {
    clearTimeout(timer);
    lastPost = Date.now(); pending = false;
    try {
      const data = await call({ action: "arena_post", game: cfg.game, room: cfg.room, name: cfg.name, score: Number(cfg.me.score) || 0, stage: String(cfg.me.stage || "").slice(0, 60), extra: cfg.me.extra || {}, since: since });
      if (!data || !data.ok) throw new Error((data && data.error) || "no arena");
      failures = 0; A.live = true;
      since = data.now || Date.now();
      board = (data.players || []).map(p => Object.assign({}, p, { me: p.name === cfg.name })).sort((a, b) => b.score - a.score);
      (data.events || []).forEach(ev => { try { cfg.onEvent(ev); } catch (e) {} });
      cfg.onBoard(board, true);
    } catch (e) {
      failures++;
      if (first || failures >= 3) { A.live = false; cfg.onBoard([], false); }
      if (failures >= 3) return; // give up quietly; game keeps working with computer rivals
    }
    timer = setTimeout(() => tick(false), pending ? 2500 : POLL_MS + Math.floor(Math.random() * 1500));
  }
  document.addEventListener("visibilitychange", () => { if (cfg && A.live && !document.hidden) tick(false); });
})();
