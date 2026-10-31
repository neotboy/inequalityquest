'use strict';
/* ===== STRANDED: GOVERN OR COLLAPSE — story data and rules =====
   Meters: 0 Supplies, 1 Safety, 2 Trust, 3 Freedom. Ren = rival power (0-100).
   Everything here is a fictional game outcome, not a claim about real events. */
const START_STATS=[55,50,50,50], START_REN=30, TOTAL_STEPS=10;
const labels=['Supplies','Safety','Trust','Freedom'];
const judgeName=s=>({council:'Ash, your elected judge,',direct:'The whole camp',ren:'Ren'}[s.flags.model]||'Ash');
const BEATS=[
{id:'barrel',loc:'water',title:'The Last Barrel',tag:'WHY HAVE A GOVERNMENT?',concept:'Social contract',
 story:()=>'Day 1 on the island. Ren grabs the only barrel of fresh water: “I decide who drinks.” Thirty thirsty people start shouting.',
 choices:[
 {t:'Make water rules together',sub:'Everyone gives up a little freedom',d:[0,5,6,-8],ren:-5,say:'Fine. Talk all you want. I’m still thirsty.',head:'A deal everyone agrees to',res:'Two cups each a day, and nobody grabs. Everyone gave up some freedom to get safety.',learn:'You just made a <b>social contract</b>: people agree to give up some freedom so a government can protect them.',key:'Made water rules together',flags:{water:1,power:'Shared rules'}},
 {t:'Let Ren guard the barrel',sub:'Fast order, one person in charge',d:[5,10,-8,-10],ren:15,say:'Smart. Somebody has to be in charge.',head:'Ren holds the ladle',res:'Ren’s crew hands out water. The line is calm, but Ren’s friends drink first.',learn:'You traded freedom for order. That trade is the heart of a <b>social contract</b>. But nobody set <b>limits</b> on Ren’s power. That will matter.',key:'Let Ren guard the water',flags:{water:1,power:'Ren’s crew'}},
 {t:'No rules. Take your share',sub:'Total freedom, no one in charge',d:[-15,-10,-5,10],ren:5,say:'See? Without me, it’s chaos.',head:'The barrel tips over',res:'A shoving match knocks the barrel over. Half the water soaks into the sand.',learn:'Thinker Thomas Hobbes called life with no government the <b>state of nature</b>: a free-for-all where the strong win. Avoiding it is one reason people create government.',key:'No rules, everyone grabbed',flags:{water:0},art:'fight'}]},
{id:'power',loc:'hall',title:'Who Holds the Power?',tag:'THREE POWERS',concept:'Three powers',
 story:()=>'Every camp needs three jobs done: make the rules, carry them out, and settle fights about them. Who gets those jobs?',
 choices:[
 {t:'Elect a council; split the jobs',sub:'Slower, but power is shared',d:[-5,-5,6,5],ren:-10,say:'A committee? We’ll starve waiting for a vote.',head:'Three jobs, three hands',res:'A 5-person council writes rules. Jo carries them out. Ash judges disputes.',learn:'Every government has three powers: <b>legislative</b> (make rules), <b>executive</b> (carry them out), and <b>judicial</b> (settle disputes). You split them up, and you elected leaders: a <b>representative democracy</b> (republic).',key:'Elected council, split the 3 powers',flags:{model:'council',rules:1,power:'Elected council'}},
 {t:'All 30 vote on every rule',sub:'Everyone has a say; meetings run long',d:[-8,-8,4,10],ren:-5,say:'Thirty people arguing? Good luck.',head:'Everybody votes',res:'Every rule gets a camp-wide vote. Meetings run until dark, and chores wait.',learn:'That’s a <b>direct democracy</b>, like ancient Athens or New England town meetings. The whole group shares <b>legislative</b> power (making rules). Someone still needs <b>executive</b> (carry out) and <b>judicial</b> (settle disputes) power.',key:'Direct democracy: all 30 vote',flags:{model:'direct',rules:1,power:'Whole camp votes'}},
 {t:'Ren does all three jobs',sub:'Quick decisions, no one checks him',d:[5,10,-10,-12],ren:20,say:'Finally, someone with sense.',head:'One man, three jobs',res:'Ren makes the rules, enforces them, and decides who broke them. Things move fast.',learn:'When one person holds all three powers, <b>legislative</b> (make rules), <b>executive</b> (carry them out), and <b>judicial</b> (settle disputes), that’s an <b>autocracy</b>: rule by one person.',key:'Autocracy: Ren holds all 3 powers',flags:{model:'ren',rules:1,power:'Ren rules alone'}}]},
{id:'thief',loc:'camp',title:'The Night Thief',tag:'KEEPING ORDER',concept:'Justice & order',
 story:s=>`Food vanished from the store last night. Jo caught Kai with the empty bag. Kai says, “My little brother was starving.” ${judgeName(s).replace(/,$/,'').replace(/^Ash, your elected judge/,'Ash, your judge')} must decide.`,
 choices:[
 {t:'Hold a fair hearing first',sub:'Both sides speak; takes a day',d:[-5,0,6,5],ren:-5,say:'A trial for a thief? You’re soft.',head:'Both sides are heard',res:s=>`${judgeName(s)} hears Kai and Jo. Kai must work extra shifts to pay the food back.`,learn:'Deciding what a rule means and settling disputes is <b>judicial power</b>. Fair hearings <b>establish justice</b>, a purpose of government in the U.S. Preamble.',key:'Fair hearing for the thief'},
 {t:'Punish Kai in front of everyone',sub:'Scares others; some call it cruel',d:[5,10,-10,-8],ren:10,say:'Now they’ll think twice.',head:'A public punishment',res:'Kai gets no food for three days while everyone watches. Thefts stop. Whispers start.',learn:'Enforcing rules is <b>executive power</b>. Skipping the hearing means no one used <b>judicial power</b> to check if the punishment was fair.',key:'Public punishment, no hearing'},
 {t:'Let it go. People are hungry',sub:'Kind, but rules mean less',d:[-10,-10,5,5],ren:0,say:'A rule nobody enforces isn’t a rule.',head:'Two more bags gone',res:'Kai is grateful. By morning, two more bags of food are missing.',learn:'A rule only keeps order if someone carries it out (<b>executive power</b>) and settles fights about it (<b>judicial power</b>). Keeping order is a main job of government.',key:'Let the thief go',art:'raid'}]},
{id:'ship',loc:'watch',title:'Ship on the Horizon',tag:'WHAT MAKES A STATE?',concept:'Four features of a state',
 story:()=>'A ship anchors offshore. Its captain shouts: “This island belongs to the Coral Trading Company. Hand over half your food, or leave.”',
 choices:[
 {t:'We rule ourselves here',sub:'Stand firm, risk a fight',d:[0,-10,6,5],ren:-5,say:'Brave. Let’s hope they don’t come back angry.',head:'A flag on the ridge',res:'You raise a flag and post a watch. The ship circles, then sails away. For now.',learn:'You claimed <b>sovereignty</b>: final say over your own land. A <b>state</b> needs four things: people (population), land (territory), a government, and sovereignty. Your island has all four.',key:'Declared independence',flags:{guard:1}},
 {t:'Pay the company to leave us be',sub:'Safer, but outsiders get a say',d:[-12,10,-5,-5],ren:0,say:'Paying strangers? Weak.',head:'Protection money',res:'The company takes food every month. In return, its ship keeps pirates away.',learn:'You still have people, land, and a government. But the company now controls your choices, so you lost <b>sovereignty</b> (final say over your own land), one of the four features of a <b>state</b>.',key:'Paid the company'},
 {t:'Send Ren to cut a deal',sub:'Ren talks; you stay out of it',d:[5,5,-10,0],ren:15,say:'Leave the talking to me.',head:'Ren’s side deal',res:'Ren lets the company use the north beach. In return he gets tools only his crew can use.',learn:'Ren gave away part of your <b>territory</b> (land). A <b>state</b> needs four things: population, territory, government, and sovereignty (final say over its land).',key:'Ren made a deal (gave up land)'}]},
{id:'claim',loc:'grove',title:'Who Has the Right to Rule?',tag:'WHERE DOES POWER COME FROM?',concept:'Origins of government',
 story:()=>'Ren climbs on a crate: “God spared me in that shipwreck. I was chosen to lead.” Old Mara says her big family has always led. Others want a vote.',
 choices:[
 {t:'Hold an election for leader',sub:'Power comes from the people',d:[-5,-5,6,5],ren:-15,say:'Votes? Fine. I won’t forget this.',head:'The people choose',res:'Everyone votes. Jo wins. Ren gets 6 votes, all from his own crew.',learn:'That’s <b>social contract theory</b>: government gets its power from the people’s agreement (consent). Other theories: <b>evolutionary</b> (grew out of families), <b>divine right</b> (God chose the ruler), <b>force</b> (taken by strength).',key:'Election (social contract)'},
 {t:'Let Mara’s family lead',sub:'Tradition: families grow into tribes',d:[5,5,-5,-5],ren:-5,say:'An old woman and her cousins? Really?',head:'The family takes charge',res:'Mara’s family runs the grove and farms well. People outside the family feel left out.',learn:'That’s <b>evolutionary theory</b>: government slowly grew from families into clans, then tribes. Other theories: <b>social contract</b> (people agree), <b>divine right</b> (God chose the ruler), <b>force</b> (taken by strength).',key:'Mara’s family (evolutionary)'},
 {t:'Accept Ren as “chosen”',sub:'No vote, no questions',d:[0,10,-10,-10],ren:20,say:'At last, you see it.',head:'Ren, the chosen one',res:'Ren’s crew cheers. Anyone who questions him is told they are questioning God.',learn:'That’s <b>divine right</b>: a ruler claims God gave them the right to rule, so no one may question them. European kings used this claim for centuries. Watch for the fourth theory, <b>force</b>.',key:'Ren is “chosen” (divine right)',flags:{power:'Ren, “chosen”'}}]},
{id:'storm',loc:'water',title:'The Storm',tag:'PURPOSES OF GOVERNMENT',concept:'Purposes of government',
 story:()=>'A storm smashes the water station and knocks down the lookout. You only have enough for one big repair.',
 choices:[
 {t:'Fix the water for everyone',sub:'Costs 15 supplies',need:15,d:[-15,0,8,0],ren:0,say:'Water won’t stop the next ship.',head:'Clean water flows',res:'Jo rebuilds the station. Everyone drinks, but the lookout lies in pieces.',learn:'You chose to <b>promote the general welfare</b>: help with needs everyone shares. It’s one of six purposes of government in the U.S. Preamble.',key:'Fixed water (general welfare)',flags:{water:2}},
 {t:'Rebuild the lookout',sub:'Costs 15 supplies',need:15,d:[-15,15,-5,0],ren:5,say:'Good. Eyes on the water.',head:'Eyes on the sea',res:'The lookout stands again. People drink muddy rainwater for a week.',learn:'You chose to <b>provide for the common defense</b>: protect against outside threats. It’s one of six purposes of government in the U.S. Preamble.',key:'Rebuilt lookout (common defense)',flags:{guard:2}},
 {t:'Save supplies, fix nothing',sub:'Keep supplies for later',d:[5,-10,-10,0],ren:0,say:'So the leaders just… wait? Interesting.',head:'Waiting it out',res:'You keep your supplies. Three people get sick from bad water, and nobody watches the sea.',learn:'Doing nothing is still a <b>public policy</b> (a government’s plan for a problem). People feel it when shared needs go unmet.',key:'Saved supplies, fixed nothing',art:'storm'}]},
{id:'emergency',loc:'camp',title:'Emergency Powers',tag:'LIMITS ON POWER',concept:'Limited government',
 story:s=>(s.flags.model==='ren'||s.renControl)?'Ash posts notes mocking Ren. Ren wants more: “Ban criticism. Let my crew search any tent, any time.”':'Ash posts notes mocking the leaders. Ren sees his chance: “Give me emergency powers. Ban criticism. Let my crew search any tent.”',
 choices:[
 {t:'No. Leaders follow rules too',sub:'Protects rights; Ren’s crew is angry',d:[0,-10,5,12],ren:-15,say:'You’ll regret tying my hands.',head:'Rights stay protected',res:'Ash keeps posting notes. Ren’s crew stops helping with the night watch.',learn:'That’s <b>limited government</b>: leaders’ power has limits, and people keep rights like free speech. The U.S. Constitution and Bill of Rights work this way.',key:'Refused: leaders have limits'},
 {t:'Yes, until the crisis ends',sub:'More order, fewer freedoms',d:[0,15,-10,-20],ren:20,say:'Finally. Now I can keep order.',head:'Ren’s crew moves in',res:'Ash’s notes are torn down. Ren’s crew searches tents at night. No end date is set.',learn:'Emergency powers can bring order. But power with no limits and no end date goes against <b>limited government</b>: the idea that leaders’ power must have limits.',key:'Gave Ren emergency powers',art:'riot',flags:{power:'Ren’s emergency rule'}},
 {t:'Searches only with a judge’s OK',sub:'Middle path; slower and costly',d:[-8,5,0,-5],ren:0,say:'Paperwork. Fine. I can be patient.',head:'A check on power',res:'Ash can keep criticizing. Ren’s crew can search a tent only if a judge agrees there’s good reason.',learn:'Needing a judge’s OK is a check on power, like the <b>warrants</b> in the U.S. Fourth Amendment. It’s an example of <b>limited government</b>.',key:'Searches need a judge’s OK'}]},
{id:'charter',loc:'hall',title:'The Charter',tag:'YOUR FINAL CALL',concept:'Preamble purposes',pick2:true,
 story:()=>'Rescue may never come. Write your island’s charter (founding plan). It only has room for two promises.',
 choices:[
 {t:'Form a more perfect union',sub:'Unite everyone as one community',d:[0,0,8,0],ren:-3},
 {t:'Establish justice',sub:'Fair rules and fair trials',d:[0,0,5,3],ren:-3},
 {t:'Insure domestic tranquility',sub:'Keep peace inside the camp',d:[0,8,0,0],ren:3},
 {t:'Provide for the common defense',sub:'Protect against outsiders',d:[-3,8,0,0],ren:3},
 {t:'Promote the general welfare',sub:'Care for shared needs like food',d:[8,0,0,0],ren:0},
 {t:'Secure the blessings of liberty',sub:'Protect people’s freedoms',d:[0,0,0,8],ren:-5}]}
];
/* Surprise events: checked in this order after beats 1-7. Max 3 per game, never two in a row. */
const EVENTS=[
{id:'coup',title:'Ren Seizes the Ridge',art:'riot',min:2,when:s=>s.ren>=65&&!s.renControl,cause:'Ren’s power got too high.',
 story:'At dawn, Ren’s crew takes the lookout and the food store. “From now on, I give the orders.”',
 choices:[
 {t:'Rally the camp against Ren',sub:'Works only if people trust you',fn:s=>s.stats[2]>=50?{d:[0,-10,5,0],ren:-30,head:'The camp stands up',res:'Thirty people march up the ridge. Ren’s crew backs down and hands over the store.',say:'This isn’t over.',key:'Rallied the camp (won)'}:{d:[0,-10,-10,-10],ren:10,head:'Not enough followers',res:'Only a few people trust you enough to follow. Ren’s crew pushes you back down the hill.',say:'Nobody follows you. They follow me.',key:'Rallied the camp (failed)',flags:{power:'Ren took control'},control:true}},
 {t:'Cut a deal: Ren runs the guards',sub:'Avoids a fight; Ren gets stronger',d:[0,10,-5,-10],ren:10,say:'Now we understand each other.',head:'A deal with Ren',res:'No one gets hurt. Ren’s crew now guards the store and the ridge.',key:'Deal: Ren runs the guards',flags:{power:'Ren runs the guards'},control:true}],
 learn:'This is the <b>force theory</b>: a person or group takes power by strength and makes everyone obey.'},
{id:'rebels',title:'Rebels in the Night',art:'fire',min:2,when:s=>s.stats[3]<=30,cause:'Freedom dropped very low.',
 story:'Someone cuts the lookout ropes and leaves a note: “We never agreed to this.”',
 choices:[
 {t:'Listen to the rebels’ demands',sub:'Give back some freedoms',d:[0,-5,5,15],ren:-10,say:'You’re rewarding criminals.',head:'Talks at the fire',res:'The rebels come out of hiding. You give back the right to meet and speak freely.',key:'Listened to rebels'},
 {t:'Hunt down the rebels',sub:'Order now; anger later',d:[0,5,-15,-5],ren:10,say:'Finally, some backbone.',head:'Tents torn apart',res:'Guards search every tent. Two rebels are caught. Many more are now angry.',key:'Hunted the rebels'}],
 learn:'Thinker John Locke argued that when a government abuses its power, people have the right to change it. That idea shaped the Declaration of Independence.'},
{id:'mutiny',title:'Nobody Shows Up',art:'riot',min:1,when:s=>s.stats[2]<=35,cause:'Trust dropped low.',
 story:'Nobody shows up for work duty. A sign on the meeting circle reads: “Why follow rules we never agreed to?”',
 choices:[
 {t:'Call an open meeting',sub:'Listen first; work waits',d:[-5,-5,15,0],ren:-5,say:'Meetings. Always meetings.',head:'Everyone gets a say',res:'People air their anger. By nightfall, most agree to go back to work.',key:'Open meeting'},
 {t:'Order guards to force work',sub:'Gets work done; people resent it',d:[10,5,-10,-10],ren:10,say:'See? Fear works.',head:'Work at spear-point',res:'The guards march people to the fields. The work gets done in silence.',key:'Forced work'}],
 learn:'A government works best with the <b>consent of the governed</b>: people’s agreement to its power.'},
{id:'raid',title:'Raid on the Storehouse',art:'raid',min:1,when:s=>s.stats[0]<=25,cause:'Supplies ran low.',
 story:'Hungry people break into the storehouse at night. Two get hurt in the scramble.',
 choices:[
 {t:'Post a night guard',sub:'Protects food; fewer freedoms',d:[5,10,-5,-5],ren:5,say:'Put my crew on it.',head:'Locked and guarded',res:'Guards watch the store all night. The raids stop, and so do late-night walks.',key:'Posted a night guard'},
 {t:'Split what’s left equally',sub:'Fair, but food runs out sooner',d:[-5,-5,10,0],ren:0,say:'Sharing won’t fill empty crates.',head:'Equal shares',res:'Every person gets the same small share. Fights stop, but the crates are almost empty.',key:'Split food equally'}],
 learn:'When resources run out, keeping order gets harder. <b>Maintaining order</b> is one of government’s main jobs.'},
{id:'chaos',title:'Free-for-All on the Beach',art:'fight',min:2,when:s=>s.stats[3]>=60&&s.stats[1]<=40,cause:'Lots of freedom, not much order.',
 story:'With few rules and nobody enforcing them, two groups fight over the only boat. Someone gets hurt.',
 choices:[
 {t:'Set a curfew and boat rules',sub:'Order returns; freedom shrinks',d:[0,15,0,-10],ren:5,say:'Rules. Told you so.',head:'Rules for the boat',res:'The boat gets a sign-up sheet and a curfew. People grumble, but the fighting stops.',key:'Curfew and boat rules'},
 {t:'Let them work it out',sub:'Freedom stays; risk grows',d:[-10,-10,0,5],ren:5,say:'Enjoy your freedom. I’ll wait.',head:'The boat is wrecked',res:'The fight ends when the boat hits the rocks. Nobody gets to use it now.',key:'Let them fight it out'}],
 learn:'Freedom needs some order to feel safe. <b>Maintaining order</b> is a main job of government, and too little can be as dangerous as too much.'},
{id:'fever',title:'Fever in Camp',art:'storm',min:3,when:s=>!s.events.length,cause:'Bad luck, and a crowded camp.',
 story:'A fever spreads through the tents. Five people are sick, and medicine is low.',
 choices:[
 {t:'Use medicine on everyone',sub:'Costs supplies',d:[-10,0,10,0],ren:0,say:'Waste it all, then.',head:'Medicine for all',res:'The sick recover. The medicine box is nearly empty.',key:'Medicine for everyone'},
 {t:'Quarantine the sick tents',sub:'Saves supplies; limits freedom',d:[0,5,-5,-10],ren:5,say:'Smart. Keep the sick away.',head:'Tents roped off',res:'Sick tents are roped off and guarded. The fever slows, but families can’t visit.',key:'Quarantined sick tents'}],
 learn:'<b>Promoting the general welfare</b> (public health) sometimes means limiting freedom. Governments face this trade-off for real.'}
];
const ENDINGS={
 dictatorship:{title:'Island Dictatorship',badge:'▲',bonus:0,why:s=>`Ren’s power reached ${s.ren}. ${s.events.includes('coup')?'When his crew seized the ridge, that was the <b>force theory</b> in action.':'Nobody stopped him. Each choice handed him a little more power.'} Now one man makes, enforces, and judges every rule, with no limits. That’s a <b>dictatorship</b>.`},
 collapse:{title:'Collapse',badge:'✕',bonus:2,why:s=>`${worstMeters(s)} fell too low. Without enough order or supplies, your government couldn’t do its basic jobs, and people split into rival camps. This is why societies create government: to <b>maintain order</b> and meet shared needs.`},
 revolution:{title:'Revolution',badge:'✊',bonus:6,why:s=>renOnTop(s)?`Ren grabbed power (${s.ren}), but his crew couldn’t keep order (Safety ${s.stats[1]}). The camp rose up and threw him out. John Locke said people may replace a government that breaks the <b>social contract</b>.`:`${worstMeters(s)} fell too low. People felt the government broke its side of the deal, so they tore it down to start over. John Locke said people may replace a government that breaks the <b>social contract</b>.`},
 republic:{title:'Thriving Republic',badge:'✦',bonus:20,why:s=>`Every meter stayed at 45 or higher, and Ren never gained control. Your people chose their leaders, shared power, and kept limits on it. That’s the <b>social contract</b> and <b>limited government</b> working together.`},
 fragile:{title:'Fragile Peace',badge:'◇',bonus:12,why:s=>`Your camp held together, but ${worstMeters(s)} stayed weak. Every government balances order, freedom, trust, and resources. You kept most of them, but not all.`}
};
function worstMeters(s){const idx=[0,1,2,3].sort((a,b)=>s.stats[a]-s.stats[b]);const low=idx.filter(i=>s.stats[i]<=25);const pick=(low.length?low:[idx[0]]).slice(0,2);return pick.map(i=>labels[i]+' ('+s.stats[i]+')').join(' and ')}
function renOnTop(s){return s.ren>=75||(s.renControl&&s.ren>=60)}
function endingFor(s){const st=s.stats,min=Math.min(...st);
 if(st[0]<=10||st[1]<=15)return 'collapse';
 if(renOnTop(s))return st[1]>=45?'dictatorship':'revolution';
 if(st.filter(n=>n<=20).length>=2)return 'collapse';
 if(st[3]<=25||st[2]<=20)return 'revolution';
 if(min>=45&&s.ren<=45)return 'republic';
 return 'fragile';}
