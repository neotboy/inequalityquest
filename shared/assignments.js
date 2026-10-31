// List of every activity that turns work in, and which class it belongs to.
// The teacher dashboard uses this to put each turn-in under the right tab,
// grouped by unit and sorted by day (matching the Schoology day posts).
// To add a new activity: copy one line, change the id, title, course, unit, day, and path (its folder).
// course must be one of: "us-history", "world-history", "sociology", "government", "civics"
window.CLASS_COURSES = {
  "us-history":    "U.S. History",
  "world-history": "World History",
  "sociology":     "Sociology",
  "government":    "Government",
  "civics":        "Civics"
};

// Unit names for each class (same order and numbers as the Schoology unit pages).
window.CLASS_UNITS = {
  "us-history": {
    1: "Roaring 20s & the Great Depression",
    2: "World War II"
  },
  "world-history": {
    1: "Imperialism & the World Wars (1800–1945)"
  },
  "sociology": {
    1: "Foundations, Perspectives & Methods",
    2: "Culture, Institutions & Society"
  },
  "government": {
    1: "Foundations of the U.S. Constitution",
    2: "Political Beliefs, Linkage Institutions & Citizenship"
  },
  "civics": {
    1: "The Missing Constitution"
  }
};

window.CLASS_ASSIGNMENTS = {
  // ---- World History · Unit 1 ----
  "divide-africa-day1":          { course: "world-history", unit: 1, day: 1, title: "Day 1 · Divide Africa", path: "divide-africa/" },
  "day-2-hanoi-rat-hunt":        { course: "world-history", unit: 1, day: 2, title: "Day 2 · The Great Hanoi Rat Hunt (Reading)", path: "day-2-hanoi/" },
  "pacific-case-files":          { course: "world-history", unit: 1, day: 3, title: "Day 3 · Pacific Case Files", path: "pacific-case-files/" },
  "wwi-alliance-chain-reaction": { course: "world-history", unit: 1, day: 4, title: "Day 4 · WWI Alliance Chain Reaction", path: "wwi-alliance-chain-reaction/" },
  "write-the-peace-treaty":      { course: "world-history", unit: 1, day: 5, title: "Day 5 · Cartoon Decoder", path: "write-the-peace-treaty/" },
  "day6-world-in-crisis":        { course: "world-history", unit: 1, day: 6, title: "Day 6 · A World in Crisis", path: "day6-world-in-crisis/" },
  "day7-maus-reading-checks":    { course: "world-history", unit: 1, day: 7, title: "Day 7 · Maus I (Reading)", path: "day7-maus/" },
  "day7-warning-signs":          { course: "world-history", unit: 1, day: 7, title: "Day 7 · Spot the Warning Signs (now in Day 8)" },
  "day8-wwii-combined":          { course: "world-history", unit: 1, day: 8, title: "Day 8 · WWII Decisions & Warning Signs", path: "day8-wwii-decision-map/" },
  "day8-wwii-decision-map":      { course: "world-history", unit: 1, day: 8, title: "Day 8 · Decision Map (older version)" },
  "day9-maus2-reading-checks":   { course: "world-history", unit: 1, day: 9, title: "Day 9 · Maus II (Reading)", path: "day9-maus2/" },

  // ---- U.S. History · Unit 2 (World War II) ----
  "wwii-graphic-reading-day1":   { course: "us-history", unit: 2, day: 1, title: "Day 1 · Maus I (Reading)", path: "wwii-graphic-reading/#day1" },
  "wwii-graphic-reading-day2":   { course: "us-history", unit: 2, day: 2, title: "Day 2 · Maus II (Reading)", path: "wwii-graphic-reading/#day2" },
  "wwii-graphic-reading-day3":   { course: "us-history", unit: 2, day: 3, title: "Day 3 · Anne Frank’s Diary (Reading)", path: "wwii-graphic-reading/#day3" },
  "wwii-graphic-reading-day4":   { course: "us-history", unit: 2, day: 4, title: "Day 4 · Fight on the Home Front (Reading)", path: "wwii-graphic-reading/#day4" },
  "wwii-graphic-reading-day5":   { course: "us-history", unit: 2, day: 5, title: "Day 5 · Japanese American Incarceration Comics (Reading)", path: "wwii-graphic-reading/#day5" },

  // ---- Sociology · Unit 1 ----
  "sociology-day-1-reading":                  { course: "sociology", unit: 1, day: 1, title: "Day 1 · What Is Sociology? (Reading)", path: "sociology/day-1-reading/" },
  "sociology-day-2-sociological-imagination": { course: "sociology", unit: 1, day: 2, title: "Day 2 · The Sociological Imagination (Reading)", path: "sociology/day-2-sociological-imagination/" },
  "sociology-day-3-founders":                 { course: "sociology", unit: 1, day: 3, title: "Day 3 · Origins and Founders (Reading)", path: "sociology/day-3-founders/" },
  "sociology-day-4-perspectives":             { course: "sociology", unit: 1, day: 4, title: "Day 4 · Sociological Perspectives (Reading)", path: "sociology/day-4-perspectives/" },
  "sociology-theory-casebook":                { course: "sociology", unit: 1, day: 4, title: "Day 4 · Theory Casebook", path: "day-4-theory-casebook/" },
  "sociology-day-7-research-ethics":          { course: "sociology", unit: 1, day: 7, title: "Day 7 · Ethics in Sociological Research (Reading)", path: "sociology/day-7-research-ethics/" },
  "sociology-unit1-review-seahaven":          { course: "sociology", unit: 1, title: "Unit 1 Review · Escape from Seahaven", path: "sociology-ethics-review/", turnIn: false },

  // ---- Sociology · Unit 2 ----
  "sociology-unit2-day1-first-shift":         { course: "sociology", unit: 2, day: 1, title: "Day 1 · First Shift: Status, Roles & Norms", path: "sociology/unit2-day1-first-shift/" },
  "sociology-unit2-arrival-culture":          { course: "sociology", unit: 2, day: 2, title: "Day 2 · The Arrival: A New Culture", path: "sociology/arrival-culture/" },
  "sociology-unit2-day3-culture-shock":      { course: "sociology", unit: 2, day: 3, title: "Day 3 · Culture Shock Exchange", path: "sociology/unit2-day3-culture-shock-exchange/" },

  // ---- Government · Unit 1 ----
  "gov-stranded-day1":                { course: "government", unit: 1, day: 1, title: "Day 1 · Stranded: Govern or Collapse", path: "civics/stranded-government/" },
  "gov-my-country-day3":              { course: "government", unit: 1, day: 3, title: "Day 3 · My Country, My Rules", path: "civics/my-country-my-rules/" },
  "gov-articles-day5":                { course: "government", unit: 1, day: 5, title: "Day 5 · 13 States. One Mess.", path: "civics/articles-confederation-game/" },
  "gov-missing-constitution-day7":    { course: "government", unit: 1, day: 7, title: "Day 7 · The Missing Constitution", path: "civics/missing-constitution/" },
  "gov-democracy-visualized-day1":    { course: "government", unit: 1, day: 1, title: "Day 1 · Purposes of Government (Reading)", path: "civics/democracy-visualized/#day1" },
  "gov-democracy-visualized-day2":    { course: "government", unit: 1, day: 2, title: "Day 2 · Social Contract & Rule of Law (Reading)", path: "civics/democracy-visualized/#day2" },
  "gov-democracy-visualized-day7":    { course: "government", unit: 1, day: 7, title: "Day 7 · The Constitution (Reading)", path: "civics/democracy-visualized/#day7" },
  "gov-democracy-visualized-day9":    { course: "government", unit: 1, day: 9, title: "Day 9 · Federalism & Iowa Government (Reading)", path: "civics/democracy-visualized/#day9" },

  // ---- Government · Unit 2 ----
  "gov-unit2-day1-the-feed":          { course: "government", unit: 2, day: 1, title: "Day 1 · The Feed: Where Beliefs Come From", path: "civics/unit2-day1-the-feed/" },
  "gov-unit2-day2-lobby-day":         { course: "government", unit: 2, day: 2, title: "Day 2 · Lobby Day: Interest Groups & Media", path: "civics/unit2-day2-lobby-day/" },

  // ---- Civics (Iowa civics test prep) · Friday 1 ----
  "civics-test-s1-founders-defense":  { course: "civics", unit: 1, title: "Founders' Defense", path: "civics/civics-test-s1-founders-defense/" }
};

// Works out the class for any id, even one not listed above.
window.classCourseFor = function (id) {
  id = String(id || "");
  const known = window.CLASS_ASSIGNMENTS[id];
  if (known) return known.course;
  if (id.startsWith("sociology-")) return "sociology";
  if (id.startsWith("civics-")) return "civics";
  if (id.startsWith("gov-")) return "government";
  if (id.startsWith("ush-") || id.startsWith("us-history-") || id.startsWith("wwii-graphic-reading")) return "us-history";
  return "world-history";
};
