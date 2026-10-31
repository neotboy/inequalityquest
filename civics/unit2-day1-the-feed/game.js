'use strict';
/* =====================================================================
   FAIR GAME · Government Unit 2 Day 1 · SS.9-12.Gov.12
   Students work a party booth at the Iowa State Fair (booth assigned at
   random, then swapped halfway). For each fairgoer: spot what shaped their
   beliefs (political socialization), place them on the idea map (ideology),
   and play the party card that fits them, or honestly send them to the other
   booth (ideology vs. party; parties connect citizens to government).
   No student opinions are collected.
   Real: both major parties run booths in the Varied Industries Building at
   the Iowa State Fair (Des Moines, August); Iowa's minimum wage is $7.25;
   Iowa's 2023 law lets state money follow a student to private school.
   Fairgoers are made up.
   ===================================================================== */
(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const KEY = 'gov-u2d1-fairgame-v1';
const ASSIGN = 'gov-unit2-day1-the-feed';
const OLD_API = 'https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit';
const PARTY = { D: 'Democrats', R: 'Republicans' };
const PCOLOR = { D: '#3e6fb0', R: '#c2463f' };

/* ---------------- DATA ---------------- */
const INFL = { family: '👪 Family', friends: '🧑‍🤝‍🧑 Friends', school: '🏫 School', faith: '⛪ Faith', job: '💼 Job', media: '📱 Media', community: '🏘️ Community' };
const QUADS = { pop: 'Populist', con: 'Conservative', lib: 'Liberal', libt: 'Libertarian' };
const CARDS = {
  health:   { p: 'D', ic: '🩺', t: 'Government help with health costs', s: 'Help people pay for care' },
  wage:     { p: 'D', ic: '💵', t: 'Raise the minimum wage', s: "Iowa's is $7.25 an hour" },
  unions:   { p: 'D', ic: '🦺', t: 'Stand up for unions', s: 'Workers bargain together for pay' },
  college:  { p: 'D', ic: '🎓', t: 'Help pay for college', s: 'More state money for schools and colleges' },
  gunsafe:  { p: 'D', ic: '🔒', t: 'Stricter gun laws', s: 'Like background checks on all sales' },
  energy:   { p: 'D', ic: '🌬️', t: 'Clean energy rules', s: 'Cut pollution, grow wind and solar' },
  taxes:    { p: 'R', ic: '✂️', t: 'Cut taxes', s: 'Families and businesses keep more' },
  regs:     { p: 'R', ic: '📋', t: 'Fewer rules on business', s: 'Less paperwork, fewer permits' },
  gunright: { p: 'R', ic: '🦌', t: 'Protect gun rights', s: 'Fewer limits on owning guns' },
  police:   { p: 'R', ic: '🚓', t: 'More money for police', s: 'More officers on the street' },
  border:   { p: 'R', ic: '🛂', t: 'More border enforcement', s: 'More agents and barriers at the border' },
  choice:   { p: 'R', ic: '🏫', t: 'School choice', s: 'State money can follow a kid to private school' },
  farmers:  { p: 'both', ic: '🌽', t: 'Support Iowa farmers', s: 'BOTH parties push for this' },
  vets:     { p: 'both', ic: '🎖️', t: 'Take care of veterans', s: 'BOTH parties push for this' },
  redirect: { p: 'redirect', ic: '👉', t: 'Try the other booth', s: "Be honest: our party isn't your best fit" }
};
const deckOf = b => Object.keys(CARDS).filter(k => CARDS[k].p === b || CARDS[k].p === 'both');
// Each fairgoer: one clear influence, one money clue + one personal-choices clue, what they respond to.
const FOLKS = [
  { id: 'dana', name: 'Dana', bio: '34 · VA hospital nurse · Des Moines', clue: 'job', quad: 'lib',
    say: 'At <mark>my job at the VA hospital</mark>, I see patients skip pills because they cost too much. <u>Government should help bring health costs down.</u> But <u>what people do in their own lives isn\'t the government\'s business.</u>',
    wants: ['health'], twist: 'Dana is registered with no party. Hundreds of thousands of Iowa voters are.',
    look: { skin: 2, hair: 'bun', hc: '#2d211b', shirt: '#6fb7c9', extra: 'badge' } },
  { id: 'earl', name: 'Earl', bio: '63 · corn and hog farmer · near Grundy Center', clue: 'community', quad: 'con',
    say: 'Every morning I have coffee with <mark>the guys at the grain co-op</mark>. We all say <u>property taxes are too high and farms have too many rules.</u> And <u>keep the betting age at 21. Kids need rules.</u>',
    wants: ['taxes', 'regs', 'farmers'], twist: 'Earl has voted Republican for 40 years. He says both parties show up at the fair to talk farming.',
    look: { skin: 0, hair: 'cap', hc: '#9a9a9a', shirt: '#7b8f4e', extra: 'cap' } },
  { id: 'maya', name: 'Maya', bio: '19 · Iowa State student · Ames', clue: 'media', quad: 'lib',
    say: '<mark>My TikTok feed</mark> is full of videos about student debt. Now I think <u>college should cost way less, and the state should help pay.</u> And <u>adults should be free to live how they want.</u>',
    wants: ['college'], twist: 'Maya hasn\'t picked a party yet. Lots of young voters haven\'t.',
    look: { skin: 1, hair: 'long', hc: '#141014', shirt: '#c43b3b', extra: 'backpack' } },
  { id: 'ray', name: 'Ray', bio: '47 · owns a trucking company · Council Bluffs', clue: 'family', quad: 'libt',
    say: '<mark>My grandpa started this company</mark>, and he always said: keep government off your back. <u>Cut taxes and cut the paperwork.</u> And <u>let adults make their own choices, like betting at 18.</u>',
    wants: ['taxes', 'regs'], twist: 'Ray votes Republican on taxes, but on personal choices he sounds libertarian.',
    look: { skin: 3, hair: 'short', hc: '#4a3426', shirt: '#2f5d7c', extra: 'glasses' } },
  { id: 'walt', name: 'Walt', bio: '72 · Vietnam veteran · Dubuque', clue: 'friends', quad: 'pop',
    say: '<mark>My old Army buddies</mark> and I still meet every week. We agree: <u>the government must take care of veterans and protect Social Security.</u> And <u>we need stricter rules, like curfews for teens.</u>',
    wants: ['vets'], twist: 'Walt has voted for Democrats AND Republicans. He votes for the person, not the party.',
    look: { skin: 2, hair: 'bald', hc: '#cfcfcf', shirt: '#5b6b3c', extra: 'vetcap' } },
  { id: 'tyler', name: 'Tyler', bio: '27 · union electrician · Cedar Rapids', clue: 'family', quad: 'pop',
    say: '<mark>My dad and grandpa were union electricians</mark>, just like me. <u>Unions got us better pay, and I want the minimum wage raised too.</u> And <u>keep strict rules on vaping and gambling.</u> Oh, and nobody touches my hunting rifle.',
    wants: ['unions', 'wage', 'gunright'], twist: 'Tyler is a registered Democrat who backs gun rights. Lots of union members do.',
    look: { skin: 1, hair: 'short', hc: '#a0522d', shirt: '#f0a43a', extra: 'hardhat' } },
  { id: 'rosa', name: 'Rosa', bio: '45 · owns a bakery · West Liberty', clue: 'job', quad: 'con',
    say: '<mark>Running my bakery</mark> taught me a lot. <u>Small shops need lower taxes and fewer permits.</u> And <u>keep marijuana illegal in Iowa. We need strict rules.</u>',
    wants: ['regs', 'taxes'], twist: 'Plot twist: Rosa is a registered Democrat. On business rules, she agrees with Republicans.',
    look: { skin: 2, hair: 'long', hc: '#2b1d16', shirt: '#f4f1ea', extra: 'apron' } },
  { id: 'jayden', name: 'Jayden', bio: '18 · high school senior · Waterloo', clue: 'school', quad: 'pop',
    say: '<mark>In civics class</mark>, we read both sides of the minimum wage debate. Now I think <u>it should go up.</u> And <u>keep the betting age at 21. Gambling hooks too many people.</u>',
    wants: ['wage'], twist: 'Jayden just turned 18 and registered to vote at the Secretary of State\'s booth in this same building.',
    look: { skin: 3, hair: 'short', hc: '#120d0b', shirt: '#4f8f5b', extra: 'none' } },
  { id: 'priya', name: 'Priya', bio: '29 · software tester · West Des Moines', clue: 'media', quad: 'libt',
    say: 'I listen to <mark>political podcasts on my commute</mark> every day. They convinced me <u>taxes are too high and government wastes money.</u> And <u>what adults do on their own time is their business.</u>',
    wants: ['taxes'], twist: 'Priya usually votes Republican, but on personal freedom she agrees with a lot of Democrats.',
    look: { skin: 1, hair: 'long', hc: '#1c1412', shirt: '#7b5fb2', extra: 'earbuds' } },
  { id: 'luis', name: 'Luis', bio: '51 · factory worker · Newton', clue: 'faith', quad: 'lib',
    say: '<mark>At my church</mark>, we help families who lost jobs when the Maytag plant closed. <u>Workers need protection: good wages and strong unions.</u> But <u>what adults do on their own time is their business.</u>',
    wants: ['unions', 'wage'], twist: 'Luis has switched parties twice in his life. Party isn\'t forever.',
    look: { skin: 2, hair: 'short', hc: '#2a2a2a', shirt: '#8a4b3a', extra: 'none' } }
];
const FOLK = Object.fromEntries(FOLKS.map(f => [f.id, f]));
const BASE = [['dana', 'earl', 'maya', 'ray', 'walt'], ['tyler', 'rosa', 'jayden', 'priya', 'luis']];
let ORDER = BASE[0].concat(BASE[1]);

const CHECKS = {
  c_both: { prompt: 'Shift change! Before you switch booths: which goal do <b>BOTH</b> parties push for?', options: ['Take care of veterans', 'Raise the minimum wage', 'Protect gun rights', 'Cut taxes'], hint: 'Think about the purple cards you saw in your hand.', why: 'The parties disagree on a lot, but they also share goals, like supporting veterans and Iowa farmers.' },
  c_iv: { prompt: 'Rosa landed in <b>Conservative</b> on the idea map, but she\'s a registered <b>Democrat</b>. What does that show?', options: ['Party and ideology don\'t always match up', 'Rosa is secretly a Republican on every issue', 'Democrats all share one ideology except Rosa', 'The idea map decides which party you join'], hint: 'One is a set of beliefs. The other is a group you join.', why: 'Your ideology is your set of beliefs. A party is a group that runs candidates. People join the party that fits them BEST, not perfectly.' },
  c_link: { prompt: 'How did your booth connect fairgoers to <b>government</b>?', options: ['It got people to vote and help elect candidates', 'It wrote new state laws right there at the fair', 'It decided which fairgoers were allowed to vote', 'It counted the official votes for the governor'], hint: 'What did people actually do at your booth?', why: 'Parties are a link between people and government. They recruit voters and volunteers and help elect candidates who make laws.' }
};

/* ---------------- STATE ---------------- */
const fresh = () => ({ v: 1, order: shuffle(BASE[0]).concat(shuffle(BASE[1])), phase: 'intro', name: '', room: '', boothA: Math.random() < .5 ? 'D' : 'R', idx: 0, step: 'listen', res: {}, score: 0, checks: {}, writing: {}, turnedIn: false, bots: null, hand: null, chips: null, pat: 60, seen: {} });
let st;
try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!st || st.v !== 1 || !st.order) st = fresh();
ORDER = st.order;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
const booth = () => st.idx < 5 ? st.boothA : (st.boothA === 'D' ? 'R' : 'D');
const other = b => b === 'D' ? 'R' : 'D';
const cur = () => FOLK[ORDER[st.idx]];
const rec = id => st.res[id] || (st.res[id] = { clueWrong: 0, mapWrong: 0, pitch: null, card: null, pts: 0 });

