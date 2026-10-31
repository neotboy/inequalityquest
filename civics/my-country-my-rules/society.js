/* A fictional society model. Economic labels do not change the scores. */
(function(root){
'use strict';
function decisions(state,events){const byRound=new Map();for(const d of state.decisions||[])if(Number.isInteger(d.event)&&events[d.event]?.choices[d.choice])byRound.set(d.event,d);return [...byRound.values()].sort((a,b)=>a.event-b.event);}
function scores(state,events,through=Infinity){
 const n={order:50,trust:50,liberty:50,approval:50,budget:55};
 if(state.approach==='hard'){n.order+=24;n.trust-=14;n.liberty-=22;n.approval-=8;n.budget+=2;}
 else if(state.approach==='firm'){n.order+=8;n.trust+=2;n.liberty+=2;n.approval+=4;n.budget-=2;}
 else{n.order-=7;n.trust+=12;n.liberty+=13;n.approval+=7;n.budget-=5;}
 const changes={democracy:{trust:8,liberty:10,approval:8},republic:{trust:8,liberty:10,approval:7},oligarchy:{order:8,trust:-14,liberty:-8,approval:-8},autocracy:{order:12,trust:-10,liberty:-17,approval:-8},totalitarian:{order:18,trust:-18,liberty:-28,approval:-15}}[state.polity]||{};
 for(const key in changes)n[key]+=changes[key];
 const checks={courts:{liberty:3,trust:2,budget:-1},congress:{budget:3,trust:1,approval:-1},time:{order:-2,liberty:3,trust:2}}[state.oversight]||{};
 for(const key in checks)n[key]+=checks[key];
 const bound=()=>{for(const key in n)n[key]=Math.max(5,Math.min(95,n[key]));};
 bound();
 for(const d of decisions(state,events))if(d.event<=through){for(const key in events[d.event].choices[d.choice].effect)n[key]+=events[d.event].choices[d.choice].effect[key]*3;bound();}
 return n;
}
const stories=[[{"scene": "privacy", "voices": [["Maya · resident", "Police get vehicle clues, with limits on searches."], ["Alex · worker", "Reviews cost money. Some people still worry about privacy."]]}, {"scene": "shops", "voices": [["Maya · resident", "No new plate records are collected."], ["Alex · worker", "Police have one less source of clues."]]}, {"scene": "oops", "voices": [["Maya · resident", "Your public copy exposes people’s trips. A resident is attacked and hurt."], ["Alex · worker", "Your privacy chief resigns. People demand an investigation."]]}], [{"scene": "homes", "voices": [["Maya · resident", "Rent aid keeps us housed. Other services must wait."], ["Alex · worker", "Building takes time, even with help."]]}, {"scene": "building", "voices": [["Maya · resident", "More homes may lower rent later."], ["Alex · worker", "Some neighbors object to the new buildings."]]}, {"scene": "protest", "voices": [["Maya · resident", "A rushed building collapses. Three people die."], ["Alex · worker", "Courts halt projects. Your housing minister resigns."]]}], [{"scene": "school", "voices": [["Maya · resident", "Our school can test an AI rule."], ["Alex · worker", "Moving to another school may mean different rules."]]}, {"scene": "hearing", "voices": [["Maya · resident", "Congress debates a shared AI law."], ["Alex · worker", "Clear rules take time. Some schools want more freedom."]]}, {"scene": "court", "voices": [["Maya · resident", "False alerts punish honest students. Schools walk out."], ["Alex · worker", "Courts order hearings. Your education chief quits."]]}], [{"scene": "protest", "voices": [["Maya · resident", "Peaceful people can still criticize the leader."], ["Alex · worker", "Shops reopen slowly. Police investigate damage."]]}, {"scene": "court", "voices": [["Maya · resident", "The safety zone reduces damage but also moves peaceful people."], ["Alex · worker", "The limit has an end date. Courts can review it."]]}, {"scene": "protest", "voices": [["Maya · resident", "Clashes leave twelve people hurt and one dead."], ["Alex · worker", "A national strike begins. Congress investigates your orders."]]}], [{"scene": "voting", "voices": [["Maya · resident", "Voting continues. Workers explain the evidence."], ["Alex · worker", "The leader might lose, but people keep their vote."]]}, {"scene": "court", "voices": [["Maya · resident", "A court reviews evidence while voting stays open."], ["Alex · worker", "The review takes time. Supporters grow impatient."]]}, {"scene": "protest", "voices": [["Maya · resident", "Six people are hurt in clashes. Your guards refuse your order."], ["Alex · worker", "Congress removes your leader. Your cabinet takes over."]]}]];
function impact(state,events,round){const d=decisions(state,events).find(d=>d.event===round);if(!d)return null;const before=scores(state,events,round-1),after=scores(state,events,round);return {...stories[round][d.choice],round,choice:d.choice,before,after};}
function residents(score){return [
{name:'Maya · parent',icon:'👩🏽',mood:score.budget<25?'worried':score.trust>=60?'hopeful':'unsure',text:score.budget<25?'Public money is low. Some repairs and services may have to wait.':score.trust>=60?'People feel heard when the government makes decisions.':'People want clearer plans before they trust their leaders.'},
{name:'Ari · student',icon:'🧑🏾',mood:score.liberty>=60?'hopeful':score.liberty<35?'worried':'unsure',text:score.liberty>=60?'People have room to speak, protest, and question leaders.':score.liberty<35?'People worry about speaking against the government.':'People disagree about whether their freedoms are safe.'}
];}
function purposeOptions(place){const name=String(place.text||place.name||'').toLowerCase(),category=place.category;
 if(/school|college|library|research/.test(name))return [['learning','Help people learn'],['fun','Bring the community together']];
 if(/hospital|shelter|food bank|housing|fire|police/.test(name))return [['health','Keep people safe and well'],['work','Provide useful local jobs']];
 if(category==='government')return [['rights','Give people a voice'],['work','Run public services']];
 if(category==='land')return [['nature','Care for land and water'],['fun','Give people a place to enjoy']];
 if(/power|solar|wind|water plant|broadband/.test(name))return [['work','Keep daily life running'],['health','Help homes and hospitals']];
 if(category==='infrastructure')return [['travel','Move people and supplies'],['work','Help local businesses']];
 if(category==='economy')return [['work','Provide jobs and supplies'],['health','Meet families’ basic needs']];
 return [['health','Help people in daily life'],['fun','Bring the community together']];
}
function changeDecision(state,events,round,choice,goal){
 if(!Number.isInteger(round)||!events[round]?.choices[choice])return false;
 const old=decisions(state,events).find(d=>d.event===round),changed=!!old&&(old.choice!==choice||old.goal!==goal);
 state.decisions=decisions(state,events).filter(d=>d.event!==round).concat({event:round,choice,goal,revisions:(old?.revisions||0)+(changed?1:0)}).sort((a,b)=>a.event-b.event);return true;
}
function unrest(state,events,through=Infinity){
 const n=scores(state,events,through),moves=decisions(state,events).filter(d=>d.event<=through);
 const abuses=moves.filter(d=>{const p=events[d.event].choices[d.choice].power||{};return p.rights||p.bypass||p.cancelElection;}).length;
 return ['Rights','Services','Voice'].map((priority,i)=>{
  const weights=[[.45,.45,.1],[.45,.2,.35],[.65,.25,.1]][i];
  const pressure=Math.round((100-n.trust)*weights[0]+(100-n.liberty)*weights[1]+(100-n.budget)*weights[2]);
  const rebellion=abuses>=2&&n.trust<35&&pressure>=[70,76,72][i];
  return {index:i,name:state.regions[i],priority,pressure,phase:rebellion?'insurrection':pressure>=55&&moves.length?'protests':'calm',reason:i===0?'People say the leader is taking their rights.':i===1?'People say their needs are being ignored.':'People say the leader will not hear them.'};
 });
}
function consequences(state,events,through=Infinity){
 const result={deaths:0,injuries:0,resignations:[],strike:false,removed:false,rebellion:[],uprisingDeaths:0,uprisingInjuries:0};
 const seen=new Set();
 for(const d of decisions(state,events))if(d.event<=through){
  const h=events[d.event].choices[d.choice].harm||{};result.deaths+=h.deaths||0;result.injuries+=h.injuries||0;if(h.resigned)result.resignations.push(h.resigned);result.strike=result.strike||!!h.strike;result.removed=result.removed||!!h.removed;
  const rebels=unrest(state,events,d.event).filter(r=>r.phase==='insurrection');
  for(const r of rebels)if(!seen.has(r.index)){seen.add(r.index);result.rebellion.push(r.name);result.uprisingDeaths++;result.uprisingInjuries+=4;}
  if(rebels.length===3)result.removed=true;
 }
 result.deaths+=result.uprisingDeaths;result.injuries+=result.uprisingInjuries;
 return result;
}
function alignment(state,events,round,choice){
 const p=events[round]?.choices[choice]?.power||{},warnings=[];
 const add=(basis,message)=>warnings.push({basis,message});
 if(p.cancelElection&&['republic','democracy'].includes(state.polity))add('Who rules','You chose '+(state.polity==='republic'?'a constitutional republic':'direct democracy')+'. Canceling the vote takes power away from voters.');
 else if(p.rights&&state.polity==='republic')add('Who rules','Your constitutional republic promises rights and legal limits. This move puts those limits at risk.');
 else if(p.bypass&&state.polity==='republic')add('Who rules','You chose a constitutional republic. This move skips other officials who may have legal power.');
 if(p.bypass&&state.polity==='democracy'&&!p.cancelElection)add('Who rules','You chose direct democracy. Here, your leader decides without a public vote.');
 if(p.election&&['autocracy','oligarchy','totalitarian'].includes(state.polity))add('Who rules','You chose rule by one leader or a small group. Letting voters replace you gives the public more power.');
 if(p.local&&state.division==='confederate'&&round===1)add('Shared power','You chose a confederation, where states keep most power. Your order overrides local decisions.');
 if(p.bypass&&state.approach==='consult')add('Leadership','You chose to build agreement. This move skips agreement and uses command.');
 if(p.input&&state.approach==='hard')add('Leadership','You chose rule by command. This move uses input or shared decisions instead.');
 if(p.bypass&&state.oversight==='congress')add('Checks and balances','You chose Congress review. This move tries to act without that check.');
 if(p.rights&&state.oversight==='courts')add('Checks and balances','You chose court review. Expect a legal challenge if people’s rights are harmed.');
 return {warnings,authoritarian:!!(p.rights||p.cancelElection||p.bypass)};
}
const api={unrest,consequences,alignment,scores,decisions,impact,residents,purposeOptions,changeDecision,stories};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CountrySociety=api;
})(typeof window!=='undefined'?window:this);
