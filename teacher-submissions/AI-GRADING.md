# AI grader for written answers

An hourly scheduled task reads new turn-ins in Fynn's "Class Turn-ins" Google Sheet, grades each student's
**written answers** 1–4 against the Iowa standard for that activity, and saves the grade inside the turn-in.
The teacher dashboard (`teacher-submissions/index.html`) reads it from there and counts it toward mastery right away.

The spreadsheet ID is given in the scheduled task's prompt. Use the **Google Sheets** connector.

## 1. Find turn-ins that need grading

The tab is `Turn-ins`. Row 1 is the header. Columns (current layout): Key | Turned in | Student | Class | Activity ID |
Activity | Kind | Page | Source | Answers. Always find the columns by header name, not by letter.

1. Read the header and the first two columns: `get_values` on `'Turn-ins'!A1:B`.
2. Candidates are rows turned in during the **last 21 days** (by "Turned in").
3. For each candidate, read its whole row (`'Turn-ins'!A{n}:J{n}`; batch nearby rows into one range). Check that the Key
   you read matches the Key from step 1. If not, rows have shifted: read A:B again and re-locate.
4. Skip a row when:
   - Answers already has `"AI level"` or `"AI graded"`, or
   - Kind is not `turn-in` (for example `progress`), or
   - Answers does not parse as JSON.
5. If a row has **no student-written text** (only multiple choice, sequences, matches, scores), mark it so it's
   not checked again: add only `"AI graded":"no written answer"` (no level). The dashboard ignores that.

## 2. Work out what the student was asked and which standard it is

- The registry is `shared/assignments.js`: `CLASS_ASSIGNMENTS[activityId]` gives the title, the page (`path`) and the
  standards (`std`). `CLASS_STANDARDS` has the exact wording of each standard. If Answers has a `"Standard"` key, it wins.
- **Written answers** are free-text values the student typed, such as `reflection`, `Answer`, `U.S. connection`, keys
  that are the question itself (Great Hanoi Rat Hunt), or text inside the `checkN` entries of the WWII reading.
  If a key like `"Exit question"` holds the question, use it.
- When the question text isn't in the turn-in, open the activity's page in the repo and find the label for the text box.
  **Questions change over time.** If the turn-in is older than the page's last change, find the wording that was live
  on the turn-in date with `git log -p --since/--until -- <folder>`. Known older wording (turn-ins before 2026-10-30):
  - WWI Alliance Chain Reaction `reflection`: "What made the war spread to more countries?"
  - Pacific Case Files `reflection`: "What is one way a country gained power?"
- Grade against what the lesson taught (the page's own reading, cases and facts), not outside knowledge.

## 3. Grade on Fynn's 1–4 scale

Give **one level per turn-in** for all of its written answers together.

| Level | Meaning |
|---|---|
| 4 | Everything a 3 has, plus stronger reasoning: accurate specific evidence and a connection or cause-and-effect beyond the basics. |
| 3 | Proficient. Accurate, answers what was asked, and **explains** (not just names), with at least one correct, specific detail from the lesson. |
| 2 | A right idea that is vague, incomplete (only part of the question), only names or lists without explaining, or has a real factual error. |
| 1 | Mostly incorrect, off-topic, blank, a word or two that shows no understanding, or not the student's own words. |

Rules:
- Spelling, grammar and capitalization never lower a grade. These are alternative high school students; short and
  plain is fine if it is accurate and explains.
- If the question has several parts (Hanoi has four), weigh all of them. Missing parts pull the level down.
- **Copied work**: text pasted from an AI chat (prompts, "AI can make mistakes", "AI Mode reply") or clearly copied
  from a website gets level **1** and `"AI flag":"Copied from an AI chat. Talk with the student."` (or "Looks copied
  from a website…"). Flag anything unsafe or inappropriate too.
- Be consistent: similar answers get the same level. Don't guess when the answer is ambiguous; grade what's on the page.

The reason is one short sentence for the teacher (under 120 characters), in plain words, saying what earned or cost
the level. No student names in the reason.

## 4. Save the grade (safely)

Rows can shift when new turn-ins arrive, so **never write by row number**. Use one `update_spreadsheet` call with a
`findReplace` request per turn-in, limited to the Answers column:

```json
{"findReplace": {"find": "<unique end of that Answers cell, ending with }>",
  "replacement": "<same text without the last }>,\"AI level\":\"3\",\"AI reason\":\"...\",\"AI graded\":\"YYYY-MM-DD\"}",
  "matchCase": true, "matchEntireCell": false, "searchByRegex": false, "includeFormulas": false,
  "range": {"sheetId": <Turn-ins sheetId>, "startRowIndex": 1, "startColumnIndex": <Answers col index>, "endColumnIndex": <+1>}}}
```

- Pick a `find` that appears in **exactly one** Answers cell (check against every Answers cell you read; lengthen it
  until unique). Two cells that are completely identical may share one grade.
- Values are JSON strings: `"AI level":"3"`. Escape quotes in the reason with `json.dumps`. Add `"AI flag"` only when flagging.
- After the call, every reply must say `occurrencesChanged: 1` (or the count of identical cells). If one says 0,
  re-read and retry that one once. Never change anything else in the sheet.
- Get the sheetId once with `get_spreadsheet` and `fields: ["sheets.properties.sheetId","sheets.properties.title"]`.

## 5. Finish

End with one line: how many turn-ins were graded, how many had no written answer, and any flags (activity and level,
no names). If nothing was new, say so in one line and stop.
