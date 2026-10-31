'use strict';
/* =====================================================================
   DISTRICT 101 · Government Unit 2 Day 1
   Political beliefs, ideology vs. party, the two major parties,
   voting blocs, coalitions, third parties. Standard SS.9-12.Gov.12.
   Facts used (verified 10/31/2026):
   - Iowa House members must be at least 21 (Iowa Constitution Art. III, Sec. 4).
   - Iowa minimum wage $7.25 since 2008; cities can't set their own (2017 law).
   - Iowa law (HF 782, 2025) bans phone use during class time; some lawmakers want bell-to-bell.
   - Iowa sports betting age is 21 (2019 law).
   - Going into the 2026 election, Iowa recognized two official political parties (Iowa SOS).
   District 101, its neighborhoods, people, polls, and candidates are made up.
   ===================================================================== */
(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const KEY = 'gov-u2d1-district58-v2';
const ASSIGN = 'gov-unit2-day1-the-feed';
const OLD_API = 'https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit';
const STD = 'Gov.12';
const WEEKS = 5;

/* ---------------- DATA ---------------- */
const ISSUES = [
  { id: 'wage', axis: 'econ', dir: +1, short: 'Raise minimum wage', q: "Raise Iowa's minimum wage above $7.25?", fact: "It's been $7.25 since 2008. Cities aren't allowed to set their own.", pro: 'Nobody can live on $7.25 an hour.', con: 'Some shops might hire fewer teens.' },
  { id: 'tax', axis: 'econ', dir: -1, short: 'Cut property taxes', q: 'Cut property taxes, even if cities get less money for parks and police?', fact: 'Property taxes pay for a lot of city and school costs.', pro: 'Families keep more of their money.', con: 'Fewer services, maybe fewer police.' },
  { id: 'college', axis: 'econ', dir: +1, short: 'Free community college', q: 'Make community college free, paid for with state taxes?', fact: 'Kirkwood Community College is right in Cedar Rapids.', pro: 'More people get job skills.', con: 'It costs taxpayers a lot.' },
  { id: 'phones', axis: 'pers', dir: +1, short: 'Phones banned all day', q: 'Ban phones in school ALL day, even at lunch?', fact: 'Since 2025, Iowa law makes schools ban phones during class time.', pro: 'Less distraction, less drama.', con: "Students can't reach family or friends." },
  { id: 'cams', axis: 'pers', dir: +1, short: 'Plate cameras', q: 'Let police put license-plate cameras on city streets?', fact: 'The cameras read every passing car\'s plate.', pro: 'Helps catch car thieves and find missing people.', con: 'Tracks everyone, even people who did nothing.' },
  { id: 'bet', axis: 'pers', dir: -1, short: 'Betting at 18', q: 'Lower the sports betting age from 21 to 18?', fact: 'In Iowa you have to be 21 to bet on sports.', pro: "At 18 you're an adult. Your call.", con: 'Gambling problems hit young people hard.' }
];
const SOURCES = [['family', 'Family'], ['friends', 'Friends'], ['school', 'School'], ['feed', 'Social media'], ['community', 'Faith or community'], ['job', 'My job']];

const HOODS = [
  { id: 'farms', name: 'North Linn Farms', who: 'Farm families', pop: 1700, box: [18, 34, 294, 256], poly: [[22, 40], [300, 34], [312, 150], [300, 282], [150, 290], [18, 270]], inf: 'family', infLabel: 'Family & neighbors', spot: 'the church supper', loyal: { D: .22, R: .46 }, prefs: { wage: -1, tax: 2, college: 1, phones: 1, cams: -2, bet: -1 }, like: 'Finally, somebody who gets out to the farm.', meh: "Haven't seen you out here." },
  { id: 'thomas', name: 'Thomas Park Neighborhoods', who: 'Parents with kids in school', pop: 2000, box: [334, 36, 294, 252], poly: [[338, 36], [620, 40], [628, 170], [618, 284], [470, 276], [334, 288]], inf: 'school', infLabel: 'School & parent groups', spot: 'PTO night', loyal: { D: .34, R: .33 }, prefs: { wage: 1, tax: 1, college: 1, phones: 2, cams: 0, bet: -2 }, like: 'You actually listened to us parents.', meh: 'What about our kids, though?' },
  { id: 'creek', name: 'Indian Creek Village', who: 'Retirees', pop: 1700, box: [650, 36, 294, 250], poly: [[652, 40], [938, 36], [944, 180], [936, 286], [790, 280], [650, 284]], inf: 'community', infLabel: 'Local TV & church', spot: 'the senior center', media: true, loyal: { D: .35, R: .40 }, prefs: { wage: 0, tax: 2, college: 0, phones: 1, cams: 1, bet: -1 }, like: 'Polite young person. I like that.', meh: 'Kids these days never visit.' },
  { id: 'kirkwood', name: 'Kirkwood Corridor', who: 'College students & young workers', pop: 1500, box: [18, 300, 294, 260], poly: [[18, 306], [160, 300], [310, 310], [312, 440], [302, 556], [22, 560]], inf: 'feed', infLabel: 'Social media & friends', spot: 'a campus forum', loyal: { D: .40, R: .20 }, prefs: { wage: 2, tax: 0, college: 2, phones: -2, cams: -1, bet: 1 }, like: 'Ok you might actually get my vote.', meh: 'Never heard of you. Is there a TikTok?' },
  { id: 'riverside', name: 'Riverside Works', who: 'Factory & union workers', pop: 1600, box: [334, 306, 296, 254], poly: [[336, 310], [620, 306], [630, 430], [624, 552], [480, 560], [334, 556]], inf: 'work', infLabel: 'Coworkers & the union hall', spot: 'the union hall', loyal: { D: .42, R: .30 }, prefs: { wage: 2, tax: 0, college: 1, phones: 0, cams: 0, bet: 1 }, like: 'You showed up for working people.', meh: 'Talk is cheap. Come to the hall.' },
  { id: 'uptown', name: 'Uptown Marion', who: 'Small-business owners', pop: 1300, box: [650, 306, 294, 254], poly: [[652, 306], [944, 312], [940, 450], [940, 556], [800, 560], [650, 552]], inf: 'media', infLabel: 'Local news & word of mouth', spot: 'a Main Street coffee shop', media: true, loyal: { D: .30, R: .38 }, prefs: { wage: -2, tax: 1, college: 0, phones: 0, cams: 1, bet: 1 }, like: 'You get what it takes to run a shop.', meh: 'Do you know what payroll costs?' }
];
const HOOD = Object.fromEntries(HOODS.map(h => [h.id, h]));
const RIVAL_STANCES = {
  // Personal-choice issues (phones, cameras, betting) split BOTH parties, so the typical candidates take no fixed side.
  D: { wage: 1, tax: -1, college: 1, phones: 0, cams: 0, bet: 0 },
  R: { wage: -1, tax: 1, college: -1, phones: 0, cams: 0, bet: 0 },
  L: { wage: -1, tax: 1, college: -1, phones: -1, cams: -1, bet: 1 }
};
const PARTY_NAME = { D: 'Democrat', R: 'Republican', I: 'Independent', L: 'Libertarian ticket' };
const RIVAL_NAMES = { D: 'Sam Ortega', R: 'Jordan Hale', L: 'Dakota Vance' };
const COLORS = { you: '#13897f', r1: '#d0643f', r2: '#c9952e', third: '#7b5fb2' };

const CHECKS = {
  c_social: { prompt: 'Which of these is an example of <b>political socialization</b>?', options: ['Getting your views on taxes from family', 'Casting your own ballot on election day', 'A party writing its platform for the year', 'A court ruling on a disputed election'], hint: 'Socialization is how you PICK UP beliefs from people and places around you.', why: 'Political socialization is how we pick up political beliefs from family, friends, school, faith, jobs, and media.' },
  c_iv: { prompt: 'You have an ideology. Now you\'re picking a party. Which one describes a political <b>party</b>?', options: ['An organized group that runs candidates for office', 'A person\'s set of beliefs about what government should do', 'A group of voters who share a background and vote alike', 'An organization that lobbies lawmakers but never runs candidates'], hint: 'Which one could put YOUR name on a ballot?', why: 'Ideology = your beliefs. Party = an organized group that recruits candidates, raises money, writes a platform, and tries to win elections.' },
  c_party: { prompt: 'Which statement about the two major parties is TRUE?', options: ['Both want a strong economy but disagree on how', 'Every member of a party agrees on every issue', 'Only one of the two runs Iowa House candidates', 'The U.S. Constitution creates both of the parties'], hint: 'Look again at the "Both parties" box and the map caption.', why: 'Both parties say they want a strong economy, safe towns, and good schools. They disagree about how much government should do. And members of a party don\'t agree on everything.' },
  c_press: { prompt: 'Parties push their lawmakers to vote together. What is the strongest <b>criticism</b> of that pressure?', options: ['Lawmakers may ignore what their own district wants', 'Voters can no longer tell the two parties apart', 'It makes it impossible for parties to raise money', 'It stops third-party candidates from being on the ballot'], hint: 'Who is a state representative supposed to represent?', why: 'Party unity helps a party pass its platform, but it can pull a lawmaker away from what the people back home want. That\'s a real trade-off.' },
  c_feed: { prompt: 'Your feed ad mostly reached people who <b>already liked you</b>. Why does that happen online?', options: ['Apps pick posts based on what you clicked before', 'Iowa law blocks political ads for some voters', 'Campaigns may only buy ads from their own party', 'People over 30 are not allowed to see paid ads'], hint: 'Think about how your own feed decides what to show you.', why: 'Campaigns aim ads at people likely to click, and apps show people more of what they already click on. Together that can create an "echo chamber," where people mostly hear one side.' },
  c_bloc: { prompt: 'Most retirees in Indian Creek Village back the same candidates on taxes and safety. What is a group like that called?', options: ['Voting bloc', 'Political party', 'Interest group', 'Political action committee'], hint: 'Do the retirees have a leader, dues, or a staff? Or do they just tend to vote alike?', why: 'A voting bloc is a group of voters who share something (age, job, place) and tend to vote alike. It has no leader or office.' },
  c_spoil: { prompt: 'Dakota Vance can\'t win. How can Dakota still change <b>who</b> wins?', options: ['By pulling votes away from one candidate', 'By casting the tie-breaking vote in the race', 'By picking the winner after the votes are in', 'By canceling the results if Dakota loses'], hint: 'Whose voters is Dakota taking?', why: 'In winner-take-all races, a third-party candidate can be a "spoiler": they take votes from the candidate closest to them, and that can flip the result.' },
  c_coal: { prompt: 'To win, a candidate needs farm families AND union workers AND parents on the same side. Bringing different voting blocs together is building a…', options: ['Coalition', 'Platform', 'Constituency', 'Ideology'], hint: 'Different groups, one team.', why: 'A coalition is several groups (voting blocs) that come together behind one candidate or party.' }
};
const VOTERS = [
  { label: 'Liberal', text: 'Raise the minimum wage and make college free. And let adults decide for themselves about betting and phones.' },
  { label: 'Conservative', text: 'Cut taxes and keep government out of business. But keep strict rules, like phone bans and a betting age of 21.' },
  { label: 'Libertarian', text: 'Cut taxes and cut rules on business. And let adults decide for themselves about betting and phones.' },
  { label: 'Populist', text: 'Raise the minimum wage and make college free. And keep strict rules, like phone bans and a betting age of 21.' }
];

/* ---------------- STATE ---------------- */
const fresh = () => ({ v: 2, phase: 'intro', name: '', room: '', takeIdx: 0, stances: {}, roots: {}, rootAsk: false, party: null, week: 1, energy: 3, money: 0, effort: { you: {}, r1: {}, r2: {}, third: {} }, revealed: {}, used: {}, selected: null, ev: {}, loyalMult: 1, thirdActive: false, flags: {}, checks: {}, queue: [], log: [], writing: {}, turnedIn: false, classMoves: 0, bots: null, history: [] });
let st;
try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!st || st.v !== 2) st = fresh();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

