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
