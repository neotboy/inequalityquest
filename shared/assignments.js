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
    1: "Founders' Files (Civics Test Section 1)"
  }
};

window.CLASS_ASSIGNMENTS = {
  // ---- World History · Unit 1 ----
  "divide-africa-day1":          { course: "world-history", unit: 1, day: 1, title: "Day 1 · Divide Africa", path: "divide-africa/", std: ["SS.9-12.WH.24"] },
  "day-2-hanoi-rat-hunt":        { course: "world-history", unit: 1, day: 2, title: "Day 2 · The Great Hanoi Rat Hunt (Reading)", path: "day-2-hanoi/", std: ["SS.9-12.WH.27", "SS.9-12.WH.24"] },
  "pacific-case-files":          { course: "world-history", unit: 1, day: 3, title: "Day 3 · Pacific Case Files", path: "pacific-case-files/", std: ["SS.9-12.WH.27", "SS.9-12.WH.25"] },
  "wwi-alliance-chain-reaction": { course: "world-history", unit: 1, day: 4, title: "Day 4 · WWI Alliance Chain Reaction", path: "wwi-alliance-chain-reaction/", std: ["SS.9-12.WH.29"] },
  "write-the-peace-treaty":      { course: "world-history", unit: 1, day: 5, title: "Day 5 · Cartoon Decoder", path: "write-the-peace-treaty/", std: ["SS.9-12.WH.31"] },
  "day6-world-in-crisis":        { course: "world-history", unit: 1, day: 6, title: "Day 6 · A World in Crisis", path: "day6-world-in-crisis/", std: ["SS.9-12.WH.31", "SS.9-12.WH.30"] },
  "day7-maus-reading-checks":    { course: "world-history", unit: 1, day: 7, title: "Day 7 · Maus I (Reading)", path: "day7-maus/", std: ["SS.9-12.WH.30", "SS.9-12.WH.33"] },
  "day7-warning-signs":          { course: "world-history", unit: 1, day: 7, title: "Day 7 · Spot the Warning Signs (now in Day 8)" },
  "day8-wwii-combined":          { course: "world-history", unit: 1, day: 8, title: "Day 8 · WWII Decisions & Warning Signs", path: "day8-wwii-decision-map/", std: ["SS.9-12.WH.29", "SS.9-12.WH.30"] },
  "day8-wwii-decision-map":      { course: "world-history", unit: 1, day: 8, title: "Day 8 · Decision Map (older version)" },
  "day9-maus2-reading-checks":   { course: "world-history", unit: 1, day: 9, title: "Day 9 · Maus II (Reading)", path: "day9-maus2/", std: ["SS.9-12.WH.30", "SS.9-12.WH.33"] },

  // ---- U.S. History · Unit 2 (World War II) ----
  "wwii-graphic-reading-day1":   { course: "us-history", unit: 2, day: 1, title: "Day 1 · Maus I (Reading)", path: "wwii-graphic-reading/#day1", std: ["SS.9-12.US.29", "SS.9-12.US.30"] },
  "wwii-graphic-reading-day2":   { course: "us-history", unit: 2, day: 2, title: "Day 2 · Maus II (Reading)", path: "wwii-graphic-reading/#day2", std: ["SS.9-12.US.29", "SS.9-12.US.30"] },
  "wwii-graphic-reading-day3":   { course: "us-history", unit: 2, day: 3, title: "Day 3 · Anne Frank’s Diary (Reading)", path: "wwii-graphic-reading/#day3", std: ["SS.9-12.US.30"] },
  "wwii-graphic-reading-day4":   { course: "us-history", unit: 2, day: 4, title: "Day 4 · Fight on the Home Front (Reading)", path: "wwii-graphic-reading/#day4", std: ["SS.9-12.US.29", "SS.9-12.US.31", "SS.9-12.US.33"] },
  "wwii-graphic-reading-day5":   { course: "us-history", unit: 2, day: 5, title: "Day 5 · Japanese American Incarceration Comics (Reading)", path: "wwii-graphic-reading/#day5", std: ["SS.9-12.US.31", "SS.9-12.US.33"] },

  // ---- Sociology · Unit 1 ----
  "sociology-day-1-reading":                  { course: "sociology", unit: 1, day: 1, title: "Day 1 · What Is Sociology? (Reading)", path: "sociology/day-1-reading/", std: ["SS.9-12.Soc.2"] },
  "sociology-day-2-sociological-imagination": { course: "sociology", unit: 1, day: 2, title: "Day 2 · The Sociological Imagination (Reading)", path: "sociology/day-2-sociological-imagination/", std: ["SS.9-12.Soc.2"] },
  "sociology-day-3-founders":                 { course: "sociology", unit: 1, day: 3, title: "Day 3 · Origins and Founders (Reading)", path: "sociology/day-3-founders/", std: ["SS.9-12.Soc.4"] },
  "sociology-day-4-perspectives":             { course: "sociology", unit: 1, day: 4, title: "Day 4 · Sociological Perspectives (Reading)", path: "sociology/day-4-perspectives/", std: ["SS.9-12.Soc.4"] },
  "sociology-theory-casebook":                { course: "sociology", unit: 1, day: 4, title: "Day 4 · Theory Casebook", path: "day-4-theory-casebook/", std: ["SS.9-12.Soc.4"] },
  "sociology-day-7-research-ethics":          { course: "sociology", unit: 1, day: 7, title: "Day 7 · Ethics in Sociological Research (Reading)", path: "sociology/day-7-research-ethics/", std: ["SS.9-12.Soc.1"] },
  "sociology-unit1-review-seahaven":          { course: "sociology", unit: 1, title: "Unit 1 Review · Escape from Seahaven", path: "sociology-ethics-review/", std: ["SS.9-12.Soc.2", "SS.9-12.Soc.4", "SS.9-12.Soc.1"] },

  // ---- Sociology · Unit 2 ----
  "sociology-unit2-day1-first-shift":         { course: "sociology", unit: 2, day: 1, title: "Day 1 · First Shift: Status, Roles & Norms", path: "sociology/unit2-day1-first-shift/", std: ["SS.9-12.Soc.5", "SS.9-12.Soc.6", "SS.9-12.Soc.7"] },
  "sociology-unit2-arrival-culture":          { course: "sociology", unit: 2, day: 2, title: "Day 2 · The Arrival: A New Culture", path: "sociology/arrival-culture/", std: ["SS.9-12.Soc.5", "SS.9-12.Soc.6"] },
  "sociology-unit2-day3-culture-shock":      { course: "sociology", unit: 2, day: 3, title: "Day 3 · Culture Shock Exchange", path: "sociology/unit2-day3-culture-shock-exchange/", std: ["SS.9-12.Soc.6", "SS.9-12.Soc.5"] },

  // ---- Government · Unit 1 ----
  "gov-stranded-day1":                { course: "government", unit: 1, day: 1, title: "Day 1 · Stranded: Govern or Collapse", path: "civics/stranded-government/", std: ["SS.9-12.Gov.1", "SS.9-12.Gov.5"] },
  "gov-my-country-day3":              { course: "government", unit: 1, day: 3, title: "Day 3 · My Country, My Rules", path: "civics/my-country-my-rules/", std: ["SS.9-12.Gov.1", "SS.9-12.Gov.4"] },
  "gov-articles-day5":                { course: "government", unit: 1, day: 5, title: "Day 5 · 13 States. One Mess.", path: "civics/articles-confederation-game/", std: ["SS.9-12.Gov.9"] },
  "gov-missing-constitution-day7":    { course: "government", unit: 1, day: 7, title: "Day 7 · The Missing Constitution", path: "civics/missing-constitution/", std: ["SS.9-12.Gov.4"] },
  "gov-democracy-visualized-day1":    { course: "government", unit: 1, day: 1, title: "Day 1 · Purposes of Government (Reading)", path: "civics/democracy-visualized/#day1", std: ["SS.9-12.Gov.1"] },
  "gov-democracy-visualized-day2":    { course: "government", unit: 1, day: 2, title: "Day 2 · Social Contract & Rule of Law (Reading)", path: "civics/democracy-visualized/#day2", std: ["SS.9-12.Gov.14"] },
  "gov-democracy-visualized-day7":    { course: "government", unit: 1, day: 7, title: "Day 7 · The Constitution (Reading)", path: "civics/democracy-visualized/#day7", std: ["SS.9-12.Gov.4"] },
  "gov-democracy-visualized-day9":    { course: "government", unit: 1, day: 9, title: "Day 9 · Federalism & Iowa Government (Reading)", path: "civics/democracy-visualized/#day9", std: ["SS.9-12.Gov.9"] },

  // ---- Government · Unit 2 ----
  "gov-unit2-day1-the-feed":          { course: "government", unit: 2, day: 1, title: "Day 1 · Fair Game: Beliefs, Ideology & Parties", path: "civics/unit2-day1-the-feed/", std: ["SS.9-12.Gov.12"] },
  "gov-unit2-day2-lobby-day":         { course: "government", unit: 2, day: 2, title: "Day 2 · Lobby Day: Interest Groups & Media", path: "civics/unit2-day2-lobby-day/", std: ["SS.9-12.Gov.12"] },

  // ---- Civics (Iowa civics test prep) · Friday 1 ----
  "civics-test-s1-presentation":     { course: "civics", unit: 1, title: "Founders' Files (Slides)", path: "civics/civics-test-s1-presentation/", std: ["SS.9-12.Gov.3", "SS.9-12.Gov.4"] },
  "civics-test-s1-founders-defense":  { course: "civics", unit: 1, title: "Founders' Defense", path: "civics/civics-test-s1-founders-defense/", std: ["SS.9-12.Gov.3", "SS.9-12.Gov.4"] }
};