/* ---------------- MODEL ---------------- */
function candidates() {
  const list = [{ id: 'you', party: st.party || 'I', stances: st.stances, name: st.name || 'You' }];
  if (!st.party) return list;
  if (st.party === 'D') list.push({ id: 'r1', party: 'R', stances: RIVAL_STANCES.R, name: RIVAL_NAMES.R });
  else if (st.party === 'R') list.push({ id: 'r1', party: 'D', stances: RIVAL_STANCES.D, name: RIVAL_NAMES.D });
  else { list.push({ id: 'r1', party: 'D', stances: RIVAL_STANCES.D, name: RIVAL_NAMES.D }); list.push({ id: 'r2', party: 'R', stances: RIVAL_STANCES.R, name: RIVAL_NAMES.R }); }
  if (st.thirdActive) list.push({ id: 'third', party: 'L', stances: RIVAL_STANCES.L, name: RIVAL_NAMES.L });
  return list;
}
function utility(c, h) {
  let issue = 0;
  ISSUES.forEach(i => { issue += (h.prefs[i.id] || 0) * (c.stances[i.id] || 0); });
  const ind = 1 - h.loyal.D - h.loyal.R;
  let loyal = 0; // in "logit" units: higher = more likely to win this voter
  if (c.party === 'D') loyal = h.loyal.D * 2.2;
  else if (c.party === 'R') loyal = h.loyal.R * 2.2;
  else loyal = ind * 1.1 - (c.id === 'third' ? 1.3 : 0);
  if (c.id === 'you') loyal *= st.loyalMult;
  const eff = (st.effort[c.id] && st.effort[c.id][h.id]) || 0;
  return issue * 0.09 + loyal + eff * 0.12;
}
function shares(h) {
  const cs = candidates();
  if (cs.length < 2) return { you: .5 };
  const ex = cs.map(c => Math.exp(utility(c, h)));
  const sum = ex.reduce((a, b) => a + b, 0);
  const out = {}; cs.forEach((c, i) => { out[c.id] = ex[i] / sum; });
  return out;
}
function totals() {
  const cs = candidates(); const votes = {}; cs.forEach(c => votes[c.id] = 0);
  let all = 0;
  HOODS.forEach(h => { const s = shares(h); cs.forEach(c => { votes[c.id] += (s[c.id] || 0) * h.pop; }); all += h.pop; });
  const pct = {}; cs.forEach(c => pct[c.id] = votes[c.id] / all * 100);
  return { votes, pct, all };
}
function ideology() {
  let econ = 0, pers = 0;
  ISSUES.forEach(i => { const s = st.stances[i.id] || 0; if (i.axis === 'econ') econ += s * i.dir; else pers += s * i.dir; });
  // econ > 0 = more government action on money issues; pers > 0 = more rules on personal choices
  let label, why;
  if (econ > 0 && pers < 0) { label = 'Liberal'; why = 'more government action on money issues, fewer rules on personal choices'; }
  else if (econ < 0 && pers > 0) { label = 'Conservative'; why = 'less government action on money issues, more rules that protect safety and tradition'; }
  else if (econ < 0 && pers < 0) { label = 'Libertarian'; why = 'less government in BOTH your wallet and your personal life'; }
  else { label = 'Populist'; why = 'a mix: more government action on money issues AND more rules on personal choices'; }
  return { econ, pers, label, why };
}
function partyFit() {
  const D = RIVAL_STANCES.D, R = RIVAL_STANCES.R; let d = 0, r = 0;
  ['wage', 'tax', 'college'].forEach(k => { if (st.stances[k] === D[k]) d++; if (st.stances[k] === R[k]) r++; });
  return { d, r };
}

/* ---------------- UI HELPERS ---------------- */
const panel = $('#panel');
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200); }
function talk(who, text) { $('#talk').innerHTML = `<span class="who">${esc(who)}:</span> “${esc(text)}”`; }
function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
function header() {
  const P = { intro: 'Getting started', takes: 'Build your platform', ideology: 'Your ideology', party: 'Pick a party', campaign: 'Week ' + st.week + ' of ' + WEEKS, election: 'Election night', final: 'Results' };
  $('#weekPill').textContent = P[st.phase] || '';
  $('#moneyPill').textContent = money(st.money);
  $('#energyPill').textContent = 'Moves ' + '●'.repeat(Math.max(0, st.energy)) + '○'.repeat(Math.max(0, 3 - st.energy));
  $('#moneyPill').style.visibility = st.party ? 'visible' : 'hidden';
  $('#energyPill').style.visibility = st.phase === 'campaign' ? 'visible' : 'hidden';
  const order = ['intro', 'takes', 'ideology', 'party', 'campaign', 'election', 'final'];
  let pct = order.indexOf(st.phase) / (order.length - 1);
  if (st.phase === 'campaign') pct = (4 + (st.week - 1) / WEEKS) / 6;
  $('#progressFill').style.width = Math.round(pct * 100) + '%';
  $('#stepLabel').textContent = P[st.phase] || '';
  pollbar(); board();
}
function pollbar() {
  const el = $('#pollbar');
  if (!st.party) { el.innerHTML = '<span class="lab">Polls open when you pick a party.</span>'; return; }
  const cs = candidates(); const t = st.phase === 'election' ? { pct: countedTotals() } : totals();
  if (st.phase === 'election' && !(st.counted || []).length) { el.innerHTML = '<span class="lab">Votes are being counted…</span>'; return; }
  el.innerHTML = (st.phase === 'election' ? '<span class="lab">Counted so far:</span>' : '') + cs.map(c => `<span class="lab ${c.id === 'you' ? 'y-lab' : c.id === 'third' ? 't-lab' : 'r-lab'}">${esc(c.id === 'you' ? 'You' : c.name)} ${t.pct[c.id].toFixed(0)}%</span>`).join('') +
    `<div class="bar" aria-hidden="true">${cs.map(c => `<i style="width:${t.pct[c.id]}%;background:${COLORS[c.id]}"></i>`).join('')}</div><span class="need">Most votes wins</span>`;
}

/* ---------------- CLASS LEADERBOARD (head-to-head) ---------------- */
let livePlayers = [];
function myPct() { // lead (+) or deficit (−) vs. your closest rival, in points. Fair for 2-way and 3-way races.
  if (st.phase === 'election' || !st.party) return null;
  const t = totals().pct, others = Object.keys(t).filter(k => k !== 'you').map(k => t[k]);
  return t.you - Math.max(...others);
}
const fmtLead = n => n == null ? '—' : (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1);
function ensureBots() {
  if (!st.bots || st.bots[0].lead == null) st.bots = [{ name: 'Kenzie R.', lead: -2 }, { name: 'Marcus T.', lead: 2 }, { name: 'Ava L.', lead: -6 }];
}
function board() {
  ensureBots();
  const live = liveOthers().length > 0;
  const others = live ? liveOthers().map(p => ({ name: p.name, lead: p.score / 10, live: true })) : st.bots;
  const me = myPct();
  const rows = others.map(o => ({ name: o.name, lead: o.lead })).concat([{ name: (st.name || 'You') + ' (you)', lead: me, me: true }]).sort((a, b) => (b.lead == null ? -99 : b.lead) - (a.lead == null ? -99 : a.lead));
  const canMove = st.phase === 'campaign' && st.classMoves < st.week && !busy;
  $('#board').innerHTML = `<div class="t">🏁 CLASS RACE<span class="tag ${live ? 'live' : ''}">${live ? 'LIVE' : 'practice rivals'}</span></div><ol>${rows.map((r, i) => `<li class="${r.me ? 'me' : canMove ? 'tap' : ''}" ${!r.me && canMove ? `data-who="${esc(r.name)}" role="button" tabindex="0" title="Steal a donor or team up"` : ''}><span class="n">${i + 1}</span><span class="nm">${esc(r.name)}</span><span class="sc">${fmtLead(r.lead)}</span></li>`).join('')}</ol><span class="bhint">${canMove ? '⚔️ Click a classmate: weekly move' : 'Points ahead of your closest rival'}</span>`;
  $('#board').querySelectorAll('[data-who]').forEach(li => { li.onclick = () => classMenu(li.dataset.who); li.onkeydown = e => { if (e.key === 'Enter') classMenu(li.dataset.who); }; });
  if (window.Arena && Arena.live && me != null) Arena.update({ score: Math.round(me * 10), stage: st.phase === 'campaign' ? 'Week ' + st.week : st.phase });
}
function botTick() {
  ensureBots();
  st.bots.forEach(b => { b.lead = Math.max(-14, Math.min(16, b.lead + (Math.random() * 6 - 2.6))); });
}
function liveOthers() { return (window.Arena && Arena.live) ? livePlayers.filter(p => !p.me && p.name !== st.name) : []; }
function classTargets() {
  const o = liveOthers();
  return o.length ? o.map(p => p.name) : (ensureBots(), st.bots.map(b => b.name));
}
function classMove(kind, target) {
  if (st.classMoves >= st.week) return;
  st.classMoves = st.week;
  const liveTarget = liveOthers().some(p => p.name === target);
  if (kind === 'team' && liveTarget) Arena.send(target, kind, { from: st.name });
  if (kind === 'steal') {
    if (Math.random() < .3) { HOODS.forEach(h => addEffort('you', h.id, -0.6)); toast('Busted! A reporter found out you poached a donor from ' + target + '. Your support dips everywhere.'); talk('Local reporter', 'Candidate caught poaching a classmate\'s donor.'); }
    else { if (liveTarget) Arena.send(target, kind, { from: st.name }); st.money += 800; toast('You stole a donor from ' + target + ': +$800'); const b = (st.bots || []).find(x => x.name === target); if (b) b.lead -= 1.5; }
  } else {
    HOODS.forEach(h => addEffort('you', h.id, 0.4)); toast('You teamed up with ' + target + '. Shared volunteers boost you everywhere.');
    const b = (st.bots || []).find(x => x.name === target); if (b) b.lead += 1;
  }
  save(); render();
}
function classMenu(target) {
  const card = $('#card'); card.className = 'card';
  card.innerHTML = `<p class="eyebrow">⚔️ CLASS MOVE · ONCE A WEEK</p><h2>What do you do to ${esc(target)}?</h2><div class="choices"><button class="choice" data-cm="steal">🕵️ Steal one of their donors<small>+$800 for you. But there's a 30% chance a reporter catches you, and your support dips everywhere.</small></button><button class="choice" data-cm="team">🤝 Team up<small>Share volunteers. You BOTH get a boost.</small></button></div><button class="go" id="cx">Never mind</button>`;
  $('#overlay').hidden = false;
  $('#cx').onclick = () => { $('#overlay').hidden = true; };
  card.querySelectorAll('[data-cm]').forEach(b => b.onclick = () => { $('#overlay').hidden = true; classMove(b.dataset.cm, target); });
}
function startArena() {
  if (!window.Arena) return;
  Arena.join({ game: ASSIGN, name: st.name, room: st.room,
    onBoard(players, live) { livePlayers = players; board(); },
    onEvent(ev) {
      if (st.phase !== 'campaign') return;
      if (ev.kind === 'steal') { st.money = Math.max(0, st.money - 800); toast(ev.from + ' stole one of your donors! −$800'); }
      if (ev.kind === 'team') { HOODS.forEach(h => addEffort('you', h.id, 0.4)); toast(ev.from + ' teamed up with you! Volunteers boost you everywhere.'); }
      save(); render();
    } });
}