function scoreFor(s,firstTry){const avg=s.stats.reduce((a,b)=>a+b,0)/4;return Math.max(0,Math.min(100,Math.round(avg*0.7+firstTry*5+ENDINGS[endingFor(s)].bonus-Math.max(0,s.ren-50)*0.2)))}
const RANKS=[[85,'Founder of a Free Republic'],[72,'Trusted Island Leader'],[58,'Steady Survivor'],[45,'Shaky Chief'],[30,'Castaway in Chaos'],[0,'Lost at Sea']];
function rankFor(score,ending){if(ending==='dictatorship')return 'Island Tyrant’s Sidekick';const r=RANKS.find(r=>score>=r[0])[1];return (r===RANKS[0][1]&&ending!=='republic')?RANKS[1][1]:r}
function clamp(n){return Math.max(0,Math.min(100,n))}
/* Applies a choice to a state object; returns the resolved outcome. */
function resolveChoice(s,c){const o=c.fn?c.fn(s):c;const before=[...s.stats],rb=s.ren;
 s.stats=s.stats.map((n,i)=>clamp(n+(o.d||[0,0,0,0])[i]));s.ren=clamp(s.ren+(o.ren||0));
 if(o.flags)Object.assign(s.flags,o.flags);if(c.flags&&c.fn)Object.assign(s.flags,c.flags);if(o.control)s.renControl=true;
 return {...o,delta:s.stats.map((n,i)=>n-before[i]),renDelta:s.ren-rb};}
