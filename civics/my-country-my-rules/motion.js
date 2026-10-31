/* Interface motion: task-to-task transitions, reveals, meters that slide to new values,
   the BREAKING crisis entrance, the lives-lost ticker, and the final score count-up.
   Nothing here changes game data. Everything falls back to instant for reduced motion. */
(function(){
'use strict';
const mq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const calm=()=>mq.matches;
const ease=t=>1-Math.pow(1-t,3);
const G=()=>state.guide||{};
const tools=document.getElementById('tools'),meters=document.getElementById('governanceMeters'),stage=document.getElementById('stageStatus');
const strip=()=>document.getElementById('chaosStrip');

// Briefly add a class, then take it away so the next change can play it again.
function flash(el,cls,ms){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);clearTimeout(el['_t'+cls]);el['_t'+cls]=setTimeout(()=>el.classList.remove(cls),ms);}

// Count a number up on screen. The real text stays final for screen readers;
// a hidden-from-readers copy does the counting on top of it.
function countUp(el,from,to,ms,delay=0){
 if(!el||calm()||from===to)return;
 el.querySelectorAll(':scope>.mo-ghost').forEach(g=>g.remove());
 const ghost=document.createElement('mo-num');ghost.className='mo-ghost';ghost.setAttribute('aria-hidden','true');
 ghost.textContent=String(from);
 const ink=getComputedStyle(el).color;el.style.setProperty('--mo-ink',ink);el.classList.add('mo-counting');el.append(ghost);
 const t0=performance.now()+delay;
 const step=n=>{if(!ghost.isConnected)return;const p=Math.max(0,Math.min(1,(n-t0)/ms));ghost.firstChild.nodeValue=String(Math.round(from+(to-from)*ease(p)));if(p<1)requestAnimationFrame(step);else{ghost.remove();el.classList.remove('mo-counting');}};
 requestAnimationFrame(step);
}
const num=el=>{const n=parseInt(el&&el.firstChild&&el.firstChild.nodeValue,10);return Number.isFinite(n)?n:null;};

// Bars slide from their old width to the new one.
const lastWidth=new Map();
function slideBars(root,selector,keyOf){root.querySelectorAll(selector).forEach(bar=>{const key=keyOf(bar),to=bar.style.width,from=lastWidth.get(key);lastWidth.set(key,to);if(from===undefined||from===to||calm())return;bar.style.transition='none';bar.style.width=from;void bar.offsetWidth;bar.style.transition='';bar.style.width=to;});}

// ---- society meters ----
const lastScore=new Map();
function onMeters(){
 slideBars(meters,'.meter-track i',bar=>bar.className);
 meters.querySelectorAll('.meter').forEach(m=>{const key=m.dataset.societyScore||m.querySelector('.meter-track i')?.className;const b=m.querySelector('b'),n=num(b);if(n===null)return;const was=lastScore.get(key);lastScore.set(key,n);if(was===undefined||was===n)return;countUp(b,was,n,700);flash(m,n>was?'mo-up':'mo-down',1500);});
}

// ---- lives-lost strip ----
let shownDead=null,shownApproval=null;
function onStrip(){
 const s=strip();if(!s||s.hidden)return;
 slideBars(s,'.cs-bar i',()=>'strip-approval');
 const dead=s.querySelector('.cs-dead b'),d=num(dead);
 if(d!==null){if(shownDead!==null&&d>shownDead){countUp(dead,shownDead,d,1100,180);flash(s,'mo-hit',1900);flash(document.body,'mo-vignette',1900);}shownDead=d;}
 const ap=s.querySelector('.cs-item:not(.cs-dead) b'),a=num(ap);
 if(a!==null){if(shownApproval!==null&&a!==shownApproval)countUp(ap,shownApproval,a,700);shownApproval=a;}
}

// ---- task card transitions ----
let lastKey=null,lastReveals=new Set();
const REVEAL='.crisis-result,.people-impact,.uprising-alert,.quiz-right,.quiz-retry,.guided-success,.power-alert,.decision-edit,.final-score,.ending-card,.guided-choice.selected,.turnin-box .turnin-done,.place-slot.filled';
function screenKey(){const title=tools.querySelector('#guideTitle')?.textContent||'',lead=(tools.querySelector('.step-intro p,.directions-intro p')?.textContent||'').slice(0,48);return [G().task,G().round,!!tools.querySelector('.breaking'),title,lead].join('|');}
// Text without our counting copies, and class names without our own mo-* classes.
function textOf(el){let out='';const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('.mo-ghost')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});while(w.nextNode())out+=w.currentNode.nodeValue;return out.trim();}
function sig(el){return [...el.classList].filter(c=>!c.startsWith('mo-')).join(' ')+'|'+(el.dataset.crisisPick??el.dataset.crisisResponse??el.dataset.quizAnswer??'')+'|'+textOf(el).slice(0,40);}
function onTools(){
 const key=screenKey(),reveals=[...tools.querySelectorAll(REVEAL)];
 const sigs=new Set(reveals.map(sig));
 if(key!==lastKey){
  const first=lastKey===null;lastKey=key;
  if(!first&&!calm()){
   const breaking=tools.querySelector('.breaking');
   if(breaking){breaking.classList.add('mo-breaking-in');tools.classList.add('mo-after-breaking');setTimeout(()=>{breaking.classList.remove('mo-breaking-in');tools.classList.remove('mo-after-breaking');},1700);}
   else flash(tools,'mo-enter',520);
  }else if(!first)flash(tools,'mo-fade',320);
 }else if(!calm()){
  reveals.forEach(el=>{if(!lastReveals.has(sig(el)))el.classList.add(el.matches('.guided-choice')?'mo-picked':'mo-reveal');});
 }
 // The final score counts up the first time the card appears.
 const score=tools.querySelector('.final-score');
 if(score&&!lastReveals.has(sig(score))&&!calm()){
  const big=score.querySelector('.fs-big'),total=num(big),dead=score.querySelector('.fs-dead b'),d=num(dead);
  score.classList.add('mo-score-in');
  if(total!==null)countUp(big,0,total,1500,250);
  if(d)countUp(dead,0,d,1100,450);
 }
 lastReveals=sigs;
}