/* ---------------- CHECKS (one quick check after each big moment) ---------------- */
function checkDef(id) {
  if (id === 'c_ideo') {
    if (st.voter == null) { st.voter = Math.floor(Math.random() * VOTERS.length); save(); }
    const v = VOTERS[st.voter], labels = VOTERS.map(x => x.label);
    return { prompt: `A voter named Casey says: <i>"${v.text}"</i> Where does Casey land on the idea map?`, options: [v.label].concat(labels.filter(l => l !== v.label)), hint: 'Check two things: money issues (more or less government?) and personal choices (more or fewer rules?).', why: `Casey is ${v.label === 'Populist' ? 'a Populist: more government on money issues AND more rules on personal choices' : v.label === 'Liberal' ? 'Liberal: more government on money issues, fewer rules on personal choices' : v.label === 'Conservative' ? 'Conservative: less government on money issues, more rules on personal choices' : 'Libertarian: less government on money AND fewer rules on personal choices'}. Real people mix and match, so labels are only a starting point.` };
  }
  return CHECKS[id];
}
let lockTimer = null;
function showCheck(id, then) {
  if (st.checks[id] && st.checks[id].done) { then && then(); return; }
  const d = checkDef(id); const rec = st.checks[id] || (st.checks[id] = { wrong: 0, done: false });
  const card = $('#card'); card.className = 'card check';
  const draw = (msg) => {
    card.innerHTML = `<p class="eyebrow">QUICK CHECK · ${STD}</p><h2>${d.prompt}</h2><div class="qchoices">${shuffle(d.options.map((t, n) => ({ t, n }))).map(o => `<button data-n="${o.n}">${esc(o.t)}</button>`).join('')}</div><p class="fb ${msg ? 'bad' : ''}" id="fb">${msg || ''}</p>`;
    card.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      if (b.dataset.n === '0') {
        rec.done = true; if (window.classFirstTry) classFirstTry.right(id); save();
        card.innerHTML = `<p class="eyebrow">QUICK CHECK · ${STD}</p><h2>${d.prompt}</h2><p class="why"><b>✓ ${esc(d.options[0])}.</b> ${d.why}</p><button class="primary go" id="cont">Keep going →</button>`;
        $('#cont').onclick = () => { $('#overlay').hidden = true; then && then(); };
      } else {
        rec.wrong++; if (window.classFirstTry) classFirstTry.wrong(); save();
        card.querySelectorAll('[data-n]').forEach(x => x.disabled = true);
        let left = 6; const fb = $('#fb');
        const tick = () => { fb.className = 'fb bad'; fb.textContent = 'Not quite. ' + d.hint + ' Choices will mix up in ' + left + '…'; if (left-- <= 0) { draw('Not quite. ' + d.hint + ' Try again.'); return; } lockTimer = setTimeout(tick, 1000); };
        tick();
      }
    });
  };
  draw(''); $('#overlay').hidden = false;
}

/* ---------------- PANELS ---------------- */
let lastView = '';
function render() { const view = st.phase + (st.phase === 'campaign' ? st.week + st.selected : st.phase === 'takes' ? st.takeIdx + '' + st.rootAsk : ''); if (view !== lastView) { $('#panel').scrollTop = 0; lastView = view; } header(); const f = { intro: pIntro, takes: pTakes, ideology: pIdeology, party: pParty, campaign: pCampaign, election: pElection, final: pFinal }[st.phase]; f && f(); }

function pIntro() {
  panel.innerHTML = `<p class="kicker">Government · Unit 2 · Day 1</p><h2>It's 2030. You just turned 21.</h2><p class="lead">That's the youngest age the Iowa Constitution allows for the Iowa House. You're running in District 101: Marion and Cedar Rapids.</p><p class="muted">Press <b>Start</b> in the box to begin.</p>`;
  const card = $('#card'); card.className = 'card';
  card.innerHTML = `<p class="eyebrow">GOVERNMENT · UNIT 2 · DAY 1 · A CAMPAIGN GAME</p><h2>District 101: Run for the Iowa House</h2>
  <p class="lead">It's 2030. You're 21, the minimum age to serve in the Iowa House. Six neighborhoods. Five weeks. One seat.</p>
  <ol class="steps"><li><b>Take a side</b> on 6 hot takes. That's your platform.</li><li><b>Pick a party</b>, or run without one.</li><li><b>Campaign:</b> click neighborhoods, spend moves and money, survive the drama. Beat your rival and your classmates.</li><li><b>Election night</b>, then 2 short answers and Turn in. About 25–30 minutes.</li></ol>
  <label for="nm">Your name: first name + last initial (like Jordan M.)</label><input id="nm" maxlength="40" autocomplete="off" value="${esc(st.name)}" placeholder="Jordan M.">
  <label for="rm">Class code (optional, from your teacher)</label><input id="rm" maxlength="12" autocomplete="off" value="${esc(st.room)}" placeholder="like 3rd">
  <p class="fb" id="nmMsg"></p><button class="primary go" id="startBtn">Start →</button>
  <p class="std"><b>SS.9-12.Gov.12</b> Critique the influence of intermediary institutions on government and policy. District 101, its people, and its polls are made up. The places and Iowa facts are real.</p>`;
  $('#overlay').hidden = false;
  $('#startBtn').onclick = () => {
    const n = window.classShortName ? classShortName($('#nm').value) : $('#nm').value.trim();
    if (!/^\S+ [A-Z]\.$/.test(n)) { $('#nmMsg').className = 'fb bad'; $('#nmMsg').textContent = 'Type your first name and last initial, like Jordan M.'; $('#nm').focus(); return; }
    st.name = n; st.room = $('#rm').value.trim(); st.phase = 'takes'; save();
    $('#overlay').hidden = true; startArena(); render();
    talk('Your mom', 'You\'re really doing this? Okay. I\'m proud of you.');
  };
}

function pTakes() {
  const i = st.takeIdx, iss = ISSUES[i];
  if (!iss) { const go = () => { st.phase = 'ideology'; save(); render(); }; panel.innerHTML = '<p class="kicker">Platform done</p><h2>Your platform is set.</h2>'; return showCheck('c_social', go); }
  if (st.rootAsk) {
    const pos = st.stances[iss.id] === 1 ? 'Agree' : 'Disagree';
    panel.innerHTML = `<p class="kicker">Hot take ${i + 1} of 6 · where it came from</p><h2>You said <span class="${pos === 'Agree' ? 'agree' : 'disagree'}" style="padding:0 6px;border-radius:6px">${pos}</span>.</h2><p class="lead">Who or what shaped that opinion the most?</p><div class="chips">${SOURCES.map(([k, l]) => `<button data-k="${k}">${l}</button>`).join('')}</div><p class="muted" style="margin-top:12px">Nobody is born with political beliefs. We pick them up from the people and places around us. That's called <b>political socialization</b>.</p>`;
    panel.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { st.roots[iss.id] = b.dataset.k; st.rootAsk = false; st.takeIdx++; save(); render(); });
    return;
  }
  panel.innerHTML = `<p class="kicker">Hot take ${i + 1} of 6 · your platform</p><div class="take"><p class="q">${esc(iss.q)}</p><span class="fact">${esc(iss.fact)}</span><div class="sides"><div><b>Supporters say</b>${esc(iss.pro)}</div><div><b>Opponents say</b>${esc(iss.con)}</div></div></div><div class="row"><button class="agree" data-v="1">👍 Agree</button><button class="disagree" data-v="-1">👎 Disagree</button></div><p class="muted" style="margin-top:10px">No wrong answers. Your picks become your platform, and voters will react to them.</p>`;
  panel.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { st.stances[iss.id] = Number(b.dataset.v); st.rootAsk = true; save(); render(); });
}