function nextEvent(s){if(s.events.length>=3||s.lastWasEvent)return null;return EVENTS.find(e=>!s.events.includes(e.id)&&s.step>=e.min&&e.when(s))||null}
/* End of each day: people gather food and wood only when camp is safe enough and they trust each other. */
function dailyGather(s){const g=(s.stats[1]>=40&&s.stats[2]>=40)?6:0;s.stats[0]=clamp(s.stats[0]+g);return g}
function impactArt(kind,label){
 const scenes={
  fire:`<path d="M365 110V66l35-25 36 25v44Z" fill="#443634"/><path d="M378 110q-10-19 3-35 2 11 9 13-4-18 10-35 2 18 14 24 14 8 4 33Z" fill="#e46c44" class="flame"/><path d="M392 110q-5-12 4-22 0 8 6 9 8 5 2 13Z" fill="#ffd06b"/>`,
  fight:`<circle cx="376" cy="62" r="18" fill="#d4a67b"/><circle cx="428" cy="62" r="18" fill="#ba906e"/><path d="M342 111q2-37 34-38t34 38M394 111q2-37 34-38t34 38" fill="#654f48"/><path d="m381 83 20-10m-5 1 8-10" stroke="#efaa65" stroke-width="5" stroke-linecap="round"/>`,
  raid:`<path d="M323 93h112v18H323Z" fill="#6a5647"/><path d="m346 92 17-31 15 31m24 0 17-31 14 31" fill="#9d784f"/><circle cx="330" cy="47" r="20" fill="#82908e" opacity=".65"/><circle cx="356" cy="37" r="25" fill="#82908e" opacity=".45"/><path d="M452 111V57m-10 5h20m-20 13h20" stroke="#f2bb67" stroke-width="5"/>`,
  riot:`<path d="M333 111V54h18v57m35 0V43h18v68m34 0V59h18v52" fill="#526067"/><circle cx="342" cy="48" r="11" fill="#cfab88"/><circle cx="394" cy="37" r="11" fill="#cfab88"/><circle cx="444" cy="53" r="11" fill="#cfab88"/><path d="M310 84h190" stroke="#d96f5f" stroke-width="4" stroke-dasharray="8 6"/>`,
  storm:`<path d="M325 52q3-25 31-23 14-27 43-7 29-10 40 16 27-2 32 22h-148Z" fill="#899c9d"/><path d="m358 71-11 23m38-23-11 23m39-23-11 23m39-23-11 23" stroke="#9fd4dc" stroke-width="5"/><path d="M337 111h155" stroke="#557a7d" stroke-width="5"/>`
 };
 const labels={fire:'CAMP ON FIRE',fight:'VIOLENCE AT CAMP',raid:'RAID IN PROGRESS',riot:'MUTINY',storm:'STORM EMERGENCY'};
 return `<svg class="impact-overlay" viewBox="0 0 560 120" aria-hidden="true"><rect x="0" y="0" width="560" height="120" fill="#07191f55"/><path d="M0 108Q100 95 200 107T400 103T560 108v12H0Z" fill="#263b3d"/>${scenes[kind]}<rect x="20" y="14" width="150" height="22" rx="4" fill="#081a20cc"/><text x="32" y="29" fill="#ffd084" font-size="10" font-family="Arial" font-weight="bold" letter-spacing="1.3">${esc(label||labels[kind])}</text></svg>`;
}

/* ===== Game state, screens and turn-in ===== */
const $=s=>document.querySelector(s), KEY='stranded-gov-day1-v3', ASSIGNMENT_ID='gov-stranded-day1', STANDARD='SS.9-12.Gov.1, SS.9-12.Gov.5';
const SUBMIT_URL='https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit';
const locations={water:{x:680,y:460,name:'Water station',icon:'water'},camp:{x:470,y:560,name:'Main camp',icon:'camp'},hall:{x:480,y:365,name:'Meeting circle',icon:'hall'},watch:{x:745,y:320,name:'Lookout ridge',icon:'watch'},dock:{x:290,y:440,name:'Wreck beach',icon:'dock'},grove:{x:305,y:670,name:'Family grove',icon:'grove'}};
const EVENT_LOC={coup:'watch',rebels:'watch',mutiny:'hall',raid:'camp',chaos:'dock',fever:'camp'};
const colors=['#e1ba77','#8dc4cc','#90ccb0','#c5a7de'];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function plain(html){return String(html).replace(/<[^>]+>/g,'')}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function freshState(){return {v:3,started:false,name:'Drift Island',color:'#ffbd69',player:{x:420,y:650},collected:[],step:0,phase:'map',stats:[...START_STATS],ren:START_REN,renControl:false,flags:{water:0,rules:0,guard:0,shelter:0,power:'Unclaimed',model:''},picks:{},eventPicks:{},log:[],events:[],lastWasEvent:false,pending:null,openEvent:null,renSay:'Someone has to take charge. Why not me?',concepts:[],ending:null,check:null,sentence:'',score:null,rank:'',submitted:false,studentName:''}}
let state=freshState();
try{const old=JSON.parse(localStorage.getItem(KEY));if(old&&old.v===3)state={...state,...old,flags:{...state.flags,...old.flags}};}catch{}
let target=null,keys={},sound=false,actx=null,toastTimeout,choiceLocked=false,charterPicks=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='Saved on this device';}catch{$('#saved').textContent='Saving unavailable in this browser';}}
function beep(freq=400,duration=.09){if(!sound)return;try{actx??=new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.04,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+duration);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+duration);}catch{}}
function toast(text,ms=2600){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),ms)}
function stepNum(){return state.phase==='map'?Math.min(state.step+1,8):state.phase==='score'?10:9}
function stormy(){return state.phase==='map'&&(state.step===5||(state.step===6&&state.flags.water<2))}
function renStatus(){return state.ren>=75||state.renControl?['IN CONTROL','#ef8f7a']:state.ren>=60?['DANGEROUS','#f0a868']:state.ren>=40?['GROWING','#e8c37a']:['WATCHING','#9fc4b4']}