// Iowa standard wording (Iowa Academic Standards for Social Studies) for every standard an in-use activity covers.
window.CLASS_STANDARDS = {
  "SS.9-12.WH.24": "Describe the economic, political and cultural factors that contributed to a new wave of European imperialism in the 19th century.",
  "SS.9-12.WH.25": "Compare and contrast the different imperialist systems created by European and other imperialist nations.",
  "SS.9-12.WH.27": "Compare the responses of resistance and adaptation to Western imperialism in the 19th century.",
  "SS.9-12.WH.29": "Analyze the causes that led to the outbreak of World War I and World War II.",
  "SS.9-12.WH.30": "Compare and contrast the rise of dictators including their methods of repression and persecution, specifically addressing the causes and impact of the Holocaust.",
  "SS.9-12.WH.31": "Assess the political and economic consequences and cultural developments after World War I and World War II.",
  "SS.9-12.WH.33": "Compare the experiences and perspectives of individuals affected by total war during World War I and World War II.",
  "SS.9-12.US.29": "Evaluate the multiple causes and effects of World War II.",
  "SS.9-12.US.30": "Evaluate the American response to the Holocaust.",
  "SS.9-12.US.31": "Analyze how labor and government actions during World War II influenced American economic systems, urbanization, and cultural development.",
  "SS.9-12.US.33": "Analyze diverse ideologies through primary and secondary sources, noting the impact on social, economic, and political institutions during World War II.",
  "SS.9-12.Soc.1": "Analyze the components of a sociological investigation.",
  "SS.9-12.Soc.2": "Compare and contrast the sociological perspective and how it differs from other social sciences.",
  "SS.9-12.Soc.4": "Explain the sociological theories that are the basis of sociology.",
  "SS.9-12.Soc.5": "Describe the components of culture.",
  "SS.9-12.Soc.6": "Analyze how culture influences individuals, including themselves.",
  "SS.9-12.Soc.7": "Evaluate important social institutions and how they respond to social needs.",
  "SS.9-12.Gov.1": "Analyze the origins of government with attention to the purpose(s) of government, and alternative models from other nations and groups.",
  "SS.9-12.Gov.3": "Analyze important founding and historical documents to the United States and the State of Iowa.",
  "SS.9-12.Gov.4": "Analyze the underlying principles established by the United States Constitution.",
  "SS.9-12.Gov.5": "Analyze the role of the government in maintaining order.",
  "SS.9-12.Gov.9": "Assess how the United States federal system divides powers between national and state governments.",
  "SS.9-12.Gov.12": "Critique the influence of intermediary institutions on government and policy.",
  "SS.9-12.Gov.14": "Analyze the role of citizens in the U.S. political system, with attention to the definition of who is a citizen, the expansion of that definition over time."
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