/* ---------------- UI helpers ---------------- */
const tray = $('#tray');
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3000); }
function hud() {
  $('#shiftPill').textContent = st.phase === 'play' ? (st.idx < 5 ? 'Shift 1' : 'Shift 2') + ' · ' + PARTY[booth()] + ' booth' : st.phase === 'final' ? 'Fair\'s over!' : 'Iowa State Fair';
  $('#countPill').textContent = st.phase === 'play' ? 'Fairgoer ' + (st.idx + 1) + ' of 10' : '';
  $('#scorePill').textContent = '🌽 ' + st.score.toLocaleString();
  race();
}
function stepsBar(on) {
  const names = [['listen', '1 Listen'], ['map', '2 Map it'], ['pitch', '3 Pitch']]; const order = names.map(n => n[0]).concat(['result']);
  return `<div class="steps">${names.map(([k, l]) => `<span class="${k === on ? 'on' : order.indexOf(k) < order.indexOf(on) ? 'done' : ''}">${l}</span>`).join('')}<span style="background:none;margin-left:auto">${esc(cur().name)} · ${esc(cur().bio)}</span></div>`;
}

/* ---------------- CLASS RACE ---------------- */
let livePlayers = [];
function liveOthers() { return (window.Arena && Arena.live) ? livePlayers.filter(p => !p.me && p.name !== st.name) : []; }
function race() {
  if (!st.bots) st.bots = [{ name: 'Kenzie R.', s: 0 }, { name: 'Marcus T.', s: 0 }, { name: 'Ava L.', s: 0 }];
  const lo = liveOthers(), live = lo.length > 0;
  const rows = (live ? lo.map(p => ({ name: p.name, s: p.score })) : st.bots).map(o => ({ name: o.name, s: o.s })).concat([{ name: 'You', s: st.score, me: true }]).sort((a, b) => b.s - a.s).slice(0, 5);
  $('#race').innerHTML = `<div class="t">🏁 CLASS RACE<span class="tag ${live ? 'live' : ''}">${live ? 'LIVE' : 'practice'}</span></div><ol>${rows.map((r, i) => `<li class="${r.me ? 'me' : ''}"><span class="n">${i + 1}</span><span class="nm">${esc(r.name)}</span><span class="sc">🌽${r.s}</span></li>`).join('')}</ol>`;
  $('#race').style.display = st.phase === 'intro' ? 'none' : '';
}
function botsStep() { if (liveOthers().length) return; (st.bots || []).forEach((b, i) => { b.s += Math.round([95, 120, 80][i] * (0.6 + Math.random() * 0.8)); }); }
function startArena() {
  if (!window.Arena) return;
  Arena.join({ game: ASSIGN, name: st.name, room: st.room, onBoard(players) { livePlayers = players; race(); }, onEvent() {} });
}
function pushScore() { if (window.Arena && Arena.live) Arena.update({ score: st.score, stage: st.phase === 'play' ? 'Fairgoer ' + (st.idx + 1) : st.phase }); }