/* ---------- side panels ---------- */
function render(){
 $('#islandName').textContent=state.name;
 const b=BEATS[state.step],done=state.phase!=='map';
 $('#roundLabel').textContent=`STEP ${stepNum()} OF ${TOTAL_STEPS}`;
 $('#stepTag').textContent=state.started?`Step ${stepNum()} of ${TOTAL_STEPS}`:'About 30 minutes';
 $('#missionTitle').textContent=done?'Your ending':b.title;
 $('#missionGoal').textContent=done?'See your ending, take the final check, and turn it in.':`Decision ${state.step+1} of 8. Every choice costs something.`;
 $('#objective').textContent=done?'Island story complete':`Go to: ${locations[b.loc].name}`;
 $('#travel').innerHTML=done?'Open my ending <span>↗</span>':'Go to mission <span>↗</span>';
 $('#meters').innerHTML=state.stats.map((n,i)=>`<div class="meter ${n<=25?'low':''}" style="--c:${n<=25?'#ee9b83':colors[i]}"><div class="meter-head"><span>${labels[i]}</span><strong>${n}<small> /100</small></strong></div><div class="meter-track" role="meter" aria-label="${labels[i]}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}"><div class="meter-fill" style="width:${n}%"></div></div></div>`).join('');
 const [rs,rc]=renStatus();
 $('#rival').innerHTML=`<div class="rival-head"><div class="portrait ren-face" style="--c:#d7a272"></div><div><div class="eyebrow" style="color:${rc}">RIVAL · ${rs}</div><strong>Ren</strong></div><b class="ren-num" style="color:${rc}">${state.ren}</b></div><div class="meter-track ren-track" role="meter" aria-label="Ren's power" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.ren}"><div class="meter-fill" style="width:${state.ren}%;--c:${rc}"></div><i class="ren-line" title="Takeover line"></i></div><p class="ren-quote">“${esc(state.renSay)}”</p><small class="ren-warn">Ren’s power. At 75, Ren can take over.</small>`;
 $('#progressBar').style.width=((stepNum()-1)/TOTAL_STEPS*100)+'%';$('#progressText').textContent=`${state.phase==='map'?state.step:8} of 8 decisions made · ${state.events.length} surprise event${state.events.length===1?'':'s'}`;
 $('#cacheCount').textContent=`${state.collected.length} / 6 crates found`;$('#logCount').textContent=state.log.length;$('#weather').textContent=stormy()?'• Storm':'• Clear skies';
 $('#waterTag').textContent=`Water • ${['Unmanaged','Shared rules','Repaired'][state.flags.water]||'Unmanaged'}`;$('#rulesTag').textContent=`Rules • ${state.flags.rules?'In place':'None'}`;$('#powerTag').textContent=`Power • ${state.flags.power}`;
 const low=Math.min(...state.stats),li=state.stats.indexOf(low);
 $('#campCondition').textContent=low<=20?'Camp in crisis':low<=35?'Under pressure':low>=55?'Holding together':'A fragile balance';
 $('#campDetail').textContent=low>=55?'Every meter is steady. Keep the balance.':`Weakest: ${labels[li]} (${low}). Low meters can trigger surprise events.`;
 $('#radio').innerHTML=[['Jo','#a3c5a3',state.stats[0]<=25?'Stores are almost empty. Look for green crates.':state.flags.water===2?'Water’s flowing again. Let’s keep it that way.':'Safe camp, steady work. That’s how we eat.'],['Ash','#b9a4d3',state.stats[3]<=30?'We need our voice back.':state.stats[3]>=70?'Free to speak. Let’s not waste it.':'A rule needs a reason.'],['Ren','#d7a272',state.renSay]].map(([n,c,t])=>`<div class="message"><div class="portrait" style="--c:${c}"></div><div><strong>${n}</strong><p>${esc(t)}</p></div></div>`).join('');
 $('#blueprintItems').innerHTML=BEATS.map(x=>x.concept).map(n=>`<div class="blueprint-step ${state.concepts.includes(n)?'done':''}"><b>${state.concepts.includes(n)?'✓':'○'}</b>${n}</div>`).join('');
}

/* ---------- decision cards ---------- */
function choiceButton(c,i){const short=c.need&&state.stats[0]<c.need;return `<button class="choice" data-choice="${i}" ${short?'disabled':''}><span class="letter">${i+1}</span><span><span class="ct">${esc(c.t)}</span><span class="fx">${short?`Need ${c.need} supplies. You have ${state.stats[0]}.`:esc(c.sub)}</span></span></button>`}
function openBeat(){
 if(state.phase!=='map'||state.pending||state.openEvent||!state.started)return;
 target=null;keys={};const b=BEATS[state.step];
 $('#eventCard').classList.remove('surprise');
 $('#eventLocation').textContent=locations[b.loc].name.toUpperCase();$('#eventDay').textContent=`STEP ${state.step+1} OF ${TOTAL_STEPS}`;
 $('#eventArt').innerHTML=sceneArt(b.loc)+(b.id==='storm'?impactArt('storm','STORM DAMAGE'):'');
 $('#eventType').textContent=b.tag;$('#eventTitle').textContent=b.title;$('#eventStory').textContent=b.story(state);$('#decisionEcho').hidden=true;
 if(b.pick2){charterPicks=[];$('#choiceList').innerHTML=`<div class="charter-grid">${b.choices.map((c,i)=>`<button class="purpose" data-purpose="${i}" aria-pressed="false"><b>${esc(c.t)}</b><small>${esc(c.sub)}</small><em>${c.d.map((n,j)=>n?`${labels[j]} ${n>0?'+':''}${n}`:'').filter(Boolean).join(' · ')}</em></button>`).join('')}</div><button class="primary wide" id="signCharter" disabled>Pick 2 promises</button>`;$('#eventFoot').textContent='These are the six purposes in the U.S. Preamble. You can only keep two.';}
 else{$('#choiceList').innerHTML=b.choices.map(choiceButton).join('');$('#eventFoot').textContent='Every choice costs something. Tip: press 1, 2, or 3.';}
 $('#event').hidden=false;($('#choiceList button:not([disabled])')).focus();beep(440);
}
function openSurprise(){
 const e=EVENTS.find(x=>x.id===state.openEvent);if(!e)return;target=null;keys={};
 $('#eventCard').classList.add('surprise');
 $('#eventLocation').textContent='⚡ SURPRISE EVENT';$('#eventDay').textContent=locations[EVENT_LOC[e.id]].name.toUpperCase();
 $('#eventArt').innerHTML=sceneArt(EVENT_LOC[e.id])+impactArt(e.art,e.title.toUpperCase());
 $('#eventType').textContent='YOUR EARLIER CHOICES CAUGHT UP WITH YOU';$('#eventTitle').textContent=e.title;$('#eventStory').textContent=e.story;
 $('#decisionEcho').hidden=false;$('#decisionEchoText').textContent=e.cause;
 $('#choiceList').innerHTML=e.choices.map(choiceButton).join('');$('#eventFoot').textContent='You must deal with this before you move on.';
 $('#event').hidden=false;$('#choiceList button').focus();beep(250,.25);
}
function choose(i){
 if(choiceLocked||state.pending)return;const isEvent=!!state.openEvent;
 const src=isEvent?EVENTS.find(e=>e.id===state.openEvent):BEATS[state.step];const c=src&&src.choices[i];if(!c||src.pick2)return;
 if(c.need&&state.stats[0]<c.need){toast('Not enough supplies for that.');return}
 choiceLocked=true;const out=resolveChoice(state,c);let gather=null;
 if(isEvent){state.events.push(src.id);state.eventPicks[src.id]=i;}else{state.picks[src.id]=i;gather=dailyGather(state);if(!state.concepts.includes(src.concept))state.concepts.push(src.concept);if(state.flags.water===2)state.flags.shelter=Math.max(state.flags.shelter,1);}
 const res=typeof out.res==='function'?out.res(state):out.res,learn=isEvent?src.learn:out.learn;state.renSay=out.say;
 const entry={kind:isEvent?'event':'beat',id:src.id,title:src.title,choice:c.t,key:out.key||c.t,result:res,learn:plain(learn),delta:out.delta,renDelta:out.renDelta,gather};
 state.log.push(entry);state.pending={...entry,head:out.head,learnHtml:learn,say:out.say};if(isEvent)state.openEvent=null;
 save();$('#event').hidden=true;showResult();render();setTimeout(()=>choiceLocked=false,300);
}
function signCharter(){
 if(choiceLocked||charterPicks.length!==2)return;choiceLocked=true;const b=BEATS[7],before=[...state.stats],rb=state.ren;
 charterPicks.forEach(i=>resolveChoice(state,b.choices[i]));const names=charterPicks.map(i=>b.choices[i].t);state.picks.charter=[...charterPicks];
 const say=charterPicks.some(i=>i===2||i===3)?'Order and defense. Now you’re learning.':charterPicks.some(i=>i===1||i===5)?'Fancy words. Words don’t stop pirates.':'Promises are easy. Keeping them is hard.';state.renSay=say;
 if(!state.concepts.includes(b.concept))state.concepts.push(b.concept);
 const learn='Those promises come from the <b>Preamble</b> (opening) of the U.S. Constitution. It lists six purposes of government. Every government has to choose what comes first.';
 const entry={kind:'beat',id:'charter',title:b.title,choice:names.join(' + '),key:names.join(' + '),result:`Your charter promises to ${names[0].toLowerCase()} and ${names[1].toLowerCase()}.`,learn:plain(learn),delta:state.stats.map((n,i)=>n-before[i]),renDelta:state.ren-rb,gather:null};
 state.log.push(entry);state.pending={...entry,head:'The charter is signed',learnHtml:learn,say};save();$('#event').hidden=true;showResult();render();setTimeout(()=>choiceLocked=false,300);
}
function showResult(){const p=state.pending;if(!p)return;
 $('#resultSymbol').textContent=p.kind==='event'?'⚡':'✓';$('#resultEyebrow').textContent=p.kind==='event'?'SURPRISE EVENT · RESULT':'YOUR DECISION';
 $('#resultTitle').textContent=p.head;$('#resultText').textContent=p.result;
 const cells=p.delta.map((n,i)=>[n,labels[i]]).concat([[p.renDelta,'Ren’s power']]);
 $('#deltas').innerHTML=cells.map(([n,l],i)=>{const bad=i===4?n>0:n<0;return `<div class="delta ${i===4?'ren':''}"><b class="${n===0?'zero':bad?'negative':''}">${n>0?'+':''}${n}</b>${l}</div>`}).join('');
 $('#gather').hidden=p.gather===null;$('#gather').textContent=p.gather?`End of day: people felt safe and trusted each other, so they gathered +${p.gather} supplies (included above).`:'End of day: camp felt too unsafe or divided to gather supplies (+0). Safety and Trust of 40+ bring in supplies.';
 $('#renSays').innerHTML=`<div class="portrait" style="--c:#d7a272"></div><p><b>REN:</b> “${esc(p.say)}”</p>`;
 $('#learning').innerHTML=`<strong>WHAT YOU JUST DID</strong><br>${p.learnHtml}`;
 $('#continue').textContent=(p.kind==='beat'&&p.id==='charter')?'See your ending →':'Back to the island →';
 $('#result').hidden=false;$('#continue').focus();beep(p.kind==='event'?300:660,.15);
}
function next(){const p=state.pending;if(!p)return;state.pending=null;$('#result').hidden=true;
 if(p.kind==='event')state.lastWasEvent=true;
 else{state.step++;if(state.step<BEATS.length){const ev=nextEvent(state);if(ev){state.openEvent=ev.id;save();render();setTimeout(openSurprise,300);return}}state.lastWasEvent=false;}
 if(state.step>=BEATS.length){state.phase='ending';state.ending=endingFor(state);save();render();showEnding();return}
 save();render();toast(`Next: ${BEATS[state.step].title} · ${locations[BEATS[state.step].loc].name}`);
}