function compassHTML(withRivals) {
  const ide = ideology();
  const x = 50 - ide.econ / 3 * 38, y = 50 - ide.pers / 3 * 38; // left = more gov econ? (we place more gov on left)
  const dots = [];
  if (withRivals) [['D', RIVAL_STANCES.D], ['R', RIVAL_STANCES.R]].forEach(([p, s]) => {
    let e = 0, q = 0; ISSUES.forEach(i => { if (i.axis === 'econ') e += s[i.id] * i.dir; else q += s[i.id] * i.dir; });
    dots.push(`<span class="dot rdot" style="left:${50 - e / 3 * 38}%;top:${50 - q / 3 * 38}%;background:${p === 'D' ? '#5b7fc7' : '#c45a5a'};width:16px;height:16px" title="Typical ${PARTY_NAME[p]}"></span>`);
  });
  dots.push(`<span class="dot" style="left:${x}%;top:${y}%;z-index:2" title="You"></span>`);
  return `<div class="compass"><span class="q" style="left:8px;top:6px">Populist</span><span class="q" style="right:8px;top:6px">Conservative</span><span class="q" style="left:8px;bottom:6px">Liberal</span><span class="q" style="right:8px;bottom:6px">Libertarian</span><span class="ax" style="left:50%;top:22px;transform:translateX(4px)">↑ more rules on personal choices</span><span class="ax" style="left:50%;bottom:22px;transform:translateX(4px)">↓ fewer rules</span><span class="ax" style="left:6px;top:50%;transform:translateY(4px)">← more gov't on money</span><span class="ax" style="right:6px;top:50%;transform:translateY(4px)">less gov't →</span>${dots.join('')}</div>`;
}

function pIdeology() {
  const ide = ideology();
  const roots = {}; Object.values(st.roots).forEach(k => roots[k] = (roots[k] || 0) + 1);
  const top = Object.entries(roots).sort((a, b) => b[1] - a[1])[0];
  panel.innerHTML = `<p class="kicker">Your ideology</p><h2>You lean <span style="color:var(--you)">${esc(ide.label)}</span>.</h2>${compassHTML(false)}<p>An <b>ideology</b> is a set of beliefs about what government should do. Yours: <b>${esc(ide.why)}</b>.</p><p class="muted">Your biggest influence: <b>${top ? esc(SOURCES.find(s => s[0] === top[0])[1]) : '—'}</b> (${top ? top[1] : 0} of 6 takes). That's your political socialization.</p><button class="primary go" id="nx">Next: pick a party →</button>`;
  $('#nx').onclick = () => {
    const go = () => { st.phase = 'party'; save(); render(); };
    if (st.checks.c_ideo && st.checks.c_ideo.done) go(); else showCheck('c_ideo', go);
  };
}

function pParty() {
  const f = partyFit();
  panel.innerHTML = `<p class="kicker">Pick a party</p><h2>Who do you run with?</h2>${compassHTML(true)}<p class="muted">Teal = you. Blue = a typical Democrat. Red = a typical Republican. The parties split mostly on money issues. On phones, cameras, and betting, members of BOTH parties disagree with each other. Real party members are spread all over this map.</p>
  <div class="party"><h3>Democratic Party <span class="fit">matches you on ${f.d} of 3</span></h3><ul><li>Generally wants government to do more on health care, wages, and the environment</li><li>Generally supports labor unions and a higher minimum wage</li><li>Many members support abortion rights and stricter gun laws</li></ul></div>
  <div class="party"><h3>Republican Party <span class="fit">matches you on ${f.r} of 3</span></h3><ul><li>Generally wants lower taxes and fewer rules on business</li><li>Generally supports gun rights and strong border enforcement</li><li>Many members support limits on abortion</li></ul></div>
  <div class="both"><b>Both parties:</b> say they want a strong economy, safe towns, and good schools. Both recruit candidates, raise money, and write platforms. In both, members disagree on some issues.</div>
  <div class="choices"><button class="choice" data-p="D">Run as a Democrat<small>Party money + loyal party voters. Rival: ${RIVAL_NAMES.R} (R).</small></button><button class="choice" data-p="R">Run as a Republican<small>Party money + loyal party voters. Rival: ${RIVAL_NAMES.D} (D).</small></button><button class="choice" data-p="I">Run as an Independent<small>No party money, no party bosses. You face BOTH a Democrat and a Republican.</small></button></div>`;
  panel.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
    st.party = b.dataset.p; st.money = st.party === 'I' ? 2500 : 5500; st.phase = 'campaign'; st.week = 1; st.energy = 3; st.selected = 'thomas';
    save(); render();
    toast(st.party === 'I' ? 'You filed as an Independent. Two rivals. Good luck.' : 'You\'re the ' + PARTY_NAME[st.party] + ' nominee! The party sends $3,000.');
    setTimeout(() => showCheck('c_iv', () => showCheck('c_party', render)), 600);
  });
}

/* ---------------- CAMPAIGN ---------------- */
function addEffort(cid, hid, n) { st.effort[cid] = st.effort[cid] || {}; st.effort[cid][hid] = (st.effort[cid][hid] || 0) + n; }
const ACT = {
  doors: { label: '🚪 Knock doors', cost: 0, energy: 1, tip: h => h.inf === 'family' ? 'Works great here: neighbors talk.' : h.inf === 'feed' ? 'Most aren\'t home. Meh.' : 'Solid everywhere.', mult: h => h.inf === 'family' ? 1.6 : h.inf === 'feed' ? .6 : 1 },
  event: { label: '🎤 Show up', cost: 400, energy: 1, tip: h => 'Speak at ' + h.spot + '.', mult: h => ['community', 'school', 'work'].includes(h.inf) ? 1.7 : .7 },
  listen: { label: '👂 Listen', cost: 0, energy: 1, tip: () => 'Learn what they care about.', mult: () => .4 },
  fund: { label: '💵 Fundraiser', cost: 0, energy: 1, tip: () => (st.party === 'I' ? '+$1,800' : '+$2,600') + ' for ads', mult: () => 0 }
};
function hoodCard(h) {
  const s = shares(h), cs = candidates(), known = st.revealed[h.id];
  const issues = ISSUES.map(i => ({ i, w: h.prefs[i.id] })).filter(x => x.w).sort((a, b) => Math.abs(b.w) - Math.abs(a.w)).slice(0, 4);
  return `<div class="hood-card"><p class="kicker">${esc(h.who)} · ${h.pop.toLocaleString()} voters</p><h2 style="font-size:20px;margin:0">${esc(h.name)}</h2>
  <div class="bar">${cs.map(c => `<i style="width:${(s[c.id] * 100).toFixed(1)}%;background:${COLORS[c.id]}"></i>`).join('')}</div>
  <p class="mini">${cs.map(c => `<b style="color:${COLORS[c.id]}">${esc(c.id === 'you' ? 'You' : c.name)} ${(s[c.id] * 100).toFixed(0)}%</b>`).join(' · ')}</p>
  ${known ? `<span class="inf">What shapes their views: ${esc(h.infLabel)}</span><div class="issues">${issues.map(x => `<span>${esc(x.i.short)}</span><span class="w" style="color:${x.w > 0 ? 'var(--good)' : 'var(--bad)'}">${x.w > 0 ? 'FOR' : 'AGAINST'}${Math.abs(x.w) > 1 ? ' !!' : ''}</span>`).join('')}</div>` : `<p class="mini">❓ You don't know what this neighborhood cares about yet. <b>Listen</b> first.</p>`}</div>`;
}
function pCampaign() {
  const h = HOOD[st.selected];
  const flipDone = st.used['flip' + st.week], tvDone = st.used['tv' + st.week], feedDone = st.used['feed' + st.week];
  const acts = h ? Object.entries(ACT).map(([k, a]) => `<button class="act" data-a="${k}" ${st.energy < a.energy || st.money < a.cost ? 'disabled' : ''}><b>${a.label}${a.cost ? ' · ' + money(a.cost) : ''}</b><small>${esc(a.tip(h))}</small></button>`).join('') : '';
  panel.innerHTML = `<p class="kicker">Week ${st.week} of ${WEEKS} · ${st.energy} move${st.energy === 1 ? '' : 's'} left</p>
  ${h ? hoodCard(h) : '<h2>Click a neighborhood on the map.</h2>'}
  <div class="actions">${acts}
    <button class="act" data-a="tv" ${tvDone || st.money < 2000 ? 'disabled' : ''}><b>📺 Local TV ad · $2,000</b><small>Whole district. Best with retirees and Uptown.</small></button>
    <button class="act" data-a="feed" ${feedDone || st.money < 1000 ? 'disabled' : ''}><b>📱 Social feed ad · $1,000</b><small>Whole district. Mostly reaches people who already like you.</small></button>
    <button class="act wide" data-a="flip" ${flipDone || st.energy < 1 ? 'disabled' : ''}><b>🔄 Change a stance (1 move)</b><small>Win some neighborhoods, lose others. Once a week.</small></button>
  </div>
  <button class="primary endweek" id="endWeek" ${busy ? 'disabled' : ''}>${st.week < WEEKS ? 'End week ' + st.week + ' →' : 'Go to election night →'}</button>`;
  panel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => doAction(b.dataset.a));
  $('#endWeek').onclick = endWeek;
  $('#mapHint').textContent = h ? 'Campaigning in ' + h.name + ' · click another neighborhood to switch' : 'Click a neighborhood';
}
function doAction(k) {
  const h = HOOD[st.selected]; if (!h) return;
  const before = totals().pct.you, hb = shares(h).you;
  if (k === 'flip') return flipPicker();
  if (k === 'tv') {
    st.money -= 2000; st.used['tv' + st.week] = true;
    HOODS.forEach(x => addEffort('you', x.id, x.media ? 2.2 : .7));
    MAP.van(null, 'you', '📺'); toast('Your ad runs on local TV all week.'); talk('Indian Creek retiree', 'Saw your ad during the news. Seemed sincere.');
  } else if (k === 'feed') {
    st.money -= 1000; st.used['feed' + st.week] = true; let reached = [];
    HOODS.forEach(x => { const s = shares(x).you; const m = x.inf === 'feed' ? 2.6 : s > .5 ? 1.4 : .2; addEffort('you', x.id, m); if (m >= 1.4) reached.push(x.name.split(' ')[0]); });
    MAP.van(null, 'you', '📱'); toast('Feed ad posted. It mostly reached: ' + (reached.join(', ') || 'almost nobody new')); talk('Kirkwood student', 'Your ad was all over my feed lol.');
  } else {
    const a = ACT[k];
    st.energy -= a.energy; st.money -= a.cost;
    if (k === 'fund') { st.money += st.party === 'I' ? 1800 : 2600; toast('Fundraiser at a backyard cookout: +' + (st.party === 'I' ? '$1,800' : '$2,600')); MAP.van(h.id, 'you', '💵'); }
    else {
      if (k === 'listen') { if (!st.revealed[h.id]) st.revealed[h.id] = true; else toast('You already know them. Small boost.'); }
      addEffort('you', h.id, 3 * a.mult(h)); MAP.van(h.id, 'you', k === 'doors' ? '🚪' : k === 'event' ? '🎤' : '👂');
      if (k === 'listen') talk(h.who, 'Here\'s what matters to us...');
      else talk(h.who, shares(h).you > .5 ? h.like : h.meh);
    }
  }
  const after = totals().pct.you, ha = shares(h).you;
  if (k !== 'fund') MAP.float(h.id, (ha - hb >= 0 ? '+' : '') + ((ha - hb) * 100).toFixed(1) + '%');
  st.log.push('W' + st.week + ' ' + k + (k === 'tv' || k === 'feed' ? '' : ' @ ' + h.id));
  save(); render();
}
function flipPicker() {
  const card = $('#card'); card.className = 'card';
  card.innerHTML = `<p class="eyebrow">CHANGE A STANCE · 1 MOVE</p><h2>Which stance do you flip?</h2><p class="muted">Each flip wins some neighborhoods and loses others. The polls update right away.</p><div class="choices">${ISSUES.map(i => `<button class="choice" data-i="${i.id}">${esc(i.short)}: <b>${st.stances[i.id] === 1 ? 'FOR → AGAINST' : 'AGAINST → FOR'}</b></button>`).join('')}</div><button class="go" id="cx">Never mind</button>`;
  $('#overlay').hidden = false;
  $('#cx').onclick = () => { $('#overlay').hidden = true; };
  card.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    const before = {}; HOODS.forEach(h => before[h.id] = shares(h).you);
    st.stances[b.dataset.i] *= -1; st.energy--; st.used['flip' + st.week] = true;
    HOODS.forEach(h => addEffort('you', h.id, -0.4)); // flip-flop costs a little trust everywhere
    const moves = HOODS.map(h => ({ h, d: shares(h).you - before[h.id] })).sort((a, c) => c.d - a.d);
    card.className = 'card';
    card.innerHTML = `<p class="eyebrow">STANCE CHANGED</p><h2>You flipped on ${esc(ISSUES.find(i => i.id === b.dataset.i).short)}.</h2><div class="deltas">${moves.map(m => `<span class="delta ${m.d >= 0 ? 'up' : 'down'}">${esc(m.h.name.split(' ').slice(-1)[0] === 'Neighborhoods' ? 'Thomas Park' : m.h.name)} ${m.d >= 0 ? '+' : ''}${(m.d * 100).toFixed(1)}%</span>`).join('')}</div><p class="reveal">That's the trade-off of building a coalition (a team of different voter groups): moving toward one group can push another away. Rivals will call it a "flip-flop."</p><button class="primary go" id="cx2">Back to the map →</button>`;
    $('#cx2').onclick = () => { $('#overlay').hidden = true; save(); render(); };
    st.log.push('W' + st.week + ' flip ' + b.dataset.i); save();
  });
}