/* ---------------- PATIENCE TIMER ---------------- */
let patTimer = null;
function startPatience() {
  clearInterval(patTimer); $('#patience').hidden = false;
  const full = st.rainFor === st.idx ? 30 : 60;
  patTimer = setInterval(() => { if (!$('#overlay').hidden) return; st.pat = Math.max(0, st.pat - 1); $('#patienceFill').style.width = (st.pat / full * 100) + '%'; if (st.pat === 0) SCENE.mood(-0.5); if (st.pat % 5 === 0) save(); }, 1000);
  $('#patienceFill').style.width = (st.pat / full * 100) + '%';
}
function stopPatience() { clearInterval(patTimer); }

/* ---------------- LOCK + RESHUFFLE for wrong answers ---------------- */
function lockThen(container, fb, msg, redraw, keep) {
  container.querySelectorAll('button').forEach(b => b.disabled = true);
  if (!keep) { st.lockUntil = Date.now() + 4000; st.lockMsg = msg; save(); }
  let left = Math.max(1, Math.ceil(((st.lockUntil || 0) - Date.now()) / 1000));
  const tick = () => { fb.className = 'fb bad'; fb.textContent = msg + ' Try again in ' + left + '…'; if (left-- <= 0) { st.lockUntil = 0; save(); return redraw(msg); } setTimeout(tick, 1000); };
  tick();
}

/* ---------------- RENDER ---------------- */
function render() {
  hud();
  ({ intro: pIntro, primer: pPrimer, play: pPlay, endchecks: pEnd, final: pFinal })[st.phase]();
}

function pIntro() {
  tray.innerHTML = '';
  SCENE.set(null);
  const card = $('#card'); card.className = 'card';
  card.innerHTML = `<p class="eyebrow">GOVERNMENT · UNIT 2 · DAY 1</p><h2>Fair Game: Booth Duty</h2>
  <p class="lead">Your summer job: work a political party's booth in the Varied Industries Building at the Iowa State Fair. Ten fairgoers. Read them right, pitch them right, and collect more corn 🌽 than your classmates.</p>
  <p class="note">Your boss assigns your booth. Halfway through, you switch to the other party's booth. About 20–25 minutes.</p>
  <label for="nm">Your name: first name + last initial (like Jordan M.)</label><input id="nm" maxlength="40" autocomplete="off" value="${esc(st.name)}" placeholder="Jordan M.">
  <label for="rm">Class code (optional, from your teacher)</label><input id="rm" maxlength="12" autocomplete="off" value="${esc(st.room)}" placeholder="like 3rd">
  <p class="fb" id="nmMsg"></p><button class="primary go" id="startBtn">Clock in →</button>
  <p class="std"><b>SS.9-12.Gov.12</b> Critique the influence of intermediary institutions on government and policy. Fairgoers are made up. The fair, the booths, and the party positions are real.</p>`;
  $('#overlay').hidden = false;
  $('#startBtn').onclick = () => {
    const n = window.classShortName ? classShortName($('#nm').value) : $('#nm').value.trim();
    if (!/^\S+ [A-Z]\.$/.test(n)) { $('#nmMsg').className = 'fb bad'; $('#nmMsg').textContent = 'Type your first name and last initial, like Jordan M.'; return; }
    st.name = n; st.room = $('#rm').value.trim(); st.phase = 'primer'; st.primer = 0;
    if (window.classFirstTry) classFirstTry.reset();
    save(); $('#overlay').hidden = true; startArena(); render();
  };
}

function deckHTML(b) {
  return `<div class="deck"><h3 style="color:${PCOLOR[b]}">${PARTY[b]} booth deck</h3><ul>${deckOf(b).map(k => `<li class="${CARDS[k].p === 'both' ? 'shared' : ''}">${CARDS[k].ic} ${esc(CARDS[k].t)}${CARDS[k].p === 'both' ? ' (both)' : ''}</li>`).join('')}</ul></div>`;
}
function pPrimer() {
  SCENE.set(null);
  const card = $('#card'); card.className = 'card';
  if (!st.primer) {
    card.innerHTML = `<p class="eyebrow">TRAINING · 1 OF 2</p><h2>How to read a fairgoer</h2>
    <p><b>1. Listen: what shaped them?</b> Nobody is born with political beliefs. People pick them up from family, friends, school, faith, jobs, media, and their community. That's called <b>political socialization</b>. Fairgoers will say it out loud. Look for the <mark>highlighted</mark> part.</p>
    <p><b>2. Map it: what's their ideology?</b> An <b>ideology</b> is a set of beliefs about what government should do. Ask two questions:</p>
    <ul><li>💵 <b>Money issues</b> (taxes, wages, health costs): MORE or LESS government?</li><li>🎲 <b>Personal choices</b> (betting, vaping, marijuana, curfews): MORE or FEWER rules?</li></ul>
    <p class="note">More gov't on money + fewer personal rules = <b>Liberal</b>. Less + more = <b>Conservative</b>. Less + fewer = <b>Libertarian</b>. More + more = <b>Populist</b>.</p>
    <button class="primary go" id="nx">Next →</button>`;
    $('#nx').onclick = () => { st.primer = 1; save(); pPrimer(); };
  } else {
    const b = st.boothA;
    card.innerHTML = `<p class="eyebrow">TRAINING · 2 OF 2</p><h2>Your boss: "You're on the <span style="color:${PCOLOR[b]}">${PARTY[b].toUpperCase()}</span> booth today."</h2>
    <p>A <b>political party</b> is a group that recruits voters and runs candidates to win elections. Your job: sign people up. These are the cards you can pitch:</p>
    ${deckHTML(b)}
    <p><b>3. Pitch:</b> Play the card that matches what the fairgoer cares about. Purple cards are goals <b>both</b> parties share. If nothing in your deck fits, play <b>👉 Try the other booth</b>. Being honest earns corn too. Pushing the wrong card makes them walk away.</p>
    <button class="primary go" id="nx">Open the booth →</button>`;
    $('#nx').onclick = () => { st.phase = 'play'; st.idx = 0; st.step = 'listen'; st.pat = 60; save(); $('#overlay').hidden = true; render(); };
  }
  $('#overlay').hidden = false;
}

