/**
 * CLASS TURN-IN SAVER  (Google Apps Script)
 * Saves student work from the class websites into this Google Sheet.
 * Only someone with the teacher code can read it back.
 *
 * ONE THING TO CHANGE: put your teacher code between the quotes below.
 * Use the same code you type into your dashboard now.
 */
const TEACHER_CODE = "CHANGE-ME";
 
// ---------------------------------------------------------------------
// You don't need to change anything below this line.
// ---------------------------------------------------------------------
const SHEET_NAME = "Turn-ins";
const HEADERS = ["Submitted", "Class", "Student", "Assignment", "Assignment ID", "Type", "Answers (readable)", "Answers (data)", "Page"];
const COURSE_NAMES = { "us-history": "U.S. History", "world-history": "World History", "sociology": "Sociology", "government": "Government" };
const MAX_CELL = 45000;
 
function doGet() {
  return json_({ ok: true, message: "The turn-in saver is running." });
}
 
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "Bad request." }); }
  try {
    if (req.action === "submit") return json_(submit_(req));
    if (req.action === "list") return json_(list_(req));
    if (req.action === "import") return json_(import_(req));
    return json_({ ok: false, error: "Unknown request." });
  } catch (err) {
    return json_({ ok: false, error: "The turn-in system had a problem. Try again." });
  }
}
 
// ---- Student turn-in -------------------------------------------------
function submit_(req) {
  const name = shortName_(req.studentName);
  if (!/ [A-Z]\.$/.test(name)) return { ok: false, error: "Type your first name and last initial, like Jordan M." };
  const id = clean_(req.assignmentId, 80);
  if (!id) return { ok: false, error: "This activity is missing its name. Tell your teacher." };
  const answers = req.answers !== undefined ? req.answers : collectAnswers_(req);
  appendRows_([[
    new Date(),
    COURSE_NAMES[req.course] ? req.course : "world-history",
    name,
    clean_(req.assignmentTitle || id, 150),
    id,
    req.kind === "progress" ? "progress" : "turn-in",
    readable_(answers),
    JSON.stringify(answers).slice(0, MAX_CELL),
    clean_(req.page, 200)
  ]]);
  return { ok: true, message: "Saved." };
}
 
// Older activities send answers as separate fields instead of one "answers" box.
function collectAnswers_(req) {
  const skip = { action: 1, studentName: 1, assignmentId: 1, assignmentTitle: 1, course: 1, page: 1, kind: 1 };
  const out = {};
  Object.keys(req).forEach(k => { if (!skip[k]) out[k] = req[k]; });
  return out;
}
 
// ---- Teacher dashboard ----------------------------------------------
function list_(req) {
  if (!codeOk_(req.code)) return { ok: false, error: "That teacher code is not right." };
  const sheet = sheet_();
  const last = sheet.getLastRow();
  if (last < 2) return { ok: true, submissions: [] };
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return {
    ok: true,
    submissions: rows.map(r => ({
      submittedAt: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      course: String(r[1]),
      studentName: unguard_(r[2]),
      assignmentTitle: unguard_(r[3]),
      assignmentId: String(r[4]),
      kind: String(r[5]),
      answers: parse_(r[7])
    }))
  };
}
 
// ---- One-time copy of old turn-ins from the old site ----------------
function import_(req) {
  if (!codeOk_(req.code)) return { ok: false, error: "That teacher code is not right." };
  const incoming = Array.isArray(req.rows) ? req.rows.slice(0, 500) : [];
  const sheet = sheet_();
  const last = sheet.getLastRow();
  const have = {};
  if (last >= 2) {
    sheet.getRange(2, 1, last - 1, 5).getValues().forEach(r => {
      const t = r[0] instanceof Date ? r[0].toISOString() : String(r[0]);
      have[t + "|" + unguard_(r[2]) + "|" + r[4]] = 1;
    });
  }
  const add = [];
  incoming.forEach(x => {
    const name = shortName_(x.studentName);
    const id = clean_(x.assignmentId, 80);
    const when = new Date(x.submittedAt);
    if (!name || !id || isNaN(when)) return;
    const key = when.toISOString() + "|" + name + "|" + id;
    if (have[key]) return;
    have[key] = 1;
    add.push([when, COURSE_NAMES[x.course] ? x.course : "world-history", name, clean_(x.assignmentTitle || id, 150), id,
      "turn-in", readable_(x.answers), JSON.stringify(x.answers || {}).slice(0, MAX_CELL), "copied from old site"]);
  });
  if (add.length) appendRows_(add);
  return { ok: true, added: add.length, skipped: incoming.length - add.length };
}
 
// ---- Helpers ---------------------------------------------------------
function codeOk_(code) {
  if (TEACHER_CODE === "CHANGE-ME" || !TEACHER_CODE) throw new Error("Set TEACHER_CODE first.");
  const ok = String(code || "") === TEACHER_CODE;
  if (!ok) Utilities.sleep(1500); // slows down guessing
  return ok;
}
 
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sh;
}
 
function appendRows_(rows) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const safe = rows.map(r => r.map(guard_));
    sh.getRange(sh.getLastRow() + 1, 1, safe.length, HEADERS.length).setValues(safe);
  } finally {
    lock.releaseLock();
  }
}
 
// First name + last initial, like "Jordan M."
function shortName_(raw) {
  const words = String(raw || "").replace(/[^A-Za-zÀ-ÿ'.\- ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
  const first = cap(words[0].replace(/\.+$/, ""));
  if (words.length === 1) return first;
  const last = words[words.length - 1].replace(/[^A-Za-zÀ-ÿ]/g, "");
  return last ? first + " " + last.charAt(0).toUpperCase() + "." : first;
}
 
function readable_(answers) {
  if (answers === null || answers === undefined) return "";
  if (typeof answers !== "object") return String(answers).slice(0, MAX_CELL);
  return Object.keys(answers).map(k => {
    const v = answers[k];
    return k + ": " + (typeof v === "string" ? v : JSON.stringify(v));
  }).join("\n").slice(0, MAX_CELL);
}
 
function clean_(v, max) { return String(v === undefined || v === null ? "" : v).trim().slice(0, max); }
function parse_(v) { try { return JSON.parse(v); } catch (e) { return {}; } }
 
// Stops a student from typing a spreadsheet formula into a cell.
function guard_(v) { return (typeof v === "string" && /^[=+\-@]/.test(v)) ? "'" + v : v; }
function unguard_(v) { v = String(v); return v.charAt(0) === "'" ? v.slice(1) : v; }
 
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