/* ---------- ending, final check, sentence, score, turn-in ---------- */
const OPTS={
 power:[['leg','Legislative: making the rules'],['exe','Executive: carrying out the rules'],['jud','Judicial: deciding what rules mean'],['sov','Sovereignty: final say over the land']],
 state:[['pop','Population: the people who live there'],['ter','Territory: the land and its borders'],['sov','Sovereignty: final say over its own land'],['gov','Government: the group that runs things']],
 origin:[['sc','Social contract: people agree to it'],['evo','Evolutionary: grew out of families'],['div','Divine right: God chose the ruler'],['for','Force: taken by strength and fear']],
 limits:[['lim','Limited government: leaders’ power has limits'],['div','Divine right: leaders’ power comes from God'],['dir','Direct democracy: everyone votes on rules'],['def','Common defense: protecting against outsiders']]};
function questions(){const p=state.picks,Q={};
 const pw=[['In your camp, Jo’s job was to carry out the council’s rules and run the night watch. Which power is that?','exe','Executive power carries out and enforces rules.','Jo didn’t write the rules or judge anyone. Jo put them into action.'],['In your camp, all 30 people voted to write each new rule. Which power were they using?','leg','Legislative power makes the rules.','Voting to write a rule is about creating it.'],['In your camp, Ren decided who broke the rules and what the rules meant. Which power is that?','jud','Judicial power interprets rules and settles disputes.','Think about deciding cases, not writing or enforcing rules.']][p.power??0];
 Q.power={q:pw[0],opts:OPTS.power,ans:pw[1],why:pw[2],clue:pw[3]};
 const st=[['You told the ship captain, “We rule ourselves here.” Which feature of a state were you claiming?','sov','Sovereignty means your state has the final say over its own land.','You already had people and land. What were you saying no outsider could take?'],['You paid the company, and now it controls some of your choices. Which feature of a state did your island lose?','sov','Sovereignty is the final say. Paying outsiders who control you weakens it.','You still have people, land, and leaders. What did the company take from you?'],['Ren let the company use the north beach. Which feature of a state did he give part of away?','ter','Territory is a state’s land and borders. Ren gave some away.','What physical thing did the company get to use?']][p.ship??0];
 Q.state={q:st[0],opts:OPTS.state,ans:st[1],why:st[2],clue:st[3]};
 const og=state.events.includes('coup')?['Ren’s crew grabbed the lookout and the food store and made everyone obey. Which origin of government matches that?','for','Force theory: a person or group takes power by strength.','How did Ren get control: a vote, a family line, God, or strength?']:[['Your camp held an election to choose its leader. Which origin of government matches that?','sc','Social contract theory: power comes from the people’s agreement.','Who gave the leader power in an election?'],['Your camp let Mara’s family lead because big families had always led. Which origin of government matches that?','evo','Evolutionary theory: government grew out of families, clans, and tribes.','Think about why Mara’s family got to lead.'],['Ren said God spared him, so he was chosen to rule. Which origin of government matches that?','div','Divine right: the ruler claims God gave them the right to rule.','Listen to what Ren said about where his power came from.']][p.claim??0];
 Q.origin={q:og[0],opts:OPTS.origin,ans:og[1],why:og[2],clue:og[3]};
 const lm=[['You told Ren that leaders must follow rules too, and people keep free speech. Which idea is that?','You kept limits on leaders. That’s limited government.'],['You let Ren ban criticism and search any tent, with no end date. Which idea did that break?','Power with no limits breaks the idea of limited government.'],['You said Ren’s crew needs a judge’s OK before searching a tent. Which idea does that protect?','A judge’s OK is a limit on power. That’s limited government.']][p.emergency??0];
 Q.limits={q:lm[0],opts:OPTS.limits,ans:'lim',why:lm[1],clue:'Think about what your choice did to the leaders’ power.'};
 return Q;}
function finalScore(){const first=state.check?Object.values(state.check.first).filter(Boolean).length:0;return {first,score:scoreFor(state,first)}}
function endingArt(kind){
 const base=(sky,ground)=>`<rect width="560" height="170" fill="${sky}"/><path d="M0 130Q140 112 280 126T560 120V170H0Z" fill="${ground}"/>`;
 const people=(x,n,c)=>Array.from({length:n},(_,i)=>`<circle cx="${x+i*18}" cy="${116-(i%2)*4}" r="6" fill="#dbb48b"/><path d="M${x+i*18-8} ${136-(i%2)*4}q8-16 16 0Z" fill="${c}"/>`).join('');
 const art={
  republic:base('#2f6f6b','#5d8a57')+`<circle cx="470" cy="45" r="24" fill="#f6d68a"/><ellipse cx="280" cy="132" rx="140" ry="16" fill="#b9a874"/><path d="M280 128V30" stroke="#d9c79a" stroke-width="4"/><path d="M282 32h52l-10 13 10 13h-52Z" fill="#f6be68"/><path d="m306 38 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#fff6dc"/>`+people(180,12,'#90ccb0'),
  dictatorship:base('#4a2a2c','#3b3a33')+`<path d="M250 132V40h60v92Z" fill="#2a2426"/><path d="M240 40h80l-40-28Z" fill="#7d2f2a"/><path d="M280 12V-2" stroke="#999" stroke-width="3"/><rect x="262" y="58" width="36" height="46" fill="#a3312a"/><text x="280" y="90" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="26" fill="#f6d0b0">R</text>`+people(110,5,'#555')+people(350,5,'#555')+`<path d="M95 112h90M345 112h90" stroke="#999" stroke-width="2"/>`,
  revolution:base('#5a3a2a','#4d4a36')+`<path d="M330 132 380 60" stroke="#7c5b3a" stroke-width="6"/><path d="M380 60l40 10-8 30-44-8Z" fill="#a3312a" transform="rotate(25 380 60)"/>`+people(120,10,'#c58a5a')+[140,212,284].map(x=>`<path d="M${x} 108V80" stroke="#7c5b3a" stroke-width="3"/><path d="M${x} 82q-8-10 0-22 8 12 0 22Z" fill="#f6a043"/>`).join(''),
  collapse:base('#3c4a4c','#4b4f3c')+`<circle cx="150" cy="50" r="30" fill="#6f7a78" opacity=".6"/><circle cx="190" cy="35" r="38" fill="#6f7a78" opacity=".45"/><path d="m120 132 40-46 30 46Z" fill="#7a6a50" transform="rotate(-18 150 110)"/><path d="m300 132 34-40 38 40Z" fill="#6c5f48"/><path d="M300 132 372 92" stroke="#2b2b28" stroke-width="5"/><path d="M420 132l30-30 30 30Z" fill="#7a6a50" transform="rotate(14 450 120)"/>`,
  fragile:base('#2f5c63','#5f7f56')+`<path d="m110 132 45-52 45 52Z" fill="#c59b61"/><path d="m360 132 45-52 45 52Z" fill="#9aaa8a"/><path d="M200 112Q280 140 360 112" stroke="#d9c79a" stroke-width="3" fill="none" stroke-dasharray="6 5"/><circle cx="280" cy="40" r="20" fill="#f6d68a" opacity=".7"/><path d="M260 40h40" stroke="#2f5c63" stroke-width="22"/>`};
 return `<svg viewBox="0 0 560 170" aria-hidden="true">${art[kind]}</svg>`}
function keyMoments(){const ren=state.ending==='dictatorship'||(state.ending==='revolution'&&renOnTop(state));const w=state.stats.indexOf(Math.min(...state.stats));let list,fmt;
 if(ren){list=[...state.log].filter(l=>l.renDelta>0).sort((a,b)=>b.renDelta-a.renDelta);fmt=l=>`Ren +${l.renDelta}`}
 else if(state.ending==='republic'){list=[...state.log].filter(l=>l.renDelta<0).sort((a,b)=>a.renDelta-b.renDelta);fmt=l=>`Ren ${l.renDelta}`}
 else{list=[...state.log].filter(l=>l.delta[w]<0).sort((a,b)=>a.delta[w]-b.delta[w]);fmt=l=>`${labels[w]} ${l.delta[w]}`}
 list=list.slice(0,2);if(!list.length)return '';return `<p class="key-moments"><b>Choices that led here:</b> ${list.map(l=>`“${esc(l.key)}” (${fmt(l)})`).join(' · ')}</p>`}
