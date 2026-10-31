/* A fictional society model. Economic labels do not change the scores. */
(function(root){
'use strict';
const E=()=>root.CountryCreator||(typeof require==='function'?require('./engine.js'):null);
const KEYS=['approval','budget','order','trust','liberty'];
const clamp=(v,lo=3,hi=97)=>Math.max(lo,Math.min(hi,Math.round(v)));
const polityMods={democracy:{approval:12,trust:18,liberty:22,order:-6,budget:-4},republic:{approval:10,trust:16,liberty:20,order:-2,budget:-4},oligarchy:{approval:-6,trust:-12,liberty:-8,order:12,budget:4},autocracy:{approval:-6,trust:-10,liberty:-18,order:18,budget:2},totalitarian:{approval:-12,trust:-16,liberty:-30,order:24,budget:2}};
const divisionMods={federal:{trust:3,budget:-2},unitary:{order:3,trust:-1},confederate:{liberty:3,order:-4,budget:-4}};
const checkMods={courts:{liberty:4,trust:3,budget:-2},congress:{budget:4,trust:2,approval:-2},time:{liberty:3,trust:2,order:-2},none:{order:4,liberty:-6,trust:-5}};
function add(m,fx){for(const k in fx||{})if(k in m)m[k]=clamp(m[k]+fx[k]);}
function chosenPlaces(s){const ids=(s.guide&&s.guide.places)||[];return ids.map(p=>E().places.find(x=>x.id===p.id)).filter(Boolean);}
function base(s){
 const m={approval:50,budget:58,order:50,trust:50,liberty:50};
 add(m,polityMods[s.polity]);add(m,divisionMods[s.division]);add(m,checkMods[s.oversight]);
 for(const p of chosenPlaces(s))add(m,p.fx);
 return m;
}
const pick=(v,open)=>v&&typeof v==='object'?(open?v.open:v.closed):v;
function pressureOf(m){return [[.45,.45,.1],[.45,.2,.35],[.65,.25,.1]].map(w=>Math.round((100-m.trust)*w[0]+(100-m.liberty)*w[1]+(100-m.budget)*w[2]));}
function statesFrom(s,m,abuses,moves){
 return ['Rights','Services','Voice'].map((priority,i)=>{
  const pressure=pressureOf(m)[i],rebellion=abuses>=3&&m.trust<30&&pressure>=[74,80,76][i];
  return {index:i,name:s.regions[i],priority,pressure,phase:rebellion?'insurrection':pressure>=55&&moves?'protests':'calm',reason:i===0?'People say the leader is taking their rights.':i===1?'People say their needs are being ignored.':'People say the leader will not hear them.'};
 });
}
function defOf(item){const C=E();return item.kind==='surprise'?C.surprises.find(x=>x.id===item.id):C.governanceEvents[item.event];}
function context(s,m,rival,abuses,has){
 const states=statesFrom(s,m,abuses,1),hot=states.slice().sort((a,b)=>b.pressure-a.pressure)[0];
 return {m:{...m},rival,abuses,has,open:E().isOpen(s.polity),hotState:hot.name,states};
}
/* Replay the whole year from the setup and the timeline. Everything on screen comes from this. */
function run(s,upto=Infinity){
 const C=E(),open=C.isOpen(s.polity),m=base(s),has={};
 for(const p of chosenPlaces(s))has[p.id]=true;
 let rival=clamp(C.rival.start+chosenPlaces(s).reduce((n,p)=>n+(p.rival||0),0),0,100);
 const harm={deaths:0,injuries:0,resigned:[],strike:false,rebels:[]};let abuses=0,takeover=null,overthrown=false,outAt=-1;const steps=[];
 (s.timeline||[]).slice(0,upto).forEach((item,index)=>{
  const def=defOf(item),ch=def&&def.choices[item.choice];if(!ch)return;
  const before={...m},rivalBefore=rival;let result=ch.result,rq=pick(ch.rq,open),ok=true;
  if(ch.test){ok=!!ch.test(context(s,m,rival,abuses,has));if(!ok){result=ch.resultFail;rq=ch.rqFail;}}
  if(item.kind==='decision'&&ch.power&&ch.power.cancelElection)result=open?ch.resultOpen:ch.resultClosed;
  add(m,ch.fx);rival=clamp(rival+(pick(ch.rival,open)||0),0,100);
  const p=ch.power||{};if(p.rights||p.bypass||p.cancelElection)abuses++;
  const h=ch.harm||{};harm.deaths+=h.deaths||0;harm.injuries+=h.injuries||0;if(h.resigned)harm.resigned.push(h.resigned);if(h.strike)harm.strike=true;
  const wasOut=!!(takeover||overthrown);
  if(!ok&&!wasOut){takeover='coup';rival=Math.max(rival,85);}
  if(item.kind==='decision'&&p.cancelElection&&open&&!wasOut)takeover='impeached';
  /* Rival power drifts with public mood. */
  rival=clamp(rival+Math.round((50-m.approval)/8)+(m.trust<35?2:0),0,100);
  let election='';
  if(item.kind==='decision'&&p.election&&!takeover&&!overthrown){if(rival>=60){takeover='election';election='lost';result+=' Vera Kane wins the vote. You hand over power peacefully.';}else{election='won';result+=' You win the vote.';}}
  const states=statesFrom(s,m,abuses,index+1),newRebels=[];
  for(const r of states)if(r.phase==='insurrection'&&!harm.rebels.includes(r.name)){harm.rebels.push(r.name);newRebels.push(r.name);harm.deaths+=1;harm.injuries+=4;}
  if(states.every(r=>r.phase==='insurrection')&&!takeover)overthrown=true;
  const removedNow=!wasOut&&!!(takeover||overthrown);if(removedNow)outAt=index;
  steps.push({item,index,def,choice:ch,before,after:{...m},rivalBefore,rivalAfter:rival,result,rq,ok,election,newRebels,removedNow,out:!!(takeover||overthrown),warnings:alignment(s,item,item.choice)});
 });
 return {m,rival,harm,abuses,takeover,overthrown,outAt,steps,has,open,states:statesFrom(s,m,abuses,steps.length)};
}
function scores(s){return run(s).m;}
function unrest(s){return run(s).states;}
function consequences(s){const r=run(s);return {deaths:r.harm.deaths,injuries:r.harm.injuries,resignations:r.harm.resigned,strike:r.harm.strike,removed:!!r.takeover||r.overthrown,rebellion:r.harm.rebels};}
/* Pick the next surprise. It is caused by the meters and choices so far. */
function nextSurprise(s,decisionIndex){
 const C=E(),r=run(s),out=!!(r.takeover||r.overthrown);
 const used=(s.timeline||[]).filter(i=>i.kind==='surprise').map(i=>i.id).concat(out?['coup','rebellion']:[]);
 if((s.timeline||[]).filter(i=>i.kind==='surprise').length>=3||decisionIndex>3)return null;
 const ctx=context(s,r.m,r.rival,r.abuses,r.has);
 for(const id of C.surprisePriority){if(used.includes(id))continue;const sp=C.surprises.find(x=>x.id===id);if(sp.when(ctx))return {id,why:sp.why(ctx),prompt:sp.prompt(ctx)};}
 const forced=(decisionIndex===1&&used.length===0)||(decisionIndex===3&&used.length<2);
 if(forced){for(const id of ['scandal','protest','strike']){if(used.includes(id))continue;const sp=C.surprises.find(x=>x.id===id);const why=id==='scandal'?sp.whyForced(ctx):id==='protest'?'Your last choice made some groups angry.':'Prices are rising faster than pay.';return {id,why,prompt:sp.prompt(ctx)};}}
 return null;
}
function alignment(s,item,choice){
 const C=E(),def=defOf(item),p=(def&&def.choices[choice]&&def.choices[choice].power)||{},w=[],sys=C.words[s.polity].name,open=C.isOpen(s.polity);
 if(p.cancelElection&&open)w.push('You chose a '+sys.toLowerCase()+'. Canceling the vote takes power away from voters.');
 else if(p.rights&&s.polity==='republic')w.push('Your constitutional republic promises rights and legal limits. This move breaks them.');
 else if(p.rights&&s.polity==='democracy')w.push('In a direct democracy, the people’s voice is the whole point. This move silences them.');
 if(p.bypass&&open&&!p.cancelElection&&!p.rights)w.push('You chose a '+sys.toLowerCase()+'. This move skips the people and officials who share power.');
 if(p.election&&!open)w.push('You chose '+(s.polity==='totalitarian'?'a ':'an ')+sys.toLowerCase()+'. A fair vote could let people replace you.');
 if(p.local&&p.bypass&&s.division==='federal')w.push('In a federal system, states and towns keep powers of their own. Overriding them breaks that split.');
 if(p.local&&p.bypass&&s.division==='confederate')w.push('In a confederation, states keep most power. Overriding them breaks your own rules.');
 if(p.national&&s.division==='confederate')w.push('In a confederation, the center only does jobs the states give it. A national school rule goes beyond that.');
 if(p.local&&!p.bypass&&s.polity==='totalitarian')w.push('A totalitarian regime controls schools and ideas. Letting states choose loosens that control.');
 if(p.seize&&s.ownership==='capitalism')w.push('You chose Capitalism (private ownership). Taking over private factories breaks with private ownership.');
 if(p.market&&(s.ownership==='socialism'||s.ownership==='communism'))w.push('You chose '+C.words[s.ownership].name+'. In your system the public or the state owns major industries, so there are no private owners to bargain.');
 if((p.bypass||p.cancelElection)&&s.oversight==='congress')w.push('You gave lawmakers control of the money. Expect them to fight this move.');
 if(p.rights&&s.oversight==='courts')w.push('You gave courts the power to cancel orders. Expect a judge to block this.');
 return w;
}
function residents(m){return [
 {name:'Maya · parent',icon:'👩🏽',text:m.budget<25?'Public money is low. Repairs and services have to wait.':m.trust>=60?'People feel heard when the government decides.':'People want clearer plans before they trust leaders.'},
 {name:'Ari · student',icon:'🧑🏾',text:m.liberty>=60?'People can speak, protest, and question leaders.':m.liberty<35?'People are afraid to speak against the government.':'People argue about whether their freedoms are safe.'}
];}
/* ---------- Endings, score, and rank ---------- */
function ending(s){
 const C=E(),r=run(s),m=r.m,rebels=r.states.filter(x=>x.phase==='insurrection').length;let key,sub='';
 if(r.takeover){key='takeover';sub=r.takeover;}
 else if(r.overthrown||(rebels>=2&&m.trust<25))key='revolution';
 else if(r.rival>=80){key='takeover';sub='rival';}
 else if(m.budget<=12||m.order<=15)key='collapse';
 else if(m.liberty<35&&m.order>=55)key='crackdown';
 else if(m.trust>=55&&m.liberty>=55&&m.budget>=20&&m.approval>=45&&m.order>=35)key='thriving';
 else key='divided';
 const info=C.endings[key];let title=info.title;
 if(key==='thriving')title=s.polity==='democracy'?'Thriving Democracy':s.polity==='republic'?'Thriving Republic':'Thriving Free Nation';
 if(key==='takeover')title={election:'Voted Out',impeached:'Removed from Office',coup:'Overthrown by a Coup',rival:'Rival Takeover'}[sub];
 return {key,sub,title,icon:key==='takeover'&&sub==='election'?'🗳️🤝':info.icon,tone:key==='takeover'&&sub==='election'?'mid':info.tone,why:why(s,r,key,sub),r};
}
const listJoin=a=>a.length<3?a.join(' and '):a.slice(0,-1).join(', ')+', and '+a.at(-1);
function worst(r){const steps=r.steps.filter(x=>x.choice.power&&(x.choice.power.rights||x.choice.power.bypass||x.choice.power.cancelElection));return steps.length?steps[steps.length-1].choice.title:'';}
function why(s,r,key,sub){
 const C=E(),m=r.m,check=C.checkNames[s.oversight].toLowerCase(),bad=worst(r);
 const q=t=>'“'+t+'”';
 switch(key){
  case 'thriving':return 'You kept rights and trust high (Trust '+m.trust+', Liberty '+m.liberty+') and still paid the bills. Your check on power, '+check+', meant people did not have to fear their leader. That is the idea behind <b>checks and balances</b>.';
  case 'divided':return 'You made it through the year, but people are split (Trust '+m.trust+', Approval '+m.approval+'). '+(bad?'Moves like '+q(bad)+' cost you support. ':'Your safe choices still cost money and patience. ')+'Most real governments live in this messy middle.';
  case 'crackdown':return 'You kept order ('+m.order+') by cutting freedoms (Liberty '+m.liberty+'). '+(bad?'Choices like '+q(bad)+' silenced critics. ':'')+'People obey out of fear, not trust. That is how <b>authoritarian</b> rule holds on.';
  case 'revolution':return 'Your crackdowns turned '+(listJoin(r.harm.rebels)||'your states')+' against you. With trust at '+m.trust+', people stopped believing peaceful change was possible. That is how an <b>insurrection</b> starts.';
  case 'collapse':return m.budget<=12?'The treasury fell to '+m.budget+'. With no money, services stopped and people stopped paying attention to your orders. A government needs resources to do its basic jobs.':'Order fell to '+m.order+'. Stores were looted and police could not keep up. Protecting people is one of government’s basic purposes.';
  case 'takeover':
   if(sub==='election')return 'You kept the vote fair, and Vera Kane won (her power: '+r.rival+'). You handed over power peacefully. That is what a <b>republic</b> is supposed to do, even when it hurts.';
   if(sub==='impeached')return 'You tried to cancel an election. Lawmakers used <b>impeachment</b> to remove you, and Vera Kane took over. That is <b>checks and balances</b> stopping a leader.';
   if(sub==='coup')return 'Trust was too low ('+m.trust+') for people to defend you. The generals sided with Vera Kane. A <b>coup</b> skips elections and takes power by force.';
   return 'Vera Kane’s power hit '+r.rival+'. Every mistake made her stronger, and now she runs '+(s.name||'your country')+'. '+(r.open?'In an open system, voters can replace leaders who lose their trust.':'Even closed systems fall when rivals gain enough support.');
 }
 return '';
}
function score(s,end,first,total){
 const m=end.r.m,avg=(m.approval+m.budget+m.order+m.trust+m.liberty)/5;
 const bonus={thriving:100,divided:70,crackdown:45,collapse:15,revolution:10,takeover:end.sub==='election'?60:25}[end.key];
 const checks=total?first/total*100:0;
 return clamp(avg*.5+checks*.3+bonus*.2,0,100);
}
function rank(end,points){const C=E();const set=end.key==='takeover'?C.ranks.takeover[end.sub]:C.ranks[end.key];return points>=70?set[0]:set[1];}
const api={run,base,scores,unrest,consequences,nextSurprise,alignment,residents,ending,score,rank,KEYS};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CountrySociety=api;
})(typeof window!=='undefined'?window:this);