/* ---------------- DRAMA EVENTS ---------------- */
function eventFor(week) {
  const party = st.party;
  if (week === 1) return party === 'I' ? {
    id: 'indie', art: '💸', title: 'No party, no money.', story: 'A rich donor from out of town calls: "I\'ll pay for your whole campaign. Just come out for cutting property taxes."',
    choices: [
      { t: 'Take the money and change my tax stance', fx: { money: 5000, stance: { tax: 1 } }, res: 'Your bank account explodes. Your platform just changed for one donor, and people notice.' },
      { t: 'Say no. Crowdfund from regular people', fx: { money: 1200, hoods: { kirkwood: 1.5, riverside: 1 } }, res: 'Small checks roll in: $10, $20, $50. Less money, but people respect it.' },
      { t: 'Say no and stay quiet about it', fx: {}, res: 'You keep your stance. Your rivals keep their party money.' }
    ], reveal: 'Parties give candidates money, volunteers, and loyal voters. Running without a party means you build all of that yourself.' }
  : {
    id: 'hq', art: '📞', title: 'The party chair is on line one.', story: '"We\'ll fund you, but promise to vote with the party on EVERYTHING. No exceptions."',
    choices: [
      { t: 'Promise. I need that money.', fx: { money: 3000, loyalMult: 1.25, all: -0.4 }, res: 'The money lands. Party voters are fired up. Some independents think you\'re just a party puppet.' },
      { t: 'No. I vote for my district first.', fx: { money: -500, loyalMult: .9, all: .9 }, res: 'The chair is annoyed and cuts back help. Independents love it.' },
      { t: 'Promise... then quietly plan to break it', fx: { money: 3000, loyalMult: 1.25, flag: 'liar' }, res: 'You smile and say yes. Hope nobody finds out.' }
    ], reveal: 'Parties expect loyalty because they want to pass their platform. But party members still disagree sometimes.' };
  if (week === 2) return { id: 'video', art: '📹', title: 'An old video just went viral.', story: 'It\'s you at 16, laughing: "Voting is pointless lol." 40,000 views and climbing.',
    choices: [
      { t: '"I was 16. Here\'s what changed my mind."', fx: { hoods: { kirkwood: 2, creek: .8, thomas: .8 } }, res: 'Your honest answer goes viral too. Young voters relate.' },
      { t: 'Delete it and say nothing', fx: { hoods: { creek: -1.5, uptown: -1.5 } }, res: 'Local news runs "Candidate deletes video." Deleting it made it a bigger story.' },
      { t: 'Say the video is fake', fx: { all: -1.6 }, res: 'A reporter finds the original. Now it\'s a lie, too. Ouch.' }
    ], reveal: 'Media decides what voters hear about. News and social feeds are linkage institutions (things that connect people to their government). They can make or break a candidate.' };
  if (week === 3) return { id: 'debate', art: '🎙️', title: 'Debate night at a Marion high school.', story: 'Your rival goes for the throat: "' + (st.name || 'My opponent') + ' is too young and doesn\'t understand real problems."',
    choices: [
      { t: 'Hit back with facts and numbers', fx: { hoods: { creek: 1.6, uptown: 1.6, farms: .5 } }, res: 'Retirees and business owners nod along. College kids zone out.' },
      { t: 'Tell a real story about a voter you met', fx: { hoods: { thomas: 1.6, riverside: 1.6, kirkwood: .8 } }, res: 'Parents and workers feel seen. The room goes quiet. In a good way.' },
      { t: 'Roast your rival right back', fx: { hoods: { kirkwood: 1.5 }, all: -.6, rivalAll: -.5 }, res: 'The clip goes viral with young voters. Everyone else thinks it got ugly.' }
    ], reveal: 'Different voting blocs respond to different messages. Smart campaigns know their audience.' };
  if (week === 4) return { id: 'spoiler', art: '🦔', title: 'Plot twist: a third candidate jumps in.', story: 'Dakota Vance enters on the Libertarian ticket: "Government out of your wallet AND your life." Dakota can\'t win, but Dakota can steal votes.',
    choices: [
      { t: 'Ignore Dakota. They can\'t win.', fx: { third: true }, res: 'Dakota stays in and starts pulling voters who want fewer rules.' },
      { t: 'Win Dakota\'s voters: come out against plate cameras', fx: { third: true, stance: { cams: -1 } }, res: 'You moved toward Dakota\'s voters. Some of your old supporters liked the cameras.' },
      { t: 'Ask Dakota to drop out and back you', fx: { third: 'ask' }, res: '' }
    ], reveal: 'Third parties rarely win in winner-take-all races, but they can be "spoilers" that change who does win.' };
  return { id: 'coach', art: '🏈', title: 'The endorsement everyone wants.', story: 'Coach Rae (made up), Marion\'s most famous coach, will endorse whoever answers one question on live radio: "Phones out of school ALL day?"',
    choices: [
      { t: '"Yes. Bell to bell."', fx: { stance: { phones: 1 }, hoods: { thomas: 1.5, creek: 1 }, coach: true }, res: 'Coach Rae endorses you! Parents cheer. Students are mad.' },
      { t: '"No. Class time is enough."', fx: { stance: { phones: -1 }, hoods: { kirkwood: 1.2 } }, res: 'Coach Rae endorses your rival. Students love your answer.' },
      { t: '"I won\'t change my answer for an endorsement."', fx: { all: .7 }, res: 'No endorsement, but people respect it. Integrity is a vibe.' }
    ], reveal: 'Endorsements from trusted local people can move votes, because people trust their own community.' };
}
function applyFx(fx) {
  if (!fx) return;
  if (fx.money) st.money = Math.max(0, st.money + fx.money);
  if (fx.loyalMult) st.loyalMult = fx.loyalMult;
  if (fx.all) HOODS.forEach(h => addEffort('you', h.id, fx.all));
  if (fx.hoods) Object.entries(fx.hoods).forEach(([k, v]) => addEffort('you', k, v));
  if (fx.rivalAll) ['r1', 'r2'].forEach(r => HOODS.forEach(h => addEffort(r, h.id, fx.rivalAll)));
  if (fx.stance) Object.entries(fx.stance).forEach(([k, v]) => st.stances[k] = v);
  if (fx.flag) st.flags[fx.flag] = true;
  if (fx.coach) { st.flags.coach = true; }
  if (fx.third === true) st.thirdActive = true;
}
let busy = false;
function endWeek() {
  if (busy) return;
  const ev = eventFor(st.week);
  if (st.ev[ev.id]) { if (st.rivalDone === st.week) afterRival(); else rivalTurn(); return; } // resume after a reload
  const card = $('#card'); card.className = 'card event';
  card.innerHTML = `<div class="art">${ev.art}</div><p class="eyebrow">WEEK ${st.week} · DRAMA</p><h2>${esc(ev.title)}</h2><p class="lead">${esc(ev.story)}</p><div class="choices">${ev.choices.map((c, i) => `<button class="choice" data-c="${i}">${esc(c.t)}</button>`).join('')}</div>`;
  $('#overlay').hidden = false;
  card.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
    const c = ev.choices[+b.dataset.c]; const before = {}; HOODS.forEach(h => before[h.id] = shares(h).you); const tb = totals().pct.you;
    let res = c.res;
    if (c.fx && c.fx.third === 'ask') {
      if (Math.random() < .4) { res = 'Dakota drops out and tells their fans to vote for you! Huge.'; HOODS.forEach(h => addEffort('you', h.id, .6)); st.flags.dakotaOut = true; }
      else { res = 'Dakota says no, on camera, and calls you "desperate." Dakota stays in.'; st.thirdActive = true; HOODS.forEach(h => addEffort('you', h.id, -.3)); }
    } else applyFx(c.fx);
    if (ev.id === 'coach' && st.flags.liar) { res += ' THEN: your party chair leaks that you planned to break your promise. Brutal.'; HOODS.forEach(h => addEffort('you', h.id, -2.5)); }
    st.ev[ev.id] = c.t;
    const moves = HOODS.map(h => ({ h, d: shares(h).you - before[h.id] })).filter(m => Math.abs(m.d) > .003);
    const ta = totals().pct.you;
    card.innerHTML = `<div class="art">${ev.art}</div><p class="eyebrow">WEEK ${st.week} · WHAT HAPPENED</p><h2>${esc(c.t)}</h2><div class="result">${esc(res)}</div><div class="deltas"><span class="delta ${ta >= tb ? 'up' : 'down'}">District ${ta >= tb ? '+' : ''}${(ta - tb).toFixed(1)}%</span>${moves.map(m => `<span class="delta ${m.d >= 0 ? 'up' : 'down'}">${esc(m.h.name)} ${m.d >= 0 ? '+' : ''}${(m.d * 100).toFixed(1)}%</span>`).join('')}</div><p class="reveal">${esc(ev.reveal)}</p><button class="primary go" id="cont">Next: see what your rival did →</button>`;
    save(); render();
    $('#cont').onclick = () => { $('#overlay').hidden = true; rivalTurn(); };
  });
}
function rivalTurn() {
  const cs = candidates().filter(c => c.id === 'r1' || c.id === 'r2');
  const notes = [];
  cs.forEach(c => {
    const targets = HOODS.map(h => { const s = shares(h); return { h, gap: Math.abs((s[c.id] || 0) - (s.you || 0)) }; }).sort((a, b) => a.gap - b.gap).slice(0, 3);
    targets.forEach(t => { addEffort(c.id, t.h.id, 3.2); MAP.van(t.h.id, c.id, '📣'); });
    HOODS.forEach(h => addEffort(c.id, h.id, .6));
    notes.push(c.name + ' campaigned in ' + targets.map(t => t.h.name.replace(' Neighborhoods', '')).join(', '));
  });
  if (st.thirdActive) HOODS.forEach(h => addEffort('third', h.id, 1));
  // practice classmates
  botTick();
  if (!liveOthers().length) {
    if (st.week === 2) { st.money = Math.max(0, st.money - 800); setTimeout(() => toast('Marcus T. stole one of your donors! −$800'), 1600); }
    if (st.week === 4) { HOODS.forEach(h => addEffort('you', h.id, .4)); setTimeout(() => toast('Ava L. teamed up with you. Extra volunteers!'), 1600); }
  }
  st.rivalDone = st.week; busy = true;
  toast(notes.join('. ') + '.');
  talk('Campaign staffer', 'They\'re targeting the close neighborhoods. We need to answer.');
  save(); render();
  setTimeout(afterRival, 1400);
}
function afterRival() {
  busy = true; const wk = st.week;
  const checkId = { 1: 'c_press', 2: 'c_feed', 3: 'c_bloc', 4: 'c_spoil', 5: 'c_coal' }[st.week];
  const next = () => {
    busy = false;
    if (st.week !== wk) return render();
    st.history.push(totals().pct.you);
    if (st.week >= WEEKS) { st.phase = 'election'; save(); render(); runElection(); return; }
    st.week++; st.energy = 3; save(); render();
  };
  if (st.checks[checkId] && st.checks[checkId].done) next(); else showCheck(checkId, next);
}