// ---- progress bar in the task header ----
function onStage(){slideBars(stage,'.guided-progress i',()=>'progress');}

// Watch only for re-renders (child list changes). Our own counting edits text values,
// which this observer ignores, so it never loops.
const watch=[[tools,onTools],[meters,onMeters],[stage,onStage]];
const ours=n=>n.nodeType===1&&n.classList.contains('mo-ghost');
const mo=new MutationObserver(records=>{records=records.filter(r=>![...r.addedNodes,...r.removedNodes].every(ours));if(!records.length)return;const hit=new Set(records.map(r=>r.target));
 for(const [el,fn] of watch)if([...hit].some(t=>t&&(t===el||el.contains(t))))safe(fn);
 const s=strip();if(s&&[...hit].some(t=>t&&(t===s||s.contains(t))))safe(onStrip);});
function safe(fn){try{fn();}catch(e){/* motion is decoration; never break the game */}}
function observe(){for(const [el] of watch)if(el)mo.observe(el,{childList:true,subtree:true});const s=strip();if(s)mo.observe(s,{childList:true,subtree:true});}
// Prime with what is already on screen so nothing animates on page load.
safe(onMeters);safe(onStrip);safe(onStage);lastKey=screenKey();lastReveals=new Set([...tools.querySelectorAll(REVEAL)].map(sig));
observe();

// Printed and saved copies use a still map (no clouds, no half-dropped places).
let stillDepth=0;const holdStill=()=>{if(stillDepth++===0)CountryWorld.setStill(true);},letGo=()=>{if(--stillDepth===0)CountryWorld.setStill(false);};
if(window.CountryWorld?.setStill){
 if(typeof makePoster==='function'){const mp=makePoster;makePoster=function(){holdStill();try{return mp.apply(this,arguments);}finally{letGo();}};}
 const finish=document.getElementById('finishBtn');
 // Hold the still map until the finish handler has copied the canvas into the report.
 if(finish&&finish.onclick){const f=finish.onclick;finish.onclick=function(e){holdStill();try{return f.call(this,e);}finally{setTimeout(letGo,0);}};}
}
})();