function pPlay() {
  const f = cur();
  SCENE.set(f, booth());
  if (!st.seen[f.id]) { st.seen[f.id] = true; st.pat = st.rainFor === st.idx ? 30 : 60; save(); }
  bubble(f, st.step === 'result');
  if (st.step !== 'result') startPatience(); else { stopPatience(); $('#patience').hidden = true; }
  ({ listen: sListen, map: sMap, pitch: sPitch, result: sResult })[st.step](f);
}
function bubble(f, withTwist) {
  const r = rec(f.id);
  const el = $('#bubble'); el.hidden = false;
  const say = st.idx >= 3 ? f.say.replace(/<\/?mark>/g, '') : f.say;
  el.innerHTML = `<span class="who">${esc(f.name)} · ${esc(f.bio)}</span>${say}${withTwist ? `<span class="twist">🔎 ${esc(f.twist)}</span>` : ''}`;
  if (!withTwist || r.pitch) {}
}

function sListen(f) {
  const r = rec(f.id);
  if (!st.chips || st.chips.for !== f.id) { st.chips = { for: f.id, list: shuffle([f.clue].concat(shuffle(Object.keys(INFL).filter(k => k !== f.clue)).slice(0, 3))) }; save(); }
  const draw = msg => {
    st.chips.list = shuffle(st.chips.list); save();
    tray.innerHTML = `${stepsBar('listen')}<h2>What shaped ${esc(f.name)}'s beliefs the most?</h2><p class="sub">${st.idx >= 3 ? 'No more highlights. Find WHO or WHAT taught them.' : 'Look at the highlighted words.'}</p><div class="chips">${st.chips.list.map(k => `<button data-k="${k}">${INFL[k]}</button>`).join('')}</div><p class="fb" id="fb">${msg ? esc(msg) : ''}</p>`;
    tray.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      if (b.dataset.k === f.clue) {
        if (window.classFirstTry) classFirstTry.right('clue-' + f.id);
        SCENE.mood(1); st.step = 'map'; save(); render();
      } else {
        r.clueWrong++; if (window.classFirstTry) classFirstTry.wrong(); save(); SCENE.mood(-0.3);
        lockThen(tray, $('#fb'), 'Not quite. Which words name WHO or WHAT taught them?', draw);
      }
    });
  };
  draw(''); if ((st.lockUntil || 0) > Date.now()) lockThen(tray, $('#fb'), st.lockMsg || 'Not quite.', draw, true);
}
function sMap(f) {
  const r = rec(f.id);
  const draw = msg => {
    tray.innerHTML = `${stepsBar('map')}<div class="mapwrap"><div><h2 style="margin-bottom:6px">Where does ${esc(f.name)} land?</h2>
      <div class="idea" role="group" aria-label="Idea map">
        <span></span><span class="ax">💵 MORE gov't on money</span><span class="ax">💵 LESS gov't on money</span>
        <span class="ax rowl">🎲 MORE<br>rules</span><button class="q-pop" data-q="pop">Populist</button><button class="q-con" data-q="con">Conservative</button>
        <span class="ax rowl">🎲 FEWER<br>rules</span><button class="q-lib" data-q="lib">Liberal</button><button class="q-libt" data-q="libt">Libertarian</button>
      </div></div>
      <div class="idea-help">Read the <u>underlined</u> parts of what ${esc(f.name)} said.<br>💵 Money issues: <b>more</b> or <b>less</b> government?<br>🎲 Personal choices: <b>more</b> or <b>fewer</b> rules?<p class="fb" id="fb">${msg ? esc(msg) : ''}</p></div></div>`;
    tray.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
      if (b.dataset.q === f.quad) {
        if (window.classFirstTry) classFirstTry.right('map-' + f.id);
        SCENE.mood(1); st.step = 'pitch'; st.hand = null; save(); render();
      } else {
        r.mapWrong++; if (window.classFirstTry) classFirstTry.wrong(); save(); SCENE.mood(-0.3);
        lockThen(tray, $('#fb'), 'Not quite. Answer the two questions one at a time.', draw);
      }
    });
  };
  draw(''); if ((st.lockUntil || 0) > Date.now()) lockThen(tray, $('#fb'), st.lockMsg || 'Not quite.', draw, true);
}
// Right answers: if the deck has the fairgoer's #1 issue, any matching card works (redirect is wrong).
// If the deck only matches a smaller issue, that card OR an honest redirect both count.
function correctCards(f, b) {
  const deck = deckOf(b); const fits = f.wants.filter(k => deck.includes(k));
  if (!fits.length) return ['redirect'];
  return deck.includes(f.wants[0]) ? fits : fits.concat(['redirect']);
}
function sPitch(f) {
  const b = booth(), right = correctCards(f, b), deck = deckOf(b);
  if (!st.hand || st.hand.for !== f.id) {
    const good = right[0] === 'redirect' ? [] : [right[0]]; // redirect is always in the hand
    const bad = shuffle(deck.filter(k => !f.wants.includes(k))).slice(0, 3 - good.length);
    st.hand = { for: f.id, cards: shuffle(good.concat(bad, ['redirect'])) }; save();
  }
  tray.innerHTML = `${stepsBar('pitch')}<h2>Play one card to pitch ${esc(f.name)}.</h2><p class="sub">You're working the <b style="color:${PCOLOR[b]}">${PARTY[b]}</b> booth. What does ${esc(f.name)} care about most? One shot!</p>
  <div class="hand">${st.hand.cards.map(k => { const c = CARDS[k]; return `<button class="pcard" data-c="${k}"><span class="band ${c.p === 'both' ? 'both' : c.p === 'redirect' ? 'redirect' : c.p}">${c.p === 'both' ? 'BOTH PARTIES' : c.p === 'redirect' ? 'BE HONEST' : PARTY[c.p].toUpperCase()}</span><span class="ic">${c.ic}</span><b>${esc(c.t)}</b><small>${esc(c.s)}</small></button>`; }).join('')}</div>`;
  tray.querySelectorAll('[data-c]').forEach(btn => btn.onclick = () => play(f, btn.dataset.c, right));
}
function play(f, k, right) {
  const r = rec(f.id); stopPatience();
  const ok = right.includes(k);
  r.card = CARDS[k].t; r.pitch = ok ? (k === 'redirect' ? 'honest' : 'signed') : 'walked';
  if (window.classFirstTry) { if (!ok) classFirstTry.wrong(); classFirstTry.right('pitch-' + f.id); }
  let pts = 0;
  if (ok) { pts = 100 + Math.min(60, st.pat * 2); if (r.clueWrong === 0) pts += 20; if (r.mapWrong === 0) pts += 20; if (st.reporterFor === st.idx) pts *= 2; }
  r.pts = pts; st.score += pts; botsStep();
  SCENE.react(r.pitch);
  st.step = 'result'; save(); pushScore(); render();
}
function explain(f, b) {
  const right = correctCards(f, b); const r = rec(f.id);
  const cards = right.filter(k => k !== 'redirect');
  let best;
  if (!cards.length) best = `Nothing in the ${PARTY[b]} deck matched what ${f.name} cares about, so the honest move was sending ${f.name} to the ${PARTY[other(b)]} booth.`;
  else if (right.includes('redirect')) best = `${f.name}'s #1 issue isn't in the ${PARTY[b]} deck. You could pitch <b>${cards.map(k => esc(CARDS[k].t.toLowerCase())).join(' or ')}</b>, or honestly send ${f.name} to the ${PARTY[other(b)]} booth. Both work.`;
  else best = `${f.name} cares about <b>${cards.map(k => esc(CARDS[k].t.toLowerCase())).join('</b> and <b>')}</b>${cards.some(k => CARDS[k].p === 'both') ? ' (a goal both parties share)' : ''}. That's in your deck, so sending ${f.name} away would lose a supporter.`;
  return best;
}
function sResult(f) {
  const r = rec(f.id), b = booth();
  const head = r.pitch === 'signed' ? `✅ ${f.name} signed up at your booth!` : r.pitch === 'honest' ? `🤝 Good call. ${f.name} heads to the ${PARTY[other(b)]} booth and says thanks for being straight with them.` : `😤 ${f.name} walks away. "That's not what I care about."`;
  const last = st.idx === ORDER.length - 1;
  tray.innerHTML = `${stepsBar('result')}<div class="result"><div class="big">${r.pitch === 'walked' ? '😤' : '🌽'}</div><div><p><b>${head}</b> ${r.pts ? `<b style="color:var(--good)">+${r.pts} corn</b>${st.reporterFor === st.idx ? ' (doubled by the reporter!)' : ''}` : ''}</p><p>${explain(f, b)}</p>${r.pitch === 'signed' ? `<p>📋 <b>What happens next:</b> ${esc(f.name)} gets on the ${PARTY[b]}' list. They'll get invites to volunteer, go to a caucus, and vote for ${PARTY[b]} running for office. That's how a party links people to government.</p>` : ''}<p class="note">What shaped them: <b>${INFL[f.clue]}</b> · Idea map: <b>${QUADS[f.quad]}</b></p></div></div>
  <div class="row"><button class="primary" id="nextBtn">${last ? 'Close the booth →' : 'Next fairgoer →'}</button></div>`;
  $('#nextBtn').onclick = nextFolk;
}
function nextFolk() {
  if (st.idx === ORDER.length - 1) { st.phase = 'endchecks'; save(); return render(); }
  const nextIdx = st.idx + 1;
  const go = () => { st.idx = nextIdx; st.step = 'listen'; st.chips = null; st.hand = null; save(); render(); };
  if (nextIdx === 2 && st.rainFor == null) return eventCard('🌧️', 'Rain!', 'A storm rolls in and everyone crowds into the Varied Industries Building. The next fairgoer is soaked and in a hurry.', 'Patience is cut in half for the next fairgoer.', () => { st.rainFor = 2; go(); });
  if (nextIdx === 5 && !st.swapped) return swapCard(go);
  if (nextIdx === 7 && st.reporterFor == null) return eventCard('📸', 'A TV reporter is filming your booth.', 'The next pitch could end up on the evening news. Nail it!', 'Corn for the next fairgoer is doubled.', () => { st.reporterFor = 7; go(); });
  go();
}
function eventCard(art, title, story, effect, then) {
  const card = $('#card'); card.className = 'card';
  card.innerHTML = `<div style="font-size:46px">${art}</div><p class="eyebrow">FAIR NEWS</p><h2>${esc(title)}</h2><p class="lead">${esc(story)}</p><p><b>${esc(effect)}</b></p><button class="primary go" id="ok">Got it →</button>`;
  $('#overlay').hidden = false; $('#ok').onclick = () => { $('#overlay').hidden = true; then(); };
}
function swapCard(then) {
  showCheck('c_both', () => swapReveal(then));
}
function swapReveal(then) {
  const nb = other(st.boothA); const card = $('#card'); card.className = 'card swap';
  card.innerHTML = `<div style="font-size:46px">🔁</div><p class="eyebrow">SHIFT CHANGE</p><h2>Your boss: "For the rest of the day you're on the <span style="color:${PCOLOR[nb]}">${PARTY[nb].toUpperCase()}</span> booth."</h2>
  <p>Same fair, different party. Compare the two decks. Purple = goals both parties share.</p><div class="decks">${deckHTML('D')}${deckHTML('R')}</div><button class="primary go" id="ok">Got it →</button>`;
  $('#overlay').hidden = false;
  $('#ok').onclick = () => { $('#overlay').hidden = true; st.swapped = true; save(); then(); };
}

/* ---------------- CHECKS ---------------- */
function showCheck(id, then) {
  const d = CHECKS[id]; const r = st.checks[id] || (st.checks[id] = { wrong: 0, done: false });
  if (r.done) { $('#overlay').hidden = true; return then(); }
  const card = $('#card'); card.className = 'card check';
  const draw = msg => {
    card.innerHTML = `<p class="eyebrow">QUICK CHECK · GOV.12</p><h2>${d.prompt}</h2><div class="qchoices">${shuffle(d.options.map((t, n) => ({ t, n }))).map(o => `<button data-n="${o.n}">${esc(o.t)}</button>`).join('')}</div><p class="fb" id="fb">${msg ? esc(msg) : ''}</p>`;
    card.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      if (b.dataset.n === '0') {
        r.done = true; if (window.classFirstTry) classFirstTry.right(id); save();
        card.innerHTML = `<p class="eyebrow">QUICK CHECK · GOV.12</p><h2>${d.prompt}</h2><p class="why"><b>✓ ${esc(d.options[0])}.</b> ${d.why}</p><button class="primary go" id="cont">Keep going →</button>`;
        $('#cont').onclick = () => { $('#overlay').hidden = true; then(); };
      } else { r.wrong++; if (window.classFirstTry) classFirstTry.wrong(); save(); lockThen(card, $('#fb'), 'Not quite. ' + d.hint, draw); }
    });
  };
  draw(''); $('#overlay').hidden = false; if ((st.lockUntil || 0) > Date.now()) lockThen(card, $('#fb'), st.lockMsg || 'Not quite.', draw, true);
}
function pEnd() {
  stopPatience(); $('#patience').hidden = true; $('#bubble').hidden = true; SCENE.set(null, booth());
  tray.innerHTML = `<h2>🌙 The fair is closing for the night.</h2><p class="sub">Two quick questions before you clock out.</p>`;
  showCheck('c_iv', () => showCheck('c_link', () => { st.phase = 'final'; save(); render(); }));
}

/* ---------------- FINAL + TURN IN ---------------- */
const PROMPTS = [
  { id: 'who', short: 'One fairgoer', label: '1. Pick one fairgoer. What shaped their beliefs, and where did they land on the idea map? Explain why.', stem: '___ was shaped by ___. They landed in ___ because ___.', min: 80,
    must: [FOLKS.map(f => f.name.toLowerCase()), ['liberal', 'conservative', 'libertarian', 'populist']], msg: 'In answer 1, name a fairgoer AND the idea map spot they landed in.' },
  { id: 'cmp', short: 'Compare the parties', label: '2. You worked BOTH booths. Name one thing the parties disagree on and one thing they agree on. Then explain why someone like Rosa or Tyler can belong to a party without agreeing with all of it.', stem: 'The parties disagree on ___. They agree on ___. Rosa (or Tyler) ___ because ___.', min: 110,
    must: [['tax', 'wage', 'union', 'gun', 'health', 'rules', 'police', 'border', 'school', 'college', 'energy', 'business'], ['farm', 'veteran', 'vets'], ['rosa', 'tyler']], msg: 'In answer 2, name a disagreement, something they share (like farmers or veterans), and talk about Rosa or Tyler.' }
];
function firstTry() {
  const out = { clue: [0, 0], map: [0, 0], pitch: [0, 0], checks: [0, 0] };
  ORDER.forEach(id => { const r = st.res[id]; if (!r || !r.pitch) return; out.clue[1]++; out.map[1]++; out.pitch[1]++; if (!r.clueWrong) out.clue[0]++; if (!r.mapWrong) out.map[0]++; if (r.pitch !== 'walked') out.pitch[0]++; });
  Object.values(st.checks).forEach(c => { if (!c.done) return; out.checks[1]++; if (!c.wrong) out.checks[0]++; });
  const tot = [out.clue[0] + out.map[0] + out.pitch[0] + out.checks[0], out.clue[1] + out.map[1] + out.pitch[1] + out.checks[1]];
  return { out, tot };
}
function pFinal() {
  stopPatience(); $('#patience').hidden = true; $('#bubble').hidden = true; SCENE.set(null, booth());
  const ft = firstTry(), signed = ORDER.filter(id => st.res[id] && st.res[id].pitch === 'signed').length, honest = ORDER.filter(id => st.res[id] && st.res[id].pitch === 'honest').length;
  const rank = [{ s: st.score, me: true }].concat((liveOthers().length ? liveOthers().map(p => ({ s: p.score })) : st.bots)).sort((a, b) => b.s - a.s).findIndex(x => x.me) + 1;
  tray.classList.add('tall');
  tray.innerHTML = `<div class="final"><div><p class="eyebrow">FAIR'S OVER</p><p class="big">🌽 ${st.score.toLocaleString()} corn</p><p class="jarline">#${rank} in the class race</p>
    <ul><li>Signed up: <b>${signed}</b> · Sent honestly to the other booth: <b>${honest}</b> · Walked away: <b>${10 - signed - honest}</b></li>
    <li>Spotted what shaped them (first try): <b>${ft.out.clue[0]} of 10</b></li><li>Idea map (first try): <b>${ft.out.map[0]} of 10</b></li><li>Right pitch: <b>${ft.out.pitch[0]} of 10</b></li><li>Quick checks (first try): <b>${ft.out.checks[0]} of ${ft.out.checks[1]}</b></li></ul>
    <p class="note">${ORDER.map(id => { const r = st.res[id] || {}; return `${FOLK[id].name} ${r.pitch === 'walked' ? '😤' : r.pitch === 'honest' ? '🤝' : '✅'}`; }).join(' · ')}</p></div>
    <div>${PROMPTS.map(p => `<label for="w_${p.id}" style="display:block;font-weight:850;margin:10px 0 2px">${esc(p.label)}</label><p class="stem">Starter: ${esc(p.stem)}</p><textarea id="w_${p.id}">${esc(st.writing[p.id] || '')}</textarea>`).join('')}
    <button class="primary go" id="sendBtn">${st.turnedIn ? 'Turn in again' : 'Turn in'}</button><p class="fb ${st.turnedIn ? 'good' : ''}" id="sendMsg">${st.turnedIn ? 'Turned in! You can fix your answers and turn in again.' : ''}</p></div></div>`;
  PROMPTS.forEach(p => $('#w_' + p.id).addEventListener('input', e => { st.writing[p.id] = e.target.value; save(); }));
  $('#sendBtn').onclick = turnIn;
  pushScore();
}
function checkWriting(p, v) {
  const t = v.toLowerCase();
  if (/_{2,}/.test(v)) return 'Replace the ___ blanks with your own words in: ' + p.short + '.';
  if (/rosa \(or tyler\)/.test(t)) return 'Pick Rosa OR Tyler in answer 2.';
  if (v.length < p.min) return 'Write a little more for: ' + p.short + ' (2 full sentences).';
  const stem = new Set(p.stem.toLowerCase().match(/[a-z']+/g) || []);
  const own = new Set((t.match(/[a-z']{3,}/g) || []).filter(w => !stem.has(w)));
  if (own.size < 7) return 'Add more of your own ideas for: ' + p.short + '.';
  if (p.must.some(g => !g.some(w => t.includes(w)))) return p.msg;
  return '';
}
async function turnIn() {
  const msg = $('#sendMsg');
  for (const p of PROMPTS) { const v = ($('#w_' + p.id).value || '').trim(); const bad = checkWriting(p, v); if (bad) { msg.className = 'fb bad'; msg.textContent = bad; $('#w_' + p.id).focus(); return; } }
  const ft = firstTry();
  const answers = { 'Standard': 'SS.9-12.Gov.12', 'First-try correct': ft.tot[0] + ' of ' + ft.tot[1], 'First-try by standard': 'Gov.12: ' + ft.tot[0] + ' of ' + ft.tot[1],
    'First-try by skill': 'What shaped them ' + ft.out.clue[0] + '/10 · Idea map ' + ft.out.map[0] + '/10 · Right pitch ' + ft.out.pitch[0] + '/10 · Checks ' + ft.out.checks[0] + '/' + ft.out.checks[1],
    'Booths worked': PARTY[st.boothA] + ' then ' + PARTY[other(st.boothA)] + ' (assigned at random)', 'Corn score': String(st.score) };
  ORDER.forEach((id, i) => { const r = st.res[id] || {}; const f = FOLK[id]; answers['Fairgoer ' + (i + 1) + ' · ' + f.name] = `Influence ${r.clueWrong ? '✗ (' + r.clueWrong + ' wrong)' : '✓'} · Map ${r.mapWrong ? '✗ (' + r.mapWrong + ' wrong)' : '✓'} · Pitched "${r.card || '-'}" → ${r.pitch === 'signed' ? 'signed up' : r.pitch === 'honest' ? 'honest redirect' : 'walked away'}`; });
  Object.keys(st.checks).forEach(k => { const d = CHECKS[k]; answers['Check · ' + d.prompt.replace(/<[^>]+>/g, '').slice(0, 60)] = d.options[0] + (st.checks[k].wrong ? ' (after ' + st.checks[k].wrong + ' wrong)' : ' (first try)'); });
  PROMPTS.forEach(p => answers['Writing: ' + p.short] = ($('#w_' + p.id).value || '').trim());
  $('#sendBtn').disabled = true; msg.className = 'fb'; msg.textContent = 'Sending your work…';
  try {
    const res = await classTurnIn(OLD_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName: st.name, assignmentId: ASSIGN, assignmentTitle: 'Government Unit 2 · Day 1 · Fair Game', answers }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Your work did not save. Try again.');
    st.turnedIn = true; save(); msg.className = 'fb good'; msg.textContent = 'Turned in! Your teacher can see your work. You\'re done.'; $('#sendBtn').textContent = 'Turned in ✓'; $('#sendBtn').disabled = false;
  } catch (e) { msg.className = 'fb bad'; msg.textContent = e.message || 'Could not turn in. Try again.'; $('#sendBtn').disabled = false; }
}

/* =====================================================================
   THE SCENE (canvas): fairground, your booth, the fairgoer
   ===================================================================== */
const SCENE = (() => {
  const cv = $('#scene'), ctx = cv.getContext('2d'), H = 400; let W = 960;
  function fit() { const r = cv.parentElement.getBoundingClientRect(); if (!r.height) return; W = Math.max(760, Math.min(1500, Math.round(H * r.width / r.height))); cv.width = W; cv.height = H; }
  fit(); window.addEventListener('resize', fit);
  let folk = null, boothParty = null, x = -140, targetX = 230, mood = 0, moodT = 0, leaving = null, kernels = [], t0 = performance.now();
  const SKIN = ['#f1c9a5', '#d9a77c', '#a8714b', '#6b4630'];
  function set(f, b) {
    boothParty = b || boothParty;
    if (f !== folk) { folk = f; x = f ? -140 : x; leaving = null; mood = 0; }
  }
  function setMood(m) { mood = m; moodT = performance.now(); }
  function react(kind) {
    if (kind === 'signed') { setMood(1); for (let i = 0; i < 6; i++) kernels.push({ x: 640 + Math.random() * 20, y: 150 - i * 12, vy: 0, t: performance.now() + i * 90 }); }
    else if (kind === 'honest') { setMood(1); setTimeout(() => { leaving = 1; }, 900); }
    else { setMood(-1); setTimeout(() => { leaving = -1; }, 900); }
  }
  /* background */
  function sky(now) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#bfe3f2'); g.addColorStop(1, '#f8efd7'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Ferris wheel
    const cx = 120, cy = 120, R = 85, a0 = now / 9000;
    ctx.strokeStyle = '#e7a23a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.lineWidth = 2; for (let i = 0; i < 10; i++) { const a = a0 + i * Math.PI / 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); ctx.fillStyle = ['#e0603f', '#3aa776', '#3e6fb0', '#f0c94d', '#7b5fb2'][i % 5]; ctx.beginPath(); ctx.roundRect(cx + Math.cos(a) * R - 9, cy + Math.sin(a) * R, 18, 13, 4); ctx.fill(); }
    ctx.strokeStyle = '#8b6d4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 50, 260); ctx.moveTo(cx, cy); ctx.lineTo(cx + 50, 260); ctx.stroke();
    // Giant Slide (yellow wavy)
    const sx = W - 200; ctx.fillStyle = '#f0c94d'; ctx.beginPath(); ctx.moveTo(sx, 70); for (let i = 0; i <= 8; i++) ctx.lineTo(sx + i * 22, 70 + i * 22 + (i % 2 ? -10 : 0)); ctx.lineTo(sx + 176, 262); ctx.lineTo(sx + 160, 262); for (let i = 8; i >= 0; i--) ctx.lineTo(sx - 12 + i * 22, 84 + i * 22 + (i % 2 ? -10 : 0)); ctx.fill();
    ctx.fillStyle = '#c55840'; for (let i = 0; i < 8; i++) ctx.fillRect(sx - 6 + i * 22, 80 + i * 22, 6, 4);
    ctx.fillStyle = '#8b6d4a'; ctx.fillRect(sx - 8, 70, 8, 190);
    // tents
    [[300, '#e0603f'], [430, '#3aa776'], [560, '#3e6fb0']].forEach(([tx, c]) => { ctx.fillStyle = '#fff'; ctx.fillRect(tx, 190, 100, 70); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(tx - 8, 190); ctx.lineTo(tx + 50, 155); ctx.lineTo(tx + 108, 190); ctx.fill(); for (let s = 0; s < 5; s++) { ctx.fillStyle = s % 2 ? c : '#fff'; ctx.fillRect(tx + s * 20, 190, 20, 10); } });
    ctx.fillStyle = '#263b50'; ctx.font = 'bold 11px system-ui,Arial'; ctx.textAlign = 'center'; ctx.fillText('CORN DOGS', 350, 230); ctx.fillText('PORK CHOP ON A STICK', 480, 230); ctx.fillText('BUTTER COW →', 610, 230);
    // string lights
    ctx.strokeStyle = '#6b5a45'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(W / 2, 130, W, 60); ctx.stroke();
    for (let i = 0; i < Math.ceil(W / 40); i++) { const px = i * 40 + 20, t = px / W, py = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 130 + t * t * 60; ctx.fillStyle = ['#f0c94d', '#e0603f', '#3aa776', '#3e6fb0'][i % 4]; ctx.globalAlpha = .7 + .3 * Math.sin(now / 400 + i); ctx.beginPath(); ctx.arc(px, py + 5, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    // ground + crowd silhouettes walking
    ctx.fillStyle = '#e6d8b5'; ctx.fillRect(0, 260, W, H - 260);
    for (let i = 0; i < 9; i++) { const p = ((now / (14000 + i * 900)) + i / 9) % 1, px = (i % 2 ? p : 1 - p) * (W + 80) - 40; ctx.fillStyle = 'rgba(80,95,110,.28)'; ctx.beginPath(); ctx.arc(px, 262, 8, 0, 7); ctx.fill(); ctx.fillRect(px - 7, 270, 14, 22); }
    // building sign
  }
  /* person */
  function person(px, py, s, look, m) {
    ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
    const skin = SKIN[look.skin];
    // body
    ctx.fillStyle = look.shirt; ctx.beginPath(); ctx.roundRect(-58, 40, 116, 150, 40); ctx.fill();
    if (look.extra === 'apron') { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#d9cfc2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-34, 70, 68, 120, 10); ctx.fill(); ctx.stroke(); }
    if (look.extra === 'badge') { ctx.fillStyle = '#fff'; ctx.fillRect(20, 70, 22, 14); ctx.fillStyle = '#3e6fb0'; ctx.fillRect(20, 70, 22, 4); }
    if (look.extra === 'backpack') { ctx.fillStyle = '#5a6b7a'; ctx.fillRect(-60, 52, 14, 70); ctx.fillRect(46, 52, 14, 70); }
    // neck + head
    ctx.fillStyle = skin; ctx.fillRect(-14, 20, 28, 26);
    ctx.beginPath(); ctx.ellipse(0, -10, 44, 50, 0, 0, 7); ctx.fill();
    // hair
    ctx.fillStyle = look.hc;
    if (look.hair === 'long') { ctx.beginPath(); ctx.ellipse(0, -24, 48, 44, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-48, -24, 16, 70); ctx.fillRect(32, -24, 16, 70); }
    else if (look.hair === 'bun') { ctx.beginPath(); ctx.ellipse(0, -30, 46, 34, 0, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(0, -66, 16, 0, 7); ctx.fill(); }
    else if (look.hair === 'short') { ctx.beginPath(); ctx.ellipse(0, -32, 45, 30, 0, Math.PI, 0); ctx.fill(); }
    else if (look.hair === 'bald') { ctx.beginPath(); ctx.ellipse(-40, -10, 6, 16, 0, 0, 7); ctx.ellipse(40, -10, 6, 16, 0, 0, 7); ctx.fill(); }
    if (look.extra === 'cap' || look.extra === 'vetcap') { ctx.fillStyle = look.extra === 'vetcap' ? '#2b2b2b' : '#2e6e4c'; ctx.beginPath(); ctx.ellipse(0, -38, 46, 26, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-4, -40, 66, 9); if (look.extra === 'vetcap') { ctx.fillStyle = '#f0c94d'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillText('VETERAN', 0, -46); } }
    if (look.extra === 'hardhat') { ctx.fillStyle = '#f0c94d'; ctx.beginPath(); ctx.ellipse(0, -38, 48, 32, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-56, -40, 112, 8); }
    // face
    ctx.fillStyle = '#2b2326'; ctx.beginPath(); ctx.arc(-15, -12, 4.5, 0, 7); ctx.arc(15, -12, 4.5, 0, 7); ctx.fill();
    if (look.extra === 'glasses') { ctx.strokeStyle = '#2b2326'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-15, -12, 11, 0, 7); ctx.moveTo(26, -12); ctx.arc(15, -12, 11, 0, 7); ctx.moveTo(-4, -12); ctx.lineTo(4, -12); ctx.stroke(); }
    if (look.extra === 'earbuds') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-44, -6, 5, 0, 7); ctx.arc(44, -6, 5, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#2b2326'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
    if (m > 0.4) ctx.arc(0, 6, 15, 0.2, Math.PI - 0.2); else if (m < -0.4) ctx.arc(0, 22, 13, Math.PI + 0.3, -0.3); else { ctx.moveTo(-11, 12); ctx.lineTo(11, m < 0 ? 15 : 12); }
    ctx.stroke();
    if (m < -0.4) { ctx.beginPath(); ctx.moveTo(-24, -28); ctx.lineTo(-8, -23); ctx.moveTo(24, -28); ctx.lineTo(8, -23); ctx.stroke(); }
    ctx.restore();
  }
  function boothFront(now) {
    const c = boothParty ? PCOLOR[boothParty] : '#8a97a0';
    // awning
    for (let i = 0; i < Math.ceil(W / 80); i++) { ctx.fillStyle = i % 2 ? c : '#fff'; ctx.fillRect(i * 80, 0, 80, 16); ctx.beginPath(); ctx.arc(i * 80 + 40, 16, 40, 0, Math.PI); ctx.fill(); }
    // counter
    ctx.fillStyle = '#9b6b43'; ctx.fillRect(0, 318, W, 14);
    ctx.fillStyle = c; ctx.fillRect(0, 332, W, H - 332);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px system-ui,Arial'; ctx.textAlign = 'center';
    ctx.fillText(boothParty ? (PARTY[boothParty] || '').toUpperCase() + ' · SIGN UP HERE' : 'IOWA STATE FAIR', W / 2 + 140, 370);
    // kernel jar
    const jx = 610, jy = 210;
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.strokeStyle = '#6b7780'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(jx, jy, 60, 108, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b7780'; ctx.fillRect(jx + 6, jy - 10, 48, 12);
    const n = ORDER.filter(id => st.res[id] && st.res[id].pitch && st.res[id].pitch !== 'walked').length;
    ctx.fillStyle = '#f0c94d'; const lvl = Math.min(1, n / 10); ctx.fillRect(jx + 4, jy + 104 - 96 * lvl, 52, 96 * lvl);
    ctx.fillStyle = '#263b50'; ctx.font = 'bold 12px system-ui,Arial'; ctx.fillText(n + ' 🌽', jx + 30, jy + 128);
    // falling kernels
    kernels = kernels.filter(k => { if (now < k.t) return true; k.vy += .5; k.y += k.vy; ctx.fillStyle = '#f0c94d'; ctx.beginPath(); ctx.ellipse(k.x, k.y, 5, 7, 0, 0, 7); ctx.fill(); return k.y < jy + 100; });
  }
  function draw(now) {
    const dt = Math.min(50, now - t0); t0 = now;
    sky(now);
    // queue behind
    if (folk && st.phase === 'play') { const left = ORDER.length - st.idx - 1; for (let i = 0; i < Math.min(3, left); i++) { ctx.globalAlpha = .55; person(30 + i * 52, 250, .32, { skin: (i + st.idx) % 4, hair: ['short', 'long', 'cap'][i % 3], hc: '#3a2a20', shirt: ['#8fb37a', '#d9a441', '#7aa6c2'][i], extra: 'none' }, 0); ctx.globalAlpha = 1; } }
    if (folk) {
      if (leaving) { x += leaving * dt * 0.6; }
      else if (x < targetX) x = Math.min(targetX, x + dt * 0.55);
      const bob = x < targetX && !leaving ? Math.sin(now / 90) * 3 : 0;
      const m = (now - moodT < 1600 || Math.abs(mood) >= 1) ? mood : 0;
      person(x, 175 + bob, 1, folk.look, (st.step === 'result' && !leaving) ? mood : m);
    }
    boothFront(now);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return { set, mood: setMood, react };
})();

/* ---------------- BOOT ---------------- */
$('#helpBtn').onclick = () => $('#helpDialog').showModal();
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => $('#' + b.dataset.close).close());
$('#resetBtn').onclick = () => { if (!confirm('Start over? This erases your progress on this device.')) return; const n = st.name, r = st.room; st = fresh(); ORDER = st.order; st.name = n; st.room = r; if (window.classFirstTry) classFirstTry.reset(); tray.classList.remove('tall'); save(); $('#overlay').hidden = true; render(); };
if (st.phase !== 'intro') startArena();
render();
})();