/* ---------------- ELECTION NIGHT ---------------- */
function runElection() {
  st.counted = [];
  const order = shuffle(HOODS.map(h => h.id));
  $('#overlay').hidden = true;
  let i = 0;
  const step = () => {
    if (st.phase !== 'election') return;
    if (i < order.length) {
      st.counted.push(order[i]); const h = HOOD[order[i]]; const s = shares(h);
      const lead = candidates().sort((a, b) => (s[b.id] || 0) - (s[a.id] || 0))[0];
      MAP.flash(h.id); i++; render();
      toast(h.name + ' goes to ' + (lead.id === 'you' ? 'YOU!' : lead.name + '.'));
      talk('Election night anchor', i < order.length ? i + ' of 6 neighborhoods in. Still too close to call…' : 'All six neighborhoods are in.');
      setTimeout(step, 1800);
    } else setTimeout(finishElection, 900);
  };
  render(); setTimeout(step, 900);
}
function countedTotals() {
  const cs = candidates(), v = {}; let all = 0; cs.forEach(c => v[c.id] = 0);
  (st.counted || []).forEach(id => { const h = HOOD[id], s = shares(h); cs.forEach(c => v[c.id] += (s[c.id] || 0) * h.pop); all += h.pop; });
  const pct = {}; cs.forEach(c => pct[c.id] = all ? v[c.id] / all * 100 : 0); return pct;
}
function finishElection() {
  const t = totals(), cs = candidates();
  const ranked = cs.slice().sort((a, b) => t.pct[b.id] - t.pct[a.id]);
  const win = ranked[0].id === 'you';
  const won = HOODS.filter(h => { const s = shares(h); return cs.every(c => c.id === 'you' || s.you >= s[c.id]); });
  let spoiler = '';
  if (st.thirdActive && t.pct.third) {
    const margin = Math.abs(t.pct[ranked[0].id] - t.pct[ranked[1].id]);
    if (t.pct.third > margin) spoiler = `Dakota Vance got ${t.pct.third.toFixed(1)}%, more than the ${margin.toFixed(1)}% gap between first and second. The third party may have decided this race.`;
  }
  const first = Object.keys(st.checks).filter(k => st.checks[k].done && !st.checks[k].wrong).length, totalQ = Object.keys(st.checks).length;
  const score = Math.round(t.pct.you * 100) + first * 50 + (win ? 1000 : 0);
  st.result = { win, pct: t.pct, won: won.map(h => h.name), spoiler, score, first, totalQ, winner: ranked[0].id === 'you' ? 'You' : ranked[0].name };
  st.phase = 'final'; save();
  if (window.Arena && Arena.live) Arena.update({ score: Math.round(t.pct.you * 10), stage: win ? 'WON' : 'lost' });
  $('#overlay').hidden = true; render();
}
function pElection() {
  const cs = candidates(), counted = st.counted || [];
  panel.innerHTML = `<p class="kicker">Election night · ${counted.length} of 6 in</p><h2>🗳️ Polls are closed.</h2><p class="lead">Watch the map. Neighborhoods report one at a time.</p>
  <div class="count-list">${HOODS.map(h => { if (!counted.includes(h.id)) return `<div class="cnt wait"><b>${esc(h.name)}</b><span>counting…</span></div>`; const s = shares(h); const lead = cs.slice().sort((a, b) => (s[b.id] || 0) - (s[a.id] || 0))[0]; return `<div class="cnt ${lead.id === 'you' ? 'yes' : 'no'}"><b>${esc(h.name)}</b><span>${lead.id === 'you' ? '✓ You' : esc(lead.name)} ${(s[lead.id] * 100).toFixed(0)}%</span></div>`; }).join('')}</div>`;
  $('#mapHint').textContent = 'Election night · results coming in';
}

