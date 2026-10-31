'use strict';
/* The guided game: found → build → government → rule (decisions + surprises) → law → ending, check, score, turn in. */
(() => {
const C=E,S=CountrySociety,W=CountryWorld;
const NAV=['Found','Build','Government','Rule','Law','Finish'];
const STAGE_NAV=[0,1,2,3,4,5,5,5];
const STAGE_TITLES=['Found your country','Build 3 places','Set up your government','Rule for one year','Sign one law','Your ending','4 quick questions','Your score'];
const STANDARD='SS.9-12.Gov.1; SS.9-12.Gov.4';
const SUBMIT_URL='https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit';
const PAL=['#c8102e','#1f4e9c','#2e7d4f','#f2c230','#222222','#f7f4ea','#e8772e','#6a3d9a'];
const PATTERNS=[['bands-v','Bands'],['bands-h','Stripes'],['cross','Cross'],['diag','Diagonal'],['canton','Corner box'],['circle','Circle']];
const SYMBOLS=[['none','None'],['star','Star'],['sun','Sun'],['stars3','3 stars']];

/* ---------- Saved progress ---------- */
let G=state.guide;
if(!G||G.v!==2){
 G={v:2,stage:0,furthest:0,seen:false,places:[],gov:0,picked:{},checks:{},seed:Math.floor(Math.random()*1e9),pending:null,showResult:false,confirm:null,law:'',lawWhy:'',lawIdea:'',checkIdx:0,sentence:'',submitted:'',rivalQuote:'',flagSet:{p:'bands-v',c1:PAL[Math.floor(Math.random()*4)],c2:PAL[5],sym:'star'}};
 state.marks=[];state.decisions=[];state.timeline=[];state.rules=[];state.revealed=null;
}
state.guide=G;state.timeline=Array.isArray(state.timeline)?state.timeline:[];if(!state.oversight)state.oversight='courts';
view='guided';
const welcomeBack=G.seen&&(G.stage>0||state.timeline.length>0);let welcomeShown=false;
let resetArmed=false,rewindArmed=null;

/* ---------- Helpers ---------- */
const words=t=>String(t||'').trim().split(/\s+/).filter(Boolean).length;
const hasName=t=>String(t||'').trim().length>=2;
const open=()=>C.isOpen(state.polity);
function rng(seed){let x=seed>>>0||1;return()=>{x^=x<<13;x>>>=0;x^=x>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
function shuffle(arr,salt){const r=rng(G.seed+String(salt).split('').reduce((n,c)=>n*31+c.charCodeAt(0)|0,7));const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function refresh(){shell();renderTools();labels();renderMeters();drawMap();drawFlag();save();}
function go(stage){G.stage=stage;G.furthest=Math.max(G.furthest,stage);G.confirm=null;rewindArmed=null;refresh();window.scrollTo(0,0);$('#guideTitle')?.focus({preventScroll:true});}
function miniMeters(){const m=S.run(state).m;return `<p class="mini-meters" aria-label="Your meters now">${S.KEYS.map(k=>`<span>${({approval:'Approval',budget:'Budget',order:'Order',trust:'Trust',liberty:'Liberty'})[k]} <b>${m[k]}</b></span>`).join('')}</p>`;}
function avatar(){return `<span class="rival-avatar" aria-hidden="true">${C.rival.initials}</span>`;}
function rivalSays(text,extra=''){return `<div class="rival-bubble">${avatar()}<div><p><b>${esc(C.rival.name)}:</b> “${esc(text)}”</p>${extra}</div></div>`;}
function head(kicker,title,text){return `<div class="step-intro guided-intro"><div class="step-kicker">${kicker}</div><h2 id="guideTitle" tabindex="-1">${title}</h2>${text?`<p>${text}</p>`:''}</div>`;}
function setupDone(){return ['polity','division','ownership','oversight'].every(k=>G.picked[k])&&G.checks['setup-polity']?.done&&G.checks['setup-division']?.done;}
function decisionsMade(){return state.timeline.filter(i=>i.kind==='decision').length;}
function resumeStage(min){return G.furthest>=5?Math.min(G.furthest,7):G.furthest>=3?Math.min(G.furthest,4):min;}
function resetYear(){state.timeline=[];G.pending=null;G.showResult=false;G.confirm=null;G.rivalQuote='';if(G.furthest>3)G.furthest=3;}

/* ---------- Flag: presets in a few taps; drawing is optional ---------- */
function starPath(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;c.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a));}c.closePath();c.fill();}
function paintFlag(c,w,h,f){
 const a=f.c1,b=f.c2;c.save();c.fillStyle=a;c.fillRect(0,0,w,h);c.fillStyle=b;
 let cx=w/2,cy=h/2,size=h*.22;
 if(f.p==='bands-v')c.fillRect(w/3,0,w/3,h);
 else if(f.p==='bands-h')c.fillRect(0,h/3,w,h/3);
 else if(f.p==='cross'){c.fillRect(w*.3,0,h*.2,h);c.fillRect(0,h*.4,w,h*.2);cx=w*.3+h*.1;}
 else if(f.p==='diag'){c.beginPath();c.moveTo(w,0);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();}
 else if(f.p==='canton'){for(let i=1;i<7;i+=2)c.fillRect(0,i*h/7,w,h/7);c.fillStyle=a;c.fillRect(0,0,w*.42,h*4/7);c.strokeStyle=b;c.lineWidth=h*.02;c.strokeRect(0,0,w*.42,h*4/7);cx=w*.21;cy=h*2/7;size=h*.15;}
 else if(f.p==='circle'){c.beginPath();c.arc(w/2,h/2,h*.3,0,Math.PI*2);c.fill();}
 const light=x=>['#f7f4ea','#f2c230'].includes(x),behind={'bands-v':b,'bands-h':b,cross:b,diag:a,canton:a,circle:b}[f.p]||a;
 const symColor=f.p==='circle'&&a!==b?a:light(behind)?'#222222':'#f7f4ea';
 c.fillStyle=symColor;c.strokeStyle=symColor;
 if(f.sym==='star')starPath(c,cx,cy,size);
 else if(f.sym==='sun'){c.beginPath();c.arc(cx,cy,size*.55,0,Math.PI*2);c.fill();c.lineWidth=Math.max(1.5,size*.12);for(let i=0;i<12;i++){const t=i*Math.PI/6;c.beginPath();c.moveTo(cx+Math.cos(t)*size*.75,cy+Math.sin(t)*size*.75);c.lineTo(cx+Math.cos(t)*size*1.05,cy+Math.sin(t)*size*1.05);c.stroke();}}
 else if(f.sym==='stars3')[-1,0,1].forEach(k=>starPath(c,cx+k*size*1.15,cy,size*.5));
 c.restore();
}
drawFlag=function(){fc.clearRect(0,0,600,360);paintFlag(fc,600,360,G.flagSet);state.flag.forEach(s=>stroke(fc,s));tc.clearRect(0,0,150,90);tc.drawImage(flag,0,0,150,90);};
$('#flagDone').onclick=()=>{$('#flagDialog').close();save();drawFlag();};

/* ---------- Header labels and law strip ---------- */
labels=function(){
 const chips=['polity','division','ownership'].filter(k=>G.picked[k]).map(k=>`<span>${esc(C.words[state[k]].name)}</span>`);
 if(G.picked.oversight)chips.push(`<span>Check: ${esc(C.checkNames[state.oversight])}</span>`);
 $('#powerLabels').innerHTML=chips.join('');
 $('#worldRules').innerHTML=state.rules.length?state.rules.map((r,i)=>`<div class="world-law"><b>${i+1}</b><span>${esc(r.text)}</span></div>`).join(''):'<span class="empty">No law signed yet.</span>';
 $('#countryName').value=state.name;$('#leaderName').value=state.leader;
};

/* ---------- Page shell: nav, progress, layout classes ---------- */
function shell(){
 const st=G.stage,b=document.body;
 b.classList.add('guided');b.classList.toggle('guide-welcome',!G.seen);b.classList.toggle('guide-creative',st===0);b.classList.toggle('guide-laws',st>=4);b.classList.toggle('guide-end',G.seen&&st>=5);b.dataset.guideStage=String(st);
 const navAt=STAGE_NAV[st];
 $('.studio nav').innerHTML=NAV.map((n,i)=>{const unlocked=i<=STAGE_NAV[G.furthest]&&(i<5||G.furthest>=5)&&!(G.furthest>=5&&i<5&&i!==0);return `<button data-nav="${i}" class="${navAt===i?'active':''}" ${unlocked?'':'disabled'} aria-current="${navAt===i?'step':'false'}"><b>${i+1}</b> ${n}</button>`;}).join('');
 document.querySelectorAll('[data-nav]').forEach(x=>x.onclick=()=>{const i=+x.dataset.nav;go(i===5?Math.max(5,Math.min(G.furthest,7)):i);});
 const done=Math.min(6,navAt+(st===7&&G.submitted?1:0));
 $('#stageStatus').innerHTML=`<b>STEP ${navAt+1} OF 6 · ${esc(STAGE_TITLES[st])}</b><div class="guided-progress" role="progressbar" aria-label="Steps finished" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${done}"><i style="width:${done/6*100}%"></i></div>`;
 $('#finishBtn').disabled=G.stage<7;$('#finishBtn').textContent=G.stage>=7?'Print my report ↗':'Report unlocks at the end 🔒';
 $('#countryName').readOnly=true;$('#leaderName').readOnly=true;$('#countryName').tabIndex=-1;$('#leaderName').tabIndex=-1;
 map.style.pointerEvents=st>=1&&st<=4?'auto':'none';
 $('#mapHint').textContent=st===1?'Drag a place to move it.':'Faces and signs show how people feel.';
}

/* ---------- Directions (first screen) ---------- */
function directions(){
 $('#tools').innerHTML=`<div class="directions-intro"><div class="step-kicker">DIRECTIONS · ABOUT 30 MINUTES</div><h2 id="guideTitle" tabindex="-1">My Country, My Rules</h2><p class="std-line" style="font-size:.86rem;line-height:1.4;color:#4a5d66;margin:6px 0 0"><b>Government · Day 3 · Standard SS.9-12.Gov.1</b> — Analyze the origins of government with attention to the purpose(s) of government, and alternative models from other nations and groups. <b>Gov.4</b> — Analyze the underlying principles established by the United States Constitution.<br><b>Today’s goal:</b> Compare ways to run a country — who rules, where power sits, who owns businesses — and see what happens to the people.</p></div><ol class="country-directions short-directions"><li><b>Build a country.</b> Pick its government, then rule it for one year. Your rival is watching.</li><li><b>Done means</b> you reach an ending and answer 4 quick questions.</li><li><b>Then</b> type your name and click <b>Turn in to my teacher</b>.</li></ol><button id="startCountry" class="primary wide">${G.stage>0?'Back to my country':'Start my country'} →</button>`;
 $('#startCountry').onclick=()=>{G.seen=true;refresh();window.scrollTo(0,0);};
}

/* ---------- Step 1: name, leader, flag ---------- */
function found(){
 const f=G.flagSet,ready=hasName(state.name)&&hasName(state.leader);
 $('#tools').innerHTML=head('STEP 1 · MAKE IT YOURS','Found your country','Name it. Name your leader. Tap a flag design.')+
 `<label for="gName">Country name</label><input id="gName" maxlength="40" autocomplete="off" placeholder="Example: The Republic of Pickles" value="${esc(state.name)}">
 <label for="gLeader">Leader’s name</label><input id="gLeader" maxlength="30" autocomplete="off" placeholder="Example: President Rivera" value="${esc(state.leader)}">
 <div class="flag-maker"><div class="flag-preview"><canvas id="flagBig" width="300" height="180" aria-label="Your flag"></canvas></div>
 <p class="maker-label">Design</p><div class="flag-patterns">${PATTERNS.map(([k,n])=>`<button type="button" data-pattern="${k}" class="${f.p===k?'selected':''}" aria-pressed="${f.p===k}" aria-label="${n}"><canvas width="60" height="36" data-mini="${k}"></canvas><small>${n}</small></button>`).join('')}</div>
 <p class="maker-label">Main color</p><div class="swatches">${PAL.map(c=>`<button type="button" class="swatch ${f.c1===c?'selected':''}" data-c1="${c}" style="--sw:${c}" aria-label="Main color ${c}" aria-pressed="${f.c1===c}"></button>`).join('')}</div>
 <p class="maker-label">Second color</p><div class="swatches">${PAL.map(c=>`<button type="button" class="swatch ${f.c2===c?'selected':''}" data-c2="${c}" style="--sw:${c}" aria-label="Second color ${c}" aria-pressed="${f.c2===c}"></button>`).join('')}</div>
 <p class="maker-label">Symbol</p><div class="flag-symbols">${SYMBOLS.map(([k,n])=>`<button type="button" data-sym="${k}" class="${f.sym===k?'selected':''}" aria-pressed="${f.sym===k}">${n}</button>`).join('')}</div>
 <button id="drawOnFlag" class="wide guide-back">Draw on it (optional) ✎</button></div>
 <p id="guideHelp" class="guided-help">${ready?'✓ Ready.':'Type a country name and a leader name to continue.'}</p><button id="guideNext" class="primary wide step-next" ${ready?'':'disabled'}>Next: build 3 places →</button>${G.furthest>=3?`<button id="backToYear" class="wide guide-back">${G.furthest>=5?'Back to my score':'Back to my year'} →</button>`:''}`;
 const paintAll=()=>{drawFlag();const big=$('#flagBig').getContext('2d');big.drawImage(flag,0,0,300,180);document.querySelectorAll('[data-mini]').forEach(cv=>paintFlag(cv.getContext('2d'),60,36,{...f,p:cv.dataset.mini}));};
 paintAll();
 const sync=()=>{const ok=hasName(state.name)&&hasName(state.leader);$('#guideNext').disabled=!ok;$('#guideHelp').textContent=ok?'✓ Ready.':'Type a country name and a leader name to continue.';labels();save();};
 $('#gName').oninput=e=>{state.name=e.target.value;sync();};$('#gLeader').oninput=e=>{state.leader=e.target.value;sync();};
 $('#gName').onkeydown=e=>{if(e.key==='Enter')$('#gLeader').focus();};
 const setF=(k,v)=>{f[k]=v;const y=window.scrollY;found();window.scrollTo(0,y);save();};
 document.querySelectorAll('[data-pattern]').forEach(x=>x.onclick=()=>setF('p',x.dataset.pattern));
 document.querySelectorAll('[data-c1]').forEach(x=>x.onclick=()=>setF('c1',x.dataset.c1));
 document.querySelectorAll('[data-c2]').forEach(x=>x.onclick=()=>setF('c2',x.dataset.c2));
 document.querySelectorAll('[data-sym]').forEach(x=>x.onclick=()=>setF('sym',x.dataset.sym));
 $('#drawOnFlag').onclick=openFlag;
 $('#guideNext').onclick=()=>{if(!hasName(state.name)||!hasName(state.leader))return;go(resumeStage(1));};
 if($('#backToYear'))$('#backToYear').onclick=()=>go(resumeStage(3));
}

/* ---------- Step 2: three places, each with a trade-off ---------- */
function yearWarning(){const n=state.timeline.length;return n?`<p class="year-warning">⚠ Your year has started. Changing anything here erases your ${n} move${n===1?'':'s'}.</p>`:'';}
function build(){
 const chosen=G.places.map(p=>p.id),ready=chosen.length===3;
 $('#tools').innerHTML=head('STEP 2 · BUILD','Build 3 places','Pick 3. Each one helps, and each one costs something. Watch your meters.')+yearWarning()+
 `<div class="place-cards">${C.places.map(p=>`<button type="button" class="place-card ${chosen.includes(p.id)?'selected':''}" data-place="${p.id}" aria-pressed="${chosen.includes(p.id)}"><span class="place-icon" aria-hidden="true">${p.icon}</span><b>${esc(p.name)}</b><span class="plus">${esc(p.plus)}</span><span class="minus">${esc(p.minus)}</span></button>`).join('')}</div>
 <p class="place-count"><b>${chosen.length} of 3</b> built.${chosen.length?' Tap again to remove.':''}</p>${miniMeters()}
 <button id="guideNext" class="primary wide step-next" ${ready?'':'disabled'}>Next: set up your government →</button><button id="guideBack" class="wide guide-back">← Back</button>`;
 document.querySelectorAll('[data-place]').forEach(x=>x.onclick=()=>{
  const id=x.dataset.place,at=G.places.findIndex(p=>p.id===id);
  if(state.timeline.length)resetYear();
  if(at>=0){const mark=G.places[at].mark;state.marks=state.marks.filter(m=>m.id!==mark);G.places.splice(at,1);}
  else{if(G.places.length>=3){toast('You have 3 places. Tap one to remove it first.');return;}const p=C.places.find(q=>q.id===id),before=state.marks.length;buildPlace(p.icon,p.name,p.category);if(state.marks.length===before)return;G.places.push({id,mark:state.marks.at(-1).id});}
  const y=window.scrollY;refresh();window.scrollTo(0,y);
 });
 $('#guideNext').onclick=()=>{if(G.places.length===3)go(G.furthest>=3&&setupDone()?3:2);};
 $('#guideBack').onclick=()=>go(0);
}

/* ---------- Checks: apply-it questions, reshuffle after a miss ---------- */
function rec(id,q){let r=G.checks[id];if(!r)r=G.checks[id]={first:null,done:false,tries:0,msg:'',key:''};if(r.key!==q.answer){r.key=q.answer;r.done=false;r.msg='';r.order=null;}if(!r.order)r.order=shuffle([q.answer,...q.wrong],id+r.tries);return r;}
function checkMarkup(q,r,kicker){
 if(r.done)return `<section class="apply-check done" aria-live="polite"><div class="check-kicker">${kicker}</div><p class="check-right"><b>✓ Right.</b> ${esc(q.why)}</p></section>`;
 return `<section class="apply-check" aria-live="polite"><div class="check-kicker">${kicker}</div><p class="quiz-scene">${esc(q.scene)}</p><h3 class="quiz-question">${esc(q.ask)}</h3><div class="guided-options">${r.order.map((t,i)=>`<button type="button" class="guided-choice" data-answer="${i}"><b>${esc(t)}</b></button>`).join('')}</div>${r.msg?`<p class="check-retry" role="status"><b>Not quite.</b> ${esc(r.msg)} The answers have been mixed up. Try again.</p>`:''}</section>`;
}
function bindCheck(q,r,after){
 document.querySelectorAll('[data-answer]').forEach(x=>x.onclick=()=>{
  const pickText=r.order[+x.dataset.answer];
  if(pickText===q.answer){if(r.first===null)r.first=true;r.done=true;r.msg='';}
  else{if(r.first===null)r.first=false;r.tries++;r.msg=q.why;const oldAt=r.order.indexOf(q.answer);let next=shuffle([q.answer,...q.wrong],q.id+r.tries),guard=0;while(next.indexOf(q.answer)===oldAt&&guard++<8)next=shuffle([q.answer,...q.wrong],q.id+r.tries+'x'+guard);r.order=next;}
  save();after();
 });
}

/* ---------- Step 3: government, one question per screen, concept named after the pick ---------- */
function gov(){
 const def=C.setup[G.gov],key=def.key,picked=G.picked[key],val=state[key];
 const checks=C.setupChecks(state,state.name);
 const q=key==='polity'?checks.polity:key==='division'?checks.division:null,r=q&&picked?rec(q.id,q):null;
 const meaning=key==='oversight'?C.checkMeaning[val]:C.words[val].text;
 const name=key==='oversight'?C.checkNames[val]:C.words[val].name;
 const warns=picked&&G.gov===3?C.setupWarnings(state):[];
 const ready=picked&&(!r||r.done);
 $('#tools').innerHTML=head(`STEP 3 · GOVERNMENT · ${G.gov+1} OF 4`,esc(def.ask),'')+yearWarning()+
 `<div class="guided-options">${def.options.map(([k,t,d])=>`<button type="button" class="guided-choice ${picked&&val===k?'selected':''}" data-gov="${k}" aria-pressed="${picked&&val===k}"><b>${esc(t)}</b><span>${esc(d)}</span></button>`).join('')}</div>
 ${def.note?`<p class="guided-help">${esc(def.note)}</p>`:''}${picked?miniMeters():''}
 ${picked&&(!r||r.done)?`<div class="concept-reveal"><span>You picked</span><b>${esc(name)}</b><p>${esc(meaning)}</p></div>`:''}
 ${warns.map(w=>`<section class="power-alert" role="alert"><div class="step-kicker">SYSTEM CLASH</div><p>${esc(w)}</p><p class="guided-help">You can keep it and face the results, or change an answer.</p></section>`).join('')}
 ${r?checkMarkup(q,r,avatar()+' VERA KANE TESTS YOU'):''}
 <button id="guideNext" class="primary wide step-next" ${ready?'':'disabled'}>${G.gov<3?'Next question →':'Start ruling →'}</button><button id="guideBack" class="wide guide-back">← Back</button>`;
 document.querySelectorAll('[data-gov]').forEach(x=>x.onclick=()=>{
  if(state.timeline.length)resetYear();
  state[key]=x.dataset.gov;G.picked[key]=true;if(key==='polity')state.approach=C.approachFor(state.polity);
  const y=window.scrollY;refresh();window.scrollTo(0,y);
 });
 if(r)bindCheck(q,r,()=>{const y=window.scrollY;refresh();window.scrollTo(0,y);});
 $('#guideNext').onclick=()=>{if(!ready)return;if(G.gov<3){G.gov++;go(2);}else go(3);};
 $('#guideBack').onclick=()=>{if(G.gov>0){G.gov--;go(2);}else go(1);};
}

/* ---------- Step 4: rule for one year ---------- */
function deltaChips(before,after){
 const labelsOf={approval:'Approval',budget:'Budget',order:'Order',trust:'Trust',liberty:'Liberty'};
 const chips=S.KEYS.map(k=>{const d=after[k]-before[k];return d?`<span class="delta ${d>0?'up':'down'}">${labelsOf[k]} ${d>0?'+':'−'}${Math.abs(d)}</span>`:'';}).join('');
 return chips?`<div class="delta-row" aria-label="Meter changes">${chips}</div>`:'';
}
function harmLine(ch){const h=ch.harm||{},bits=[];if(h.deaths)bits.push(h.deaths+(h.deaths===1?' person dies.':' people die.'));if(h.injuries)bits.push(h.injuries+' hurt.');if(h.strike)bits.push('National strike.');if(h.resigned)bits.push(h.resigned+' quits.');return bits.length?`<p class="harm-result"><b>${bits.join(' ')}</b></p>`:'';}
function rewindMarkup(){
 const items=state.timeline.map((it,i)=>({it,i})).filter(x=>x.it.kind==='decision');
 if(!items.length)return '';
 return `<details class="past-decisions"><summary>Change an earlier decision</summary><p class="guided-help">Going back erases every move after it.</p>${items.map(({it,i})=>`<button data-rewind="${i}">${rewindArmed===i?'Erase later moves? Click again':'↩ Redo decision '+(it.event+1)+': '+esc(C.governanceEvents[it.event].title)}</button>`).join('')}</details>`;
}
function bindRewind(){document.querySelectorAll('[data-rewind]').forEach(x=>x.onclick=()=>{const i=+x.dataset.rewind;if(rewindArmed!==i){rewindArmed=i;rule();document.querySelector('.past-decisions').open=true;return;}rewindArmed=null;state.timeline=state.timeline.slice(0,i);G.pending=null;G.showResult=false;G.confirm=null;const last=S.run(state).steps.at(-1);G.rivalQuote=last?last.rq:'';refresh();});}
function choiceList(def,salt){return `<div class="guided-options">${shuffle(def.choices.map((c,i)=>i),salt).map(i=>`<button type="button" class="guided-choice" data-choice="${i}"><b>${esc(def.choices[i].title)}</b><span>${esc(def.choices[i].text)}</span></button>`).join('')}</div>`;}
function confirmMarkup(def,warns){
 const c=def.choices[G.confirm.choice];
 return `<p class="policy-chosen"><b>Your move:</b> ${esc(c.title)}</p><section class="power-alert" role="alert"><div class="step-kicker">SYSTEM CLASH</div><h3>Does this fit your government?</h3>${warns.slice(0,2).map(w=>`<p>${esc(w)}</p>`).join('')}<div class="confirm-row"><button id="doIt" class="primary">Do it anyway</button><button id="pickAgain">Pick again</button></div></section>`;
}
function commit(item){state.timeline.push(item);if(item.kind==='surprise')G.pending=null;G.confirm=null;G.showResult=true;const step=S.run(state).steps.at(-1);G.rivalQuote=step?step.rq:'';refresh();window.scrollTo(0,0);$('#guideTitle')?.focus({preventScroll:true});}
function bindChoices(makeItem){
 document.querySelectorAll('[data-choice]').forEach(x=>x.onclick=()=>{const item=makeItem(+x.dataset.choice),warns=S.alignment(state,item,item.choice);if(warns.length){G.confirm=item;rule();window.scrollTo(0,0);return;}commit(item);});
 if($('#doIt'))$('#doIt').onclick=()=>commit(G.confirm);
 if($('#pickAgain'))$('#pickAgain').onclick=()=>{G.confirm=null;rule();};
}
function rule(){
 const r=S.run(state),made=decisionsMade(),last=r.steps.at(-1);
 if(G.showResult&&last){resultScreen(last,r);return;}
 if(made>=5&&!G.pending){yearOver(r);return;}
 if(G.pending){surpriseScreen(G.pending);return;}
 const d=made,ev=C.governanceEvents[d],prompt=!open()&&ev.promptClosed?ev.promptClosed:ev.prompt;
 const item=G.confirm&&G.confirm.kind==='decision'?G.confirm:null;
 $('#tools').innerHTML=head(`STEP 4 · DECISION ${d+1} OF 5`,esc(ev.title),esc(prompt))+advisorNote(r)+
 (d===0&&!state.timeline.length?`<div class="rival-intro">${avatar()}<p><b>Meet your rival.</b> ${esc(C.rival.intro(state.polity))}</p></div>`:'')+
 (ev.fact?`<details class="topic-fact"><summary>Real-world background</summary><p>${esc(ev.fact)}</p><a href="${esc(ev.source)}" target="_blank" rel="noopener">Source ↗</a></details>`:'')+
 (item?confirmMarkup(ev,S.alignment(state,item,item.choice)):`<p class="pick-hint">Every move costs something. Pick one.</p>`+choiceList(ev,'d'+d))+rewindMarkup();
 bindChoices(choice=>({kind:'decision',event:d,choice}));bindRewind();
}
function advisorNote(r){return r.takeover||r.overthrown?`<p class="advisor-note">⚠ <b>You are out of power.</b> You now advise the new government. Your advice still moves the meters and your score.</p>`:'';}
function surpriseScreen(p){
 const sp=C.surprises.find(x=>x.id===p.id),item=G.confirm&&G.confirm.kind==='surprise'?G.confirm:null;
 const r=S.run(state);
 $('#tools').innerHTML=advisorNote(r)+`<section class="surprise-banner" role="alert"><div class="surprise-icon" aria-hidden="true">${sp.icon}</div><div class="step-kicker">⚡ SURPRISE · ${esc(sp.kicker)}</div><h2 id="guideTitle" tabindex="-1">${esc(sp.title)}</h2><p class="surprise-why"><b>Why now?</b> ${esc(p.why)}</p></section><p class="decision-prompt">${esc(p.prompt)}</p>`+
 (item?confirmMarkup(sp,S.alignment(state,item,item.choice)):choiceList(sp,'s'+p.id))+rewindMarkup();
 bindChoices(choice=>({kind:'surprise',id:p.id,choice,why:p.why,prompt:p.prompt}));bindRewind();
}
function resultScreen(step,r){
 const ch=step.choice,def=step.def,isS=step.item.kind==='surprise';
 const learn=!r.open&&def.learnClosed?def.learnClosed:def.learn;
 const ended=step.removedNow;
 const label=isS?'SURPRISE RESULT':`DECISION ${step.item.event+1} OF 5 · RESULT`;
 $('#tools').innerHTML=head(label,'What happened','')+
 `<p class="policy-chosen"><b>Your move:</b> ${esc(ch.title)}</p><p class="result-text">${esc(step.result)}</p>${harmLine(ch)}${deltaChips(step.before,step.after)}
 ${rivalSays(step.rq,`<small class="rival-shift">Rival power ${step.rivalBefore} → <b>${step.rivalAfter}</b></small>`)}
 ${W.uprisingMarkup(step)}${ended?`<section class="uprising-alert" role="alert"><div class="step-kicker">YOU ARE OUT OF POWER</div><h3>${r.overthrown?'Rebels control all three states.':'Vera Kane takes over.'}</h3><p>Your ending is set. Finish the year as an advisor. Your choices still count toward your score.</p></section>`:''}
 <div class="concept-callout learn-box">${learn}</div>
 ${step.warnings.length?'<p class="clash-note">⚠ This move clashed with your system.</p>':''}
 <button id="nextMove" class="primary wide step-next">${ended?'Keep going as an advisor →':'Next →'}</button>
 <button id="undoMove" class="wide guide-back">↩ Change this move</button>`+rewindMarkup();
 $('#nextMove').onclick=()=>{G.showResult=false;if(!isS)G.pending=S.nextSurprise(state,step.item.event);refresh();window.scrollTo(0,0);$('#guideTitle')?.focus({preventScroll:true});};
 $('#undoMove').onclick=()=>{const it=state.timeline.pop();G.showResult=false;G.pending=isS?{id:it.id,why:it.why||'',prompt:it.prompt||''}:null;const prev=S.run(state).steps.at(-1);G.rivalQuote=prev?prev.rq:'';refresh();};
 bindRewind();
}
function yearOver(r){
 const early=r.takeover||r.overthrown;
 $('#tools').innerHTML=head('STEP 4 · YEAR OVER',early?'Your year ended early':'You made it through the year',early?'You are out of power. One last thing before you see why.':'Five decisions. Your country will remember them.')+
 rivalSays(G.rivalQuote||'Let’s see how this ends.')+`<button id="guideNext" class="primary wide step-next">Next: sign one law →</button>`+rewindMarkup();
 $('#guideNext').onclick=()=>go(4);bindRewind();
}

/* ---------- Step 5: one law with a sentence stem ---------- */
function law(){
 const ready=()=>words(G.law)>=4&&words(G.lawWhy)>=3;
 $('#tools').innerHTML=head('STEP 5 · YOUR LAW','Sign one law','Think about your year. What law does '+esc(state.name||'your country')+' need most? Tap an idea or write your own.')+
 `<div class="law-chips">${C.lawIdeas.map(l=>`<button type="button" data-idea="${l.id}" class="${G.lawIdea===l.id?'selected':''}" aria-pressed="${G.lawIdea===l.id}">${esc(l.topic)}</button>`).join('')}</div>
 <label for="gLaw">The law (you can edit it)</label><textarea id="gLaw" maxlength="140" placeholder="Example: Police need a warrant to search camera records.">${esc(G.law)}</textarea>
 <label for="gLawWhy">Finish the sentence</label><div class="stem-box"><span class="stem">This law matters because</span><textarea id="gLawWhy" maxlength="160" placeholder="…what happened in my year">${esc(G.lawWhy)}</textarea></div>
 <p id="guideHelp" class="guided-help">${ready()?'✓ Ready to sign.':'Write a law (4+ words) and finish the sentence (3+ words).'}</p><button id="guideNext" class="primary wide step-next" ${ready()?'':'disabled'}>Sign the law ✍</button><button id="guideBack" class="wide guide-back">← Back to my year</button>`;
 const upd=()=>{$('#guideNext').disabled=!ready();$('#guideHelp').textContent=ready()?'✓ Ready to sign.':'Write a law (4+ words) and finish the sentence (3+ words).';save();};
 document.querySelectorAll('[data-idea]').forEach(x=>x.onclick=()=>{G.lawIdea=x.dataset.idea;const idea=C.lawIdeas.find(l=>l.id===G.lawIdea);if(idea.text)G.law=idea.text;const y=window.scrollY;law();window.scrollTo(0,y);if(!idea.text)$('#gLaw').focus();save();});
 $('#gLaw').oninput=e=>{G.law=e.target.value;upd();};$('#gLawWhy').oninput=e=>{G.lawWhy=e.target.value;upd();};
 $('#guideNext').onclick=()=>{if(!ready())return;state.rules=[{id:1,text:G.law.trim()}];const idea=C.lawIdeas.find(l=>l.id===G.lawIdea)||C.lawIdeas.at(-1);G.rivalQuote=idea.rq;go(5);};
 $('#guideBack').onclick=()=>go(3);
}

/* ---------- Ending, end check, score, turn in ---------- */
const finalWords={thriving:'Fine. You earned it. See you next election.',divided:'Half the country is with me now. Next year is mine.',crackdown:'You can rule by fear. Fear doesn’t last.',revolution:'The people did what I couldn’t.',collapse:'Broke and broken. I’ll clean up your mess.',election:'Thanks for a fair fight. Now watch me work.',impeached:'The system worked. Against you.',coup:'The generals chose me. History will decide.',rival:'Every mistake made me stronger. Thank you.'};
function endingScreen(){
 const e=S.ending(state),m=e.r.m;
 $('#tools').innerHTML=`<section class="ending-card tone-${e.tone}"><div class="ending-art" aria-hidden="true">${e.icon}</div><div class="step-kicker">THE END OF YEAR ONE · GAME OUTCOME</div><h2 id="guideTitle" tabindex="-1">${esc(e.title)}</h2><div class="ending-scene"><img src="${flag.toDataURL('image/png')}" alt="Your flag" class="ending-flag"><img src="${map.toDataURL('image/png')}" alt="Your country map at the end of the year" class="ending-map"></div><p class="ending-why">${e.why}</p><div class="ending-stats">${S.KEYS.map(k=>`<span><small>${({approval:'Approval',budget:'Budget',order:'Order',trust:'Trust',liberty:'Liberty'})[k]}</small><b>${m[k]}</b></span>`).join('')}<span><small>Rival</small><b>${e.r.rival}</b></span></div>${rivalSays(finalWords[e.sub||e.key])}<p class="guided-help">This is a fictional game outcome, not a prediction.</p></section><button id="guideNext" class="primary wide step-next">Lock in your score: 4 quick questions →</button>`;
 $('#guideNext').onclick=()=>go(6);
}
function endCheckList(){return shuffle(C.endChecks(state,state.name),'end');}
function checkStage(){
 const qs=endCheckList(),i=Math.min(G.checkIdx,qs.length-1),q=qs[i],r=rec(q.id,q);
 $('#tools').innerHTML=head(`QUESTION ${i+1} OF ${qs.length} · ABOUT YOUR COUNTRY`,'Prove what you know','First-try answers raise your score.')+checkMarkup(q,r,'APPLY IT')+
 (r.done?`<button id="guideNext" class="primary wide step-next">${i<qs.length-1?'Next question →':'See my score →'}</button>`:'');
 bindCheck(q,r,()=>checkStage());
 if($('#guideNext'))$('#guideNext').onclick=()=>{if(i<qs.length-1){G.checkIdx=i+1;checkStage();save();window.scrollTo(0,0);}else go(7);};
}
function firstTry(){const ids=['setup-polity','setup-division',...C.endChecks(state,state.name).map(q=>q.id)];return {right:ids.filter(id=>G.checks[id]?.first===true).length,total:ids.length};}
function results(){const e=S.ending(state),ft=firstTry(),points=S.score(state,e,ft.right,ft.total);return {e,ft,points,rank:S.rank(e,points)};}
function finalStage(){
 const {e,ft,points,rank}=results(),stem='My country got the '+e.title+' ending because I';
 const ok=()=>words(G.sentence)>=4;
 G.final={ending:e.title,score:points,rank};
 $('#tools').innerHTML=`<section class="score-card"><div class="step-kicker">FINAL SCORE</div><div class="score-big"><b>${points}</b><span>/100</span></div><h2 id="guideTitle" tabindex="-1">${esc(rank)}</h2><p class="score-ending">${esc(e.title)} · ${ft.right} of ${ft.total} answers right on the first try</p><p class="score-compare"><b>Compare your score with your class.</b></p></section>
 <label for="gSentence">Finish the sentence</label><div class="stem-box"><span class="stem">${esc(stem)}</span><textarea id="gSentence" maxlength="200" placeholder="…what I did that caused it">${esc(G.sentence)}</textarea></div>
 <label for="gStudent">Your name</label><input id="gStudent" maxlength="40" autocomplete="off" placeholder="First name + last initial (like Jordan M.)" value="${esc(G.student||'')}">
 <button id="turnIn" class="primary wide step-next" ${ok()&&String(G.student||'').trim()?'':'disabled'}>Turn in to my teacher</button><p id="turnStatus" class="turn-status" role="status">${G.submitted?'✓ Turned in at '+esc(G.submitted)+'. You can turn in again if you change something.':''}</p>
 <button id="printMine" class="wide">Print my 3-page report</button><button id="replayYear" class="wide guide-back">Replay my year (keep my country)</button>`;
 const upd=()=>{$('#turnIn').disabled=!(ok()&&String(G.student||'').trim());save();};
 $('#gSentence').oninput=e2=>{G.sentence=e2.target.value;upd();};$('#gStudent').oninput=e2=>{G.student=e2.target.value;upd();};
 $('#printMine').onclick=openReport;
 let replayArmed=false;$('#replayYear').onclick=()=>{if(!replayArmed){replayArmed=true;$('#replayYear').textContent='Erase this year and play again? Click again.';return;}resetYear();G.law='';G.lawWhy='';G.lawIdea='';state.rules=[];G.checkIdx=0;G.sentence='';G.furthest=3;go(3);};
 $('#turnIn').onclick=turnIn;
}
function payload(){
 const {e,ft,points,rank}=results(),r=e.r,dec=r.steps.filter(s=>s.item.kind==='decision'),sur=r.steps.filter(s=>s.item.kind==='surprise');
 return {studentName:G.student,assignmentId:'gov-my-country-day3',answers:{
  'Standard':STANDARD,
  'First-try correct':ft.right+' of '+ft.total,
  'Score':points+' / 100',
  'Rank':rank,
  'Ending':e.title,
  'Country':(state.name||'')+' (leader: '+(state.leader||'')+')',
  'Government':[C.words[state.polity].name,C.words[state.division].name,C.words[state.ownership].name,'Check: '+C.checkNames[state.oversight]].join(' · '),
  'Places':G.places.map(p=>C.places.find(x=>x.id===p.id)?.name).join(', '),
  'Decisions':dec.map(s=>(s.item.event+1)+') '+s.choice.title).join('; '),
  'Surprise events':sur.length?sur.map(s=>s.def.title+' → '+s.choice.title).join('; '):'None',
  'Moves that clashed with my system':String(r.steps.filter(s=>s.warnings.length).length),
  'Law':G.law.trim()+' This law matters because '+G.lawWhy.trim(),
  'Sentence':'My country got the '+e.title+' ending because I '+G.sentence.trim()
 }};
}
async function turnIn(){
 const btn=$('#turnIn'),st=$('#turnStatus');btn.disabled=true;st.textContent='Sending…';st.className='turn-status';
 try{
  const body=payload();
  const res=await classTurnIn(SUBMIT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(res.ok){G.submitted=new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});save();shell();st.textContent='✓ Turned in! Your teacher can see your work. You can still print your report.';st.className='turn-status ok';}
  else{st.textContent=data.error||'Turn-in did not go through. Check your name and try again.';st.className='turn-status bad';}
 }catch(err){st.textContent='No connection. Keep this page open and try again in a minute.';st.className='turn-status bad';}
 btn.disabled=false;
}
function openReport(){
 if(G.stage<7)return;
 const {e,ft,points,rank}=results();
 CountryReport.mount({state,engine:C,society:S,mapUrl:map.toDataURL('image/png'),flagUrl:flag.toDataURL('image/png'),ending:e,score:points,rank,firstTry:ft,guide:G});
 $('#showDialog').showModal();$('#showDialog').scrollTop=0;
}
$('#finishBtn').onclick=openReport;
$('#backBuild').onclick=()=>$('#showDialog').close();

/* ---------- Router ---------- */
renderTools=function(){
 if(!G.seen){directions();return;}
 [found,build,gov,rule,law,endingScreen,checkStage,finalStage][G.stage]();
 if(welcomeBack&&!welcomeShown){welcomeShown=true;const n=STAGE_NAV[G.stage]+1;$('#tools').insertAdjacentHTML('afterbegin',`<p class="welcome-back" role="status">Welcome back — you’re on step ${n} of 6.</p>`);}
};
$('#instructionsBtn').onclick=()=>{G.seen=false;refresh();};
$('#resetBtn').onclick=()=>{if(!resetArmed){resetArmed=true;$('#resetBtn').textContent='Erase everything? Click again.';setTimeout(()=>{resetArmed=false;$('#resetBtn').textContent='Start over';},5000);return;}localStorage.removeItem(KEY);try{window.classFirstTry&&classFirstTry.reset();}catch(e){}location.reload();};
$('#words').innerHTML=Object.values(C.words).map(w=>`<details class="vocab-term"><summary>${esc(w.name)}</summary><p>${esc(w.text)}</p></details>`).join('')+'<p class="note">Economic terms compare ownership. They do not tell us who rules.</p><p class="note">Term sources: <a href="https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/capitalism" target="_blank" rel="noopener">IMF</a> · <a href="https://www.bu.edu/eci/2024/08/23/comparative-economic-systems/" target="_blank" rel="noopener">Boston University</a></p>';
/* Keep the stage valid after a refresh. */
if(G.stage>=2&&G.places.length<3)G.stage=1;
if(G.stage>=3&&!setupDone()){G.stage=2;}
if(G.stage>=5&&!state.rules.length)G.stage=4;
if(G.stage===7&&C.endChecks(state,state.name).some(q=>!G.checks[q.id]?.done))G.stage=6;
refresh();
document.body.classList.remove('guided-loading');$('#guideLoading')?.remove();
})();
