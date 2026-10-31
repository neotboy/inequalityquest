/**
 * CLASS TURN-IN SAVER  (Google Apps Script)
 * Saves every student turn-in as one row in this Google Sheet,
 * and lets the teacher dashboard read them back.
 *
 * SETUP (one time, about 5 minutes):
 *  1. Make a new Google Sheet in your school account. Name it "Class Turn-ins".
 *  2. In the sheet: Extensions > Apps Script. Delete what's there, paste this whole file, click Save.
 *  3. Project Settings (gear icon) > Script Properties > Add script property:
 *        Property: TEACHER_CODE     Value: the same code you type into the dashboard
 *     (The code lives only here, never in the public website.)
 *  4. Deploy > New deployment > type "Web app".
 *        Execute as: Me      Who has access: Anyone
 *     Click Deploy, allow access, and copy the Web app URL (ends in /exec).
 *  5. Paste that URL into GOOGLE_SAVER_URL at the top of shared/turnin.js.
 *
 * If you ever edit this script: Deploy > Manage deployments > pencil > Version: New version > Deploy.
 * (That keeps the same URL.)
 */

var SHEET_NAME = "Turn-ins";
var HEADERS = ["Turned in", "Student", "Class", "Activity ID", "Activity", "Type", "Page", "Answers"];
var MAX_ANSWER_CHARS = 45000; // a Google Sheets cell holds 50,000 characters

function doGet() {
  return json({ ok: true, message: "Turn-in saver is running." });
}

function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); }
  catch (err) { return json({ ok: false, error: "Your work did not save. Try again." }); }

  try {
    if (body.action === "submit") return json(submit(body));
    if (body.action === "list")   return json(list(body));
    if (body.action === "import") return json(importRows(body));
    if (body.action === "arena_post")  return json(arenaPost(body));
    if (body.action === "arena_event") return json(arenaEvent(body));
    return json({ ok: false, error: "Unknown request." });
  } catch (err) {
    return json({ ok: false, error: "The turn-in sheet had a problem. Try again in a minute." });
  }
}

// ---------- Students turning in ----------
function submit(b) {
  var name = clean(b.studentName, 40);
  if (!/^\S+ [A-Z]\.$/.test(name)) return { ok: false, error: "Type your first name and last initial, like Jordan M." };
  var id = String(b.assignmentId || "").trim();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) return { ok: false, error: "This activity is missing its name. Tell your teacher." };

  var answers = JSON.stringify(b.answers == null ? {} : b.answers);
  if (answers.length > MAX_ANSWER_CHARS) answers = answers.slice(0, MAX_ANSWER_CHARS) + "…(cut off)";

  var row = [
    new Date().toISOString(), name, clean(b.course, 30), id,
    clean(b.assignmentTitle, 120), clean(b.kind || "turn-in", 20), clean(b.page, 200), answers
  ];
  withLock(function (sh) { sh.appendRow(row.map(safeCell)); });
  return { ok: true, saved: true };
}

// ---------- Teacher dashboard ----------
function list(b) {
  if (!codeOk(b.code)) return { ok: false, error: "That teacher code is not right." };
  var sh = sheet(), n = sh.getLastRow();
  if (n < 2) return { ok: true, submissions: [] };
  var values = sh.getRange(2, 1, n - 1, HEADERS.length).getValues();
  return { ok: true, submissions: values.map(toRecord) };
}

// Copies turn-ins from the old site into this sheet, skipping ones already here.
function importRows(b) {
  if (!codeOk(b.code)) return { ok: false, error: "That teacher code is not right." };
  var rows = Array.isArray(b.rows) ? b.rows.slice(0, 500) : [];
  var added = 0, skipped = 0;
  withLock(function (sh) {
    var have = {}, n = sh.getLastRow();
    if (n >= 2) sh.getRange(2, 1, n - 1, HEADERS.length).getValues().forEach(function (v) { have[keyOf(toRecord(v))] = true; });
    var out = [];
    rows.forEach(function (r) {
      var rec = {
        submittedAt: toIso(r.submittedAt), studentName: clean(r.studentName, 40), course: clean(r.course, 30),
        assignmentId: clean(r.assignmentId, 80), assignmentTitle: clean(r.assignmentTitle, 120), kind: "turn-in", page: "(copied from old site)",
        answers: r.answers == null ? {} : r.answers
      };
      var k = keyOf(rec);
      if (!rec.studentName || !rec.assignmentId || have[k]) { skipped++; return; }
      have[k] = true; added++;
      var a = JSON.stringify(rec.answers); if (a.length > MAX_ANSWER_CHARS) a = a.slice(0, MAX_ANSWER_CHARS) + "…(cut off)";
      out.push([rec.submittedAt, rec.studentName, rec.course, rec.assignmentId, rec.assignmentTitle, rec.kind, rec.page, a].map(safeCell));
    });
    if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, HEADERS.length).setValues(out);
  });
  return { ok: true, added: added, skipped: skipped };
}