function showEnding(){
 if(state.phase==='map')return;target=null;keys={};const e=ENDINGS[state.ending];const box=$('#endingBody');$('#ending').hidden=false;
 if(state.phase==='ending'){
  box.innerHTML=`<div class="ending-art">${endingArt(state.ending)}</div><div class="eyebrow">STEP 9 OF 10 · YOUR ENDING</div><h2 class="ending-title">${e.badge} ${esc(e.title)}</h2><p class="ending-why">${e.why(state)}</p>${keyMoments()}<div id="endingStats">${state.stats.map((n,i)=>`<span><strong>${n}</strong>${labels[i]}</span>`).join('')}<span class="ren-stat"><strong>${state.ren}</strong>Ren’s power</span></div><p class="fine-note">This is a game outcome, not a prediction about real countries.</p><button class="primary wide" id="toCheck">Next: final check (4 quick questions) →</button>`;
  $('#toCheck').onclick=()=>{state.phase='check';if(!state.check)state.check={order:shuffle(['power','state','origin','limits']),idx:0,first:{}};save();render();showEnding()};$('#toCheck').focus();
 }else if(state.phase==='check')renderCheck();
 else if(state.phase==='write'){
  box.innerHTML=`<div class="eyebrow">STEP 9 OF 10 · ONE SENTENCE</div><h2 class="stage-title">Explain your island</h2><p class="stage-help">Finish the sentence. Name one real choice from your game. (At least 8 more words.)</p><label class="stem" for="sentence">Our island needed a government because…</label><textarea id="sentence" rows="4" maxlength="400" placeholder="…people kept fighting over water, and when we…">${esc(state.sentence)}</textarea><div id="writeHint" class="task-hint" role="status"></div><button class="primary wide" id="toScore">See my score →</button>`;
  $('#sentence').oninput=e=>{state.sentence=e.target.value;save()};
  $('#toScore').onclick=()=>{const w=state.sentence.trim().split(/\s+/).filter(Boolean);if(w.length<8){$('#writeHint').textContent=`Add a little more. You have ${w.length} words. Write at least 8.`;$('#writeHint').className='task-hint try-again';$('#sentence').focus();return}const f=finalScore();state.score=f.score;state.rank=rankFor(f.score,state.ending);state.phase='score';save();render();showEnding();beep(880,.3)};
  $('#sentence').focus();
 }else if(state.phase==='score'){
  const f=finalScore(),avg=Math.round(state.stats.reduce((a,b)=>a+b,0)/4);
  box.innerHTML=`<div class="eyebrow">STEP 10 OF 10 · FINAL SCORE</div><div class="score-big"><b>${state.score}</b><span>/100</span></div><div class="rank">${esc(state.rank)}</div><p class="ending-line">${e.badge} ${esc(e.title)} · ${f.first} of 4 checks right on the first try</p><p class="compare">Compare your score with your class.</p><p class="fine-note">Score = your four meters (average ${avg}) + 5 per first-try check + an ending bonus${state.ren>50?' − a penalty for Ren’s power':''}.</p>
  <div class="turnin"><label for="studentName">First name + last initial (like Jordan M.)</label><input id="studentName" maxlength="40" autocomplete="off" value="${esc(state.studentName)}" placeholder="Jordan M."><button class="primary wide" id="turnIn">Turn in to my teacher</button><div id="turnStatus" role="status" class="turn-status ${state.submitted?'ok':''}">${state.submitted?'✓ Turned in! Your teacher can see your work. You can send it again if you need to.':''}</div></div>
  <div class="end-actions"><button class="text-button" id="finalDownload">Download my island report ↓</button><button class="text-button" id="journalEnd">Read my captain’s log</button><button class="text-button" id="replay">Play again</button></div>`;
  $('#studentName').oninput=e=>{state.studentName=e.target.value;save()};$('#turnIn').onclick=turnIn;$('#finalDownload').onclick=download;$('#journalEnd').onclick=journal;$('#replay').onclick=restart;
 }
}
function renderCheck(feedback){
 const c=state.check,Q=questions();if(c.idx>=c.order.length){state.phase='write';save();render();showEnding();return}
 const id=c.order[c.idx],q=Q[id];const opts=shuffle(q.opts);
 $('#endingBody').innerHTML=`<div class="eyebrow">STEP 9 OF 10 · FINAL CHECK · QUESTION ${c.idx+1} OF ${c.order.length}</div><h2 class="stage-title">About your game</h2><p class="check-q">${esc(q.q)}</p><div class="check-opts">${opts.map(([k,t])=>`<button class="choice check-opt" data-opt="${k}"><span class="ct">${esc(t)}</span></button>`).join('')}</div><div id="checkHint" class="task-hint ${feedback?'try-again':''}" role="status">${feedback?esc(feedback):''}</div><button class="primary wide" id="checkNext" hidden>Next →</button>`;
 document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{
  if(b.dataset.opt===q.ans){if(!(id in c.first))c.first[id]=true;if(window.classFirstTry)classFirstTry.right('stranded-'+id);save();document.querySelectorAll('[data-opt]').forEach(x=>{x.disabled=true});b.classList.add('right');$('#checkHint').className='task-hint';$('#checkHint').textContent='✓ Right. '+q.why;$('#checkNext').hidden=false;$('#checkNext').focus();beep(700);}
  else{if(!(id in c.first))c.first[id]=false;if(window.classFirstTry)classFirstTry.wrong();save();beep(220);renderCheck('Not quite. '+q.clue+' The answers were reshuffled. Try again.');}
 });
 const nb=$('#checkNext');nb.onclick=()=>{c.idx++;save();renderCheck()};
 if(!feedback)$('.check-opt').focus();
}
function decisionAnswers(){const names={barrel:'1. Water barrel',power:'2. Who holds power',thief:'3. Food thief',ship:'4. The ship',claim:'5. Right to rule',storm:'6. The storm',emergency:'7. Emergency powers',charter:'8. Charter promises'};const out={};state.log.filter(l=>l.kind==='beat').forEach(l=>{out[names[l.id]]=l.key});return out}
function buildAnswers(){const f=finalScore();return {Standard:STANDARD,'First-try correct':`${f.first} of 4`,Score:`${state.score??f.score} / 100`,Rank:state.rank||rankFor(f.score,state.ending),Ending:ENDINGS[state.ending]?.title||'',...decisionAnswers(),'Surprise events':state.log.filter(l=>l.kind==='event').map(l=>`${l.title} → ${l.key}`).join('; ')||'None','Final meters':`Supplies ${state.stats[0]} · Safety ${state.stats[1]} · Trust ${state.stats[2]} · Freedom ${state.stats[3]} · Ren ${state.ren}`,'My sentence':'Our island needed a government because '+state.sentence.trim()}}
async function turnIn(){
 const name=$('#studentName').value.trim(),st=$('#turnStatus'),btn=$('#turnIn');const say=(t,ok)=>{st.textContent=t;st.className='turn-status '+(ok?'ok':'bad')};
 if(!name){say('Type your first name + last initial (like Jordan M.).');$('#studentName').focus();return}
 if(typeof window.classTurnIn!=='function'){say('Turn-in is not available right now. Keep this page open and tell your teacher.');return}
 btn.disabled=true;say('Sending…',true);
 try{const res=await classTurnIn(SUBMIT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:name,assignmentId:ASSIGNMENT_ID,answers:buildAnswers()})});const data=await res.json().catch(()=>({}));
  if(res.ok){state.submitted=true;state.studentName=name;save();say('✓ Turned in! Your teacher can see your work now.',true);beep(900,.2)}else say(data.error||'That didn’t go through. Check your name and try again.');}
 catch{say('Could not reach the class site. Keep this page open and try again.')}finally{btn.disabled=false}
}
function journal(){$('#journalTitle').textContent=`${state.name}: captain’s log`;$('#journalEntries').innerHTML=state.log.length?state.log.map((l,n)=>`<article class="log-entry"><span>${l.kind==='event'?'⚡ SURPRISE EVENT':'DECISION'}</span><h3>${esc(l.title)}</h3><p>You chose: ${esc(l.choice)}</p><p>${esc(l.result)}</p><small>${esc(l.learn)}</small></article>`).join(''):'<p>Your first decision is waiting at the water station.</p>';$('#journalDialog').showModal();}
function download(){const e=ENDINGS[state.ending],f=finalScore();const lines=[`STRANDED: GOVERN OR COLLAPSE · ISLAND REPORT`,`Island: ${state.name}`,`Standards: ${STANDARD}`,`Ending: ${e?e.title:'In progress'}`,state.score!=null?`Score: ${state.score}/100 · Rank: ${state.rank} · Final check first try: ${f.first} of 4`:'',`Meters: ${labels.map((n,i)=>`${n} ${state.stats[i]}`).join(' | ')} | Ren's power ${state.ren}`,'',...state.log.map(l=>`${l.kind==='event'?'SURPRISE EVENT':'DECISION'}: ${l.title}\n  Choice: ${l.choice}\n  Result: ${l.result}\n  Concept: ${l.learn}\n`),state.sentence?`My sentence: Our island needed a government because ${state.sentence.trim()}`:'','','Game outcomes are fictional. They are not facts about real countries.'];const blob=new Blob([lines.filter(x=>x!==undefined).join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stranded-island-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function restart(){if(confirm('Start over? Your island on this device will be erased.')){localStorage.removeItem(KEY);try{window.classFirstTry&&classFirstTry.reset()}catch{}location.reload()}}
const canvas=$('#map'),ctx=canvas.getContext('2d');let vw=0,vh=0,dpr=1,scale=1,ox=0,oy=0,clock=0,lastTime=0;
const land=[ [152,464],[184,372],[267,304],[337,238],[420,225],[471,177],[564,195],[614,245],[711,230],[764,278],[808,362],[854,409],[860,492],[815,566],[808,643],[733,690],[687,753],[599,775],[537,812],[447,779],[368,794],[292,748],[236,683],[207,612],[166,560] ];
const cacheSpots=[{x:226,y:422},{x:584,y:245},{x:794,y:546},{x:594,y:730},{x:266,y:600},{x:607,y:350}];
function rand(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function polygon(points,fill){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function inside(x,y){let c=false;for(let i=0,j=land.length-1;i<land.length;j=i++){const a=land[i],b=land[j];if(((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
function palm(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(6,9,21,7,'#0c3c3544');ctx.strokeStyle='#92724d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(5,-20,-1,-38);ctx.stroke();const sway=Math.sin(clock*.6+x)*2;for(let i=0;i<6;i++){const a=i*Math.PI/3+sway*.02;const dx=Math.cos(a)*29,dy=Math.sin(a)*15;ctx.beginPath();ctx.moveTo(-1,-37);ctx.quadraticCurveTo(dx*.4,-56+dy,dx,-36+dy);ctx.quadraticCurveTo(dx*.5,-35+dy,-1,-37);ctx.fillStyle=i%2?'#2c7354':'#42895d';ctx.fill()}ctx.restore()}
function tent(x,y,s=1,c='#c59b61'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(4,11,30,10,'#163e3444');polygon([[-27,7],[0,-29],[28,7]],c);polygon([[0,-29],[28,7],[43,-2],[17,-35]],'#92754c');polygon([[-12,7],[0,-14],[12,7]],'#163c3c');line(0,-29,0,7,'#e6c58c',1);line(-27,7,-36,15,'#8a7652');line(28,7,34,15,'#8a7652');ctx.restore()}
function crate(x,y,glow=false){if(glow){ellipse(x,y+7,20,10,'#91d2ae18');ctx.strokeStyle=`rgba(149,224,182,${.2+.2*Math.sin(clock*3)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,18+Math.sin(clock*3)*3,12+Math.sin(clock*3)*2,0,0,7);ctx.stroke()}roundRect(x-9,y-8,18,18,2,'#a67a46');polygon([[x-9,y-8],[x-4,y-12],[x+13,y-12],[x+9,y-8]],'#d5b16b');polygon([[x+9,y-8],[x+13,y-12],[x+13,y+5],[x+9,y+10]],'#785d39');line(x-6,y-5,x+6,y+6,'#d8b97c',2);line(x+6,y-5,x-6,y+6,'#d8b97c',2);if(glow){ctx.fillStyle='#b4f3bd';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('+',x,y-18)}}
function person(x,y,c='#bca278',size=1,walk=false){ctx.save();ctx.translate(x,y);ctx.scale(size,size);ellipse(2,7,10,4,'#0a292b55');const step=walk?Math.sin(clock*12)*3:0;line(-3,3,-3-step,9,'#183b43',3);line(3,3,3+step,9,'#183b43',3);roundRect(-6,-7,12,14,4,c);ellipse(0,-10,5,6,'#dbb48b');ellipse(0,-13,5,2.5,'#453c2e');ctx.restore()}
function drawLocation(key){const p=locations[key],x=p.x,y=p.y;ctx.save();ctx.translate(x,y);
if(key==='water'){ellipse(0,0,37,19,'#5e8a6244');for(let i=0;i<(state.flags.water===2?3:1);i++){ellipse(-15+i*15,-4-i%2*5,9,6,'#b8aaa0');roundRect(-24+i*15,-15-i%2*5,18,12,2,'#427586');ellipse(-15+i*15,-15-i%2*5,9,4,'#84b8bd');line(-21+i*15,-11-i%2*5,-9+i*15,-11-i%2*5,'#abc4bd',1)}if(state.flags.water===2){line(-26,8,31,8,'#7e9c8b',5);roundRect(22,3,9,16,2,'#50787b');ellipse(26,20,12,4,'#8ad6cf80')}else if(state.step>=5){line(-24,-10,22,9,'#6e5f49',4);line(10,-14,-17,18,'#8a7554',4)}}
if(key==='camp'){tent(-27,-4,1.1);tent(26,21,.85,'#9aaa8a');if(state.flags.shelter)tent(27,-38,.8,'#bd9669');if(state.flags.shelter===2)tent(-48,37,.8,'#8da58e');ellipse(-4,35,13,6,'#5f6452');for(let i=0;i<6;i++){let a=i*1.05;ellipse(-4+Math.cos(a)*12,35+Math.sin(a)*5,3,2,'#9d9a7b')}polygon([[-10,35],[-6,20+Math.sin(clock*7)*3],[0,34],[5,26],[6,35]],'#f9bc63');ellipse(-4,34,5,2,'#ffd79a');for(let i=0;i<3;i++)ellipse(-6+Math.sin(clock+i)*4,16-((clock*8+i*7)%25),4+i,2,'#d5e1c812');}
if(key==='hall'){ellipse(0,0,40,25,'#c4b183');ellipse(0,0,32,19,'#9ca071');for(let i=0;i<7;i++){let a=i*6.28/7;ellipse(Math.cos(a)*35,Math.sin(a)*20,7,4,'#8e8c6a')}roundRect(-15,-11,30,19,3,'#92714e');polygon([[-15,-11],[-7,-16],[23,-16],[15,-11]],'#b7935c');if(state.flags.rules){line(40,4,40,-31,'#796244',4);roundRect(26,-35,31,23,2,'#c4a173');for(let i=0;i<3;i++)line(31,-29+i*6,51,-29+i*6,'#4e5c45',1.5)}}
if(key==='watch'){polygon([[-35,12],[-17,-18],[7,-25],[34,5],[22,18]],'#7a8f7a');polygon([[-17,-18],[7,-25],[34,5],[8,-1]],'#a1aa8b');if(state.flags.guard){line(-12,0,-10,-43,'#896f4c',5);line(12,0,10,-43,'#896f4c',5);line(-14,-43,14,-43,'#bfa375',5);line(-11,-27,10,-13,'#896f4c',2);line(-11,-13,10,-27,'#896f4c',2);polygon([[-24,-44],[0,-61],[24,-44]],'#bd9c60');if(state.flags.guard===2)person(0,-42,'#91c1ac',.8)}else{line(-10,0,-10,-39,'#967c56',4);polygon([[-10,-39],[16,-35],[-10,-24]],state.flags.power.includes('Ren')?'#d59571':'#f0c779')}}
if(key==='dock'){ctx.rotate(-.2);polygon([[-45,8],[-37,-18],[28,-18],[49,4],[27,20],[-28,20]],'#79573c');polygon([[-33,-10],[23,-10],[32,4],[22,12],[-25,12]],'#b49461');for(let i=0;i<6;i++)line(-23+i*9,-10,-23+i*9,12,'#7f6546',2);line(-45,8,14,-26,'#ad8d5b',4);ctx.rotate(.2);crate(38,22);line(-65,-4,-49,-12,'#96794d',4)}
if(key==='grove'){tent(-17,2,.8,'#93ad83');tent(20,-16,.7,'#b7a176');roundRect(7,15,19,8,2,'#a7936c');palm(-42,-14,.8)}
ctx.restore()}
function sceneArt(loc){const icon=locations[loc].icon;const col=loc==='water'?'#86b9bb':loc==='watch'?'#c9b888':'#c29f69';let shapes='';if(icon==='water')shapes='<path d="M185 100V58h115v42" fill="#497c83"/><ellipse cx="242" cy="58" rx="58" ry="17" fill="#81b7b9"/><path d="M183 69h118M183 89h118" stroke="#aec6b6" stroke-width="4"/>';else if(icon==='watch')shapes='<path d="M220 110V44m55 66V44m-55 10 55 40m-55 0 55-40" stroke="#bda579" stroke-width="9"/><path d="m197 45 50-32 50 32Z" fill="#d7b673"/>';else if(icon==='camp'||icon==='grove')shapes='<path d="m160 108 75-86 80 86Z" fill="#cfb07b"/><path d="m235 22 80 86 60-21-80-74Z" fill="#947a52"/><path d="m210 108 25-40 30 40Z" fill="#1c4142"/>';else if(icon==='hall')shapes='<ellipse cx="260" cy="108" rx="120" ry="28" fill="#6a8160"/><path d="M211 96V65h91v31Z" fill="#b18f5e"/><path d="m211 65 15-10h90l-14 10Z" fill="#c9ae7c"/><path d="M355 106V26" stroke="#a68a5c" stroke-width="7"/><rect x="324" y="20" width="64" height="49" rx="3" fill="#cbb384"/><path d="M336 34h40m-40 10h32m-32 10h40" stroke="#52694f" stroke-width="3"/>';else shapes='<path d="m160 70 36 38h120l40-38Z" fill="#b59161"/><path d="M245 85V13m-1 4 62 54h-62" fill="#ddd1ad" stroke="#ab9265" stroke-width="5"/>';
return `<svg viewBox="0 0 560 120" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#1d424b"/><stop offset="1" stop-color="#4f7260"/></linearGradient></defs><rect width="560" height="120" fill="url(#sky)"/><circle cx="440" cy="35" r="23" fill="#c8c58c" opacity=".3"/><path d="M0 107Q90 73 165 100T340 94T560 89V120H0" fill="#3d6652"/><path d="M0 115Q140 95 260 113T560 105V120H0" fill="#687e54"/>${shapes}<path d="M70 118 78 40m0 0Q45 12 30 55q18-6 48-15m0 0q25-30 47-4-18-2-47 4m0 0q-4-33-22-34 5 20 22 34" stroke="#35674e" fill="#35674e" stroke-width="6"/></svg>`;}
function resize(){const r=canvas.getBoundingClientRect();vw=r.width;vh=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=vw*dpr;canvas.height=vh*dpr;scale=Math.min(vw/1000,vh/970)*1.03;ox=(vw-1000*scale)/2;oy=(vh-940*scale)/2;}
new ResizeObserver(resize).observe(canvas);
function draw(t){const dt=Math.min((t-lastTime)/1000,.2)||.016;lastTime=t;clock=t/1000;update(dt);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#195968';ctx.fillRect(0,0,vw,vh);const grad=ctx.createLinearGradient(0,0,vw,vh);grad.addColorStop(0,'#164c5c');grad.addColorStop(.6,'#23777b');grad.addColorStop(1,'#164b5b');ctx.fillStyle=grad;ctx.fillRect(0,0,vw,vh);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
// Fine chart grid and drifting sea ripples.
ctx.strokeStyle='#b5dac008';ctx.lineWidth=1;for(let x=0;x<1100;x+=80){line(x,0,x,1000,'#b5dac008')}for(let y=0;y<1000;y+=80)line(0,y,1000,y,'#b5dac008');for(let i=0;i<120;i++){const x=rand(i+100)*1100,y=rand(i+200)*1000;if(!inside(x,y)){const drift=Math.sin(clock*.8+i)*5;line(x+drift,y,x+14+drift,y,'#a1d9d01a',1)}}
// Offshore rocks and an abandoned vessel.
ellipse(120,706,22,11,'#648a80');polygon([[100,703],[115,682],[138,700]],'#9aa795');ellipse(870,690,25,12,'#406c6c');polygon([[850,687],[867,665],[888,685]],'#839b8c');ellipse(795,170,18,8,'#59867b');polygon([[780,168],[795,153],[812,167]],'#8da28e');
// Shore rings.
ctx.save();ctx.translate(500,500);ctx.scale(1.11+Math.sin(clock*.6)*.003,1.09+Math.sin(clock*.6)*.003);ctx.translate(-500,-500);polygon(land,'#62bbb125');ctx.restore();ctx.save();ctx.translate(500,500);ctx.scale(1.055,1.045);ctx.translate(-500,-500);polygon(land,'#5cae9f80');ctx.restore();polygon(land,'#c9bb87');ctx.save();ctx.translate(500,500);ctx.scale(.95,.95);ctx.translate(-500,-500);polygon(land,'#849b65');ctx.restore();ctx.save();ctx.translate(500,500);ctx.scale(.87,.88);ctx.translate(-500,-500);polygon(land,'#688e5b');ctx.restore();
// Meadows, terrain and trails.
for(let i=0;i<110;i++){const x=200+rand(i+412)*630,y=220+rand(i+688)*540;if(inside(x,y)){ellipse(x,y,3+rand(i+90)*9,1.5,'#b0b87844');}}
const path=(a,b)=>{ctx.strokeStyle='#b3aa77';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+15,(a.y+b.y)/2-8,b.x,b.y);ctx.stroke();ctx.strokeStyle='#cdc08b45';ctx.lineWidth=4;ctx.stroke()};[['dock','hall'],['hall','water'],['hall','watch'],['hall','camp'],['camp','grove'],['camp','water']].forEach(([a,b])=>path(locations[a],locations[b]));
// A pond and stony ridge.
ellipse(580,595,45,26,'#507c5d');ellipse(580,591,38,23,'#407d78');ellipse(579,589,31,17,'#76a393');for(let i=0;i<11;i++){let x=650+rand(i+76)*88,y=245+rand(i+56)*52;polygon([[x-10,y+6],[x,y-14],[x+17,y+5]],'#829378');polygon([[x,y-14],[x+17,y+5],[x+4,y+3]],'#a2ad8b')}
// Palms avoid mission sites, trails' central area, and cache locations.
for(let i=0;i<62;i++){const x=220+rand(i+112)*570,y=260+rand(i+55)*475;if(inside(x,y)&&Object.values(locations).every(p=>Math.hypot(p.x-x,p.y-y)>68)&&cacheSpots.every(p=>Math.hypot(p.x-x,p.y-y)>27))palm(x,y,.7+rand(i+774)*.55)}
Object.keys(locations).sort((a,b)=>locations[a].y-locations[b].y).forEach(drawLocation);
cacheSpots.forEach((p,i)=>{if(!state.collected.includes(i))crate(p.x,p.y,true)});
// Residents react to camp condition.
for(let i=0;i<13;i++){const p=Object.values(locations)[i%6],x=p.x+Math.sin(clock*.3+i*2)*25+18,y=p.y+Math.cos(clock*.25+i*3)*16+24;if(state.stats[2]<=25&&i>6)continue;person(x,y,['#bd9864','#9bb3a0','#bd999e','#829eb0'][i%4],.8,true)}
// Mission beacon.
if(state.phase==='map'&&state.started&&BEATS[state.step]){const p=locations[BEATS[state.step].loc],r=34+Math.sin(clock*3)*3;ctx.strokeStyle='#f3c77c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+9,r,r*.55,0,0,7);ctx.stroke();ctx.save();ctx.translate(p.x,p.y-68+Math.sin(clock*3)*3);polygon([[0,-11],[9,0],[0,11],[-9,0]],'#f6c477');ellipse(0,0,2,2,'#274544');ctx.restore();}
// Location chips, away from buildings.
Object.entries(locations).forEach(([key,p])=>{const active=state.phase==='map'&&BEATS[state.step]?.loc===key;ctx.font='600 11px Arial';ctx.textAlign='center';const label=p.name.toUpperCase(),w=ctx.measureText(label).width+18;roundRect(p.x-w/2,p.y+41,w,22,4,active?'#143331e8':'#12383ac9');ctx.fillStyle=active?'#f6c77b':'#b4cbb9';ctx.fillText(label,p.x,p.y+56)});
// Player has a bright ring and an explicit label.
const p=state.player;ellipse(p.x,p.y+8,14,7,'#e7f6ce22');ctx.strokeStyle='#e5f4dd';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y+8,13,6,0,0,7);ctx.stroke();person(p.x,p.y,state.color,1.4,!!target||Object.values(keys).some(Boolean));roundRect(p.x-15,p.y-39,30,16,4,'#e8efdb');ctx.fillStyle='#254945';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText('YOU',p.x,p.y-28);
if(target){ctx.strokeStyle='#f6c77b80';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y+7);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.setLineDash([]);ellipse(target.x,target.y,3,2,'#f6c77b')}
// Sea birds and drifting clouds.
for(let i=0;i<5;i++){let x=(clock*10+i*137)%1100-50,y=115+i*21+Math.sin(clock*.4+i)*15;line(x-4,y,x,y-2,'#c6ded1aa',1.5);line(x,y-2,x+5,y,'#c6ded1aa',1.5)}
for(let i=0;i<4;i++){const x=((clock*5+i*337)%1500)-250,y=170+i*155;ctx.save();ctx.translate(x,y);ellipse(0,0,120,35,'#e5e8d405');ellipse(65,-10,90,30,'#e5e8d405');ctx.restore()}
if(stormy()){ctx.fillStyle='#12374644';ctx.fillRect(-100,-100,1200,1200);for(let i=0;i<70;i++){let x=rand(i+8)*1100,y=((clock*270+i*43)%1100)-100;line(x,y,x-4,y+12,'#c4e4dd2b',1)}}
// Tiny compass rose.
ctx.save();ctx.translate(900,820);ctx.strokeStyle='#badcc177';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,27,0,7);ctx.stroke();polygon([[0,-23],[6,8],[0,3],[-6,8]],'#cde4c477');polygon([[0,23],[6,-8],[0,-3],[-6,-8]],'#9dc7b133');ctx.fillStyle='#cde4c4aa';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('N',0,-34);ctx.restore();
ctx.restore();requestAnimationFrame(draw);}

/* ===== Movement, controls, start-up ===== */
let moveSave=0;
function overlayOpen(){return !$('#welcome').hidden||!$('#event').hidden||!$('#result').hidden||!$('#ending').hidden||!!document.querySelector('dialog[open]')}
function update(dt){if(!state.started||overlayOpen())return;let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);if(dx||dy)target=null;else if(target){dx=target.x-state.player.x;dy=target.y-state.player.y;if(Math.hypot(dx,dy)<5){target=null;dx=dy=0;}}
 if(dx||dy){const len=Math.hypot(dx,dy),speed=target?420:160,step=Math.min(speed*dt,len);let nx=state.player.x+dx/len*step,ny=state.player.y+dy/len*step;if(inside(nx,ny)){state.player.x=nx;state.player.y=ny}else{if(inside(nx,state.player.y))state.player.x=nx;else if(inside(state.player.x,ny))state.player.y=ny;else target=null;}moveSave+=dt;if(moveSave>1){save();moveSave=0}}
 cacheSpots.forEach((p,i)=>{if(!state.collected.includes(i)&&Math.hypot(p.x-state.player.x,p.y-state.player.y)<23){state.collected.push(i);state.stats[0]=clamp(state.stats[0]+3);save();render();toast('+3 supplies · crate found');beep(790)}});
 const b=state.phase==='map'&&BEATS[state.step],near=b&&Math.hypot(locations[b.loc].x-state.player.x,locations[b.loc].y-state.player.y)<50;const show=state.started&&state.phase==='map';$('#interact').hidden=!show;const lbl=near?'Start mission (E)':'Go to mission ↗';if($('#interact').textContent!==lbl)$('#interact').textContent=lbl;$('#mapHint').textContent=near?'MISSION READY':target?'ON THE MOVE':'EXPLORE • GATHER • GOVERN';
 if(near&&target&&Math.hypot(target.x-locations[b.loc].x,target.y-locations[b.loc].y)<5){target=null;openBeat()}}
canvas.addEventListener('pointerdown',e=>{if(overlayOpen())return;canvas.focus();const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-ox)/scale,y=(e.clientY-r.top-oy)/scale;if(inside(x,y)){target={x,y};beep(330,.035)}else toast('Stay on the island. Click a trail or the gold marker.');});
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape'){if(!$('#event').hidden&&!state.openEvent)$('#event').hidden=true;return}const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k)){if(!overlayOpen()){keys[k]=true;e.preventDefault()}}if(k==='e'&&!$('#interact').hidden&&!overlayOpen())openBeat();if(!$('#event').hidden&&['1','2','3'].includes(k)){const b=document.querySelector('[data-choice="'+(+k-1)+'"]');if(b&&!b.disabled)choose(+k-1)}});
window.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});window.addEventListener('blur',()=>keys={});
$('#travel').onclick=()=>{if(state.phase!=='map'){showEnding();return}const p=locations[BEATS[state.step].loc];if(Math.hypot(p.x-state.player.x,p.y-state.player.y)<50)openBeat();else{target={x:p.x,y:p.y};toast('Heading to '+p.name);canvas.focus();}};
$('#interact').onclick=()=>$('#travel').click();
$('#choiceList').onclick=e=>{const b=e.target.closest('[data-choice]');if(b&&!b.disabled){choose(+b.dataset.choice);return}const p=e.target.closest('[data-purpose]');if(p){const i=+p.dataset.purpose;if(charterPicks.includes(i))charterPicks=charterPicks.filter(x=>x!==i);else{if(charterPicks.length>=2)charterPicks.shift();charterPicks.push(i)}document.querySelectorAll('[data-purpose]').forEach(x=>{const on=charterPicks.includes(+x.dataset.purpose);x.classList.toggle('picked',on);x.setAttribute('aria-pressed',on)});const s=$('#signCharter');s.disabled=charterPicks.length!==2;s.textContent=charterPicks.length===2?'Sign the charter →':`Pick ${2-charterPicks.length} more promise${charterPicks.length===1?'':'s'}`;return}if(e.target.id==='signCharter')signCharter();};
$('#continue').onclick=next;$('#help').onclick=()=>{$('#helpDialog').showModal();keys={}};$('#journalBtn').onclick=journal;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-label',sound?'Disable sound':'Enable sound');beep(600)};
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.color=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x===b))});
$('#start').onclick=()=>{state.name=$('#nameInput').value.trim().slice(0,24)||'Drift Island';state.started=true;$('#welcome').hidden=true;save();render();toast('Click “Go to mission” or walk to the gold marker.',3500);canvas.focus();};
$('#restart').onclick=restart;$('#download').onclick=download;
document.querySelectorAll('[data-dir]').forEach(b=>{const dirs={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[dirs[b.dataset.dir]]=true});['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[dirs[b.dataset.dir]]=false));});
/* Start-up and resume */
render();resize();
if(!state.started)$('#welcome').hidden=false;
else{if(state.pending)showResult();else if(state.openEvent)openSurprise();else if(state.phase!=='map')showEnding();const bn=$('#banner');bn.textContent=`Welcome back! You’re on step ${stepNum()} of ${TOTAL_STEPS}.`;bn.hidden=false;setTimeout(()=>bn.hidden=true,6000);}
requestAnimationFrame(draw);
