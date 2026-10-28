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
 const bound=()=>{for(const key in n)n[key]=Math.max(5,Math.min(95,n[key]));};
 bound();
 for(const d of decisions(state,events))if(d.event<=through){for(const key in events[d.event].choices[d.choice].effect)n[key]+=events[d.event].choices[d.choice].effect[key]*3;bound();}
 return n;
}
const stories=[
[
{scene:'homes',voices:[['Maya · renter','My family gets help with rent while new homes are built.'],['Eli · builder','More homes are coming, but building takes time and public money.']]},
{scene:'building',voices:[['Eli · builder','We can start more homes. Rent may fall later.'],['Sam · neighbor','Some towns disagree about where the new buildings should go.']]},
{scene:'protest',voices:[['Sam · neighbor','Our town lost a say. People are protesting.'],['Jordan · judge','Some building plans must stop while courts review your order.']]}
],
[
{scene:'shelter',voices:[['Rae · parent','My family has a safe place and a fair hearing.'],['Alex · town worker','We have more help, but the plan uses public money.']]},
{scene:'border',voices:[['Alex · town worker','More officers arrive to manage the border.'],['Rae · parent','Families may be split apart while officials review their cases.']]},
{scene:'protest',voices:[['Rae · parent','People lose a chance to explain their need for safety.'],['Jordan · judge','States and Congress challenge the leader’s power.']]}
],
[
{scene:'hearing',voices:[['Taylor · parent','Families can speak at public hearings. A vote takes time.'],['Ari · student','Congress is debating safety rules instead of one leader deciding alone.']]},
{scene:'school',voices:[['Taylor · parent','More officers may help some families feel safer.'],['Ari · student','More officers also make some students feel watched.']]},
{scene:'protest',voices:[['Sam · resident','People lose a fair hearing before guns are taken.'],['Jordan · judge','Courts challenge the order. Trust in leaders falls.']]}
],
[
{scene:'hospital',voices:[['Taylor · patient','The law gives clearer rules for emergency care.'],['Jordan · judge','Some states may challenge the law in court.']]},
{scene:'states',voices:[['Taylor · patient','The care I can get may depend on my state.'],['Sam · voter','State leaders and voters have more say over these rules.']]},
{scene:'court',voices:[['Taylor · patient','The new rule starts now, but it may not last.'],['Jordan · judge','A court may stop the order. Another president could change it.']]}
],
[
{scene:'cooling',voices:[['Maya · parent','My family can cool down safely. Hospitals keep their power.'],['Alex · town worker','Lives are saved, but less emergency money remains.']]},
{scene:'blackout',voices:[['Maya · parent','Seven people die after hospitals lose power. Families demand answers.'],['Alex · town worker','The palace gets a gold fan while people need help.']]},
{scene:'power',voices:[['Taylor · nurse','Hospitals get power first.'],['Eli · worker','Workers strike. A court blocks part of the takeover order.']]}
],
[
{scene:'hospital',voices:[['Maya · parent','More people may afford medicine and health care.'],['Alex · town worker','The plan costs money, and companies challenge it.']]},
{scene:'shops',voices:[['Maya · parent','Some families get help with high bills.'],['Taylor · patient','Others still struggle to pay for their care.']]},
{scene:'court',voices:[['Taylor · patient','Prices fall fast, but some hospitals may turn patients away.'],['Sam · voter','Congress challenges the leader for acting without a vote.']]}
],
[
{scene:'voting',voices:[['Sam · voter','More people can vote and see how the count was checked.'],['Alex · election worker','We get protection and money to run the election.']]},
{scene:'queue',voices:[['Sam · voter','Some people trust the count more.'],['Maya · voter','Long lines and extra steps may stop other people from voting.']]},
{scene:'protest',voices:[['Sam · voter','Our chance to choose a leader was taken away.'],['Alex · election worker','Courts block the order. Congress acts, and your leader loses the job.']]}
],
[
{scene:'privacy',voices:[['Ari · student','I get more say over who uses my private details.'],['Eli · shop owner','Businesses need time and money to follow the new rules.']]},
{scene:'shops',voices:[['Eli · shop owner','Companies can choose their own rules and change them quickly.'],['Ari · student','People have fewer ways to make a company fix a problem.']]},
{scene:'oops',voices:[['Ari · student','Private details leak, including the president’s search history.'],['Sam · resident','The director quits. People call the agency the Department of Oops.']]}
],
[
{scene:'school',voices:[['Ari · student','Students get the same basic protections in every state.'],['Taylor · teacher','The law takes time. Some states may challenge it in court.']]},
{scene:'states',voices:[['Ari · student','School rules and support may change when a family moves states.'],['Sam · voter','State and local voters decide school rules.']]},
{scene:'court',voices:[['Taylor · teacher','Schools get a rule quickly, but courts may block it.'],['Ari · student','A new president could change the rule again.']]}
]
];
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
const api={scores,decisions,impact,residents,purposeOptions,changeDecision,stories};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CountrySociety=api;
})(typeof window!=='undefined'?window:this);