// ---------- Class arena (live leaderboard + head-to-head moves) ----------
// Kept in fast temporary memory (CacheService, up to 6 hours), not in the sheet.
// Final scores still arrive through normal turn-ins.
var ARENA_TTL = 21600; // 6 hours
function arenaKey(b) {
  var g = String(b.game || "").replace(/[^a-z0-9-]/g, "").slice(0, 80);
  var r = String(b.room || "").replace(/[^a-z0-9-]/gi, "").slice(0, 40);
  if (!g || !r) return "";
  return "arena:" + g + ":" + r;
}
function arenaLoad(key) {
  var raw = CacheService.getScriptCache().get(key);
  try { return raw ? JSON.parse(raw) : { players: {}, events: [] }; } catch (e) { return { players: {}, events: [] }; }
}
function arenaSave(key, st) {
  var raw = JSON.stringify(st);
  while (raw.length > 95000 && st.events.length) { st.events.shift(); raw = JSON.stringify(st); }
  CacheService.getScriptCache().put(key, raw, ARENA_TTL);
}
function arenaPost(b) {
  var key = arenaKey(b), name = clean(b.name, 40);
  if (!key) return { ok: false, error: "Arena needs a game and room." };
  if (!/^\S+ [A-Z]\.$/.test(name)) return { ok: false, error: "Type your first name and last initial, like Jordan M." };
  var now = Date.now(), since = Number(b.since) || 0, out = {};
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var st = arenaLoad(key);
    var extra = JSON.stringify(b.extra || {}); if (extra.length > 600) extra = "{}";
    st.players[name] = { score: Math.max(-1e9, Math.min(1e9, Number(b.score) || 0)), stage: clean(b.stage, 60), extra: JSON.parse(extra), t: now };
    var names = Object.keys(st.players);
    if (names.length > 60) { names.sort(function (x, y) { return st.players[x].t - st.players[y].t; }); delete st.players[names[0]]; }
    arenaSave(key, st);
    out.players = Object.keys(st.players).map(function (n) { var p = st.players[n]; return { name: n, score: p.score, stage: p.stage, extra: p.extra, active: now - p.t < 120000 }; });
    out.events = st.events.filter(function (e) { return e.t > since && (e.to === name || e.to === "*") && e.from !== name; });
  } finally { lock.releaseLock(); }
  return { ok: true, now: now, players: out.players, events: out.events };
}
function arenaEvent(b) {
  var key = arenaKey(b), from = clean(b.from, 40), to = clean(b.to, 40) || "*";
  if (!key || !/^\S+ [A-Z]\.$/.test(from)) return { ok: false, error: "Arena move not allowed." };
  var data = JSON.stringify(b.data || {}); if (data.length > 600) data = "{}";
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var st = arenaLoad(key);
    st.events.push({ t: Date.now(), from: from, to: to, kind: clean(b.kind, 30), data: JSON.parse(data) });
    if (st.events.length > 300) st.events = st.events.slice(-300);
    arenaSave(key, st);
  } finally { lock.releaseLock(); }
  return { ok: true };
}

// ---------- Helpers ----------
function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold"); }
  return sh;
}
function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { fn(sheet()); } finally { lock.releaseLock(); }
}
function codeOk(code) {
  var real = PropertiesService.getScriptProperties().getProperty("TEACHER_CODE");
  return !!real && String(code || "").trim() === String(real).trim();
}
function toRecord(v) {
  var answers; try { answers = JSON.parse(v[7] || "{}"); } catch (e) { answers = { text: String(v[7]) }; }
  return { submittedAt: toIso(v[0]), studentName: unCell(v[1]), course: unCell(v[2]), assignmentId: unCell(v[3]),
           assignmentTitle: unCell(v[4]), kind: unCell(v[5]) || "turn-in", page: unCell(v[6]), answers: answers };
}
function keyOf(r) { return String(r.submittedAt).slice(0, 16) + "|" + String(r.studentName).toLowerCase() + "|" + r.assignmentId; }
function toIso(v) { var d = v instanceof Date ? v : new Date(v); return isNaN(d) ? String(v || "") : d.toISOString(); }
function clean(v, max) { return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
// Stop typed text like "=IMPORTXML(...)" from running as a formula.
function safeCell(v) { v = String(v); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function unCell(v) { return String(v == null ? "" : v); }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
