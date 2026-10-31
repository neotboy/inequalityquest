/* Surprise crises, final score, rank, and endings. All outcomes are fictional game events. */
(function(root){
'use strict';
const RIVAL='Senator Cole';
const AUTH=['autocracy','totalitarian','oligarchy'];
// Each crisis: when it is likely, what already happened (base toll), and two hard responses.
// Placeholders: {leader} {state} {b} budget {t} trust {a} approval {l} liberty {p} state unrest.
const pool=[
{id:'heat',name:'Heat wave',
 weight:c=>c.n.budget<35?5:1,
 base:c=>({deaths:c.n.budget<20?7:c.n.budget<35?4:2,injuries:0}),
 headline:'Heat wave kills {d}',
 text:c=>c.n.budget<35?'It hits 104°F for a week. Cooling centers closed after budget cuts.':'It hits 104°F for a week. Old power lines fail across the country.',
 cause:c=>c.n.budget<35?'Caused by: budget room fell to {b}.':'Partly bad luck: a record heat wave.',
 choices:[
  {title:'Open emergency cooling centers',text:'Costs money you barely have.',result:'Centers open within hours. Deaths stop. The treasury takes another hit.',effect:{budget:-4,approval:2,trust:1},rival:'Nice of you to show up after the funerals.'},
  {title:'Let the states handle it',text:'Save national money.',result:'Rich states cope. Poor states can’t. Five more people die.',effect:{approval:-3,trust:-3},harm:{deaths:5},rival:'Five more dead. You saved a little money.'}],
 reveal:'Federalism: states handle many emergencies, but not every state has the same money.'},
{id:'bridge',name:'Bridge collapse',
 weight:c=>(c.n.budget<30?4:.6)+(c.flags.forcedBuild?3:0),
 base:c=>({deaths:c.n.budget<20?9:c.n.budget<30?6:3,injuries:20}),
 headline:'Bridge collapse kills {d}',
 text:()=>'An interstate bridge falls into the river at rush hour. Inspectors had warned about it.',
 cause:c=>c.flags.forcedBuild?'Caused by: you skipped safety inspections.':c.n.budget<30?'Caused by: repairs were cut. Budget room: {b}.':'Partly bad luck: an old bridge finally failed.',
 choices:[
  {title:'Emergency repair fund',text:'Fix every weak bridge now.',result:'Crews start work everywhere. Debt grows. Bridges reopen safely.',effect:{budget:-5,trust:2,approval:1},rival:'Funny how money appears after a disaster.'},
  {title:'Blame the builder, wait',text:'Investigate first. Spend nothing.',result:'Roads stay closed for months. Truck drivers walk off the job.',effect:{approval:-3,order:-2,trust:-3},flag:'strikeRisk',rival:'Pointing fingers won’t rebuild a bridge.'}],
 reveal:'Budgets are choices: cutting spending can move risk onto the public.'},
{id:'riots',name:'Riots',
 weight:c=>(c.n.trust<35?4:0)+(c.maxPressure>=55?2:0),
 base:()=>({deaths:2,injuries:40}),
 headline:'Riots spread to three cities',
 text:()=>'Crowds smash stores and burn cars. Two people die. Police are outnumbered.',
 cause:c=>c.n.trust<35?'Caused by: public trust fell to {t}.':'Caused by: unrest in {state} reached {p}.',
 choices:[
  {title:'Police with court limits',text:'Arrest looters. Protect peaceful crowds.',result:'Calm returns slowly. Courts review every arrest.',effect:{order:3,trust:1,budget:-2},rival:'Too slow. Stores are still burning.'},
  {title:'Declare martial law',text:'Soldiers patrol. Curfew for everyone.',result:'Streets go quiet. Soldiers fire into a crowd. Five people die.',effect:{order:4,liberty:-6,trust:-4},harm:{deaths:5,injuries:10},flag:'martial',abuse:true,rival:'Soldiers shooting citizens. Is this your country now?'}],
 reveal:'Martial law puts the military in charge of public order. Civil liberties shrink.'},
{id:'coup',name:'Coup attempt',
 weight:c=>(c.n.trust<40&&c.n.order>=55?3:0)+(c.state.approach==='hard'?2:0)+(AUTH.includes(c.state.polity)?2:0)+(c.flags.martial?4:0)+(c.n.approval<30?1:0),
 base:()=>({deaths:3,injuries:10}),
 headline:'Generals try to seize power',
 text:()=>'Tanks surround the capitol. Army leaders say {leader} has lost control. Three soldiers die.',
 cause:c=>c.flags.martial?'Caused by: martial law put the army in the streets.':(c.state.approach==='hard'||AUTH.includes(c.state.polity))?'Caused by: power sits in a few hands. Generals want it.':'Caused by: public trust fell to {t}.',
 choices:[
  {title:'Call on Congress and courts',text:'Let the law decide, not guns.',result:'Most soldiers obey the Constitution. The coup collapses in a day.',effect:{trust:3,order:-1},rival:'For once, you followed the Constitution.'},
  {title:'Purge the army',text:'Arrest any officer who might betray you.',result:'Hundreds are jailed without trials. Two die in custody. The army now fears you.',effect:{order:3,liberty:-6,trust:-4},harm:{deaths:2},flag:'massArrests',abuse:true,rival:'A purge. Who will you arrest next? Me?'}],
 reveal:'Civilian control: elected leaders, not generals, command the military.'},
{id:'shooting',name:'Attack on the leader',
 weight:c=>c.n.approval<35?3:.7,
 base:()=>({deaths:1,injuries:3}),
 headline:'Shots fired at {leader}',
 text:()=>'A gunman fires at a rally. A guard dies. {leader} survives.',
 cause:c=>c.n.approval<35?'Anger is high. Approval is only {a}.':'Partly bad luck: one angry person with a gun.',
 choices:[
  {title:'Stay public, add guards',text:'Keep rallies. Pay for security.',result:'Crowds cheer your courage. Security costs money.',effect:{budget:-2,approval:3,trust:1},rival:'I condemn this attack. Violence has no place here.'},
  {title:'Ban rallies, jail critics',text:'Blame opponents. No trials.',result:'Critics go to jail without hearings. Protests explode. Twelve people are hurt.',effect:{liberty:-6,trust:-4,order:1},harm:{injuries:12},flag:'massArrests',abuse:true,rival:'One gunman, and you jail everyone who disagrees?'}],
 reveal:'Due process: even after an attack, people get charges and a fair hearing.'},
{id:'strike',name:'General strike',
 weight:c=>(c.flags.strikeRisk||c.harm.strike?5:0)+(c.n.budget<30&&c.n.approval<40?3:0),
 base:()=>({deaths:1,injuries:0}),
 headline:'General strike shuts down the country',
 text:()=>'Trains stop. Power plants slow. A hospital generator fails and one patient dies.',
 cause:c=>c.harm.strike?'Caused by: your crackdown sparked a national strike.':c.flags.strikeRisk?'Caused by: roads stayed closed after the bridge collapse.':'Caused by: low pay and a budget of {b}.',
 choices:[
  {title:'Negotiate with unions',text:'Raise pay. It costs a lot.',result:'Work restarts in three days. The budget takes a big hit.',effect:{budget:-5,approval:2,trust:2},rival:'You caved. Fine. People needed their trains.'},
  {title:'Order workers back',text:'Send police to break the strike.',result:'Police clash with strikers. Three die and 25 are hurt. The strike grows.',effect:{liberty:-5,trust:-5,order:-2},harm:{deaths:3,injuries:25},abuse:true,rival:'Breaking strikes with clubs. Workers will remember.'}],
 reveal:'Freedom of assembly lets workers organize and protest together.'},
{id:'arrests',name:'Mass arrests',
 weight:c=>(c.flags.massArrests?5:0)+(c.abuses>=2?3:0)+(c.n.liberty<30?2:0),
 base:()=>({deaths:0,injuries:0}),
 headline:'400 critics jailed overnight',
 text:()=>'Police hold reporters and activists with no charges. Families crowd the jail gates.',
 cause:c=>c.flags.massArrests?'Caused by: your earlier crackdown. Police think you want more.':'Caused by: civil liberties fell to {l}.',
 choices:[
  {title:'Free them, hold hearings',text:'Charge them in court or let them go.',result:'Most go home. A few face real charges. Your security chief quits.',effect:{trust:3,liberty:4,order:-2},harm:{resigned:'Security chief'},rival:'Good. Now explain why they were jailed.'},
  {title:'Keep them locked up',text:'Call them threats. No hearings.',result:'Three prisoners die in crowded cells. Other countries cut trade.',effect:{liberty:-6,trust:-5,budget:-2},harm:{deaths:3},abuse:true,rival:'Three people died in your jails. No charges. No trials.'}],
 reveal:'Habeas corpus: a jailer must show a judge a legal reason to hold someone.'},
{id:'secession',name:'A state breaks away',
 weight:c=>(c.maxPressure>=60?5:0)+(c.harm.rebellion.length?4:0),
 base:()=>({deaths:4,injuries:15}),
 headline:'{state} breaks away',
 text:()=>'{state}’s governor says your orders no longer apply. State police block the roads. Four die.',
 cause:()=>'Caused by: unrest in {state} reached {p}.',
 choices:[
  {title:'Negotiate with {state}',text:'Hear demands. Share some power.',result:'Talks hold. {state} stays, with more control over its own rules.',effect:{trust:2,order:-1,liberty:1,approval:-1},rival:'Talking beats shooting. Barely.'},
  {title:'Send in the army',text:'Crush the uprising by force.',result:'Fighting lasts a week. Eleven die. Two more states threaten to leave.',effect:{order:2,trust:-6,liberty:-4},harm:{deaths:11,injuries:40},abuse:true,rival:'Our soldiers fighting our own people. Stop this now.'}],
 reveal:'Federalism: states keep their own powers, but the Constitution binds them to the union.'},
{id:'tornado',name:'Tornado',
 weight:()=>1.2,
 base:c=>({deaths:c.n.budget<35?4:2,injuries:15}),
 headline:'Tornado rips through {state}',
 text:()=>'A mile-wide tornado hits farm towns at night. Warning sirens failed in two counties.',
 cause:c=>c.n.budget<35?'Made worse by: siren repairs were cut. Budget room: {b}.':'Mostly bad luck. Nature doesn’t care who rules.',
 choices:[
  {title:'Send national disaster aid',text:'Fast help. Big cost.',result:'Aid arrives in a day. Towns start rebuilding. The budget shrinks.',effect:{budget:-4,approval:3,trust:2},rival:'Good. Now fix the sirens.'},
  {title:'Leave it to {state}',text:'Save national money.',result:'{state} is overwhelmed. Rescues are slow. Four more people die.',effect:{approval:-3,trust:-3},harm:{deaths:4},rival:'Four more dead while you counted money.'}],
 reveal:'Federalism: big disasters often need national and state governments working together.'},
{id:'water',name:'Poisoned water',
 weight:c=>c.n.budget<30?3:.4,
 base:()=>({deaths:0,injuries:60}),
 headline:'Lead found in {state}’s water',
 text:()=>'Old pipes leak lead into tap water. Sixty people are sick. Inspectors were laid off.',
 cause:c=>c.n.budget<30?'Caused by: inspection cuts. Budget room: {b}.':'Partly bad luck: pipes nobody checked for decades.',
 choices:[
  {title:'Replace the pipes now',text:'Expensive, but it ends the danger.',result:'Clean water returns in weeks. The budget takes a hit.',effect:{budget:-5,trust:2,approval:1},rival:'About time.'},
  {title:'Keep it quiet',text:'Avoid panic. Fix it slowly.',result:'Reporters expose the cover-up. Two people die. Trust collapses.',effect:{trust:-7,approval:-4,liberty:-1},harm:{deaths:2},rival:'You hid poison from families. Resign.'}],
 reveal:'A free press can expose what officials try to hide.'}
];
const byId=Object.fromEntries(pool.map(c=>[c.id,c]));
function rng(seed,slot){let t=((seed>>>0)^Math.imul(slot+1,0x9E3779B9))>>>0;return()=>{t=(t+0x6D2B79F5)>>>0;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return((r^(r>>>14))>>>0)/4294967296;};}
function context(state,E,S,slot){
 const events=E.governanceEvents,n=S.scores(state,events,slot),harm=S.consequences(state,events,slot),states=S.unrest(state,events,slot);
 const hot=states.slice().sort((a,b)=>b.pressure-a.pressure)[0];
 const flags={};for(const c of S.crises(state,slot))if(c.flag)flags[c.flag]=true;
 const forced=state.decisions.find(d=>d.event===1);if(forced&&events[1].choices[forced.choice]?.power?.bypass)flags.forcedBuild=true;
 const abuses=S.decisions(state,events).filter(d=>d.event<=slot).filter(d=>{const p=events[d.event].choices[d.choice].power||{};return p.rights||p.bypass||p.cancelElection;}).length+S.crises(state,slot).filter(c=>c.abuse).length;
 return {state,n,harm,flags,abuses,maxPressure:hot.pressure,hotState:hot.name};
}
function fire(state,E,S,slot,seed){
 const c=context(state,E,S,slot),used=(state.guide?.crises||[]).filter(Boolean).map(r=>r.id);
 const options=pool.filter(p=>!used.includes(p.id)).map(p=>({p,w:Math.max(0,p.weight(c))})).filter(o=>o.w>0);
 const r=rng(seed,slot);let roll=r()*options.reduce((s,o)=>s+o.w,0),pick=options[options.length-1].p;
 for(const o of options){roll-=o.w;if(roll<=0){pick=o.p;break;}}
 const randomState=state.regions[Math.floor(r()*3)]||'State One';
 const where=['riots','secession'].includes(pick.id)?c.hotState:randomState;
 const base=pick.base(c);
 const vars={leader:state.leader||'Your leader',state:where,b:c.n.budget,t:c.n.trust,a:c.n.approval,l:c.n.liberty,p:c.maxPressure,d:base.deaths};
 return {slot,id:pick.id,base,vars,text:pick.text(c),cause:pick.cause(c),choice:null};
}
function fill(s,vars){return String(s||'').replace(/\{(\w+)\}/g,(m,k)=>vars&&k in vars?vars[k]:m);}
function view(rec){const p=byId[rec.id],v=rec.vars;return {name:p.name,headline:fill(p.headline,v),text:fill(rec.text,v),cause:fill(rec.cause,v),reveal:p.reveal,choices:p.choices.map(ch=>({title:fill(ch.title,v),text:fill(ch.text,v),result:fill(ch.result,v),rival:ch.rival,harm:ch.harm||{}}))};}
function resolve(rec,choice){const ch=byId[rec.id].choices[choice];if(!ch)return false;Object.assign(rec,{choice,effect:ch.effect,harm:ch.harm||{},flag:ch.flag||null,abuse:!!ch.abuse});return true;}
function ending(state,E,S){
 const n=S.scores(state,E.governanceEvents),h=S.consequences(state,E.governanceEvents);
 if(h.rebellion.length===3)return {key:'collapse',title:'Collapse',text:'All three states broke away and your government fell apart. Federalism only works when states trust the national government.'};
 if(h.removed)return {key:'removed',title:'Removed from Office',text:'Your own government removed you, led by '+RIVAL+'. Other branches can check a leader who breaks the rules.'};
 if(n.liberty<30&&n.order>=50)return {key:'iron',title:'Iron Fist',text:'You kept order by taking freedom. Critics are silent or in jail. That is authoritarian rule: power with few limits.'};
 if(h.deaths>=20)return {key:'funerals',title:'A Year of Funerals',text:h.deaths+' people died this year. Families blame your choices. Every cut and crackdown had a cost.'};
 if(n.budget<15)return {key:'broke',title:'Broke and Breaking',text:'The treasury is empty and services are failing. Spending choices decide who gets protected.'};
 if(n.liberty>=55&&n.trust>=55&&h.deaths<12)return {key:'free',title:'Free and Standing',text:'You protected rights and kept trust through a brutal year. Limits on power held.'};
 return {key:'divided',title:'Divided but Standing',text:'Your country survived, but people are split. Every choice helped some people and cost others.'};
}
const ranks=[[75,'Guardian of the Republic'],[60,'Steady Hand in a Storm'],[45,'Barely Holding On'],[30,'Crisis Magnet'],[15,'Walking Disaster'],[-1,'History’s Warning Label']];
function score(state,E,S,stats){
 const n=S.scores(state,E.governanceEvents),h=S.consequences(state,E.governanceEvents);
 const avg=(n.approval+n.trust+n.liberty+n.order+n.budget)/5;
 const country=Math.round(avg*.4),checks=Math.round((stats.total?stats.firstTry/stats.total:0)*30);
 // Deaths cost the most, but capped so first-try checks still separate students in a disaster year.
 const lifeCost=Math.min(45,Math.round(h.deaths*1.5+h.injuries/20)),otherCost=Math.min(15,(h.removed?10:0)+h.rebellion.length*5);
 const total=Math.max(0,Math.min(100,country+checks+30-lifeCost-otherCost));
 return {total,country,checks,safety:30,lifeCost,otherCost,rank:ranks.find(([min])=>total>=min)[1],deaths:h.deaths,injuries:h.injuries};
}
const api={RIVAL,pool,fire,view,resolve,ending,score,ranks,fill};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CountryChaos=api;
})(typeof window!=='undefined'?window:this);
