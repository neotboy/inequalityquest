// List of every activity that turns work in, and which class it belongs to.
// The teacher dashboard uses this to put each turn-in under the right tab.
// To add a new activity: copy one line, change the id, title, course, and path (its folder).
// course must be one of: "us-history", "world-history", "sociology", "government"
window.CLASS_COURSES = {
  "us-history":    "U.S. History",
  "world-history": "World History",
  "sociology":     "Sociology",
  "government":    "Government"
};

window.CLASS_ASSIGNMENTS = {
  // ---- World History ----
  "divide-africa-day1":          { course: "world-history", title: "Day 1 · Divide Africa", path: "divide-africa/" },
  "day-2-hanoi-rat-hunt":        { course: "world-history", title: "Day 2 · The Great Hanoi Rat Hunt", path: "day-2-hanoi/" },
  "pacific-case-files":          { course: "world-history", title: "Day 3 · Pacific Case Files", path: "pacific-case-files/" },
  "wwi-alliance-chain-reaction": { course: "world-history", title: "Day 4 · WWI Alliance Chain Reaction", path: "wwi-alliance-chain-reaction/" },
  "write-the-peace-treaty":      { course: "world-history", title: "Day 6 · Cartoon Decoder", path: "write-the-peace-treaty/" },
  "day6-world-in-crisis":        { course: "world-history", title: "Day 6 · A World in Crisis", path: "day6-world-in-crisis/" },
  "day7-maus-reading-checks":    { course: "world-history", title: "Day 7 · Maus I Reading Checks", path: "day7-maus/" },
  "day8-wwii-combined":          { course: "world-history", title: "Day 8 · WWII Decisions & Warning Signs", path: "day8-wwii-decision-map/" },
  "day8-wwii-decision-map":      { course: "world-history", title: "Day 8 · Decision Map (older version)" },
  "day7-warning-signs":          { course: "world-history", title: "Day 8 · Warning Signs (older version)" },
  "day9-maus2-reading-checks":   { course: "world-history", title: "Day 9 · Maus II Reading Checks", path: "day9-maus2/" },
  "day9-anne-frank-quick-write": { course: "world-history", title: "Anne Frank Diary Quick Write", path: "day9-anne-frank-quick-write/" },

  // ---- U.S. History ----
  "wwii-graphic-reading-day1":   { course: "us-history", title: "WWII Graphic Reading · Day 1", path: "wwii-graphic-reading/" },
  "wwii-graphic-reading-day2":   { course: "us-history", title: "WWII Graphic Reading · Day 2" },
  "wwii-graphic-reading-day3":   { course: "us-history", title: "WWII Graphic Reading · Day 3" },
  "wwii-graphic-reading-day4":   { course: "us-history", title: "WWII Graphic Reading · Day 4" },
  "wwii-graphic-reading-day5":   { course: "us-history", title: "WWII Graphic Reading · Day 5" },

  // ---- Sociology ----
  "sociology-theory-casebook":        { course: "sociology", title: "Theory Casebook", path: "day-4-theory-casebook/" },
  "sociology-unit2-arrival-culture":  { course: "sociology", title: "Unit 2 · The Arrival: A New Culture", path: "sociology/arrival-culture/" }

  // ---- Government ----
  // (Government games don't turn work in yet. Add them here when they do.)
};

// Works out the class for any id, even one not listed above.
window.classCourseFor = function (id) {
  id = String(id || "");
  const known = window.CLASS_ASSIGNMENTS[id];
  if (known) return known.course;
  if (id.startsWith("sociology-")) return "sociology";
  if (id.startsWith("gov-") || id.startsWith("civics-")) return "government";
  if (id.startsWith("ush-") || id.startsWith("us-history-") || id.startsWith("wwii-graphic-reading")) return "us-history";
  return "world-history";
};
