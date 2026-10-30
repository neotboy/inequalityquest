'use strict';
const groups=JSON.parse(document.getElementById('reading-data').textContent);
const $=id=>document.getElementById(id);
const total=groups.reduce((n,g)=>n+g.questions.length,0);
let misses={},groupIndex=0,questionIndex=0,completed=0,correct=false,ready=false,timer=null,focusImage=null,previousOrder='';
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function openImage(src,alt){$('large').src=src;$('large').alt=alt;$('zoom').showModal()}
function renderChoices(){const q=groups[groupIndex].questions[questionIndex];const options=shuffle(q.choices.map((text,i)=>({text,correct:i===q.answer})));if(options.map(o=>o.text).join('|')===previousOrder)options.push(options.shift());previousOrder=options.map(o=>o.text).join('|');$('choices').replaceChildren();options.forEach((option,i)=>{const button=document.createElement('button');button.type='button';button.className='choice';button.disabled=!ready;const letter=document.createElement('span');letter.className='letter';letter.textContent=String.fromCharCode(65+i);const text=document.createElement('span');text.textContent=option.text;button.append(letter,text);button.onclick=()=>choose(option.correct);$('choices').append(button)})}
function unlockAfter(seconds,retry){clearInterval(timer);ready=false;$('choices').querySelectorAll('button').forEach(b=>b.disabled=true);$('lock').hidden=false;let left=seconds;function label(){const prefix=retry?'Look again.':focusImage?'Look closely.':'Read first.';$('lock').textContent=prefix+' Choices open in '+left+' seconds.'}label();timer=setInterval(()=>{if(document.hidden){$('lock').textContent='Reading time pauses while this tab is hidden.';return}if(focusImage&&(!focusImage.complete||!focusImage.naturalWidth)){$('lock').textContent='Waiting for the picture to load.';return}left--;label();if(left<=0){clearInterval(timer);ready=true;$('lock').hidden=true;$('choices').querySelectorAll('button').forEach(b=>b.disabled=false)}},1000)}
function choose(isCorrect){if(!ready||correct)return;if(!isCorrect){const k=groupIndex+'-'+questionIndex;misses[k]=(misses[k]||0)+1}if(isCorrect){correct=true;completed++;$('feedback').textContent='That fits. '+groups[groupIndex].questions[questionIndex].explain;$('feedback').className='good';$('next').disabled=false;$('bar').value=completed;$('questionProgress').textContent=completed+' of '+total+' questions done';$('choices').querySelectorAll('button').forEach(b=>b.disabled=true)}else{$('feedback').textContent='Not quite. '+(focusImage?'Look at the marked picture and read its words again.':'Read the text again.');$('feedback').className='retry';ready=false;renderChoices();unlockAfter(8,true)}}
function focusEvidence(q){focusImage=null;const buttons=[...$('scans').children];buttons.forEach(b=>b.classList.remove('focus-comic'));$('evidenceHint').hidden=!q.comicImage;if(!q.comicImage)return;const index=groups[groupIndex].images.findIndex(i=>i.src===q.comicImage);const button=buttons[index];if(!button)return;focusImage=button.querySelector('img');button.classList.add('focus-comic');$('evidenceHint').textContent='Use the marked picture.';const box=$('scans');box.scrollTop=button.offsetTop-box.offsetTop;}
function showQuestion(first){clearInterval(timer);correct=false;ready=false;const g=groups[groupIndex],q=g.questions[questionIndex];$('within').textContent='Question '+(questionIndex+1)+' of '+g.questions.length+' for this reading';$('question').textContent=q.question;$('feedback').textContent='';$('feedback').className='';$('next').disabled=true;const last=questionIndex===g.questions.length-1;$('next').textContent=last?(groupIndex===groups.length-1?'Finish reading':'Next reading'):'Next question · same reading';$('questionProgress').textContent=completed+' of '+total+' questions done';focusEvidence(q);renderChoices();unlockAfter(first?20:6,false)}
function showGroup(){const g=groups[groupIndex];$('progressText').textContent='Reading '+(groupIndex+1)+' of '+groups.length;$('readingTitle').textContent=g.title;$('helpText').textContent=g.summary;$('helpText').hidden=false;$('toggleHelp').setAttribute('aria-expanded','true');$('toggleHelp').textContent='Hide reading help';$('scans').replaceChildren();g.images.forEach((image,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Enlarge picture '+(i+1));if(image.kind==='comic')button.classList.add('comic');const img=document.createElement('img');img.src=image.src;img.alt=image.alt;button.append(img);button.onclick=()=>openImage(image.src,image.alt);$('scans').append(button)});$('scans').scrollTop=0;showQuestion(true)}
function start(){clearInterval(timer);misses={};groupIndex=0;questionIndex=0;completed=0;previousOrder='';$('bar').value=0;$('intro').hidden=true;$('finish').hidden=true;$('work').hidden=false;showGroup()}
$('start').onclick=start;$('restart').onclick=start;
$('next').onclick=()=>{if(!correct)return;questionIndex++;if(questionIndex<groups[groupIndex].questions.length){showQuestion(false);return}groupIndex++;questionIndex=0;if(groupIndex===groups.length){clearInterval(timer);$('work').hidden=true;$('finish').hidden=false;$('reflection').focus();return}showGroup()};
$('toggleHelp').onclick=()=>{const hide=!$('helpText').hidden;$('helpText').hidden=hide;$('toggleHelp').setAttribute('aria-expanded',String(!hide));$('toggleHelp').textContent=hide?'Reading help':'Hide reading help'};
$('close').onclick=()=>$('zoom').close();$('zoom').addEventListener('click',e=>{if(e.target===$('zoom'))$('zoom').close()});$('print').onclick=()=>window.print();

/* ---- Turn in to the teacher dashboard (one turn-in per reading day) ---- */
(function(){
 const fin=$('finish');if(!fin)return;
 const folder=(location.pathname.split('/').filter(Boolean).slice(-1)[0]||'reading').replace(/\.html$/,'');
 const id='sociology-'+folder;
 const t=document.title.replace(/\s*\|\s*/,' · ').replace(/^Day (\d+) Sociology/,'Day $1');
 const wrap=document.createElement('div');wrap.className='turnin-box';wrap.style.cssText='margin:16px 0;padding:14px;border:2px solid #cfd6e2;border-radius:12px;background:#f7f9fc';
 wrap.innerHTML='<label for="turnName" style="display:block;font-weight:800;margin-bottom:6px">Your name (first name + last initial, like Jordan M.)</label><input id="turnName" type="text" autocomplete="off" style="font:inherit;font-size:1.05rem;padding:10px 12px;border:2px solid #cfd6e2;border-radius:10px;width:100%;max-width:340px"><div style="margin-top:10px"><button id="turnBtn" class="primary" type="button">Turn in to my teacher</button></div><p id="turnMsg" aria-live="polite" style="font-weight:800;margin:8px 0 0"></p>';
 const printBtn=$('print');fin.insertBefore(wrap,printBtn);
 $('turnBtn').onclick=async()=>{
  const msg=$('turnMsg'),btn=$('turnBtn');
  const raw=$('turnName').value.trim(),name=window.classShortName?window.classShortName(raw):raw;
  if(!/^\S+ [A-Z]\.$/.test(name)){msg.style.color='#b42318';msg.textContent='Type your first name and last initial, like Jordan M.';$('turnName').focus();return}
  const ref=($('reflection')&&$('reflection').value||'').trim();
  if(ref.split(/\s+/).filter(Boolean).length<5){msg.style.color='#b42318';msg.textContent='Write your final thought (at least one full sentence) before turning in.';$('reflection').focus();return}
  const answers={'Reading':t};
  groups.forEach((g,gi)=>g.questions.forEach((q,qi)=>{const m=misses[gi+'-'+qi]||0;answers['Q'+(Object.keys(answers).length)+': '+q.question]=m?('Correct after '+m+' wrong '+(m===1?'try':'tries')):'Correct on first try'}));
  answers['Final thought']=ref;
  btn.disabled=true;msg.style.color='#475467';msg.textContent='Turning in...';
  try{
   if(!window.classTurnIn)throw new Error('The turn-in system did not load. Refresh the page and try again.');
   const r=await window.classTurnIn('https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:name,assignmentId:id,assignmentTitle:t,answers})});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Your work did not save. Try again.');
   msg.style.color='#067647';msg.textContent='Turned in! Your teacher can see your work.';btn.textContent='Turned in';
  }catch(e){btn.disabled=false;msg.style.color='#b42318';msg.textContent=(e&&e.message)||'Could not turn in. Try again.'}
 };
})();
