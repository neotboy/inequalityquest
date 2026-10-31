'use strict';
/* Required tasks are saved separately from the creative work already on the map. */
(() => {
const freeTools=renderTools,originalFinish=$('#finishBtn').onclick,originalFlagDone=$('#flagDone').onclick,originalSave=save;
const titles=['Name your country','Name your leader','Make your flag','Build place 1','Build place 2','Build place 3','Build place 4','Build place 5','Choose who rules','Choose how power is shared','Choose how you will lead','Choose your economic system','Check your leader’s power','Survive your first year','Make law 1','Make law 2','Review your country'];
const LAST=titles.length-1; // review screen (16)
const stageAt=i=>i<8?'build':i<13?'power':i===13?'crisis':'laws';
const starts={build:0,power:8,crisis:13,laws:14};
const G=state.guide&&state.guide.version===1?state.guide:{version:1,task:0,furthest:0,done:{},picks:{},meanings:{},places:[],round:0,readRounds:[],lawReasons:{},flagConfirmed:false,flagPurpose:''};
state.guide=G;G.decorating=false;G.lawDrafts=G.lawDrafts||{};G.task=Math.max(0,Math.min(LAST,Number(G.task)||0));G.furthest=Math.max(0,Math.min(LAST,Number(G.furthest)||0));
let viewingInstructions=false,placePage=0,savedPlaceMode=false,editingRound=null,historyPage=0,replacingSlot=-1,chosenPlace=null,pendingChoice=null,choiceGoal='',mapPurpose='',lawDraft='',lawReason='',lawTask=-1,flagPurpose=G.flagPurpose||'';
const longEnough=t=>String(t||'').trim().split(/\s+/).filter(Boolean).length>=3&&String(t||'').trim().length>=12;
const hasFlag=()=>!!state.flagSet||state.flag.length>0||state.flagBg!=='#16364a';
const hasName=t=>String(t||'').trim().length>=2;
const placeFor=i=>G.places[i]&&state.marks.find(m=>m.id===G.places[i].id);
const K=CountryKnowledge;
const checks={
 polity:{democracy:'People vote on laws themselves.',republic:'Voters elect leaders. The Constitution limits their power.',oligarchy:'A small group holds most power.',autocracy:'One leader holds most power.',totalitarian:'Government tries to control politics and daily life.'},
 division:{federal:'National and state governments share power.',unitary:'The national government holds most power.',confederate:'States keep most power.'},
 approach:{consult:'Hear from Congress, states, and the public.',firm:'Act quickly while keeping legal limits.',hard:'Put more decisions under the leader’s control.'},
 oversight:{courts:'Courts review orders.',congress:'Congress reviews spending.',time:'Emergency orders expire without a vote.'},
 ownership:{capitalism:'Private owners run businesses and sell for profit.',mixed:'Private businesses, public services, and government rules.',socialism:'The public or workers own major businesses and resources.',communism:'An idea of shared ownership and no social classes.'}
};
if(!G.knowledge||G.knowledge.version!==1){
 G.knowledge={version:1,seed:Math.floor(Math.random()*4294967295),log:{}};
 G.round=0;G.reviewStep=0;G.readRounds=[];
 for(let i=6;i<=10;i++)delete G.done[i];
 if(G.task>6){G.task=6;G.furthest=6;}
}
if(G.courseVersion===2){
 state.decisions=state.decisions.filter(d=>d.event<3);
 for(let i=3;i<5;i++){delete G.knowledge.log['round.'+i];if(G.seenResults)delete G.seenResults[i];}
 for(let i=11;i<=15;i++)delete G.done[i];
 G.round=Math.min(G.round,3);G.task=Math.min(G.task,11);G.furthest=Math.min(G.furthest,11);G.courseVersion=3;
}
if(G.courseVersion!==3){
 if(state.decisions.length)G.previousCourse={decisions:state.decisions,knowledge:G.knowledge};
 state.decisions=[];G.round=0;G.reviewStep=0;G.readRounds=[];
 G.knowledge={version:1,seed:Math.floor(Math.random()*4294967295),log:{}};
 for(let i=6;i<=15;i++)delete G.done[i];
 G.task=Math.min(G.task,6);G.furthest=Math.min(G.furthest,6);G.courseVersion=3;
}
// Add two place tasks without discarding completed government checks or decisions.
if(G.requiredPlaces!==5){
 const shifted={};for(const [key,value] of Object.entries(G.done)){const i=Number(key);shifted[i>=6?i+2:i]=value;}G.done=shifted;
 if(G.task>=6)G.task+=2;if(G.furthest>=6)G.furthest+=2;
 G.requiredPlaces=5;
 if(G.task>=8&&(!placeFor(3)||!placeFor(4)))G.task=6;
}
G.seenResults=G.seenResults||{};
// Round 2: laws cut from 3 to 2. Saved games that were on law 3 or the review move to the review.
if(G.lawCount!==2){delete G.done[16];G.task=Math.min(G.task,LAST);G.furthest=Math.min(G.furthest,LAST);G.lawCount=2;}
G.crises=Array.isArray(G.crises)?G.crises:[];
const passed=id=>G.knowledge.log[id]?.passed===true;
function shuffled(id,variant,size){
 let seed=G.knowledge.seed>>>0;
 for(const c of id+':'+variant)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 const slot=id.startsWith('round.')?5+Number(id.split('.')[1]):['polity','division','approach','ownership','oversight'].indexOf(id.split('.')[1]);
 const positions=[1,0,2,0,2,1,2,1,0,1];
 const answerAt=(positions[Math.max(0,slot)%positions.length]+(G.knowledge.seed%3)+variant)%size;
 const wrong=[];for(let i=1;i<size;i++)wrong.push(i);
 for(let i=wrong.length-1;i>0;i--){seed=(Math.imul(seed,1103515245)+12345)>>>0;const j=(seed>>>8)%(i+1);[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
 const result=[];for(let i=0;i<size;i++)result.push(i===answerAt?0:wrong.shift());
 return result;
}
function quizRecord(id,bank){
 if(!G.knowledge.log[id])G.knowledge.log[id]={variant:0,attempts:[],selected:null,status:'answer',passed:false,order:shuffled(id,0,bank[0].choices.length)};
 return G.knowledge.log[id];
}
function quizMarkup(id,bank){
 const r=quizRecord(id,bank),q=bank[r.variant%bank.length];
 if(r.status==='correct')return `<section class="guided-check quiz-right" role="status"><b>✓ Knowledge check passed</b><details><summary>Why?</summary><p>${esc(q.why)}</p></details><button id="quizEdit" class="wide guide-back">Review or change my answer</button></section>`;
 if(r.status==='wrong')return `<section class="guided-check quiz-retry"><b>Not quite.</b>${q.hint?`<p><b>Hint:</b> ${esc(q.hint)}</p>`:''}<p>${esc(q.why)}</p><p class="guided-help">Read that, then try the idea in a new example.</p><button id="quizRetry" class="primary wide">Try a new example →</button></section>`;
 return `<section class="guided-check"><div class="step-kicker">USE WHAT YOU KNOW</div><p class="quiz-scene">${esc(q.scene)}</p><h3 class="quiz-question">${esc(q.ask)}</h3>${pickButtons(r.order.map((n,i)=>[String(i),q.choices[n]]),r.selected===null?null:String(r.selected),'data-quiz-answer')}<p class="guided-help">One answer is correct.</p><button id="quizSubmit" class="primary wide" ${r.selected===null?'disabled':''}>Check my answer</button><details id="quizClue"><summary>Need a clue?</summary><p>Look for who has power, which right is at stake, or what the plan gives up.</p></details></section>`;
}
function bindQuiz(id,bank,onPass=()=>{}){
 const r=quizRecord(id,bank),q=bank[r.variant%bank.length];
 document.querySelectorAll('[data-quiz-answer]').forEach(b=>b.onclick=()=>{if(r.status!=='answer')return;r.selected=+b.dataset.quizAnswer;refresh();});
 if($('#quizEdit'))$('#quizEdit').onclick=()=>{r.status='answer';r.passed=false;r.selected=null;refresh();};
 if($('#quizSubmit'))$('#quizSubmit').onclick=()=>{
  if(r.status!=='answer'||r.selected===null)return;
  const answer=q.choices[r.order[r.selected]],correct=answer===q.answer;
  r.attempts.push({question:q.id,answer,correct,helpUsed:!!r.helpUsed});
  r.status=correct?'correct':'wrong';r.passed=correct;if(!correct)r.wrongAt=Date.now();
  if(correct)onPass();refresh();
 };
 if($('#quizRetry')){const btn=$('#quizRetry'),label=btn.textContent;const left=()=>Math.ceil((8000-(Date.now()-(r.wrongAt||0)))/1000);const tick=()=>{if(!document.body.contains(btn))return;const n=left();if(n>0){btn.disabled=true;btn.textContent=`Read first… ${n}`;setTimeout(tick,500)}else{btn.disabled=false;btn.textContent=label}};tick();}
 if($('#quizRetry'))$('#quizRetry').onclick=()=>{if(r.status!=='wrong'||Date.now()-(r.wrongAt||0)<8000)return;r.variant++;r.status='answer';r.selected=null;r.helpUsed=false;r.order=shuffled(id,r.variant,bank[r.variant%bank.length].choices.length);refresh();};
 if($('#quizClue'))$('#quizClue').addEventListener('toggle',e=>{if(e.target.open){r.helpUsed=true;save();}});
}
function activeCheckIds(){return ['polity','division','approach','ownership','oversight'].map(k=>'system.'+k+'.'+state[k]).concat(K.rounds.map((_,i)=>'round.'+i));}
function checkLabel(id){const parts=id.split('.');if(parts[0]==='round')return 'Round '+(+parts[1]+1)+': '+E.governanceEvents[+parts[1]].title;if(parts[0]==='review')return 'Final check '+(+parts[1]+1);return ({polity:'Who rules',division:'How power is shared',approach:'Leadership style',ownership:'Economic system',oversight:'Checks and balances'}[parts[1]])+': '+(parts[1]==='approach'?({consult:'Build agreement',firm:'Lead firmly',hard:'Rule by command'}[parts[2]]):(E.words[parts[2]]?.name||({courts:'Court review',congress:'Spending review',time:'Emergency time limits'}[parts[2]])));}
function learningStats(){const ids=activeCheckIds(),records=ids.map(id=>G.knowledge.log[id]);return {total:ids.length,passed:records.filter(r=>r?.passed).length,firstTry:records.filter(r=>r?.attempts[0]?.correct).length,retries:records.reduce((n,r)=>n+Math.max(0,(r?.attempts.length||0)-1),0),clues:records.filter(r=>r?.attempts.some(a=>a.helpUsed)).length};}
function learningReport(){const stats=learningStats();return `<section class="guided-check"><h3>Knowledge check record</h3><p>${stats.passed} of ${stats.total} checks passed.<br>${stats.firstTry} correct on the first try.<br>Extra attempts: ${stats.retries}.<br>Checks with a clue: ${stats.clues}.</p><p class="guided-help">These checks assess civics ideas. Political choices do not count as right or wrong answers.</p></section>`;}
function taskValid(i){
 if(i===0)return hasName(state.name);
 if(i===1)return hasName(state.leader);
 if(i===2)return hasFlag()&&G.flagConfirmed&&!!G.flagPurpose;
 if(i>=3&&i<=7)return !!placeFor(i-3)&&!!G.places[i-3].purpose;
 if(i>=8&&i<=12){const key=['polity','division','approach','ownership','oversight'][i-8];return G.picks[key]===state[key]&&passed('system.'+key+'.'+state[key]);}
 if(i===13)return E.governanceEvents.every((e,n)=>passed('round.'+n)&&state.decisions.some(d=>d.event===n&&e.choices[d.choice]))&&CRISIS_SLOTS.every(crisisDone);
 if(i>=14&&i<=15){const r=state.rules[i-14];return !!r&&longEnough(r.text)&&longEnough(G.lawReasons[r.id])&&state.rules.filter(x=>x.text.trim().toLowerCase()===r.text.trim().toLowerCase()).length===1;}
 return false;
}
const finished=()=>titles.slice(0,LAST).every((_,i)=>G.done[i]&&taskValid(i));
function firstUnfinished(){return titles.slice(0,LAST).findIndex((_,i)=>!G.done[i]||!taskValid(i));}
function shell(){
 document.body.classList.toggle('guide-welcome',G.instructionsSeen!==true||viewingInstructions);
 view=G.decorating?'build':stageAt(G.task);document.body.classList.add('guided');document.body.classList.toggle('guide-laws',G.task>=14);document.body.classList.toggle('guide-creative',G.task<=7||G.decorating);document.body.dataset.guideTask=G.decorating?'decorate':String(G.task);
 $('main').classList.toggle('main-govern',view==='power');
 document.querySelectorAll('[data-tool]').forEach(b=>{const start=starts[b.dataset.tool];const unlocked=G.furthest>=start&&titles.slice(0,start).every((_,i)=>G.done[i]&&taskValid(i));b.disabled=!unlocked;b.classList.toggle('active',view===b.dataset.tool);b.setAttribute('aria-current',view===b.dataset.tool?'step':'false');b.title=unlocked?'Review this part':'Finish the earlier tasks to unlock this part';});
 $('#finishBtn').disabled=!finished();$('#finishBtn').textContent=finished()?'Review your country ↗':'Finish all tasks to review 🔒';
 $('#countryName').readOnly=true;$('#leaderName').readOnly=true;$('#countryName').tabIndex=-1;$('#leaderName').tabIndex=-1;
 $('#flagBtn').disabled=G.task!==2&&!finished();$('#flagBtn').tabIndex=$('#flagBtn').disabled?-1:0;
 map.style.pointerEvents=G.decorating||G.task>=3&&G.task<=7||G.task===LAST?'auto':'none';
 $('#stageStatus').innerHTML=`<b>${G.decorating?'Creative time':`TASK ${G.task+1} OF ${titles.length} · ${esc(titles[G.task])}`}</b><div class="guided-progress" role="progressbar" aria-label="Required tasks completed" aria-valuemin="0" aria-valuemax="${LAST}" aria-valuenow="${titles.slice(0,LAST).filter((_,i)=>G.done[i]&&taskValid(i)).length}"><i style="width:${titles.slice(0,LAST).filter((_,i)=>G.done[i]&&taskValid(i)).length/LAST*100}%"></i></div>`;
}
const CH=CountryChaos,CRISIS_SLOTS=[0,1,2,3];
function crisisDone(k){const c=G.crises[k];return !!c&&c.choice!==null&&c.choice!==undefined&&c.seen===true;}
const strip=document.createElement('div');strip.id='chaosStrip';strip.className='chaos-strip';strip.setAttribute('aria-live','polite');$('#stageStatus').before(strip);
let shownDeaths=null;
function renderStrip(){
 const on=G.instructionsSeen===true&&!viewingInstructions&&G.task>=8;strip.hidden=!on;if(!on)return;
 const t=CountryWorld.through(),h=CountrySociety.consequences(state,E.governanceEvents,t),n=CountrySociety.scores(state,E.governanceEvents,t),st=CountrySociety.unrest(state,E.governanceEvents,t);
 const top=Math.max(...st.map(r=>r.pressure)),phase=st.some(r=>r.phase==='insurrection')?'Rebellion':st.some(r=>r.phase==='protests')?'Protests':'Calm';
 const low=[['budget','Budget','services failing'],['trust','Trust','people stop listening'],['liberty','Liberties','people live in fear'],['order','Order','streets out of control'],['approval','Approval','your support is gone']].filter(([k])=>n[k]<25).map(([k,l,w])=>`${l} ${n[k]}: ${w}`);
 strip.innerHTML=`<div class="cs-item cs-dead"><span>Lives lost</span><b>${h.deaths}</b></div><div class="cs-item"><span>Approval</span><b>${n.approval}</b><i class="cs-bar"><i style="width:${n.approval}%"></i></i></div><div class="cs-item cs-${phase.toLowerCase()}"><span>Unrest</span><b>${phase}</b><small>${top}/100</small></div>${low.length?`<p class="cs-warn">⚠ ${esc(low.slice(0,2).join(' · '))}</p>`:''}`;
 if(shownDeaths!==null&&h.deaths>shownDeaths){strip.classList.remove('cs-hit');void strip.offsetWidth;strip.classList.add('cs-hit');setTimeout(()=>strip.classList.remove('cs-hit'),950);document.body.classList.remove('chaos-flash');void document.body.offsetWidth;document.body.classList.add('chaos-flash');setTimeout(()=>document.body.classList.remove('chaos-flash'),900);}
 shownDeaths=h.deaths;
}
save=function(){originalSave();shell();renderStrip();};
updateStageStatus=shell;
function refresh(){renderTools();labels();drawMap();drawFlag();save();}
function focusTask(){$('#guideTitle')?.focus({preventScroll:true});window.scrollTo(0,0);}
function moveTask(i){G.decorating=false;G.task=Math.max(0,Math.min(G.furthest,i));placePage=0;savedPlaceMode=false;editingRound=null;replacingSlot=-1;chosenPlace=null;pendingChoice=null;choiceGoal='';mapPurpose='';lawTask=-1;refresh();focusTask();}
function advance(){if(!taskValid(G.task)){toast('Finish the task on this card first.');return;}G.done[G.task]=true;G.furthest=Math.max(G.furthest,G.task+1);moveTask(G.task+1);}
goStage=function(stage){const start=starts[stage];if(start===undefined)return;const missing=firstUnfinished();if(start>G.furthest||missing>=0&&missing<start){toast('Finish your current task to unlock that part.');return;}moveTask(start);};
function intro(text){return `<div class="step-intro guided-intro"><div class="step-kicker">ONE TASK AT A TIME</div><h2 id="guideTitle" tabindex="-1">${esc(titles[G.task])}</h2><p>${text}</p></div>`;}
function footer(ready,label='Save and continue →'){return `<p id="guideHelp" class="guided-help">${ready?'✓ Ready to continue.':'Finish this task to continue.'}</p><button id="guideNext" class="primary wide step-next" ${ready?'':'disabled'}>${label}</button>${G.task>0?'<button id="guideBack" class="wide guide-back">← Review the last task</button>':''}`;}
function bindFooter(){if($('#guideNext'))$('#guideNext').onclick=advance;if($('#guideBack'))$('#guideBack').onclick=()=>moveTask(G.task-1);}
function updateNext(ready){const b=$('#guideNext');if(b)b.disabled=!ready;const h=$('#guideHelp');if(h)h.textContent=ready?'✓ Ready to continue.':'Finish this task to continue.';}
function pickButtons(items,selected,attr){return `<div class="guided-options">${items.map(([k,t,d])=>`<button type="button" ${attr}="${esc(k)}" class="guided-choice ${selected===k?'selected':''}" aria-pressed="${selected===k}"><b>${esc(t)}</b>${d?`<span>${esc(d)}</span>`:''}</button>`).join('')}</div>`;}
function names(){const key=G.task===0?'name':'leader',name=key==='name';$('#tools').innerHTML=intro(name?'Name your country. Funny names are welcome.':'Who is in charge? Give your leader a name or title.')+`<label for="guidedName">${name?'Country name':'Leader name'}</label><input id="guidedName" maxlength="${name?40:30}" autocomplete="off" placeholder="${name?'Example: The Republic of Chaos':'Example: President Pickles'}" value="${esc(state[key])}"><p class="guided-help">Use at least 2 characters. You can change it later.</p>`+footer(taskValid(G.task));$('#guidedName').oninput=e=>{state[key]=e.target.value;$(name?'#countryName':'#leaderName').value=e.target.value;save();updateNext(taskValid(G.task));};$('#guidedName').onkeydown=e=>{if(e.key==='Enter'&&taskValid(G.task))advance();};bindFooter();}
/* ---------- Quick flag maker: pick a design, two colors, a symbol. Drawing on top is optional. ---------- */
const FLAG_PAL=['#c8102e','#1f4e9c','#2e7d4f','#f2c230','#222222','#f7f4ea','#e8772e','#6a3d9a'];
const FLAG_PATTERNS=[['bands-v','Bands'],['bands-h','Stripes'],['cross','Cross'],['diag','Diagonal'],['canton','Corner box'],['circle','Circle']];
const FLAG_SYMBOLS=[['none','None'],['star','Star'],['sun','Sun'],['stars3','3 stars']];
function starPath(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r;c.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a));}c.closePath();c.fill();}
function paintFlag(c,w,h,f){
 const a=f.c1,b=f.c2;c.save();c.fillStyle=a;c.fillRect(0,0,w,h);c.fillStyle=b;let cx=w/2,cy=h/2,size=h*.22;
 if(f.p==='bands-v')c.fillRect(w/3,0,w/3,h);else if(f.p==='bands-h')c.fillRect(0,h/3,w,h/3);
 else if(f.p==='cross'){c.fillRect(w*.3,0,h*.2,h);c.fillRect(0,h*.4,w,h*.2);cx=w*.3+h*.1;}
 else if(f.p==='diag'){c.beginPath();c.moveTo(w,0);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();}
 else if(f.p==='canton'){for(let i=1;i<7;i+=2)c.fillRect(0,i*h/7,w,h/7);c.fillStyle=a;c.fillRect(0,0,w*.42,h*4/7);c.strokeStyle=b;c.lineWidth=h*.02;c.strokeRect(0,0,w*.42,h*4/7);cx=w*.21;cy=h*2/7;size=h*.15;}
 else if(f.p==='circle'){c.beginPath();c.arc(w/2,h/2,h*.3,0,Math.PI*2);c.fill();}
 const light=x=>['#f7f4ea','#f2c230'].includes(x),behind={'bands-v':b,'bands-h':b,cross:b,diag:a,canton:a,circle:b}[f.p]||a;
 const symColor=f.p==='circle'&&a!==b?a:light(behind)?'#222222':'#f7f4ea';c.fillStyle=symColor;c.strokeStyle=symColor;
 if(f.sym==='star')starPath(c,cx,cy,size);
 else if(f.sym==='sun'){c.beginPath();c.arc(cx,cy,size*.55,0,Math.PI*2);c.fill();c.lineWidth=Math.max(1.5,size*.12);for(let i=0;i<12;i++){const t=i*Math.PI/6;c.beginPath();c.moveTo(cx+Math.cos(t)*size*.75,cy+Math.sin(t)*size*.75);c.lineTo(cx+Math.cos(t)*size*1.05,cy+Math.sin(t)*size*1.05);c.stroke();}}
 else if(f.sym==='stars3')[-1,0,1].forEach(k=>starPath(c,cx+k*size*1.15,cy,size*.5));
 c.restore();
}
drawFlag=function(){if(state.flagSet)paintFlag(fc,600,360,state.flagSet);else{fc.fillStyle=state.flagBg;fc.fillRect(0,0,600,360);}state.flag.forEach(s=>stroke(fc,s));tc.clearRect(0,0,150,90);tc.drawImage(flag,0,0,150,90);};
function flagTask(){
 if(!state.flagSet)state.flagSet={p:'bands-v',c1:FLAG_PAL[Math.floor(Math.random()*4)],c2:FLAG_PAL[5],sym:'star'};
 G.flagConfirmed=true;const f=state.flagSet;
 const purposes=[['freedom','Freedom'],['strength','Strength'],['community','Community'],['nature','Nature'],['humor','Something funny'],['own','My own meaning']];
 $('#tools').innerHTML=intro('Tap a design, two colors, and a symbol. Then pick what it stands for.')+`<div class="flag-maker"><div class="flag-preview"><canvas id="flagBig" width="300" height="180" aria-label="Your flag"></canvas></div>
 <p class="maker-label">Design</p><div class="flag-patterns">${FLAG_PATTERNS.map(([k,n])=>`<button type="button" data-pattern="${k}" class="${f.p===k?'selected':''}" aria-pressed="${f.p===k}" aria-label="${n}"><canvas width="60" height="36" data-mini="${k}"></canvas><small>${n}</small></button>`).join('')}</div>
 <p class="maker-label">Main color</p><div class="swatches">${FLAG_PAL.map(c=>`<button type="button" class="swatch ${f.c1===c?'selected':''}" data-c1="${c}" style="--sw:${c}" aria-label="Main color ${c}" aria-pressed="${f.c1===c}"></button>`).join('')}</div>
 <p class="maker-label">Second color</p><div class="swatches">${FLAG_PAL.map(c=>`<button type="button" class="swatch ${f.c2===c?'selected':''}" data-c2="${c}" style="--sw:${c}" aria-label="Second color ${c}" aria-pressed="${f.c2===c}"></button>`).join('')}</div>
 <p class="maker-label">Symbol</p><div class="flag-symbols">${FLAG_SYMBOLS.map(([k,n])=>`<button type="button" data-sym="${k}" class="${f.sym===k?'selected':''}" aria-pressed="${f.sym===k}">${n}</button>`).join('')}</div>
 <button id="guidedFlag" type="button" class="wide guide-back">Draw on it (optional) ✎</button></div>
 <p class="guided-question">What does your flag stand for?</p>`+pickButtons(purposes,G.flagPurpose,'data-flag-purpose')+footer(taskValid(2));
 const paintAll=()=>{drawFlag();const big=$('#flagBig').getContext('2d');big.clearRect(0,0,300,180);big.drawImage(flag,0,0,300,180);document.querySelectorAll('[data-mini]').forEach(cv=>paintFlag(cv.getContext('2d'),60,36,{...f,p:cv.dataset.mini}));};
 paintAll();
 const setF=(k,v)=>{f[k]=v;const y=window.scrollY;refresh();window.scrollTo(0,y);};
 document.querySelectorAll('[data-pattern]').forEach(x=>x.onclick=()=>setF('p',x.dataset.pattern));
 document.querySelectorAll('[data-c1]').forEach(x=>x.onclick=()=>setF('c1',x.dataset.c1));
 document.querySelectorAll('[data-c2]').forEach(x=>x.onclick=()=>setF('c2',x.dataset.c2));
 document.querySelectorAll('[data-sym]').forEach(x=>x.onclick=()=>setF('sym',x.dataset.sym));
 $('#guidedFlag').onclick=openFlag;
 document.querySelectorAll('[data-flag-purpose]').forEach(b=>b.onclick=()=>{G.flagPurpose=b.dataset.flagPurpose;const y=window.scrollY;refresh();window.scrollTo(0,y);});
 if(!taskValid(2))$('#guideHelp').textContent='Pick what your flag stands for to continue.';
 bindFooter();}
function mapTask(){
 const slot=G.task-3,record=G.places[slot],saved=placeFor(slot),used=G.places.filter((p,i)=>i!==slot).map(p=>p.id);
 const usedNames=G.places.filter((p,i)=>i!==slot).map(p=>state.marks.find(m=>m.id===p.id)?.text);
 const priority=['Hospital','Public School','National Park','Public Library','Congress','Power Plant'];
 const freshPlaces=stickerGroups.flatMap(g=>g.items.map(([icon,name])=>({icon,name,category:g.id}))).filter(p=>!usedNames.includes(p.name)).sort((a,b)=>{const rank=p=>priority.includes(p.name)?priority.indexOf(p.name):100;return rank(a)-rank(b)||a.name.localeCompare(b.name);});
 const old=state.marks.filter(m=>!used.includes(m.id));
 const pool=savedPlaceMode?old:freshPlaces;
 const pages=Math.max(1,Math.ceil(pool.length/3));placePage=Math.max(0,Math.min(placePage,pages-1));
 const selected=chosenPlace?.saved?state.marks.find(m=>m.id===chosenPlace.saved):chosenPlace;
 const purposes=selected?CountrySociety.purposeOptions(selected):[];
 let content='';
 if(saved&&!chosenPlace&&replacingSlot!==slot){
  const purposeNames={health:'Care for people',learning:'Help people learn',rights:'Protect rights and give people a voice',travel:'Move people and supplies',work:'Provide jobs and services',nature:'Care for land and water',fun:'Bring people together'};
  content=`<p class="guided-success">✓ ${esc(saved.text)} is on your map.<br><b>Its purpose:</b> ${esc(record.purposeText||purposeNames[record.purpose]||record.purpose)}.</p><p>Drag it to a spot you like. Then save this place.</p><button id="changePlace" class="wide guide-back">Choose a different place</button>`;
 }else if(selected){
  content=`<p class="guided-success"><b>Your place:</b> ${esc(selected.name||selected.text)}</p><p class="guided-question">What will this place help people do?</p>`+pickButtons(purposes,mapPurpose,'data-place-purpose')+`<button id="buildGuidedPlace" class="primary wide step-next" ${purposes.some(p=>p[0]===mapPurpose)?'':'disabled'}>Build this place →</button><button id="changePlace" class="wide guide-back">← Choose a different place</button>`;
 }else{
  const shown=pool.slice(placePage*3,placePage*3+3);
  content=pickButtons(shown.map((p,i)=>[String(placePage*3+i),(p.icon||'📍')+' '+(p.name||p.text)]),null,savedPlaceMode?'data-existing-place':'data-new-place')+`<div class="place-pager">${placePage>0?'<button id="placePrevious">← Back</button>':''}${placePage<pages-1?'<button id="placeMore">Three other places →</button>':''}</div>${old.length?`<button id="toggleSavedPlaces" class="wide guide-back">${savedPlaceMode?'Choose a new place instead':'Use a place already on my map'}</button>`:''}`;
 }
 $('#tools').innerHTML=intro(`Place ${slot+1} of 5. Pick one place. Then choose one of its two purposes.`)+content+(saved&&!chosenPlace&&replacingSlot!==slot?footer(taskValid(G.task)):'<button id="guideBack" class="wide guide-back">← Back to the last task</button>');
 document.querySelectorAll('[data-new-place]').forEach(b=>b.onclick=()=>{chosenPlace=freshPlaces[+b.dataset.newPlace];mapPurpose='';refresh();});
 document.querySelectorAll('[data-existing-place]').forEach(b=>b.onclick=()=>{chosenPlace={saved:old[+b.dataset.existingPlace].id};mapPurpose='';refresh();});
 if($('#placeMore'))$('#placeMore').onclick=()=>{placePage++;refresh();};
 if($('#placePrevious'))$('#placePrevious').onclick=()=>{placePage--;refresh();};
 if($('#toggleSavedPlaces'))$('#toggleSavedPlaces').onclick=()=>{savedPlaceMode=!savedPlaceMode;placePage=0;refresh();};
 if($('#changePlace'))$('#changePlace').onclick=()=>{replacingSlot=slot;chosenPlace=null;mapPurpose='';placePage=0;refresh();};
 document.querySelectorAll('[data-place-purpose]').forEach(b=>b.onclick=()=>{mapPurpose=b.dataset.placePurpose;refresh();});
 if($('#buildGuidedPlace'))$('#buildGuidedPlace').onclick=()=>{if(!selected||!purposes.some(p=>p[0]===mapPurpose))return;const purpose=mapPurpose,purposeText=purposes.find(p=>p[0]===purpose)[1];let id=chosenPlace.saved;if(!id&&saved){checkpoint();Object.assign(saved,{kind:'place',icon:chosenPlace.icon,text:chosenPlace.name,category:chosenPlace.category});id=saved.id;}if(!id){const before=state.marks.length;buildPlace(chosenPlace.icon,chosenPlace.name,chosenPlace.category);if(state.marks.length===before)return;id=state.marks.at(-1).id;}G.places[slot]={id,purpose,purposeText};replacingSlot=-1;chosenPlace=null;mapPurpose='';refresh();};
 bindFooter();
}
function government(){
 const key=['polity','division','approach','ownership','oversight'][G.task-8],keys=Object.keys(checks[key]);
 const label=k=>key==='oversight'?({courts:'Court review',congress:'Spending review',time:'Emergency time limits'}[k]):key==='approach'?({consult:'Build agreement',firm:'Lead firmly',hard:'Rule by command'}[k]):E.words[k].name;
 const explanation={polity:'Who gets the final say? Choose a system to try.',division:'Who holds power: national leaders, states, or both?',approach:'How will your leader use power?',ownership:'Who owns major businesses?',oversight:'Choose a check on your leader’s power.'}[key];
 const selected=G.picks[key],options=keys.map(k=>[k,label(k),checks[key][k]]);
 const id=selected?'system.'+key+'.'+selected:null,bank=selected?K.systems[key][selected]:null;
 $('#tools').innerHTML=intro(`Government ${G.task-7} of 5. ${explanation}`)+(selected?`<p class="guided-success"><b>Your choice:</b> ${esc(label(selected))}</p><button id="changeSystem" class="wide guide-back">Change my system</button>`:pickButtons(options,null,'data-gov-select'))+(key==='ownership'?'<p class="guided-help">This labels your economy. No choice here earns more country points.</p>':'')+(selected?quizMarkup(id,bank):'')+footer(taskValid(G.task),selected?'Save my system →':'Choose a system first');
 if($('#changeSystem'))$('#changeSystem').onclick=()=>{delete G.picks[key];refresh();};
 document.querySelectorAll('[data-gov-select]').forEach(b=>b.onclick=()=>{state[key]=b.dataset.govSelect;G.picks[key]=state[key];refresh();});
 if(selected)bindQuiz(id,bank);
 bindFooter();
}
function scoreGuide(){return '<details class="score-guide"><summary>What do the country scores mean?</summary><p><b>Approval:</b> support for your government.<br><b>Budget room:</b> money left to spend.<br><b>Order:</b> safety and whether laws are followed.<br><b>Trust:</b> belief in your leaders.<br><b>Civil liberties:</b> freedoms such as speech and privacy.</p></details>';}
function crisisFrontier(){for(let i=0;i<E.governanceEvents.length;i++)if(!state.decisions.some(d=>d.event===i)||!passed('round.'+i))return i;return E.governanceEvents.length;}
function goRound(n){if(!Number.isInteger(n)||n<0||n>crisisFrontier()){toast('Finish the earlier scenario first.');return;}G.task=13;G.round=n;editingRound=null;pendingChoice=null;choiceGoal='';refresh();focusTask();}
function pastDecisions(){const rounds=CountrySociety.decisions(state,E.governanceEvents).filter(d=>d.event<=crisisFrontier());if(!rounds.length)return '';const pageCount=Math.ceil(rounds.length/3);historyPage=Math.max(0,Math.min(historyPage,pageCount-1));return `<details class="past-decisions"><summary>Review or change an earlier decision</summary>${rounds.slice(historyPage*3,historyPage*3+3).map(d=>`<button data-go-round="${d.event}"><b>Round ${d.event+1}:</b> ${esc(E.governanceEvents[d.event].title)}</button>`).join('')}<div class="round-page">${historyPage>0?'<button id="historyPrevious">← Earlier</button>':''}${historyPage<pageCount-1?'<button id="historyNext">Later →</button>':''}</div></details>`;}
function roundControls(n){const frontier=crisisFrontier();return `<div class="round-navigation">${n>0?`<button class="guide-back wide" data-go-round="${Math.min(n-1,E.governanceEvents.length-1)}">← Previous scenario</button>`:'<button id="backToGovernment" class="guide-back wide">← Government choices</button>'}${n<frontier?`<button class="guide-back wide" data-go-round="${frontier}">Back to where I was →</button>`:''}</div>`+pastDecisions();}
function bindRoundControls(){document.querySelectorAll('[data-go-round]').forEach(b=>b.onclick=()=>goRound(+b.dataset.goRound));if($('#backToGovernment'))$('#backToGovernment').onclick=()=>moveTask(12);if($('#historyPrevious'))$('#historyPrevious').onclick=()=>{historyPage--;refresh();$('.past-decisions').open=true;};if($('#historyNext'))$('#historyNext').onclick=()=>{historyPage++;refresh();$('.past-decisions').open=true;};}
function powerAlert(n,choice,compact=false){
 const check=CountrySociety.alignment(state,E.governanceEvents,n,choice);
 if(!check.warnings.length&&!check.authoritarian)return '';
 if(compact)return `<section class="power-alert" role="alert"><b>⚠ ${check.warnings.length?'This move clashes with your setup.':'This move shifts power toward the leader.'}</b><details><summary>Why?</summary><p>${esc(check.warnings[0]?.message||'People have less room to challenge the leader.')}</p></details></section>`;
 return `<section class="power-alert" role="alert"><div class="step-kicker">${check.warnings.length?'GOVERNMENT MISMATCH':'POWER SHIFT'}</div><h3>${check.warnings.length?'Does this match your setup?':'This move is more authoritarian.'}</h3>${check.warnings.slice(0,1).map(w=>`<p>${esc(w.message)}</p>`).join('')}${check.authoritarian?'<p><b>Authoritarian move: power shifts toward the leader.</b> People have less room to challenge decisions.</p>':''}<p class="guided-help">Keep the move and face the result, or change it.</p><button id="reviewGovernment" class="wide guide-back">Review my government setup</button></section>`;
}
function bindPowerAlert(){if($('#reviewGovernment'))$('#reviewGovernment').onclick=()=>moveTask(8);}
const readyAt={};
/* Read timer: scenario choices unlock after a few seconds so students read the issue first. */
const readSecs=text=>Math.max(5,Math.min(8,Math.round(String(text).split(/\s+/).length/4)));
function readGate(key,sec,sel,label){if(!readyAt[key])readyAt[key]=Date.now()+sec*1000;const left=()=>Math.ceil((readyAt[key]-Date.now())/1000);const els=[...document.querySelectorAll(sel)];if(!els.length)return;const note=document.createElement('p');note.className='guided-help read-gate';(els[0].closest('.guided-options')||els[0]).before(note);const tick=()=>{if(!document.body.contains(els[0])){note.remove();return}if(document.hidden){readyAt[key]+=500;setTimeout(tick,500);return}const n=left();if(n>0){els.forEach(e=>e.disabled=true);note.textContent=`${label} Opens in ${n}…`;setTimeout(tick,500)}else{els.forEach(e=>e.disabled=false);note.remove()}};tick();}
function crisisEvent(slot){
 let rec=G.crises[slot];
 if(!rec){rec=G.crises[slot]=CH.fire(state,E,CountrySociety,slot,G.knowledge.seed);}
 const v=CH.view(rec),b=rec.base||{},toll=[b.deaths?b.deaths+' dead':'',b.injuries?b.injuries+' hurt':''].filter(Boolean).join(' · ');
 const head=`<section class="breaking" role="alert"><div class="breaking-kicker">BREAKING · CRISIS ${slot+1} OF 4</div><h2 id="guideTitle" tabindex="-1">${esc(v.headline)}</h2>${toll?`<p class="breaking-toll">${esc(toll)}</p>`:''}<p>${esc(v.text)}</p><p class="breaking-cause">${esc(v.cause)}</p></section>`;
 if(rec.choice===null||rec.choice===undefined){
  $('#tools').innerHTML=head+`<p class="guided-question">How do you respond? No take-backs.</p>`+pickButtons(v.choices.map((c,i)=>[String(i),c.title,c.text]),null,'data-crisis-response')+`<p class="guided-help">Fictional event. It was shaped by your earlier choices, plus some luck.</p>`;
  readGate('crisis'+slot,readSecs(v.text+' '+v.cause+' '+v.choices.map(c=>c.title+' '+c.text).join(' ')),'[data-crisis-response]','Read the news first.');
  document.querySelectorAll('[data-crisis-response]').forEach(btn=>btn.onclick=()=>{if(btn.disabled||rec.choice!==null&&rec.choice!==undefined)return;CH.resolve(rec,+btn.dataset.crisisResponse);refresh();focusTask();});
  return;
 }
 const c=v.choices[rec.choice],h=c.harm||{},extra=[h.deaths?'+'+h.deaths+' dead':'',h.injuries?'+'+h.injuries+' hurt':'',h.resigned?h.resigned+' quits':''].filter(Boolean).join(' · ');
 const total=CountrySociety.consequences(state,E.governanceEvents,CountryWorld.through());
 $('#tools').innerHTML=head+`<section class="people-impact crisis-result"><h3>You chose: ${esc(c.title)}</h3>${extra?`<p class="harm-result"><b>${esc(extra)}</b></p>`:'<p class="harm-result calm-result"><b>No more lives lost.</b></p>'}<p class="impact-result">${esc(c.result)}</p><p class="rival-line"><b>${CH.RIVAL} (your rival):</b> “${esc(c.rival)}”</p><p class="concept-reveal">${esc(v.reveal)}</p><p class="guided-help">Lives lost so far: <b>${total.deaths}</b>.</p></section><button id="crisisNext" class="primary wide step-next">Next: scenario ${slot+2} of 5 →</button>`;
 readGate('crisisDone'+slot,5,'#crisisNext','Read what happened.');
 $('#crisisNext').onclick=()=>{if($('#crisisNext').disabled)return;rec.seen=true;refresh();focusTask();};
}
function crisis(){
 const n=G.round,total=E.governanceEvents.length;
 // A surprise crisis follows each of the first four scenarios.
 const due=CRISIS_SLOTS.find(k=>k<n&&!crisisDone(k));
 if(due!==undefined){G.round=due+1;crisisEvent(due);return;}
 if(n>=total){
  const end=CH.ending(state,E,CountrySociety),harm=CountrySociety.consequences(state,E.governanceEvents);
  $('#tools').innerHTML=intro('Your first year is over.')+`<section class="ending-card ending-${end.key}"><div class="step-kicker">YOUR ENDING</div><h3>${esc(end.title)}</h3><p>${esc(end.text)}</p><p class="ending-toll">Lives lost: <b>${harm.deaths}</b> · People hurt: <b>${harm.injuries}</b></p></section>`+learningReport()+footer(taskValid(13),'Next: make law 1 →')+roundControls(n);bindFooter();bindRoundControls();return;
 }
 const event=E.governanceEvents[n],decision=state.decisions.find(d=>d.event===n),picked=decision&&event.choices[decision.choice],revising=editingRound===n;
 if(picked&&!revising){
  const id='round.'+n,bank=K.rounds[n];
  const checked=G.seenResults[n]===true;
  $('#tools').innerHTML=intro(`Scenario ${n+1} of ${total}. ${checked?'Show what you know.':'See what changed.'}`)+(checked?`<details><summary>Your choice and its effect</summary><p>${esc(picked.title)}</p>${CountryWorld.impactMarkup(n)}</details>`:`<p class="policy-chosen"><b>Your move:</b> ${esc(picked.title)}</p>`+CountryWorld.uprisingMarkup(n)+CountryWorld.impactMarkup(n))+(!checked?powerAlert(n,decision.choice,true):'')+`<details class="decision-revision"><summary>Change my decision</summary><button id="reviseDecision" class="wide guide-back">Try another move ↩</button></details>`+(checked?quizMarkup(id,bank)+`<button id="nextRound" class="primary wide step-next" ${passed(id)?'':'disabled'}>${n===total-1?'Finish this year →':'Next scenario →'}</button>`:'<button id="checkResult" class="primary wide step-next">Now check what I know →</button>')+roundControls(n);
  readGate('result'+n,6,'#checkResult','Look at what happened first.');
  if($('#checkResult'))$('#checkResult').onclick=()=>{G.seenResults[n]=true;refresh();focusTask();};
  bindPowerAlert();bindQuiz(id,bank,()=>{G.readRounds[n]=true;});
  $('#reviseDecision').onclick=()=>{editingRound=n;pendingChoice=null;choiceGoal='';refresh();};
  if($('#nextRound'))$('#nextRound').onclick=()=>{if(!passed(id))return;G.round++;editingRound=null;pendingChoice=null;choiceGoal='';refresh();focusTask();};bindRoundControls();return;
 }
 $('#tools').innerHTML=intro(`${revising?'Change your choice':'Scenario '+(n+1)+' of '+total}. Choose your move.`)+(revising?'<div class="decision-edit"><p>Try a different path. Your society and scores will update.</p><button id="cancelDecisionEdit" class="wide">Keep my old decision</button></div>':'')+`<section class="decision-game"><div class="crisis-kicker">FICTIONAL SOCIETY · YOUR MOVE</div><h3>${esc(event.title)}</h3><p class="decision-prompt">${esc(event.prompt)}</p>${CountrySociety.consequences(state,E.governanceEvents,n-1).removed?'<p class="guided-help">Your leader lost office. You now advise the caretaker government.</p>':''}${event.source?`<details class="topic-fact"><summary>Real-world background</summary><p>${esc(event.fact)}</p><a href="${esc(event.source)}" target="_blank" rel="noopener">Source ↗</a></details>`:''}${pendingChoice===null?pickButtons(shuffled('round.'+n,2,event.choices.length).map(i=>[String(i),event.choices[i].title,event.choices[i].text]),null,'data-crisis-pick'):`<p class="guided-success"><b>Your move:</b> ${esc(event.choices[pendingChoice].title)}</p><button id="changeResponse" class="wide guide-back">← Choose a different move</button>`}</section>`+(pendingChoice!==null?powerAlert(n,pendingChoice):'')+(pendingChoice!==null?`<button id="commitDecision" class="primary wide step-next">${revising?'Save change':'See what happens'} →</button>`:'')+roundControls(n);
 bindPowerAlert();
 if($('#cancelDecisionEdit'))$('#cancelDecisionEdit').onclick=()=>{editingRound=null;pendingChoice=null;choiceGoal='';refresh();};
 if($('#changeResponse'))$('#changeResponse').onclick=()=>{pendingChoice=null;choiceGoal='';refresh();};
 readGate('pick'+n,readSecs(event.prompt+' '+event.choices.map(c=>c.title+' '+c.text).join(' ')),'[data-crisis-pick]','Read the issue first.');
 document.querySelectorAll('[data-crisis-pick]').forEach(b=>b.onclick=()=>{if(b.disabled)return;pendingChoice=+b.dataset.crisisPick;choiceGoal='policy';refresh();});
 if($('#commitDecision'))$('#commitDecision').onclick=()=>{if(pendingChoice===null||!choiceGoal||(!revising&&state.decisions.some(d=>d.event===n)))return;CountrySociety.changeDecision(state,E.governanceEvents,n,pendingChoice,choiceGoal);state.revealed={event:n,choice:pendingChoice};G.seenResults[n]=false;editingRound=null;pendingChoice=null;choiceGoal='';refresh();focusTask();};bindRoundControls();
}
const lawIdeas=[['Rights','People can criticize the government and hold peaceful protests.'],['Emergency powers','Emergency rules end after 30 days unless Congress votes to keep them.'],['Voting','Every eligible voter can vote. The public can check election results.'],['Health and safety','The government will keep hospitals and cooling centers ready for emergencies.'],['My own idea','']];
function law(){const slot=G.task-14,existing=state.rules[slot];if(lawTask!==G.task){lawTask=G.task;lawDraft=G.lawDrafts[slot]?.text??existing?.text??'';lawReason=G.lawDrafts[slot]?.reason??(existing?G.lawReasons[existing.id]||'':'');}const ready=()=>longEnough(lawDraft)&&longEnough(lawReason)&&!state.rules.some((r,i)=>i!==slot&&r.text.trim().toLowerCase()===lawDraft.trim().toLowerCase());$('#tools').innerHTML=intro(`Law ${slot+1} of 2. Pick an idea or write your own. Say why it matters.`)+pickButtons(lawIdeas.map(([k,t],i)=>[String(i),k,t]),null,'data-law-idea')+`<label for="guidedLaw">Your law</label><textarea id="guidedLaw" maxlength="120" placeholder="People can… / The government must…">${esc(lawDraft)}</textarea><label for="guidedLawReason">Why does this law matter?</label><textarea id="guidedLawReason" maxlength="160" placeholder="This law matters because…">${esc(lawReason)}</textarea><p class="guided-help">Use at least 3 words in each box. Make each law different.</p>`+footer(ready(),`Save law ${slot+1} and continue →`);document.querySelectorAll('[data-law-idea]').forEach(b=>b.onclick=()=>{lawDraft=lawIdeas[+b.dataset.lawIdea][1];G.lawDrafts[slot]={text:lawDraft,reason:lawReason};save();$('#guidedLaw').value=lawDraft;$('#guidedLaw').focus();updateNext(ready());});$('#guidedLaw').oninput=e=>{lawDraft=e.target.value;G.lawDrafts[slot]={text:lawDraft,reason:lawReason};save();updateNext(ready());};$('#guidedLawReason').oninput=e=>{lawReason=e.target.value;G.lawDrafts[slot]={text:lawDraft,reason:lawReason};save();updateNext(ready());};$('#guideNext').onclick=()=>{if(!ready()){toast('Write a different law and explain why it matters.');return;}if(existing)existing.text=lawDraft.trim();else E.addRule(state,lawDraft);G.lawReasons[state.rules[slot].id]=lawReason.trim();advance();};if($('#guideBack'))$('#guideBack').onclick=()=>moveTask(G.task-1);}
function yearEnding(){const end=CH.ending(state,E,CountrySociety);return end.title+'. '+end.text;}
const STANDARD='SS.9-12.Gov.1, SS.9-12.Gov.4';
function scoreCard(sc,end){return `<section class="final-score ending-${end.key}"><div class="fs-kicker">FINAL SCORE</div><div class="fs-row"><div class="fs-big">${sc.total}<small>/100</small></div><div class="fs-dead"><span>Lives lost</span><b>${sc.deaths}</b></div></div><div class="fs-rank">${esc(sc.rank)}</div><p class="fs-ending"><b>Ending: ${esc(end.title)}.</b> ${esc(end.text)}</p><p class="fs-parts">Country health +${sc.country} · First-try checks +${sc.checks} · Safety +${sc.safety} · Lives and injuries −${sc.lifeCost}${sc.otherCost?` · Removal and rebellion −${sc.otherCost}`:''}</p><p class="guided-help">Compare your score and lives lost with your class.</p></section>`;}
function turnInBox(){return G.turnedIn?`<section class="turnin-box"><p class="guided-success">✓ Turned in. Your teacher can see your score.<br><b>Name:</b> ${esc(G.turnedIn)}</p><button id="turninAgain" class="wide guide-back">Turn in again (after changes)</button></section>`:`<section class="turnin-box"><h3>Turn in to my teacher</h3><label for="turninName">First name + last initial (like Jordan M.)</label><input id="turninName" maxlength="40" autocomplete="off" placeholder="Jordan M."><button id="turninBtn" class="primary wide">Turn in to my teacher</button><p id="turninMsg" class="guided-help" role="status"></p></section>`;}
function turnInAnswers(sc,end){
 const stats=learningStats(),events=E.governanceEvents,harm=CountrySociety.consequences(state,events);
 const approachNames={consult:'Build agreement',firm:'Lead firmly',hard:'Rule by command'},checkNames={courts:'Court review',congress:'Spending review',time:'Emergency time limits'};
 const answers={'Standard':STANDARD,'First-try correct':stats.firstTry+' of '+stats.total,'Score':sc.total+' / 100','Rank':sc.rank,'Ending':end.title+': '+end.text,'Lives lost':sc.deaths+' (people hurt: '+sc.injuries+')',
  'Country':(state.name||'')+', led by '+(state.leader||''),
  'Government picks':'Who rules: '+E.words[state.polity].name+'; Power shared: '+E.words[state.division].name+'; Leadership: '+approachNames[state.approach]+'; Economy: '+E.words[state.ownership].name+'; Check on leader: '+(checkNames[state.oversight]||''),
  'Decisions':events.map((e,i)=>{const d=state.decisions.find(d=>d.event===i);return (i+1)+') '+e.title+': '+(d?e.choices[d.choice].title:'—');}).join(' | '),
  'Crises':G.crises.filter(Boolean).map(r=>{const v=CH.view(r);return v.headline+' → '+(v.choices[r.choice]?.title||'no response');}).join(' | ')};
 if(harm.resignations.length)answers['Officials who quit']=harm.resignations.join(', ');
 if(harm.rebellion.length)answers['States in rebellion']=harm.rebellion.join(', ');
 state.rules.slice(0,2).forEach((r,i)=>{answers['Law '+(i+1)]=r.text+' — Why: '+(G.lawReasons[r.id]||'');});
 return answers;
}
function bindTurnIn(sc,end){
 if($('#turninAgain'))$('#turninAgain').onclick=()=>{G.turnedIn='';refresh();};
 const btn=$('#turninBtn');if(!btn)return;
 btn.onclick=async()=>{
  const name=$('#turninName').value.trim(),msg=$('#turninMsg');
  if(!/\S+\s+\S/.test(name)){msg.textContent='Type your first name and last initial, like Jordan M.';return;}
  btn.disabled=true;msg.textContent='Sending…';
  try{
   const res=await classTurnIn("https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentName:name,assignmentId:"gov-my-country-day3",answers:turnInAnswers(sc,end)})});
   const data=await res.json().catch(()=>({}));
   if(res.ok){G.turnedIn=(window.classShortName?classShortName(name):name);refresh();toast('Turned in! Your teacher can see your score.');}
   else{msg.textContent=data.error||'Turn-in did not work. Try again or tell your teacher.';btn.disabled=false;}
  }catch(e){msg.textContent='Turn-in did not work. Check the internet and try again.';btn.disabled=false;}
 };
}
function review(){if(!finished()){moveTask(Math.max(0,firstUnfinished()));return;}const sc=CH.score(state,E,CountrySociety,learningStats()),end=CH.ending(state,E,CountrySociety);$('#tools').innerHTML=intro('Turn in your score first. Then print your report.')+scoreCard(sc,end)+turnInBox()+`<p class="guided-success">✓ Country, leader, flag, and 5 places<br>✓ 5 government choices checked<br>✓ 5 scenarios and 4 crises survived<br>✓ 2 laws explained</p><div class="guided-review">${state.rules.slice(0,2).map((r,i)=>`<article><h3>Law ${i+1}</h3><p>${esc(r.text)}</p><p><b>Why it matters:</b> ${esc(G.lawReasons[r.id])}</p></article>`).join('')}</div><button id="guidedReview" class="primary wide step-next">Open my finished country →</button><button id="decorateMore" class="wide">Keep decorating my map and flag ✎</button><button id="guideBack" class="wide guide-back">← Review law 2</button>`;bindTurnIn(sc,end);$('#guidedReview').onclick=()=>$('#finishBtn').click();$('#decorateMore').onclick=()=>{G.decorating=true;undoStack=[];refresh();};const history=document.createElement('div');history.innerHTML=pastDecisions();$('#tools').append(history);bindRoundControls();$('#guideBack').onclick=()=>moveTask(15);}
function instructions(){
 const returning=G.instructionsSeen===true;
 $('#tools').innerHTML=`<div class="directions-intro"><div class="step-kicker">DIRECTIONS · START HERE</div><h2 id="guideTitle" tabindex="-1">How to play</h2><p class="dir-goal"><b>Today’s goal:</b> Build a government, survive a year of crises, and explain your laws.</p><p class="dir-std">Standards: ${STANDARD} · About 30 minutes</p></div><ol class="country-directions"><li><b>Make it yours.</b> Name, leader, flag, and 5 places.</li><li><b>Set up your government.</b> Pass each quick check.</li><li><b>Survive 5 decisions.</b> Surprise crises hit in between.</li><li><b>Write 2 laws.</b> Say why each one matters.</li><li><b>Turn in your score.</b> That’s done. Then print your report.</li></ol><div class="directions-reminder"><p><b>People can die.</b> Lives lost cost big points. Compare scores with your class.</p><p>Wrong answers cost points, so read first.</p></div><button id="startCountry" class="primary wide">${returning?'Back to my country':G.furthest>0?'Continue my country':'Start my country'} →</button>`;
 $('#startCountry').onclick=()=>{G.instructionsSeen=true;viewingInstructions=false;refresh();focusTask();};
}
$('#instructionsBtn').onclick=()=>{viewingInstructions=true;refresh();focusTask();};
renderTools=function(){shell();if(G.instructionsSeen!==true||viewingInstructions){instructions();return;}if(G.decorating&&finished()){view='build';freeTools();$('#tools').querySelector('.step-intro').innerHTML='<h2>Keep decorating</h2><p>Your required work is complete. Add places, draw, or edit your flag.</p>';$('#tools').querySelector('[data-next-step]')?.remove();const b=document.createElement('button');b.className='primary wide step-next';b.textContent='Return to my finished country →';b.onclick=()=>{G.decorating=false;moveTask(LAST);};$('#tools').append(b);return;}if(G.task<2)names();else if(G.task===2)flagTask();else if(G.task<=7)mapTask();else if(G.task<=12)government();else if(G.task===13)crisis();else if(G.task<=15)law();else review();};
$('#flagDone').onclick=()=>{G.flagConfirmed=true;originalFlagDone();save();refresh();};
let profileDownloadUrl='';
$('#saveImage').onclick=null;
$('#finishBtn').onclick=()=>{
 if(!finished()){toast('Finish every required task before reviewing.');return;}
 G.task=LAST;G.decorating=false;refresh();originalFinish();
 if(profileDownloadUrl)URL.revokeObjectURL(profileDownloadUrl);
 const binary=atob(posterUrl.split(',')[1]),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 profileDownloadUrl=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));
 $('#saveImage').href=profileDownloadUrl;$('#saveImage').download='my-country-my-rules.png';
 CountryReport.mount({state,engine:E,society:CountrySociety,mapUrl:map.toDataURL('image/png'),flagUrl:flag.toDataURL('image/png'),ending:yearEnding(),model:state.modelExample===true,final:Object.assign(CH.score(state,E,CountrySociety,learningStats()),{crises:G.crises.filter(Boolean).map(r=>{const v=CH.view(r);return v.headline+' → '+(v.choices[r.choice]?.title||'');})})});
 $('#showDialog').scrollTop=0;
};
// Include the reasons and the decision log in the student's downloaded work.
makePoster=function(){
 drawFlag();drawMap();const c=document.createElement('canvas'),p=c.getContext('2d');c.width=1200;
 const rows=[];const line=(text,bold=false)=>{p.font=(bold?'bold ':'')+'23px Arial';for(const textLine of wrapped(p,text,1080))rows.push({text:textLine,bold});rows.push({text:'',bold:false});};
 const purposeNames={health:'Care for people',learning:'Help people learn',rights:'Protect rights or make decisions',travel:'Move people or supplies',work:'Provide jobs, food, or power',nature:'Protect land or water',fun:'Make life more fun'};
 const goalNames={help:'Help people now',money:'Protect the budget',rights:'Protect rights',speed:'Act fast',power:'Gain more control',chaos:'Try a wild idea and face the result'};
 line('THE MEANING OF MY FLAG',true);line(G.flagPurpose==='own'?'My own meaning':G.flagPurpose);
 line('FIVE PLACES WITH A PURPOSE',true);G.places.forEach((record,i)=>{const place=placeFor(i);if(place)line(place.text+': '+(record.purposeText||purposeNames[record.purpose]||record.purpose));});
 line('CHECK ON MY LEADER: '+({courts:'Court review',congress:'Spending review',time:'Emergency time limits'}[state.oversight]),true);
 line('KNOWLEDGE CHECK RECORD',true);const stats=learningStats();line(stats.passed+' of '+stats.total+' checks passed. '+stats.firstTry+' correct on the first try. '+'Extra attempts: '+stats.retries+'. Checks with a clue: '+stats.clues+'.');activeCheckIds().forEach(id=>{const record=G.knowledge.log[id];if(record)line(checkLabel(id)+': '+record.attempts.length+' attempt(s); first try '+(record.attempts[0]?.correct?'correct':'needed another example')+(record.attempts.some(a=>a.helpUsed)?'; clue used':''));});line('MY TWO LAWS',true);state.rules.slice(0,2).forEach((r,i)=>{line((i+1)+'. '+r.text,true);line('Why it matters: '+G.lawReasons[r.id]);});
 const harm=CountrySociety.consequences(state,E.governanceEvents);line('LIVES LOST: '+harm.deaths+' · PEOPLE HURT: '+harm.injuries,true);if(harm.resignations.length)line('Officials who quit: '+harm.resignations.join(', '));if(harm.rebellion.length)line('States that rose against the government: '+harm.rebellion.join(', '));
 line('MY FIRST YEAR: '+yearEnding(),true);
 E.governanceEvents.forEach((event,i)=>{const decision=state.decisions.find(d=>d.event===i);if(!decision)return;const choice=event.choices[decision.choice];line('ROUND '+(i+1)+': '+event.title,true);line('My choice: '+choice.title);if(decision.goal&&decision.goal!=='policy')line('My goal: '+(goalNames[decision.goal]||decision.goal));line('What happened: '+choice.result);line('Knowledge check: '+(passed('round.'+i)?'passed':'not passed')); });
 c.height=1140+rows.length*32;p.fillStyle='#fff9ed';p.fillRect(0,0,c.width,c.height);p.strokeStyle='#302342';p.lineWidth=8;p.strokeRect(6,6,1188,c.height-12);
 p.drawImage(flag,55,45,200,120);p.fillStyle='#302342';p.font='bold 36px Arial';wrapped(p,state.name,820).slice(0,2).forEach((t,i)=>p.fillText(t,290,80+i*42));p.font='21px Arial';p.fillText('LEADER: '+state.leader,290,170);
 p.font='bold 23px Arial';p.fillText(E.words[state.polity].name+' · '+E.words[state.division].name,55,225);p.font='20px Arial';p.fillText('Approach: '+({consult:'Build agreement',firm:'Lead firmly',hard:'Rule by command'}[state.approach]),55,262);p.fillText('Ownership: '+(E.words[state.ownership].name),55,294);
 const scores=indicators();p.font='18px Arial';p.fillText('Approval '+scores.approval+' · Budget '+scores.budget+' · Order '+scores.order+' · Trust '+scores.trust+' · Civil liberties '+scores.liberty,55,328);p.drawImage(map,55,350,1090,700);
 rows.forEach((r,i)=>{p.fillStyle=r.bold?'#302342':'#46554f';p.font=(r.bold?'bold ':'')+'23px Arial';p.fillText(r.text,55,1100+i*32);});p.font='15px Arial';p.fillText('The American Experiment · Fictional country · All required tasks completed',55,c.height-25);return c.toDataURL('image/png');
};
map.addEventListener('pointerdown',e=>{if(mode!=='erase')return;const [x,y]=point(map,e),m=hit(x,y);if(m&&G.places.some(p=>p.id===m.id)){e.stopImmediatePropagation();e.preventDefault();toast('Keep this required place. You can move it or add more.');}},true);
// Restore the exact task after refresh. Existing creative work stays available.
if(G.furthest>0){const missing=firstUnfinished();if(missing>=0&&missing<G.task){G.task=missing;G.furthest=missing;}}
$('#words').innerHTML=Object.values(E.words).map(w=>`<details class="vocab-term"><summary>${esc(w.name)}</summary><p>${esc(w.text)}</p></details>`).join('')+'<p class="note">Economic terms compare ownership. They do not tell us everything about who rules.</p><p class="note">Term sources: <a href="https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/capitalism" target="_blank" rel="noopener">IMF</a> · <a href="https://www.bu.edu/eci/2024/08/23/comparative-economic-systems/" target="_blank" rel="noopener">Boston University</a></p>';
refresh();
document.body.classList.remove('guided-loading');$('#guideLoading')?.remove();
})();