/* ---------------- FINAL + TURN IN ---------------- */
const PROMPTS = [
  { id: 'coal', short: 'How I built my coalition', label: '1. How did you build your coalition? Name two neighborhoods (voting blocs) and what won or lost each one.', stem: 'I won/lost ___ because ___. I won/lost ___ because ___.', min: 90, words: 6, must: [['farm', 'north linn', 'thomas', 'parent', 'creek', 'retire', 'senior', 'kirkwood', 'college', 'student', 'riverside', 'union', 'factory', 'uptown', 'business', 'shop']], msg: 'In answer 1, name the neighborhoods (like Riverside Works or Uptown Marion).' },
  { id: 'crit', short: 'Critique: did my party help or hurt?', label: '2. Critique: Did your party (or running without one) help or hurt you? Give one way parties connect voters to government, and one problem with their influence.', stem: 'My party helped/hurt because ___. Parties connect voters by ___. One problem is ___.', min: 100, words: 6, must: [['democrat', 'republican', 'independent', 'money', 'volunteer', 'loyal', 'chair', 'donor', 'base'], ['recruit', 'candidate', 'platform', 'organiz', 'vote', 'choice', 'choose', 'label', 'team', 'money', 'turnout', 'together'], ['pressure', 'loyal', 'boss', 'control', 'money', 'ignore', 'district', 'split', 'divide', 'extreme', 'fight', 'promise', 'force', 'choice', 'only two']], msg: 'In answer 2, use details from YOUR campaign: what your party did for you, how parties connect voters, and one real problem.' }
];
function pFinal() {
  const r = st.result; if (!r) return;
  const cs = candidates();
  panel.innerHTML = `<p class="kicker">Results</p><p class="final-big ${r.win ? 'win' : 'lose'}">${r.win ? 'YOU WON!' : 'You lost.'}</p><p class="lead">${r.win ? 'You\'re the new state representative for District 101.' : esc(r.winner) + ' wins District 101.'}</p>
  <p>${cs.map(c => `<b style="color:${COLORS[c.id]}">${esc(c.id === 'you' ? 'You' : c.name)} ${r.pct[c.id].toFixed(1)}%</b>`).join(' · ')}</p>
  <h3>Why</h3><ul class="why-list"><li>Your coalition: <b>${r.won.length ? esc(r.won.join(', ')) : 'no neighborhoods'}</b> (${r.won.length} of 6).</li><li>You ran as <b>${esc(PARTY_NAME[st.party])}</b> with a <b>${esc(ideology().label)}</b> platform.</li>${r.spoiler ? `<li>${esc(r.spoiler)}</li>` : ''}<li>Quick checks right on the first try: <b>${r.first} of ${r.totalQ}</b>.</li></ul>
  <p class="mini">Score: <b>${r.score.toLocaleString()}</b> (vote % + first-try checks + win bonus)</p>
  ${PROMPTS.map(p => `<label for="w_${p.id}" style="display:block;font-weight:850;margin:12px 0 3px">${esc(p.label)}</label><p class="stem">${esc(p.stem)}</p><textarea id="w_${p.id}" style="width:100%;min-height:80px;border:1.5px solid #a4c5bf;border-radius:9px;padding:9px">${esc(st.writing[p.id] || '')}</textarea>`).join('')}
  <button class="primary go" id="sendBtn">${st.turnedIn ? 'Turn in again' : 'Turn in'}</button><p class="fb ${st.turnedIn ? 'good' : ''}" id="sendMsg">${st.turnedIn ? 'Turned in! You can fix your answers and turn in again.' : ''}</p>`;
  PROMPTS.forEach(p => $('#w_' + p.id).addEventListener('input', e => { st.writing[p.id] = e.target.value; save(); }));
  $('#sendBtn').onclick = turnIn;
  $('#mapHint').textContent = r.win ? 'Your coalition is shown in teal' : 'Neighborhoods you lost are shown in your rival\'s color';
}
function checkWriting(p, v) {
  if (/_{2,}/.test(v)) return 'Fill in the blanks with your own words for: ' + p.short + '.';
  if (v.length < p.min) return 'Write a little more for: ' + p.short + ' (1–2 full sentences).';
  const stem = new Set(p.stem.toLowerCase().match(/[a-z']+/g) || []);
  const own = new Set((v.toLowerCase().match(/[a-z']{3,}/g) || []).filter(w => !stem.has(w)));
  if (own.size < p.words) return 'Add more of your own ideas for: ' + p.short + '. Use details from your campaign.';
  if (/\b(won\/lost|helped\/hurt)\b/i.test(v)) return 'Pick one: won OR lost, helped OR hurt. Fix that in: ' + p.short + '.';
  const ownText = (v.toLowerCase().match(/[a-z']+/g) || []).filter(w => !stem.has(w)).join(' ');
  if (p.must.some(g => !g.some(w => ownText.includes(w)))) return p.msg;
  return '';
}
async function turnIn() {
  const msg = $('#sendMsg');
  for (const p of PROMPTS) { const v = ($('#w_' + p.id).value || '').trim(); const bad = checkWriting(p, v); if (bad) { msg.className = 'fb bad'; msg.textContent = bad; $('#w_' + p.id).focus(); return; } }
  const r = st.result, ids = Object.keys(st.checks);
  const answers = { 'Standard': 'SS.9-12.Gov.12', 'First-try correct': r.first + ' of ' + ids.length, 'First-try by standard': 'Gov.12: ' + r.first + ' of ' + ids.length,
    'Result': (r.win ? 'Won' : 'Lost') + ' · You ' + r.pct.you.toFixed(1) + '%', 'Party': PARTY_NAME[st.party], 'Ideology (from platform)': ideology().label,
    'Platform': ISSUES.map(i => i.short + ': ' + (st.stances[i.id] === 1 ? 'for' : 'against')).join('; '),
    'Belief roots (who shaped each take)': ISSUES.map(i => i.short + ' ← ' + (SOURCES.find(s => s[0] === st.roots[i.id]) || ['', '?'])[1]).join('; '),
    'Coalition (neighborhoods won)': r.won.join(', ') || 'none', 'Spoiler': r.spoiler || 'no', 'Score': String(r.score) };
  Object.entries(st.ev).forEach(([k, v]) => answers['Choice · ' + k] = v);
  ids.forEach(k => { const d = checkDef(k); answers['Check · ' + d.prompt.replace(/<[^>]+>/g, '').slice(0, 70)] = d.options[0] + (st.checks[k].wrong ? ' (after ' + st.checks[k].wrong + ' wrong)' : ' (first try)'); });
  PROMPTS.forEach(p => answers['Writing: ' + p.short] = ($('#w_' + p.id).value || '').trim());
  $('#sendBtn').disabled = true; msg.className = 'fb'; msg.textContent = 'Sending your work…';
  try {
    const res = await classTurnIn(OLD_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName: st.name, assignmentId: ASSIGN, assignmentTitle: 'Government Unit 2 · Day 1 · District 101', answers }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Your work did not save. Try again.');
    st.turnedIn = true; save(); msg.className = 'fb good'; msg.textContent = 'Turned in! Your teacher can see your work. You\'re done.'; $('#sendBtn').textContent = 'Turned in ✓';
  } catch (e) { msg.className = 'fb bad'; msg.textContent = e.message || 'Could not turn in. Try again.'; $('#sendBtn').disabled = false; }
}

/* =====================================================================
   THE MAP (canvas). Everything is drawn here; no outside images.
   ===================================================================== */
const MAP = (() => {
  const cv = $('#map'), ctx = cv.getContext('2d'), W = 960, H = 600;
  const paths = {}; HOODS.forEach(h => { const p = new Path2D(); h.poly.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); paths[h.id] = p; });
  const fills = { farms: '#d9e9b8', thomas: '#cfe5d6', creek: '#e3d9ef', kirkwood: '#f5e3b8', riverside: '#d7e1ea', uptown: '#f2d6c8' };
  const HQ = [322, 296];
  const vans = [], floats = [], flashes = {};
  let hover = null, t0 = performance.now();
  const center = h => [h.box[0] + h.box[2] / 2, h.box[1] + h.box[3] / 2 + 10];
  function van(hid, cid, icon) {
    const to = hid ? center(HOOD[hid]) : [W / 2, H / 2];
    const from = cid === 'you' ? HQ : [W - 40, H - 40];
    vans.push({ from, to, t: 0, color: COLORS[cid] || '#555', icon, dur: 1100 });
  }
  function float(hid, text) { const c = center(HOOD[hid]); floats.push({ x: c[0], y: c[1] - 40, text, t: 0 }); }
  function flash(hid) { flashes[hid] = performance.now(); }
  /* tiny drawing kit (same style as My Country, My Rules) */
  function tree(x, y, s = 10) { ctx.fillStyle = '#906b43'; ctx.fillRect(x - 2, y, 4, s); ctx.fillStyle = '#4b9a70'; ctx.beginPath(); ctx.arc(x, y - 3, s * .75, 0, 7); ctx.fill(); ctx.fillStyle = '#6bb47a'; ctx.beginPath(); ctx.arc(x - s * .35, y - s * .4, s * .55, 0, 7); ctx.fill(); }
  function home(x, y, roof = '#e58b60') { ctx.fillStyle = '#fff7e1'; ctx.fillRect(x - 10, y - 6, 20, 19); ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 14, y - 6); ctx.lineTo(x, y - 18); ctx.lineTo(x + 14, y - 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5b8c9b'; ctx.fillRect(x - 6, y, 5, 5); ctx.fillRect(x + 3, y, 5, 5); ctx.fillStyle = '#a17b5c'; ctx.fillRect(x - 2, y + 6, 5, 7); }
  function face(x, y, mood, shirt) { ctx.save(); ctx.fillStyle = shirt; ctx.beginPath(); ctx.roundRect(x - 7, y + 2, 14, 17, 5); ctx.fill(); ctx.fillStyle = ['#a87350', '#e0b48f', '#6e4a33', '#c98f66'][Math.abs(Math.round(x + y)) % 4]; ctx.beginPath(); ctx.arc(x, y - 6, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#473b3c'; ctx.beginPath(); ctx.arc(x - 3, y - 7, 1.2, 0, 7); ctx.arc(x + 3, y - 7, 1.2, 0, 7); ctx.fill(); ctx.strokeStyle = '#473b3c'; ctx.lineWidth = 1.5; ctx.beginPath(); if (mood > 0) ctx.arc(x, y - 5, 4, .2, Math.PI - .2); else if (mood < 0) ctx.arc(x, y + 1, 4, Math.PI + .2, -.2); else { ctx.moveTo(x - 3, y - 2); ctx.lineTo(x + 3, y - 2); } ctx.stroke(); ctx.restore(); }
  function capsule(text, x, y, w = 190, size = 13, bg = '#fffdf3f2', fg = '#284f59') { ctx.save(); ctx.fillStyle = bg; ctx.strokeStyle = '#6e8a8670'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 12, w, 24, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = fg; ctx.font = 'bold ' + size + 'px system-ui,Arial'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 4.5, w - 12); ctx.restore(); }
  function sign(x, y, color) { ctx.fillStyle = '#7b6a55'; ctx.fillRect(x - 1, y, 2, 12); ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x - 8, y - 9, 16, 10, 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center'; ctx.fillText('VOTE', x, y - 2); }
  function deco(h, now) {
    const [x, y, w] = h.box;
    ctx.save();
    if (h.id === 'farms') {
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#c4d98e' : '#e8d98a'; ctx.fillRect(x + 22, y + 52 + i * 11, 130, 9); }
      ctx.fillStyle = '#b8473b'; ctx.fillRect(x + 180, y + 66, 46, 34); ctx.beginPath(); ctx.moveTo(x + 176, y + 66); ctx.lineTo(x + 203, y + 46); ctx.lineTo(x + 230, y + 66); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x + 197, y + 80, 12, 20);
      ctx.fillStyle = '#c9cfd4'; ctx.fillRect(x + 236, y + 44, 18, 56); ctx.beginPath(); ctx.arc(x + 245, y + 44, 9, Math.PI, 0); ctx.fill();
      tree(x + 266, y + 96, 11); tree(x + 162, y + 60, 9);
    } else if (h.id === 'thomas') {
      [0, 1, 2, 3].forEach(i => home(x + 36 + i * 38, y + 72, ['#e58b60', '#7aa6c2', '#d9a441', '#8fb37a'][i]));
      ctx.fillStyle = '#e9c27c'; ctx.fillRect(x + 196, y + 56, 76, 44); ctx.fillStyle = '#b5523f'; ctx.fillRect(x + 196, y + 50, 76, 8); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('SCHOOL', x + 234, y + 82);
      ctx.fillStyle = '#555'; ctx.fillRect(x + 278, y + 40, 2, 60); ctx.fillStyle = '#c8473f'; ctx.fillRect(x + 280, y + 40 + Math.sin(now / 400) * 1.5, 14, 9);
      tree(x + 30, y + 112, 9); tree(x + 180, y + 112, 9);
    } else if (h.id === 'creek') {
      ctx.strokeStyle = '#7cc3d6'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + w - 30, y + 10); ctx.bezierCurveTo(x + w - 70, y + 70, x + w - 10, y + 120, x + w - 60, y + 240); ctx.stroke();
      ctx.fillStyle = '#2f6f86'; ctx.font = 'bold 9px Arial'; ctx.fillText('Indian Creek', x + w - 112, y + 150);
      ctx.fillStyle = '#efe4f6'; ctx.fillRect(x + 30, y + 50, 96, 58); ctx.strokeStyle = '#a58dc0'; ctx.lineWidth = 2; ctx.strokeRect(x + 30, y + 50, 96, 58);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = (r + c + Math.floor(now / 3000)) % 4 ? '#ffe9a6' : '#9fb7c9'; ctx.fillRect(x + 38 + c * 18, y + 57 + r * 16, 10, 9); }
      ctx.fillStyle = '#8fc79a'; ctx.beginPath(); ctx.arc(x + 160, y + 92, 22, 0, 7); ctx.fill(); ['#f28b8b', '#f7d26a', '#c79ae0'].forEach((cl, i) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(x + 150 + i * 10, y + 88 + (i % 2) * 8, 4, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#9c7a52'; ctx.fillRect(x + 192, y + 98, 30, 5);
    } else if (h.id === 'kirkwood') {
      ctx.fillStyle = '#f0e2c4'; ctx.fillRect(x + 30, y + 62, 130, 50); ctx.fillStyle = '#c9a14e'; ctx.beginPath(); ctx.moveTo(x + 24, y + 62); ctx.lineTo(x + 95, y + 38); ctx.lineTo(x + 166, y + 62); ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(x + 40 + i * 24, y + 66, 6, 44); }
      ctx.fillStyle = '#7a5a22'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('COLLEGE', x + 95, y + 58);
      ctx.strokeStyle = '#4e6e86'; ctx.lineWidth = 2; [0, 1].forEach(i => { const bx = x + 196 + i * 34 + Math.sin(now / 700 + i) * 3; ctx.beginPath(); ctx.arc(bx, y + 104, 7, 0, 7); ctx.arc(bx + 18, y + 104, 7, 0, 7); ctx.stroke(); });
      tree(x + 260, y + 70, 11);
    } else if (h.id === 'riverside') {
      ctx.fillStyle = '#b6c4cf'; ctx.fillRect(x + 30, y + 58, 120, 52); ctx.fillStyle = '#93a5b3'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 30 + i * 30, y + 58); ctx.lineTo(x + 45 + i * 30, y + 44); ctx.lineTo(x + 60 + i * 30, y + 58); ctx.fill(); }
      ctx.fillStyle = '#7d8c97'; ctx.fillRect(x + 128, y + 22, 14, 40);
      for (let i = 0; i < 4; i++) { const p = ((now / 1800) + i / 4) % 1; ctx.fillStyle = `rgba(200,205,210,${.7 - p * .7})`; ctx.beginPath(); ctx.arc(x + 135 + p * 30, y + 18 - p * 40, 6 + p * 10, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#e7d3a8'; ctx.fillRect(x + 186, y + 66, 76, 44); ctx.fillStyle = '#9d3f30'; ctx.fillRect(x + 186, y + 60, 76, 8); ctx.fillStyle = '#5a3a20'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('UNION HALL', x + 224, y + 92);
    } else if (h.id === 'uptown') {
      ['#e07a5f', '#5f9ea0', '#e9b85f', '#8d7bc0', '#7fb069'].forEach((cl, i) => { const sx = x + 24 + i * 50; ctx.fillStyle = '#f7ead6'; ctx.fillRect(sx, y + 52, 44, 50); ctx.fillStyle = cl; ctx.beginPath(); ctx.moveTo(sx - 2, y + 62); for (let k = 0; k < 6; k++) { ctx.lineTo(sx + k * 8.8, y + 52); ctx.lineTo(sx + k * 8.8 + 4.4, y + 64); } ctx.lineTo(sx + 46, y + 52); ctx.fill(); ctx.fillStyle = '#7fb3c9'; ctx.fillRect(sx + 6, y + 72, 32, 16); });
      ctx.fillStyle = '#263b50'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText('UPTOWN MARION', x + w / 2, y + 116);
    }
    ctx.restore();
  }
  function people(h) {
    const s = shares(h), cs = candidates(); const n = 10, [x, y, w, hh] = h.box;
    const counts = cs.map(c => ({ c, k: Math.round((s[c.id] || 0) * n) }));
    let seq = []; counts.forEach(o => { for (let i = 0; i < o.k; i++) seq.push(o.c.id); }); while (seq.length < n) seq.push(cs[cs.length > 1 ? 1 : 0].id); seq = seq.slice(0, n);
    const started = !!st.party && !(st.phase === 'election' && !(st.counted || []).includes(h.id));
    seq.forEach((cid, i) => { const px = x + 36 + (i % 5) * 50 + (i >= 5 ? 22 : 0), py = y + hh - 64 + (i >= 5 ? 30 : 0); face(px, py, !started ? 0 : cid === 'you' ? 1 : -1, !started ? '#b9c3c8' : COLORS[cid]); });
    if (started) { const yours = Math.round(s.you * 6); for (let i = 0; i < 6; i++) sign(x + w - 26 - i * 22, y + hh - 92, i < yours ? COLORS.you : COLORS[cs[1] ? cs[1].id : 'r1']); }
  }
  function draw(now) {
    const dt = now - t0; t0 = now;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e9f1e2'; ctx.fillRect(0, 0, W, H);
    // roads
    ctx.fillStyle = '#c9c4b8'; ctx.fillRect(314, 0, 18, H - 40); ctx.fillRect(0, 290, W, 14); ctx.fillRect(630, 0, 18, H - 40);
    ctx.strokeStyle = '#fff8'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(323, 0); ctx.lineTo(323, H - 40); ctx.moveTo(0, 297); ctx.lineTo(W, 297); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) { const p = ((now / 5200) + i / 3) % 1; ctx.fillStyle = ['#e07a5f', '#5f9ea0', '#e9b85f'][i]; ctx.fillRect(316 + (i % 2) * 8, p * (H - 60), 7, 12); const q = ((now / 7000) + i / 3) % 1; ctx.fillRect(q * W, 292 + (i % 2) * 5, 13, 6); }
    // river
    ctx.fillStyle = '#9fd3e3'; ctx.beginPath(); ctx.moveTo(0, H - 34); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H - 30 + Math.sin(x / 90 + now / 1500) * 4); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = '#2f6f86'; ctx.font = 'bold 12px system-ui,Arial'; ctx.textAlign = 'left'; ctx.fillText('CEDAR RIVER', 30, H - 10);
    // neighborhoods
    const night = st.phase === 'election' || st.phase === 'final';
    HOODS.forEach(h => {
      let fill = fills[h.id];
      if (night && st.counted && st.counted.includes(h.id) || st.phase === 'final') { const s = shares(h); const lead = candidates().sort((a, b) => (s[b.id] || 0) - (s[a.id] || 0))[0]; fill = lead.id === 'you' ? '#bfe6dd' : lead.id === 'third' ? '#ddd2f0' : '#f6d2c4'; }
      ctx.fillStyle = fill; ctx.fill(paths[h.id]);
      ctx.lineWidth = st.selected === h.id && st.phase === 'campaign' ? 5 : hover === h.id ? 3.5 : 2;
      ctx.strokeStyle = st.selected === h.id && st.phase === 'campaign' ? '#c55840' : hover === h.id ? '#52988f' : '#fffdf6';
      ctx.stroke(paths[h.id]);
      if (flashes[h.id] && now - flashes[h.id] < 900) { ctx.fillStyle = `rgba(255,255,255,${.6 * (1 - (now - flashes[h.id]) / 900)})`; ctx.fill(paths[h.id]); }
      deco(h, now); people(h);
      const [x, y, w] = h.box;
      capsule(h.name, x + w / 2, y + 22, 200, 13);
      if (st.party && !(st.phase === 'election' && !(st.counted || []).includes(h.id))) { const s = shares(h); capsule('You ' + (s.you * 100).toFixed(0) + '%', x + w / 2, y + 48 + 4, 92, 12, s.you >= Math.max(...Object.values(s)) - 1e-9 ? COLORS.you : '#fff', s.you >= Math.max(...Object.values(s)) - 1e-9 ? '#fff' : COLORS.you); }
      if (st.phase === 'campaign' && !st.revealed[h.id]) { ctx.fillStyle = '#e9b85f'; ctx.beginPath(); ctx.arc(x + w - 18, y + 22, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('?', x + w - 18, y + 27); }
    });
    capsule('I-380', 323, 352, 52, 11, '#2f6f86', '#fff');
    // HQ
    ctx.fillStyle = COLORS.you; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 15; ctx.lineTo(HQ[0] + Math.cos(a) * r, HQ[1] + Math.sin(a) * r); } ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    // vans
    for (let i = vans.length - 1; i >= 0; i--) { const v = vans[i]; v.t += dt; const p = Math.min(1, v.t / v.dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; const vx = v.from[0] + (v.to[0] - v.from[0]) * e, vy = v.from[1] + (v.to[1] - v.from[1]) * e - Math.sin(p * Math.PI) * 30; ctx.fillStyle = v.color; ctx.beginPath(); ctx.roundRect(vx - 16, vy - 10, 32, 18, 6); ctx.fill(); ctx.fillStyle = '#263b50'; ctx.beginPath(); ctx.arc(vx - 9, vy + 9, 4, 0, 7); ctx.arc(vx + 9, vy + 9, 4, 0, 7); ctx.fill(); ctx.font = '15px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(v.icon, vx, vy + 4); if (v.t > v.dur + 500) vans.splice(i, 1); }
    // floating numbers
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; const p = f.t / 1600; ctx.globalAlpha = Math.max(0, 1 - p); ctx.fillStyle = f.text.startsWith('-') ? '#b0412f' : '#1d7a52'; ctx.font = 'bold 24px system-ui,Arial'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y - p * 40); ctx.globalAlpha = 1; if (p >= 1) floats.splice(i, 1); }
    if (st.phase === 'election') { ctx.fillStyle = 'rgba(25,35,70,.18)'; ctx.fillRect(0, 0, W, H); }
    requestAnimationFrame(draw);
  }
  function hit(e) { const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height; return HOODS.find(h => ctx.isPointInPath(paths[h.id], x, y)); }
  cv.addEventListener('mousemove', e => { const h = hit(e); hover = h ? h.id : null; });
  cv.addEventListener('mouseleave', () => hover = null);
  cv.addEventListener('click', e => { const h = hit(e); if (!h || st.phase !== 'campaign') return; st.selected = h.id; save(); render(); });
  requestAnimationFrame(draw);
  return { van, float, flash };
})();

/* ---------------- BOOT ---------------- */
$('#helpBtn').onclick = () => $('#helpDialog').showModal();
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => $('#' + b.dataset.close).close());
$('#resetBtn').onclick = () => { if (!confirm('Start over? This erases your campaign on this device.')) return; const n = st.name, r = st.room; st = fresh(); st.name = n; st.room = r; if (window.classFirstTry) classFirstTry.reset(); save(); $('#overlay').hidden = true; render(); };
if (st.phase !== 'intro') startArena();
if (st.phase === 'election') { runElection(); }
if (st.phase === 'campaign') {
  if (!(st.checks.c_iv && st.checks.c_iv.done) || !(st.checks.c_party && st.checks.c_party.done)) setTimeout(() => showCheck('c_iv', () => showCheck('c_party', render)), 300);
  else if (st.ev[eventFor(st.week).id]) setTimeout(endWeek, 300);
}
render();
if (st.phase !== 'intro') talk('Campaign staffer', 'Welcome back, ' + (st.name || '') + '. Right where you left off.');
})();
