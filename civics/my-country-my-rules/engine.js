/* Content for My Country, My Rules. All scenarios and outcomes are fictional game results. */
(function(root){
'use strict';
const words={
 insurrection:{name:'Insurrection',text:'A violent uprising against a government. In this game, repeated abuses plus low trust can push states into rebellion.',group:'Civics terms'},
 coup:{name:'Coup',text:'When a small group, often military officers, tries to take power by force instead of by election.',group:'Civics terms'},
 authoritarian:{name:'Authoritarian rule',text:'Leaders limit freedoms and make it hard for people to challenge or replace them.',group:'Civics terms'},
 democracy:{name:'Direct democracy',text:'People vote on laws themselves. This is different from electing leaders to vote on laws.',group:'Who holds power?'},
 republic:{name:'Constitutional republic',text:'Voters elect leaders. The Constitution limits those leaders and protects rights. The U.S. is a constitutional republic.',group:'Who holds power?'},
 oligarchy:{name:'Oligarchy',text:'A small group holds most political power. Most people have little say.',group:'Who holds power?'},
 autocracy:{name:'Autocracy',text:'One leader holds most power. People have few ways to stop or replace that leader.',group:'Who holds power?'},
 totalitarian:{name:'Totalitarian regime',text:'A totalitarian government tries to control politics and daily life, including news, groups, and beliefs.',group:'Who holds power?'},
 federal:{name:'Federal system',text:'Federalism means national and state governments share power. The U.S. Constitution sets limits for each level.',group:'Where is power divided?'},
 unitary:{name:'Unitary system',text:'The national government holds most power. It can give powers to local governments.',group:'Where is power divided?'},
 confederate:{name:'Confederation',text:'States keep most power. They give a central body only certain jobs.',group:'Where is power divided?'},
 capitalism:{name:'Capitalism (private ownership)',text:'Private owners run businesses and sell for profit: money left after costs. Customers choose what to buy. Government can still set rules.',group:'Economic systems'},
 mixed:{name:'Mixed economy',text:'Private businesses and government both have a role. Capitalism can exist alongside public services and business rules. The U.S. has a mixed economy.',group:'Economic systems'},
 socialism:{name:'Socialism',text:'The public or workers own or run major businesses and resources. This economic label alone does not tell us who rules.',group:'Economic systems'},
 communism:{name:'Communism',text:'An idea of shared ownership and no social classes. Many governments using this name put businesses under state control.',group:'Economic systems'},
 dueProcess:{name:'Due process',text:'Fair legal steps, such as being told the charge and getting a fair hearing.',group:'Civics terms'},
 checksBalances:{name:'Checks and balances',text:'Branches of government can limit each other’s power. A court can stop an order that breaks the Constitution.',group:'Civics terms'},
 civilLiberties:{name:'Civil liberties',text:'Freedoms that government must respect, such as speech, religion, protest, and privacy.',group:'Civics terms'},
 impeachment:{name:'Impeachment',text:'The House can bring charges against a president. The Senate can then hold a trial and vote on removal.',group:'Civics terms'}
};
function fresh(){return{version:4,name:'',leader:'',polity:'republic',division:'federal',approach:'consult',ownership:'mixed',oversight:'courts',regions:['State One','State Two','State Three'],rules:[],marks:[],strokes:[],flag:[],flagBg:'#16364a',decisions:[],timeline:[],nextId:1};}
function addRule(s,text){text=String(text).trim().slice(0,120);if(!text)return false;s.rules.push({id:s.nextId++,text});return true;}

/* Open systems hold real elections. Closed systems keep power with one person or a small group. */
const isOpen=polity=>polity==='republic'||polity==='democracy';

/* ---------- Setup: plain words first, the concept name after ---------- */
const setup=[
 {key:'polity',ask:'Who makes the final call?',options:[
  ['democracy','Everyone votes on every law','No leaders vote for you.'],
  ['republic','Voters elect leaders','A constitution limits those leaders.'],
  ['oligarchy','A few powerful families decide','Most people have little say.'],
  ['autocracy','One leader decides','Few ways to stop or replace them.'],
  ['totalitarian','One party controls everything','Even news, clubs, and beliefs.']]},
 {key:'division',ask:'Where does power live?',options:[
  ['federal','Nation and states share it','Each level has its own jobs.'],
  ['unitary','The national government','States do what the nation allows.'],
  ['confederate','The states','The center only gets a few jobs.']]},
 {key:'ownership',ask:'Who owns the big businesses?',note:'No answer here earns more points. It changes which moves fit your system.',options:[
  ['capitalism','Private owners','They compete and keep the profit.'],
  ['mixed','Private owners, plus public services','Government runs some services and sets rules.'],
  ['socialism','The public or the workers','Major industries are shared.'],
  ['communism','Everyone, through the state','The goal is no classes. The state runs it.']]},
 {key:'oversight',ask:'What can stop your leader?',options:[
  ['courts','Courts can cancel orders','Judges strike down illegal orders.'],
  ['congress','Lawmakers control the money','No money, no plan.'],
  ['time','Emergency powers expire','After 30 days, lawmakers must vote.'],
  ['none','Nothing can stop the leader','Fast decisions. No brakes.']]}
];
const checkNames={courts:'Judicial review',congress:'The power of the purse',time:'Time limits on emergency power',none:'No checks on power'};
const checkMeaning={courts:'Courts can cancel orders that break the constitution. That is a check and balance.',congress:'Lawmakers decide how money is spent, so they can refuse to pay for a plan. That is a check and balance.',time:'Emergency powers end unless lawmakers vote to keep them. That is a check and balance.',none:'Nothing limits the leader. That is the opposite of checks and balances.'};
function setupWarnings(s){
 const w=[];
 if(isOpen(s.polity)&&s.oversight==='none')w.push('A '+(s.polity==='republic'?'constitutional republic':'direct democracy')+' depends on limits. With no check, nothing stops a leader who abuses power.');
 if(!isOpen(s.polity)&&s.oversight==='courts')w.push('In a '+words[s.polity].name.toLowerCase()+', courts rarely overrule the ruler. Expect judges and your government to clash.');
 if(s.polity==='totalitarian'&&s.division==='confederate')w.push('A totalitarian regime wants control everywhere. In a confederation, states keep most power. These two clash.');
 if(s.polity==='democracy'&&s.division==='unitary')w.push('Note: with everyone voting on national laws, states get little say. That can work, but expect state pushback.');
 return w;
}
/* Leadership style follows from who rules. It shapes the starting meters. */
function approachFor(polity){return isOpen(polity)?'consult':'firm';}

/* ---------- Places: three slots, every pick has a cost ---------- */
const places=[
 {id:'hospital',icon:'🏥',name:'Hospital',category:'community',fx:{approval:6,budget:-5},plus:'+Approval',minus:'Costs money'},
 {id:'school',icon:'🏫',name:'Public School',category:'community',fx:{trust:5,approval:3,budget:-5},plus:'+Trust',minus:'Costs money'},
 {id:'newsroom',icon:'📰',name:'Newsroom',category:'community',fx:{liberty:6,trust:3},rival:6,plus:'+Rights, +Trust',minus:'Your rival gets airtime'},
 {id:'police',icon:'🚓',name:'Police Station',category:'community',fx:{order:7,budget:-3,liberty:-2},plus:'+Order',minus:'Less freedom, costs money'},
 {id:'army',icon:'🪖',name:'Army Base',category:'government',fx:{order:9,budget:-5},plus:'+Order',minus:'Generals gain power'},
 {id:'court',icon:'⚖️',name:'Courthouse',category:'government',fx:{trust:4,liberty:5,budget:-3},plus:'+Rights, +Trust',minus:'Judges can block you'},
 {id:'factory',icon:'🏭',name:'Factory',category:'economy',fx:{budget:9,approval:2,trust:-2},plus:'+Money, +Jobs',minus:'Workers may strike'},
 {id:'farm',icon:'🌾',name:'Farm',category:'economy',fx:{budget:4,approval:3},plus:'+Food, +Money',minus:'Small boost only'},
 {id:'election',icon:'🗳️',name:'Election Office',category:'government',fx:{trust:7,budget:-2},rival:4,plus:'+Trust',minus:'Fair votes help rivals too'}
];

/* ---------- The rival ---------- */
const rival={name:'Vera Kane',initials:'VK',start:35,role:p=>isOpen(p)?'Opposition party leader':'Banned opposition leader',
 intro:p=>isOpen(p)?'Vera Kane leads the other party. She wants your job, and she will use every mistake.':'Vera Kane leads a banned opposition group. She works in secret to bring you down.'};

/* ---------- Five big decisions (fictional) ---------- */
const governanceEvents=[
 {title:'Flock cameras: safety or privacy?',prompt:'Car thefts are rising. Police want Flock license plate cameras. Residents ask who can search the records.',
  fact:'Flock cameras photograph vehicles and license plates. The company says they do not use facial recognition. The choices and outcomes here are fictional.',source:'https://www.flocksafety.com/blog/what-do-flock-cameras-actually-capture',
  learn:'You just weighed safety against <b>civil liberties</b> (freedoms like privacy). The U.S. Fourth Amendment limits unreasonable government searches.',
  choices:[
  {title:'Cameras with strict rules',text:'Log every search. Delete records after 30 days.',result:'Police find more stolen cars. The audits cost money, and privacy groups still worry.',fx:{order:9,budget:-6,trust:3,liberty:-3},rival:2,rq:'Cameras with rules? Rules get broken. I’ll be watching.',power:{input:true},scene:'privacy'},
  {title:'No cameras. Hire officers.',text:'Spend the money on people, not plate records.',result:'No plate records exist. Hiring is slow and costly, and thefts keep rising for now.',fx:{order:3,budget:-9,liberty:6,approval:-3},rival:4,rq:'Car thefts are up, and you did nothing. Remember that.',scene:'shops'},
  {title:'Cameras everywhere, no warrant',text:'Keep records forever. Any officer can search.',result:'Thefts drop fast. Then an officer uses the records to track his ex-partner. Your privacy chief quits.',fx:{order:15,budget:-3,liberty:-15,trust:-9,approval:3},rival:{open:7,closed:-4},rq:{open:'No warrant, no limits? Voters will hear about this.',closed:'Your cameras follow my people. We’ll go quiet. For now.'},power:{rights:true},harm:{resigned:'Privacy chief'},scene:'oops'}]},
 {title:'Rent eats your paycheck',prompt:'Rent jumps 20 percent. Workers may leave. Towns block new apartment buildings.',
  learn:'Towns and states usually make building rules. Overriding them moves power to the national level. That is a <b>federalism</b> question.',
  choices:[
  {title:'Rent aid for families',text:'Use public money to pay part of the rent.',result:'Families stay housed. The money runs out fast, and rents keep rising.',fx:{approval:12,budget:-15,trust:6,order:3},rival:2,rq:'Free money now, empty treasury later. Smart.',power:{input:true},scene:'homes'},
  {title:'Pay towns to build homes',text:'Reward towns that approve new housing.',result:'Builders start work. Rent may fall in a few years. Neighbors complain about the noise.',fx:{approval:3,budget:-6,trust:3},rival:4,rq:'Homes in five years? People need help today.',power:{input:true},scene:'building'},
  {title:'Override towns. Skip inspections.',text:'Build fast. No local votes, no safety checks.',result:'Homes go up fast. Then a building collapses, and three people die. Your housing minister quits.',fx:{approval:6,budget:-3,order:6,trust:-15,liberty:-6},rival:{open:7,closed:4},rq:{open:'Three people died in your rushed buildings. Shame.',closed:'Your news calls it an accident. Everyone knows the truth.'},power:{bypass:true,local:true},harm:{deaths:3,resigned:'Housing minister'},scene:'protest'}]},
 {title:'AI did my homework',prompt:'Students use AI for homework. Teachers want proof of learning. Families want useful tech skills.',
  learn:'Punishing someone without fair steps, like a hearing, skips <b>due process</b>. Who sets school rules is a <b>federalism</b> question.',
  choices:[
  {title:'Let each state decide',text:'States test their own AI rules.',result:'States try different rules. Families who move face new rules, and some schools struggle.',fx:{order:-6,trust:6,liberty:6},rival:2,rq:'Three states, three rules. What a mess.',power:{local:true,input:true},scene:'school'},
  {title:'One national AI rule',text:'Pass one rule for every school.',result:'Rules become clear everywhere. It costs money, and states say you took their power.',fx:{order:6,budget:-6,trust:3,approval:3,liberty:-3},rival:3,rq:'The capital knows best? Families hate being told.',power:{national:true},scene:'hearing'},
  {title:'Auto-suspend flagged students',text:'If AI software flags work, suspend the student.',result:'Cheating drops. Then the software flags forty honest students. Courts order fair hearings. Your education chief quits.',fx:{order:9,budget:3,trust:-12,liberty:-12,approval:-3},rival:{open:6,closed:3},rq:'You suspended honest kids. Their parents are calling me.',power:{rights:true},harm:{resigned:'Education chief'},scene:'court'}]},
 {title:'The protest shuts down downtown',prompt:'Rent protesters block downtown for days. Most are peaceful, but a few break windows.',
  learn:'The U.S. First Amendment protects <b>peaceful assembly</b> (protest) and a free press. Breaking windows is still a crime.',
  choices:[
  {title:'Protect the protest',text:'Keep it open. Charge only people who did damage.',result:'Peaceful critics keep their voice. Downtown stays blocked for a week, and shop owners are furious.',fx:{order:-9,liberty:12,trust:9,approval:-3,budget:-3},rival:5,rq:'Downtown is shut and you let it happen. Weak.',power:{input:true},scene:'protest'},
  {title:'Short safety zone',text:'Limit the area for 3 days. Courts can review it.',result:'Damage stops. Some peaceful people are moved too. A judge reviews the limits.',fx:{order:6,liberty:-3,trust:3,budget:-3,approval:3},rival:1,rq:'A safety zone with a judge watching. Fine, I guess.',power:{review:true},scene:'court'},
  {title:'Arrest leaders. Block the news.',text:'No hearings. Shut down protest coverage.',result:'The streets clear. Clashes leave twelve hurt and one dead. Workers call a national strike.',fx:{order:12,liberty:-21,trust:-18,approval:-6,budget:-3},rival:{open:9,closed:-10},rq:{open:'You jailed protesters. I’m calling for impeachment.',closed:'They arrested my organizers. This isn’t over.'},power:{rights:true,bypass:true},harm:{deaths:1,injuries:12,strike:true},scene:'protest'}]},
 {title:'An AI fake could cost you the vote',prompt:'A vote is days away. A fake AI video of Vera Kane goes viral. Your supporters say: stop the vote.',
  promptClosed:'Your government holds a vote to look fair. A fake AI video of Vera Kane goes viral. Your inner circle says: cancel it.',
  learn:'In a republic, leaders must accept the vote count. Congress can remove a leader who breaks the law (<b>impeachment</b>). That is a <b>check and balance</b>.',
  learnClosed:'Many autocracies hold votes, but leaders control the result. Without a fair vote, people have no peaceful way to replace a ruler.',
  choices:[
  {title:'Keep voting. Show the evidence.',text:'Election workers explain the fake. Accept the count.',result:'Voting continues. Election workers show the video is fake.',fx:{trust:12,liberty:9,order:-3,budget:-3},rival:4,rq:'Let the people decide. I like my chances.',power:{election:true},scene:'voting'},
  {title:'Ask a court to check',text:'Voting stays open while a judge reviews it.',result:'A judge reviews the evidence. Voting goes on. Your supporters grow impatient.',fx:{trust:6,liberty:3,order:3,budget:-3,approval:3},rival:3,rq:'Courts? You’re stalling. Voters can see it.',power:{review:true,election:true},scene:'court'},
  {title:'Cancel the vote. Arrest Vera.',text:'Say the fake proves she cheated.',result:'Crowds clash, and six people are hurt.',resultOpen:'Your guards refuse the order. Crowds clash. Congress impeaches and removes you.',resultClosed:'Vera is jailed. Crowds clash, and six people are hurt. Fear spreads.',fx:{trust:-24,liberty:-27,order:-6},rival:{open:30,closed:-20},rq:{open:'You tried to cancel an election. Congress just handed me the keys.',closed:'You can jail me. You can’t jail what people think.'},power:{cancelElection:true,rights:true,bypass:true},harm:{injuries:6},scene:'protest'}]}
];

/* ---------- Surprise events: caused by the student's own meters and choices ---------- */
const surprises=[
 {id:'rebellion',icon:'🔥',title:'Armed rebellion!',kicker:'REBELLION',
  when:c=>c.abuses>=2&&c.m.trust<32,why:c=>'You cut people’s rights '+c.abuses+' times, and trust fell to '+c.m.trust+'.',
  prompt:c=>'Rebels seize the capitol building in '+c.hotState+'. They say you broke the rules.',
  learn:'When people think peaceful change is impossible, some turn to <b>insurrection</b> (violent uprising). Constitutions offer peaceful ways to change leaders instead.',
  choices:[
  {title:'Negotiate. Restore rights.',text:'Free prisoners. Promise fair elections.',result:'The rebels leave the capitol. Your supporters call you weak.',fx:{trust:9,liberty:9,order:-3,approval:-3},rival:6,rq:'Even you had to back down. People noticed.',scene:'hearing',calm:true},
  {title:'Send in the army',text:'Retake the capitol by force.',result:'The army retakes the capitol. Five people die. Other states watch, angry.',fx:{order:12,trust:-15,liberty:-9},rival:{open:8,closed:-5},rq:{open:'Soldiers against citizens. History will judge you.',closed:'You won today. Every funeral makes us stronger.'},power:{rights:true,bypass:true},harm:{deaths:5,injuries:20},scene:'protest'}]},
 {id:'coup',icon:'🪖',title:'Coup attempt!',kicker:'COUP ATTEMPT',
  when:c=>(c.has.army&&(c.rival>=55||c.m.trust<35))||(!c.open&&c.rival>=65),
  why:c=>(c.has.army?'You built an Army Base, and ':'')+(c.rival>=55?'Vera Kane’s power reached '+c.rival+'.':'trust fell to '+c.m.trust+'.'),
  prompt:()=>'Tanks roll toward the capital. Some generals say Vera Kane should lead.',
  learn:'A <b>coup</b> is a takeover by force, often by the military. In this game, high public trust makes a coup much harder.',
  choices:[
  {title:'Call on people to resist',text:'Ask citizens and courts to stand with you.',test:c=>c.m.trust>=45,
   result:'Crowds block the tanks. Soldiers refuse to fire. The coup fails.',resultFail:'Too few people stand with you. The generals take the capital.',
   fx:{order:-6,trust:6},rival:-20,rq:'The crowds chose you. This time.',rqFail:'The army chose me. Pack your office.',scene:'coup'},
  {title:'Pay the generals off',text:'Give them a huge raise to stand down.',result:'The tanks turn back. Now the generals expect more money.',fx:{budget:-15,order:3,trust:-6},rival:-8,rq:'You bought them once. Can you afford it twice?',scene:'coup'}]},
 {id:'strike',icon:'✊',title:'General strike!',kicker:'GENERAL STRIKE',
  when:c=>c.m.budget<35||(c.has.factory&&c.m.budget<48),
  why:c=>c.has.factory?'Your Factory workers want a raise, and the budget is down to '+c.m.budget+'.':'The budget is down to '+c.m.budget+'.',
  prompt:()=>'Workers say pay is too low. Factories and buses stop. Shelves empty.',
  learn:'Who owns the factories is an <b>economic system</b> question. It is separate from who rules.',
  choices:[
  {title:'Government takes over the plants',text:'The state runs the factories and sets pay.',result:'Workers return. Owners sue, and some investors leave.',fx:{budget:-6,approval:6,order:3,liberty:-3},rival:3,rq:'Grabbing businesses? Wait until the bills come.',power:{seize:true},scene:'strike'},
  {title:'Owners and unions bargain',text:'Let them work out a deal.',result:'Talks drag on for two weeks. A deal raises pay a little.',fx:{budget:-3,order:-6,approval:3,trust:3},rival:2,rq:'Two weeks of empty shelves. Nice leadership.',power:{market:true},scene:'strike'},
  {title:'Order workers back. Fire leaders.',text:'Ban the strike. No talks.',result:'Buses run again. Fired strikers fill the streets.',fx:{order:9,budget:6,trust:-12,liberty:-12,approval:-6},rival:{open:6,closed:-3},rq:{open:'Firing workers for striking? I’m with the workers.',closed:'Fire them all. They’ll come to us.'},power:{rights:true},scene:'strike'}]},
 {id:'protest',icon:'📣',title:'Thousands march on the capital',kicker:'MASS PROTEST',
  when:c=>c.m.trust<40||c.m.approval<35,why:c=>c.m.trust<40?'Public trust fell to '+c.m.trust+'.':'Approval fell to '+c.m.approval+'.',
  prompt:()=>'People are angry about your choices. A huge march heads for your office.',
  learn:'<b>Civil liberties</b> include the right to protest. Protest warns leaders that people are unhappy.',
  choices:[
  {title:'Meet the march leaders',text:'Listen. Promise one real change.',result:'You listen and promise a change. Some marchers stay angry, but it ends peacefully.',fx:{approval:6,trust:6,order:-3,budget:-3},rival:-3,rq:'A photo op with protesters. Cute.',scene:'hearing'},
  {title:'Curfew and mass arrests',text:'Clear the streets by night.',result:'The streets empty. Eight people are hurt. Anger moves underground.',fx:{order:9,liberty:-15,trust:-9},rival:{open:6,closed:-6},rq:{open:'Arrests for marching? I’ll march next.',closed:'Curfews can’t stop whispers.'},power:{rights:true},harm:{injuries:8},scene:'protest'}]},
 {id:'chaos',icon:'🌃',title:'Looting after dark',kicker:'CHAOS IN THE STREETS',
  when:c=>c.m.liberty>=65&&c.m.order<40,why:c=>'Freedom is high ('+c.m.liberty+'), but order fell to '+c.m.order+'.',
  prompt:()=>'Police are stretched thin. Stores are looted at night. Shop owners want action.',
  learn:'Governments must protect both <b>order</b> and <b>rights</b>. Too little order can hurt people, too.',
  choices:[
  {title:'Hire more officers',text:'Expensive, but no new limits on rights.',result:'Night patrols grow. Looting slows. The bill is huge.',fx:{budget:-12,order:9},rival:2,rq:'Spending your way out again?',scene:'shops'},
  {title:'National Guard for 10 days',text:'Troops patrol. The order ends on its own.',result:'Looting stops. Some residents feel watched. The order expires on time.',fx:{order:12,liberty:-6,budget:-3},rival:1,rq:'Troops on our streets. Ten days, you said.',power:{review:true},scene:'shops'}]},
 {id:'scandal',icon:'📰',title:'Vera Kane leaks a scandal',kicker:'RIVAL SCHEME',
  when:c=>c.rival>=45,why:c=>'Vera Kane’s power is '+c.rival+'. She’s ready to strike.',whyForced:()=>'Vera Kane has been digging through your government.',
  prompt:()=>'Leaked papers say your treasury chief took bribes. Everyone is talking about it.',
  learn:'A <b>free press</b> lets citizens check their leaders. It is a check on power outside government.',
  choices:[
  {title:'Independent investigation',text:'Let outside investigators dig.',result:'Investigators confirm the bribes. Your treasury chief resigns. People respect the honesty.',fx:{approval:-6,trust:9,budget:-3},rival:-6,rq:'You cleaned house. Annoying.',harm:{resigned:'Treasury chief'},scene:'court'},
  {title:'Call it fake. Sue the reporters.',text:'Attack the story and the messenger.',result:'Your base cheers. Reporters are scared to dig. Vera says you are hiding something.',fx:{approval:3,trust:-9,liberty:-9},rival:6,rq:'Suing reporters? Sounds like guilt.',power:{rights:true},scene:'scandal'}]}
];
const surprisePriority=['rebellion','coup','strike','protest','chaos','scandal'];

/* ---------- One law (with a sentence stem) ---------- */
const lawIdeas=[
 {id:'rights',topic:'Protest rights',text:'People can criticize the government and protest peacefully.',rq:'Protest rights? I’ll use them on you.'},
 {id:'emergency',topic:'Emergency limits',text:'Emergency powers end after 30 days unless lawmakers vote to keep them.',rq:'Time limits on your power. Finally.'},
 {id:'voting',topic:'Fair votes',text:'Every adult citizen can vote, and the public can check the count.',rq:'Fair votes? See you at the ballot box.'},
 {id:'privacy',topic:'Privacy',text:'Police need a warrant from a judge to search plate camera records.',rq:'Warrants for cameras. Who are you protecting?'},
 {id:'own',topic:'My own idea',text:'',rq:'A new law. Let’s see if you follow it.'}
];

/* ---------- Endings ---------- */
const endings={
 thriving:{title:'Thriving Republic',icon:'🏛️🎉',tone:'good'},
 divided:{title:'Divided but Standing',icon:'⚖️😬',tone:'mid'},
 crackdown:{title:'One-Party Crackdown',icon:'🔒🪖',tone:'dark'},
 revolution:{title:'Revolution',icon:'🔥✊',tone:'bad'},
 collapse:{title:'Collapse',icon:'💸🏚️',tone:'bad'},
 takeover:{title:'Rival Takeover',icon:'👑🦊',tone:'bad'}
};

/* ---------- End check: apply-it questions about the student's own country ---------- */
function endChecks(s,countryName){
 const C=countryName||'your country';
 const own={capitalism:'Private owners who keep the profit',mixed:'Private owners, following public rules',socialism:'The public or its workers, together',communism:'The state, in the name of everyone'};
 const stop={courts:'A court can cancel the order',congress:'Lawmakers can refuse to pay for it',time:'It expires unless lawmakers renew it',none:'Nothing in the system can stop it'};
 const ownOthers=s.ownership==='capitalism'||s.ownership==='mixed'?['The workers who run it, together','The state, which plans what it makes']:['Private owners who keep the profit','Private owners, following public rules'];
 const stopOthers=s.oversight==='none'?['A court can cancel the order','Lawmakers can refuse to pay for it']:Object.keys(stop).filter(k=>k!==s.oversight&&k!=='none').slice(0,1).map(k=>stop[k]).concat(stop.none);
 return [
  {id:'end-economy',scene:'A new phone company opens in '+C+'. You chose '+words[s.ownership].name+'.',ask:'Who most likely owns it?',answer:own[s.ownership],wrong:ownOthers,why:words[s.ownership].name+': '+words[s.ownership].text},
  {id:'end-checks',scene:'Your leader signs an order that breaks the constitution of '+C+'.',ask:'Under your setup, what happens next?',answer:stop[s.oversight],wrong:stopOthers,why:checkMeaning[s.oversight]},
  {id:'end-dueprocess',scene:'AI software flags a student’s essay as cheating in '+C+'.',ask:'What would due process give that student?',answer:'A fair hearing before any punishment',wrong:['A quick suspension, then an appeal','A class vote on the punishment'],why:'Due process means fair legal steps before punishment, like a hearing where you can explain.'},
  {id:'end-liberty',scene:'In your year, police wanted license plate cameras in '+C+'.',ask:'What was the real trade-off?',answer:'Public safety versus personal privacy',wrong:['Jobs for workers versus pollution','School funding versus lower taxes'],why:'Plate cameras can help find stolen cars, but they collect records of where people drive. That is safety versus a civil liberty: privacy.'}
 ];
}
function setupChecks(s,countryName){
 const C=countryName||'your country';
 const law={democracy:'Every citizen votes on it directly',republic:'Elected lawmakers vote, inside constitutional limits',oligarchy:'A few rich families decide in private',autocracy:'The leader decides alone, with no real check',totalitarian:'The one ruling party decides and silences critics'};
 const near={democracy:['republic','autocracy'],republic:['democracy','oligarchy'],oligarchy:['autocracy','republic'],autocracy:['oligarchy','totalitarian'],totalitarian:['autocracy','democracy']};
 const split={federal:'The state can, but national law still applies',unitary:'National leaders decide, and the state must follow',confederate:'The state decides, and the center cannot overrule it'};
 return {
  polity:{id:'setup-polity',scene:'Vera Kane wants a four-day school week in '+C+'.',ask:'How would that become law?',answer:law[s.polity],wrong:near[s.polity].map(k=>law[k]),why:words[s.polity].name+': '+words[s.polity].text},
  division:{id:'setup-division',scene:s.regions[0]+' wants its own rule banning phones in class.',ask:'In '+C+', who gets to decide?',answer:split[s.division],wrong:Object.keys(split).filter(k=>k!==s.division).map(k=>split[k]),why:words[s.division].name+': '+words[s.division].text}
 };
}
const ranks={
 thriving:['Founder of a Free Republic','Steady Constitutional Leader'],
 divided:['Survivor of a Hard Year','Barely Holding On'],
 crackdown:['Iron-Fisted Ruler','Fearful Dictator'],
 revolution:['Toppled by Your Own People','Toppled by Your Own People'],
 collapse:['Captain of a Sinking Ship','Captain of a Sinking Ship'],
 takeover:{election:['Gracious Loser: the System Worked','Voted Out of Office'],impeached:['Removed by Checks and Balances','Removed by Checks and Balances'],coup:['Overthrown by the Generals','Overthrown by the Generals'],rival:['Outplayed by Vera Kane','Outplayed by Vera Kane']}
};

const E={words,fresh,addRule,isOpen,setup,checkNames,checkMeaning,setupWarnings,approachFor,places,rival,governanceEvents,surprises,surprisePriority,lawIdeas,endings,endChecks,setupChecks,ranks};
if(typeof module!=='undefined'&&module.exports)module.exports=E;else root.CountryCreator=E;
})(typeof window!=='undefined'?window:this);
