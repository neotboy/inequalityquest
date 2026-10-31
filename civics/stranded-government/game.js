'use strict';
/* ===== STRANDED: GOVERN OR COLLAPSE — story data and rules =====
   Meters: 0 Supplies, 1 Safety, 2 Trust, 3 Freedom. Ren = rival power (0-100).
   People: 30 survivors. "die" = lives lost; "flee" = people who leave the island.
   Everything here is a fictional game outcome, not a claim about real events. */
const START_STATS=[60,50,50,50], START_REN=30, TOTAL_STEPS=10, START_PEOPLE=30, MAX_EVENTS=5;
const labels=['Supplies','Safety','Trust','Freedom'];
const judgeName=s=>({council:'Ash, your judge,',direct:'The whole camp',ren:'Ren'}[s.flags.model]||'Ash');
const BEATS=[
{id:'barrel',loc:'water',title:'The Last Barrel',tag:'WHY HAVE A GOVERNMENT?',concept:'Social contract',
 story:()=>'Day 1. Ren grabs the only barrel of fresh water: “I decide who drinks.” Thirty thirsty people start shouting.',
 choices:[
 {t:'Make water rules together',sub:'Everyone gives up some freedom',d:[0,5,6,-8],ren:-5,say:'Talk all you want. I’m still thirsty.',head:'A deal everyone signs',res:'Two cups each a day. Nobody grabs. Everyone gave up a little freedom.',learn:'You made a <b>social contract</b>: people give up some freedom so a government can protect them.',key:'Made water rules together',flags:{water:1,power:'Shared rules'}},
 {t:'Let Ren guard the barrel',sub:'Fast order, one boss',d:[5,10,-8,-10],ren:15,say:'Smart. Somebody has to be in charge.',head:'Ren holds the ladle',res:'The line is calm. Ren’s friends drink first. Nobody limits his power.',learn:'You traded freedom for order (a <b>social contract</b>) but put no <b>limits</b> on Ren.',key:'Let Ren guard the water',flags:{water:1,power:'Ren’s crew'}},
 {t:'No rules. Grab your share',sub:'Total freedom, nobody in charge',d:[-15,-10,-5,10],ren:5,die:2,news:'2 dead in water brawl',say:'See? Without me, it’s chaos.',head:'Brawl at the barrel',res:'The barrel tips and the water soaks into the sand. Two men die in the brawl.',learn:'Thomas Hobbes called life with no government the <b>state of nature</b>: “nasty, brutish, and short.”',key:'No rules: brawl (2 died)',flags:{water:0},art:'fight'}]},
{id:'power',loc:'hall',title:'Who Holds the Power?',tag:'THREE POWERS',concept:'Three powers',
 story:()=>'Three jobs need doing: make the rules, carry them out, and judge who broke them. Who gets them?',
 choices:[
 {t:'Elect a council; split the jobs',sub:'Slower, but power is shared',d:[-5,-5,6,5],ren:-10,say:'A committee? We’ll starve waiting for a vote.',head:'Three jobs, three hands',res:'The council writes rules. Jo carries them out. Ash judges.',learn:'You split <b>legislative</b> (make), <b>executive</b> (carry out), and <b>judicial</b> (judge) power among elected leaders: a <b>representative democracy</b>.',key:'Elected council, split the 3 powers',flags:{model:'council',rules:1,power:'Elected council'}},
 {t:'All 30 vote on every rule',sub:'Everyone has a say; very slow',d:[-8,-8,4,10],ren:-5,say:'Thirty people arguing? Good luck.',head:'Everybody votes',res:'Meetings run until dark. Nobody fishes. Chores pile up.',learn:'Everyone voting on every rule is <b>direct democracy</b>: the people hold <b>legislative</b> power (making rules) themselves.',key:'Direct democracy: all 30 vote',flags:{model:'direct',rules:1,power:'Whole camp votes'}},
 {t:'Ren does all three jobs',sub:'Fast, and nobody checks him',d:[5,10,-10,-12],ren:20,say:'Finally, someone with sense.',head:'One man, three jobs',res:'Ren makes the rules, enforces them, and judges who broke them.',learn:'One person holding <b>legislative</b>, <b>executive</b>, and <b>judicial</b> power is <b>autocracy</b>: rule by one.',key:'Autocracy: Ren holds all 3 powers',flags:{model:'ren',rules:1,power:'Ren rules alone'}}]},
{id:'thief',loc:'camp',title:'The Night Thief',tag:'KEEPING ORDER',concept:'Justice & order',
 story:s=>`Food vanished overnight. Jo caught Kai with the empty bag: “My little brother was starving.” ${judgeName(s)} must decide.`,
 choices:[
 {t:'Hold a fair hearing first',sub:'Both sides speak; takes a day',d:[-5,0,6,5],ren:-5,say:'A trial for a thief? You’re soft.',head:'Both sides heard',res:s=>`${judgeName(s)} hears both sides. Kai works extra shifts to pay it back.`,learn:'Settling disputes fairly is <b>judicial power</b>, and it helps <b>establish justice</b>, a Preamble purpose.',key:'Fair hearing for the thief'},
 {t:'Punish Kai in public',sub:'Scares others; some call it cruel',d:[5,10,-10,-8],ren:10,say:'Now they’ll think twice.',head:'Public punishment',res:'Kai gets no food for three days. Thefts stop. Whispers start.',learn:'Enforcing rules is <b>executive power</b>, but with no hearing, no <b>judicial power</b> checked if it was fair.',key:'Public punishment, no hearing'},
 {t:'Let it go. People are hungry',sub:'Kind, but rules mean less',d:[-12,-10,5,5],ren:0,say:'A rule nobody enforces isn’t a rule.',head:'More food gone',res:'Kai is grateful. By morning, two more bags of food are missing.',learn:'A rule keeps order only if someone enforces it (<b>executive power</b>) and judges it (<b>judicial power</b>).',key:'Let the thief go',art:'raid',flags:{theft:1}}]},
{id:'ship',loc:'watch',title:'Ship on the Horizon',tag:'WHAT MAKES A STATE?',concept:'Four features of a state',
 story:()=>'A company ship anchors offshore. The captain shouts: “This island is ours. Hand over half your food, or leave.”',
 choices:[
 {t:'We rule ourselves here',sub:'Stand firm; they may come back',d:[0,-10,6,5],ren:-5,say:'Brave. Let’s hope they don’t come back angry.',head:'A flag on the ridge',res:'You raise a flag. The ship sails off. The captain yells, “We’ll be back.”',learn:'You claimed <b>sovereignty</b> (final say over your land); a <b>state</b> needs people, land, a government, and sovereignty.',key:'Declared independence',flags:{guard:1,defied:1}},
 {t:'Pay them to leave us alone',sub:'Safer, but outsiders get a say',d:[-12,10,-5,-5],ren:0,say:'Paying strangers? Weak.',head:'Protection money',res:'The company takes food every month. Its ship keeps pirates away.',learn:'You still have people, land, and a government, but outsiders now control you, so you lost <b>sovereignty</b>.',key:'Paid the company',flags:{paid:1}},
 {t:'Send Ren to cut a deal',sub:'Ren talks; you stay out',d:[5,5,-10,0],ren:15,say:'Leave the talking to me.',head:'Ren’s side deal',res:'Ren gives the company the north beach. In return, his crew gets weapons.',learn:'Ren gave away <b>territory</b> (land), one of the four things every <b>state</b> needs.',key:'Ren made a deal (gave up land)',flags:{renArms:1}}]},
{id:'claim',loc:'grove',title:'Who Has the Right to Rule?',tag:'WHERE DOES POWER COME FROM?',concept:'Origins of government',
 story:()=>'Ren: “God spared me in the wreck. I was chosen to lead.” Old Mara says her family always led. Others want a vote.',
 choices:[
 {t:'Hold an election',sub:'Power comes from the people',d:[-5,-5,6,5],ren:-15,say:'Votes? Fine. I won’t forget this.',head:'The people choose',res:'Jo wins. Ren gets 6 votes, all from his own crew.',learn:'Power from the people’s agreement is <b>social contract theory</b>; the others are <b>evolutionary</b>, <b>divine right</b>, and <b>force</b>.',key:'Election (social contract)'},
 {t:'Let Mara’s family lead',sub:'Tradition: families grow into tribes',d:[5,5,-5,-5],ren:-5,say:'An old woman and her cousins? Really?',head:'The family takes charge',res:'Mara’s family farms well. Everyone else feels left out.',learn:'Government that grew from families into clans and tribes is <b>evolutionary theory</b>.',key:'Mara’s family (evolutionary)'},
 {t:'Accept Ren as “chosen”',sub:'No vote, no questions',d:[0,10,-10,-10],ren:20,say:'At last, you see it.',head:'Ren, the chosen one',res:'Ren’s crew cheers. Questioning Ren now means questioning God.',learn:'A ruler claiming God chose them is <b>divine right</b>, used by European kings for centuries.',key:'Ren is “chosen” (divine right)',flags:{power:'Ren, “chosen”'}}]},
{id:'storm',loc:'water',title:'The Storm',tag:'PURPOSES OF GOVERNMENT',concept:'Purposes of government',
 story:()=>'A storm smashes the water station and the lookout. Two fishers are lost at sea. You can only fix one thing.',
 choices:[
 {t:'Fix the water for everyone',sub:'Costs 15 supplies',need:15,d:[-15,0,8,0],ren:0,die:2,news:'2 fishers drown',say:'Water won’t stop the next ship.',head:'Clean water, two lost',res:'Everyone drinks. With no lookout, nobody spots the fishers. Both drown.',learn:'Meeting shared needs like water is <b>promoting the general welfare</b>, a Preamble purpose.',key:'Fixed water (2 fishers drowned)',flags:{water:2}},
 {t:'Rebuild the lookout',sub:'Costs 15 supplies',need:15,d:[-15,15,-5,0],ren:5,say:'Good. Eyes on the water.',head:'Eyes on the sea',res:'The lookout spots the fishers. Both saved. Everyone drinks muddy rainwater.',learn:'Guarding against danger from outside is <b>providing for the common defense</b>, a Preamble purpose.',key:'Rebuilt lookout (common defense)',flags:{guard:2,badWater:1}},
 {t:'Save supplies, fix nothing',sub:'Keep supplies for later',d:[5,-10,-10,0],ren:0,die:2,news:'2 fishers drown',say:'So the leaders just… wait? Interesting.',head:'Waiting it out',res:'You keep your supplies. Both fishers drown. People drink bad water.',learn:'Doing nothing is still a <b>public policy</b> (a government’s plan), and people pay when shared needs go unmet.',key:'Fixed nothing (2 drowned)',art:'storm',flags:{badWater:1}}]},
{id:'emergency',loc:'camp',title:'Emergency Powers',tag:'LIMITS ON POWER',concept:'Limited government',
 story:s=>(s.flags.model==='ren'||s.renControl)?'Ash posts notes mocking Ren. Ren wants more: “Ban criticism. My crew searches any tent, any time.”':'Ash posts notes mocking the leaders. Ren: “Give me emergency powers. Ban criticism. Let my crew search any tent.”',
 choices:[
 {t:'No. Leaders follow rules too',sub:'Rights stay; Ren’s crew quits watch',d:[0,-10,5,12],ren:-15,say:'You’ll regret tying my hands.',head:'Rights protected',res:'Ash keeps posting. Ren’s crew walks off the night watch.',learn:'Limits on leaders, while people keep rights like free speech, is <b>limited government</b>.',key:'Refused: leaders have limits',flags:{noWatch:1}},
 {t:'Yes, until the crisis ends',sub:'More order, fewer freedoms',d:[0,15,-10,-20],ren:20,die:1,news:'Man dies in night search',say:'Finally. Now I can keep order.',head:'Ren’s crew moves in',res:'Ash’s notes are torn down. A man fights a night search and dies. No end date.',learn:'Power with no limits and no end date breaks <b>limited government</b>.',key:'Gave Ren emergency powers (1 died)',art:'riot',flags:{power:'Ren’s emergency rule',searches:1}},
 {t:'Searches only with a judge’s OK',sub:'Middle path; slow and costly',d:[-8,5,0,-5],ren:0,say:'Paperwork. Fine. I can be patient.',head:'A check on power',res:'Ash keeps posting. Ren’s crew needs a judge’s OK to search a tent.',learn:'Needing a judge’s OK, like a <b>warrant</b> in the Fourth Amendment, is <b>limited government</b> at work.',key:'Searches need a judge’s OK'}]},
{id:'charter',loc:'hall',title:'The Charter',tag:'YOUR FINAL CALL',concept:'Preamble purposes',pick2:true,
 story:()=>'Rescue may never come. Write your charter (founding plan). There is room for only two promises.',
 choices:[
 {t:'Form a more perfect union',sub:'Unite everyone as one',d:[0,0,8,0],ren:-3},
 {t:'Establish justice',sub:'Fair rules and fair trials',d:[0,0,5,3],ren:-3},
 {t:'Insure domestic tranquility',sub:'Keep peace inside camp',d:[0,8,0,0],ren:3},
 {t:'Provide for the common defense',sub:'Protect against outsiders',d:[-3,8,0,0],ren:3},
 {t:'Promote the general welfare',sub:'Care for needs like food',d:[8,0,0,0],ren:0},
 {t:'Secure the blessings of liberty',sub:'Protect people’s freedoms',d:[0,0,0,8],ren:-5}]}
];

/* "Prove it" checks: one per decision. A NEW situation, so students must apply the idea, not just remember the story. */
const PROVE={
barrel:{q:'A new town forms. People agree to pay taxes and obey laws so the town keeps them safe. What is that?',opts:[['sc','Social contract: trade some freedom for safety'],['sn','State of nature: no rules, strongest wins'],['dr','Divine right: God picked the ruler'],['dd','Direct democracy: all vote on every law']],ans:'sc',hint:'What do people give up, and what do they get back?'},
power:{q:'A city bans texting while driving. Police write tickets. A judge hears one case. Which power did the POLICE use?',opts:[['exe','Executive: carrying out the rules'],['leg','Legislative: writing the rules'],['jud','Judicial: judging what rules mean'],['sov','Sovereignty: final say over land']],ans:'exe',hint:'The police didn’t write the ban or judge the case.'},
thief:{q:'Two neighbors fight over a fence line. A judge hears both sides and decides. Which power settled it?',opts:[['jud','Judicial: settling disputes over rules'],['exe','Executive: enforcing rules each day'],['leg','Legislative: making brand-new laws'],['sov','Sovereignty: control over the land']],ans:'jud',hint:'Who decided, and what kind of job is deciding a dispute?'},
ship:{q:'A country has people, land, and leaders. But a neighbor’s army decides all its laws. What is it missing?',opts:[['sov','Sovereignty: final say over its laws'],['pop','Population: people living inside it'],['ter','Territory: land inside its borders'],['gov','Government: leaders who run it']],ans:'sov',hint:'It has people, land, and leaders. Who has the final say?'},
claim:{q:'A general and his soldiers seize the capital: “We are the government now.” Where did their power come from?',opts:[['for','Force: taken by strength and fear'],['sc','Social contract: the people agreed'],['evo','Evolutionary: grew out of families'],['div','Divine right: God chose the ruler']],ans:'for',hint:'Did the people agree, or did someone take it?'},
storm:{q:'A town builds a water plant so every family has clean water. Which Preamble purpose is that?',opts:[['gw','General welfare: meeting shared needs'],['cd','Common defense: stopping attacks'],['ej','Justice: fair laws and trials'],['bl','Liberty: protecting freedoms']],ans:'gw',hint:'Clean water is a need everyone shares.'},
emergency:{q:'A mayor cancels the election “until things calm down.” A court says the city charter forbids it. What idea did the court protect?',opts:[['lim','Limited government: leaders obey rules too'],['dr','Divine right: leaders answer only to God'],['for','Force theory: the strongest gets to rule'],['dd','Direct democracy: citizens vote on all laws']],ans:'lim',hint:'The court stopped a leader from going past the rules.'},
charter:{q:'The Preamble says government should “insure domestic tranquility.” What does that mean?',opts:[['dt','Keep peace inside the country'],['cd','Protect it from outside attacks'],['ej','Make courts and trials fair'],['gw','Meet needs everyone shares']],ans:'dt',hint:'“Domestic” means at home. “Tranquility” means calm.'}};
const PROVE_TOTAL=Object.keys(PROVE).length, CHECK_TOTAL=PROVE_TOTAL+4;

/* Surprise events. Up to 5 per game, at most one between decisions.
   "when" = caused by the student's meters/choices (chain reactions). "chance" = can also strike at random. */
const EVENTS=[
{id:'coup',title:'Ren Seizes the Ridge',art:'riot',loc:'watch',min:2,when:s=>s.ren>=65&&!s.renControl,cause:()=>'Ren’s power hit 65.',
 story:'At dawn, Ren’s crew takes the lookout and the food store. “From now on, I give the orders.”',
 choices:[
 {t:'Rally the camp against Ren',sub:'Only works if Trust is 50+',fn:s=>s.stats[2]>=50?{d:[0,-10,5,0],ren:-30,die:1,news:'1 dead retaking the ridge',head:'The camp fights back',res:'Thirty people storm the ridge. Ren’s crew runs. One man falls from the rocks.',say:'This isn’t over.',key:'Rallied vs Ren (won, 1 died)'}:{d:[0,-10,-10,-10],ren:10,die:3,news:'3 dead as Ren crushes rally',head:'The rally fails',res:'Too few follow you. Ren’s crew drives you back. Three die on the hill.',say:'Nobody follows you. They follow me.',key:'Rallied vs Ren (lost, 3 died)',flags:{power:'Ren took control'},control:true}},
 {t:'Deal: Ren runs the guards',sub:'No fight; Ren gets stronger',d:[0,10,-5,-10],ren:10,say:'Now we understand each other.',head:'A deal with Ren',res:'Nobody gets hurt today. Ren’s crew now holds the store and the ridge.',key:'Deal: Ren runs the guards',flags:{power:'Ren runs the guards'},control:true}],
 learn:'Taking power by strength is the <b>force theory</b> of government.'},
{id:'starve',title:'The Food Is Gone',art:'raid',loc:'camp',min:1,when:s=>s.stats[0]<=12,cause:()=>'Supplies fell to almost zero.',
 story:'The crates are empty. People are too weak to work. The oldest are dying first.',
 choices:[
 {t:'Send divers to the reef',sub:'Could find food; could drown',fn:()=>Math.random()<.5?{d:[20,0,5,0],ren:0,head:'Fish for everyone',res:'The divers come back with fish and crabs. Everyone eats tonight.',say:'Lucky. Luck runs out.',key:'Divers found food'}:{d:[5,0,-5,0],ren:0,die:2,news:'2 divers drown',head:'The reef takes two',res:'The current is too strong. Two divers drown. They bring back a little food.',say:'You sent them. Remember that.',key:'Divers (2 drowned)'}},
 {t:'Take Ren’s hidden food',sub:'Food now; Ren fights back',d:[15,-10,0,0],ren:-10,die:1,news:'1 dead in food-stash fight',head:'Raid on Ren’s stash',res:'You find Ren’s secret food stash. In the scuffle, one man dies.',say:'You’ll pay for that.',key:'Took Ren’s stash (1 died)'}],
 learn:'<b>Promoting the general welfare</b> starts with basic needs, like food, that keep people alive.'},
{id:'raiders',title:'The Company Ship Is Back',art:'raid',loc:'dock',min:6,when:s=>s.flags.defied&&!s.flags.paid,cause:()=>'You told the company no.',
 story:'The company ship returns with armed sailors. They land on the beach and march toward your food.',
 choices:[
 {t:'Fight them on the beach',sub:'Much better with a lookout',fn:s=>s.flags.guard>=2?{d:[0,-5,8,5],ren:-5,die:1,news:'1 dead defending the beach',head:'Driven back to sea',res:'The lookout saw them coming. You drive them off. One defender dies.',say:'Not bad. For amateurs.',key:'Fought raiders (won, 1 died)'}:{d:[-10,-15,0,0],ren:5,die:4,news:'4 dead in company raid',head:'Caught off guard',res:'No lookout, no warning. They hit before you’re ready. Four die.',say:'Should have listened to me.',key:'Fought raiders (4 died)'}},
 {t:'Hand over the food',sub:'Nobody dies; you lose control',d:[-20,0,-10,-5],ren:5,head:'A company flag',res:'They take half your food and plant their flag on your beach.',say:'You fold too easy.',key:'Gave raiders the food',flags:{paid:1}}],
 learn:'Defending your land is <b>common defense</b>; giving in costs <b>sovereignty</b>.'},
{id:'squeeze',title:'The Company Wants More',art:'raid',loc:'dock',min:6,when:s=>s.flags.paid&&!s.flags.defied,cause:()=>'You paid the company once.',
 story:'The company doubles its price: “Pay double, or we take it.” Your crates are already thin.',
 choices:[
 {t:'Pay double',sub:'Safe now; people go hungry',d:[-20,5,-8,-5],ren:5,head:'The ship leaves full',res:'The company takes double. Your camp goes to bed hungry.',say:'They own you now.',key:'Paid double'},
 {t:'Refuse to pay',sub:'Take back control; risk a raid',fn:s=>({d:[0,-10,8,8],ren:-5,die:s.flags.guard>=2?1:3,news:s.flags.guard>=2?'1 dead in company raid':'3 dead in company raid',head:'They come for it',res:s.flags.guard>=2?'The lookout warns you. You hold the beach. One defender dies.':'Sailors storm the camp at night. Three die before they leave.',say:'Freedom costs blood. Told you.',key:`Refused the company (${s.flags.guard>=2?1:3} died)`})}],
 learn:'Once outsiders control your choices, you have lost <b>sovereignty</b>.'},
{id:'purge',title:'Ren’s Crew Goes Hunting',art:'riot',loc:'camp',min:4,when:s=>s.ren>=55&&(s.renControl||s.flags.searches||s.flags.renArms||s.flags.model==='ren'),cause:()=>'Ren has power and nobody limits it.',
 story:'Ren’s crew drags two critics out of their tents at night. Their families beg you to act.',
 choices:[
 {t:'Stand up to Ren’s crew',sub:'Only works if Trust is 45+',fn:s=>s.stats[2]>=45?{d:[0,-5,8,5],ren:-20,head:'The camp says no',res:'The whole camp surrounds Ren’s crew. They let the critics go.',say:'You got lucky tonight.',key:'Stood up to Ren (critics saved)'}:{d:[0,-5,-10,-5],ren:5,die:2,news:'2 critics vanish',head:'Too few stood up',res:'Only a handful stand with you. The two critics are never seen again.',say:'Anyone else want to complain?',key:'Stood up to Ren (2 lost)'}},
 {t:'Stay out of it',sub:'Safe for you, not for them',d:[0,5,-12,-10],ren:10,die:2,news:'2 critics vanish',head:'You looked away',res:'You stay in your tent. The two critics are never seen again.',say:'Smart. Keep your head down.',key:'Looked away (2 lost)'}],
 learn:'Without <b>limited government</b>, rulers can silence critics with no trial.'},
{id:'rebels',title:'Rebels in the Night',art:'fire',loc:'watch',min:2,when:s=>s.stats[3]<=30,cause:()=>'Freedom fell to 30 or less.',
 story:'Someone cuts the lookout ropes and leaves a note: “We never agreed to this.”',
 choices:[
 {t:'Listen to their demands',sub:'Give back some freedoms',d:[0,-5,5,15],ren:-10,say:'You’re rewarding criminals.',head:'Talks at the fire',res:'The rebels come out of hiding. You give back the right to meet and speak.',key:'Listened to rebels'},
 {t:'Hunt down the rebels',sub:'Order now; anger later',d:[0,5,-15,-5],ren:10,die:2,news:'2 rebels killed',say:'Finally, some backbone.',head:'Tents torn apart',res:'Guards tear through every tent. Two rebels die fighting. Many more are furious.',key:'Hunted rebels (2 died)',flags:{anger:1}}],
 learn:'John Locke said people may change a government that abuses its power, an idea in the Declaration of Independence.'},
{id:'mutiny',title:'Nobody Shows Up',art:'riot',loc:'hall',min:1,when:s=>s.stats[2]<=35,cause:()=>'Trust fell to 35 or less.',
 story:'Nobody shows up for work. A sign reads: “Why follow rules we never agreed to?”',
 choices:[
 {t:'Call an open meeting',sub:'Listen first; work waits',d:[-5,-5,15,0],ren:-5,say:'Meetings. Always meetings.',head:'Everyone gets a say',res:'People shout it out. By nightfall, most agree to go back to work.',key:'Open meeting'},
 {t:'Force them to work',sub:'Work gets done; people resent it',d:[10,5,-10,-10],ren:10,die:1,news:'Worker dies on forced crew',say:'See? Fear works.',head:'Work under guard',res:'Guards march people to the fields. One worker collapses in the heat and dies.',key:'Forced work (1 died)'}],
 learn:'Government works best with the <b>consent of the governed</b>: the people’s agreement.'},
{id:'raid',title:'Storehouse Break-In',art:'raid',loc:'camp',min:1,when:s=>s.stats[0]<=25||s.flags.theft&&s.stats[1]<=40,cause:s=>s.flags.theft?'You let the first thief go.':'Supplies fell to 25 or less.',
 story:'Hungry people break into the storehouse at night. Knives come out in the dark.',
 choices:[
 {t:'Post an armed guard',sub:'Protects food; fewer freedoms',d:[5,10,-5,-5],ren:5,die:1,news:'Raider killed at storehouse',say:'Put my crew on it.',head:'Locked and guarded',res:'The guard catches a raider. He fights back and dies. The raids stop.',key:'Armed guard (1 died)'},
 {t:'Split what’s left equally',sub:'Fair, but food runs out sooner',d:[-8,-5,10,0],ren:0,say:'Sharing won’t fill empty crates.',head:'Equal shares',res:'Everyone gets the same small share. Fights stop. The crates are nearly empty.',key:'Split food equally'}],
 learn:'When food runs out, <b>maintaining order</b>, one of government’s main jobs, gets much harder.'},
{id:'chaos',title:'Brawl Over the Boat',art:'fight',loc:'dock',min:2,when:s=>s.stats[3]>=60&&s.stats[1]<=40,cause:()=>'High freedom, low safety.',
 story:'With few rules and nobody enforcing them, two groups fight over the only boat.',
 choices:[
 {t:'Set a curfew and boat rules',sub:'Order returns; freedom shrinks',d:[0,15,0,-10],ren:5,say:'Rules. Told you so.',head:'Rules for the boat',res:'The boat gets a sign-up sheet and a curfew. People grumble. The fighting stops.',key:'Curfew and boat rules'},
 {t:'Let them work it out',sub:'Freedom stays; risk grows',d:[-10,-10,0,5],ren:5,die:2,news:'2 drown in boat brawl',say:'Enjoy your freedom.',head:'The boat goes down',res:'Mid-fight, the boat hits the rocks and flips. Two drown.',key:'Let them fight (2 drowned)'}],
 learn:'Freedom with no order can turn deadly; <b>maintaining order</b> is a main job of government.'},
{id:'raft',title:'Six Try to Escape',art:'storm',loc:'dock',min:3,when:s=>s.stats[2]<=40,cause:()=>'Trust fell to 40 or less.',
 story:'Six people build a raft. “We never agreed to your rules.” They plan to push off at dawn.',
 choices:[
 {t:'Let them go',sub:'Their choice; the sea is rough',d:[5,0,5,10],ren:0,flee:6,say:'Six fewer mouths. Fine by me.',head:'The raft drifts away',res:'The raft drifts out of sight. Nobody knows if they will make it.',key:'Let 6 leave on a raft',flags:{raft:1}},
 {t:'Stop them at the shore',sub:'Everyone stays; freedom shrinks',d:[0,5,-10,-15],ren:5,say:'Nobody leaves my island.',head:'Raft burned',res:'Guards drag the raft ashore and burn it. The six are furious.',key:'Stopped the raft'}],
 learn:'People who no longer <b>consent</b> to a government may try to leave it.'},
{id:'fever',title:'Fever in Camp',art:'storm',loc:'camp',min:2,when:s=>s.flags.badWater===1,chance:.25,cause:s=>s.flags.badWater?'Your camp drank bad water.':'Crowded tents, and bad luck.',
 story:'Fever spreads through the tents. Eight people are sick. Medicine is low.',
 choices:[
 {t:'Use medicine on everyone',sub:'Costs 10 supplies',need:10,d:[-10,0,8,0],ren:0,die:1,news:'Fever: 1 dead',say:'Waste it all, then.',head:'Medicine for all',res:'Most recover. One doesn’t. The medicine box is nearly empty.',key:'Medicine for all (1 died)',flags:{badWater:2}},
 {t:'Quarantine the sick tents',sub:'Saves supplies; limits freedom',d:[0,5,-5,-10],ren:5,die:3,news:'Fever: 3 dead',say:'Smart. Keep the sick away.',head:'Tents roped off',res:'The sick are roped off. The fever stops spreading, but three die.',key:'Quarantine (3 died)',flags:{badWater:2}}],
 learn:'<b>Promoting the general welfare</b> (public health) sometimes means limiting freedom.'},
{id:'fire',title:'Fire in the Tents',art:'fire',loc:'camp',min:3,when:s=>!!(s.flags.anger||s.flags.noWatch),chance:.35,cause:s=>s.flags.anger?'Angry rebels wanted revenge.':s.flags.noWatch?'Nobody was on night watch.':'Dry tents, and bad luck.',
 story:'Fire races through the tents at night. People are trapped. The food store is next.',
 choices:[
 {t:'Save the people first',sub:'The food store may burn',d:[-12,0,8,0],ren:0,die:1,news:'Fire: 1 dead',say:'No food. Smart move.',head:'People first',res:'You pull people out. One is lost. The food store burns.',key:'Saved people (1 died)'},
 {t:'Save the food store',sub:'Food is life, but tents burn',d:[0,-5,-12,0],ren:5,die:3,news:'Fire: 3 dead',say:'Cold. I like it.',head:'Food saved',res:'The food is safe. Three people in the far tents don’t make it out.',key:'Saved food (3 died)'}],
 learn:'Emergencies like fires are why governments <b>promote the general welfare</b> with rescue and safety services.'}
];
const URGENT=['coup','starve'];
const ENDINGS={
 dictatorship:{title:'Island Dictatorship',badge:'▲',bonus:0,why:s=>`Ren’s power hit ${s.ren}. ${s.events.includes('coup')?'His crew took the ridge by <b>force</b>.':'Your choices kept handing him more.'} One man now makes, enforces, and judges every rule: a <b>dictatorship</b>.`},
 collapse:{title:'Collapse',badge:'✕',bonus:0,why:s=>`${alive(s)<=15?`Only ${alive(s)} of 30 are left.`:`${worstMeters(s)} fell too low.`} Your government couldn’t do its basic jobs, so the camp broke apart. That’s why people create government: to <b>maintain order</b> and keep people alive.`},
 revolution:{title:'Revolution',badge:'✊',bonus:3,why:s=>`${renOnTop(s)?'Ren grabbed power but couldn’t keep order, so the camp threw him out.':`${worstMeters(s)} fell too low, so people tore the government down.`} John Locke said people may replace a government that breaks the <b>social contract</b>.`},
 republic:{title:'Thriving Republic',badge:'✦',bonus:15,why:s=>`Every meter stayed 45+ and Ren never took over. People chose leaders and kept limits on them: the <b>social contract</b> and <b>limited government</b> at work.`},
 fragile:{title:'Fragile Peace',badge:'◇',bonus:8,why:s=>`Your camp held, but ${worstMeters(s)} stayed weak${s.dead>6?` and ${s.dead} people died`:''}. Every government trades off order, freedom, trust, and supplies.`}
};
function alive(s){return START_PEOPLE-s.dead-s.fled}
function worstMeters(s){const idx=[0,1,2,3].sort((a,b)=>s.stats[a]-s.stats[b]);const low=idx.filter(i=>s.stats[i]<=25);const pick=(low.length?low:[idx[0]]).slice(0,2);return pick.map(i=>labels[i]+' ('+s.stats[i]+')').join(' and ')}
function renOnTop(s){return s.ren>=75||(s.renControl&&s.ren>=60)}
function endingFor(s){const st=s.stats,min=Math.min(...st);
 if(alive(s)<=15||st[0]<=10||st[1]<=15)return 'collapse';
 if(renOnTop(s))return st[1]>=45?'dictatorship':'revolution';
 if(st.filter(n=>n<=20).length>=2)return 'collapse';
 if(st[3]<=25||st[2]<=20)return 'revolution';
 if(min>=45&&s.ren<=45&&s.dead<=6)return 'republic';
 return 'fragile';}
/* Score: meters (up to 35) + first-try checks (up to 30) + ending bonus (up to 15) + lives (20, minus 3 per death, minus 1 per person who fled) − Ren penalty. */
function scoreParts(s,firstTry){const avg=s.stats.reduce((a,b)=>a+b,0)/4;return {meters:Math.round(avg*.35),checks:Math.round(firstTry/CHECK_TOTAL*30),ending:ENDINGS[s.ending||endingFor(s)].bonus,lives:20-3*s.dead-s.fled,ren:-Math.round(Math.max(0,s.ren-50)*.3)}}
function scoreFor(s,firstTry){const p=scoreParts(s,firstTry);return Math.max(0,Math.min(100,p.meters+p.checks+p.ending+p.lives+p.ren))}
const RANKS=[[72,'Island Legend'],[58,'Steady Survivor'],[45,'Shaky Chief'],[30,'Captain of the Wreck'],[15,'Shark Bait'],[0,'Lost at Sea']];
function rankFor(score,ending,s){if(ending==='dictatorship')return 'Ren’s Puppet';if(score>=85&&ending==='republic')return 'Founder of a Free Republic';if(s&&s.dead>=12)return 'Captain of a Ghost Camp';if(s&&s.dead===0&&score>=72)return 'Nobody Left Behind';return RANKS.find(r=>score>=r[0])[1]}
function clamp(n){return Math.max(0,Math.min(100,n))}
/* People die or flee. Each death also costs Trust (people blame the leaders): a chain reaction. */
function applyLoss(s,die=0,flee=0){die=Math.min(die,Math.max(0,alive(s)-3));s.dead+=die;flee=Math.min(flee,alive(s));s.fled+=flee;if(die)s.stats[2]=clamp(s.stats[2]-Math.min(8,die*2));return {die,flee}}
/* Applies a choice to a state object; returns the resolved outcome. */
function resolveChoice(s,c){const o=c.fn?c.fn(s):c;const before=[...s.stats],rb=s.ren;
 s.stats=s.stats.map((n,i)=>clamp(n+(o.d||[0,0,0,0])[i]));s.ren=clamp(s.ren+(o.ren||0));
 if(o.flags)Object.assign(s.flags,o.flags);if(c.flags&&c.fn)Object.assign(s.flags,c.flags);if(o.control)s.renControl=true;
 const loss=applyLoss(s,o.die||0,o.flee||0);const news=[];if(loss.die)news.push(o.news||`${loss.die} dead`);if(loss.flee)news.push(`${loss.flee} people flee the island`);
 return {...o,die:loss.die,flee:loss.flee,news,delta:s.stats.map((n,i)=>n-before[i]),renDelta:s.ren-rb};}
/* Picks the next surprise event: urgent first, then a random one of those your choices caused, then maybe a random disaster. */
function nextEvent(s,rnd=Math.random){if(s.events.length>=MAX_EVENTS)return null;
 const ok=EVENTS.filter(e=>!s.events.includes(e.id)&&s.step>=e.min);
 const urgent=ok.find(e=>URGENT.includes(e.id)&&e.when(s));if(urgent)return urgent;
 const caused=ok.filter(e=>e.when(s));if(caused.length)return caused[Math.floor(rnd()*caused.length)];
 return ok.filter(e=>e.chance).find(e=>rnd()<e.chance)||null}
/* End of each day: people gather food when camp is safe and they trust each other. Fewer people, less food. */
function dailyGather(s){const ok=(s.stats[1]>=40)+(s.stats[2]>=40);const g=Math.round([0,4,8][ok]*(alive(s)>=20?1:.5));s.stats[0]=clamp(s.stats[0]+g);return g}
/* End of each day: neglected meters kill people, and earlier choices come back (chain reactions). */
function nightToll(s,rnd=Math.random){const out=[];
 if(s.stats[0]<=15){const n=applyLoss(s,s.stats[0]<=5?3:2).die;if(n)out.push(`${n} starve to death`)}
 if(s.stats[1]<=15){const n=applyLoss(s,2).die;if(n)out.push(`${n} killed in camp fights`)}
 if(s.flags.raft===1){s.flags.raft=2;if(rnd()<.5){s.fled=Math.max(0,s.fled-6);const n=applyLoss(s,6).die;out.push(`The raft washes back empty. ${n} presumed drowned`)}else out.push('A passing boat says the raft made it')}
 return out}
function impactArt(kind,label){
 const scenes={
  fire:`<path d="M365 110V66l35-25 36 25v44Z" fill="#443634"/><path d="M378 110q-10-19 3-35 2 11 9 13-4-18 10-35 2 18 14 24 14 8 4 33Z" fill="#e46c44" class="flame"/><path d="M392 110q-5-12 4-22 0 8 6 9 8 5 2 13Z" fill="#ffd06b"/>`,
  fight:`<circle cx="376" cy="62" r="18" fill="#d4a67b"/><circle cx="428" cy="62" r="18" fill="#ba906e"/><path d="M342 111q2-37 34-38t34 38M394 111q2-37 34-38t34 38" fill="#654f48"/><path d="m381 83 20-10m-5 1 8-10" stroke="#efaa65" stroke-width="5" stroke-linecap="round"/>`,
  raid:`<path d="M323 93h112v18H323Z" fill="#6a5647"/><path d="m346 92 17-31 15 31m24 0 17-31 14 31" fill="#9d784f"/><g class="puff"><circle cx="330" cy="47" r="20" fill="#82908e" opacity=".65"/><circle cx="356" cy="37" r="25" fill="#82908e" opacity=".45"/></g><path d="M452 111V57m-10 5h20m-20 13h20" stroke="#f2bb67" stroke-width="5"/>`,
  riot:`<path d="M333 111V54h18v57m35 0V43h18v68m34 0V59h18v52" fill="#526067"/><circle cx="342" cy="48" r="11" fill="#cfab88"/><circle cx="394" cy="37" r="11" fill="#cfab88"/><circle cx="444" cy="53" r="11" fill="#cfab88"/><path class="tape" d="M310 84h190" stroke="#d96f5f" stroke-width="4" stroke-dasharray="8 6"/>`,
  storm:`<path d="M325 52q3-25 31-23 14-27 43-7 29-10 40 16 27-2 32 22h-148Z" fill="#899c9d"/><path class="rain" d="m358 71-11 23m38-23-11 23m39-23-11 23m39-23-11 23" stroke="#9fd4dc" stroke-width="5"/><path d="M337 111h155" stroke="#557a7d" stroke-width="5"/>`
 };
 const labels={fire:'CAMP ON FIRE',fight:'VIOLENCE AT CAMP',raid:'RAID IN PROGRESS',riot:'MUTINY',storm:'STORM EMERGENCY'};
 return `<svg class="impact-overlay" viewBox="0 0 560 120" aria-hidden="true"><rect x="0" y="0" width="560" height="120" fill="#07191f55"/><path d="M0 108Q100 95 200 107T400 103T560 108v12H0Z" fill="#263b3d"/>${scenes[kind]}<g class="impact-label"><rect x="20" y="14" width="${Math.round(26+String(label||labels[kind]).length*7.6)}" height="22" rx="4" fill="#081a20cc"/><text x="32" y="29" fill="#ffd084" font-size="10" font-family="Arial" font-weight="bold" letter-spacing="1.3">${esc(label||labels[kind])}</text></g></svg>`;
}

/* ===== Game state, screens and turn-in ===== */
const $=s=>document.querySelector(s), KEY='stranded-gov-day1-v4', ASSIGNMENT_ID='gov-stranded-day1', STANDARD='SS.9-12.Gov.1, SS.9-12.Gov.5';
const SUBMIT_URL='https://fynn-class-assignment-submissions-20261024.neotboy.chatgpt.site/api/submit';
const locations={water:{x:680,y:460,name:'Water station',icon:'water'},camp:{x:470,y:560,name:'Main camp',icon:'camp'},hall:{x:480,y:365,name:'Meeting circle',icon:'hall'},watch:{x:745,y:320,name:'Lookout ridge',icon:'watch'},dock:{x:290,y:440,name:'Wreck beach',icon:'dock'},grove:{x:305,y:670,name:'Family grove',icon:'grove'}};
const colors=['#e1ba77','#8dc4cc','#90ccb0','#c5a7de'];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function plain(html){return String(html).replace(/<[^>]+>/g,'')}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* After a miss, the answers must land in a NEW order. */
let lastOrder={};function reshuffle(key,opts){const prev=lastOrder[key];let o=shuffle(opts),n=0;while(prev&&o.map(x=>x[0]).join()===prev&&n++<20)o=shuffle(opts);lastOrder[key]=o.map(x=>x[0]).join();return o}
function freshState(){return {v:4,dead:0,fled:0,openCause:'',proof:{},logNote:'',started:false,name:'Drift Island',color:'#ffbd69',player:{x:420,y:650},collected:[],step:0,phase:'map',stats:[...START_STATS],ren:START_REN,renControl:false,flags:{water:0,rules:0,guard:0,shelter:0,power:'Unclaimed',model:''},picks:{},eventPicks:{},log:[],events:[],pending:null,openEvent:null,renSay:'Someone has to take charge. Why not me?',concepts:[],ending:null,check:null,sentence:'',score:null,rank:'',submitted:false,studentName:''}}
let state=freshState();
try{const old=JSON.parse(localStorage.getItem(KEY));if(old&&old.v===4)state={...state,...old,flags:{...state.flags,...old.flags}};}catch{}
let target=null,keys={},sound=false,actx=null,toastTimeout,choiceLocked=false,charterPicks=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='Saved on this device';}catch{$('#saved').textContent='Saving unavailable in this browser';}}
function beep(freq=400,duration=.09){if(!sound)return;try{actx??=new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.04,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+duration);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+duration);}catch{}}
function toast(text,ms=2600){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('show'),ms)}
function stepNum(){return state.phase==='map'?Math.min(state.step+1,8):state.phase==='score'?10:9}
function stormy(){return state.phase==='map'&&(state.step===5||(state.step===6&&state.flags.water<2))}
function renStatus(){return state.ren>=75||state.renControl?['IN CONTROL','#ef8f7a']:state.ren>=60?['DANGEROUS','#f0a868']:state.ren>=40?['GROWING','#e8c37a']:['WATCHING','#9fc4b4']}

/* ---------- motion helpers: numbers count, bars slide. Reduced motion shows the final value at once. ---------- */
function countTo(el,from,to,ms=700,fmt=n=>String(n),delay=0,done){if(!el)return;if(calm()||from===to){el.textContent=fmt(to);done&&done();return}el.textContent=fmt(from);const t0=performance.now()+delay;const step=t=>{if(!el.isConnected)return;const k=Math.min(1,Math.max(0,(t-t0)/ms)),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(step);else done&&done()};requestAnimationFrame(step)}
function slideBar(f,from,to){if(!f||calm())return;f.style.transition='none';f.style.width=from+'%';void f.offsetWidth;f.style.transition='';f.style.width=to+'%'}
function pulse(el,cls){if(!el||calm())return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
const signed=n=>(n>0?'+':'')+n;
/* Side panel numbers animate from what the student last saw, once the card in front closes. */
let shown=null;
function animateSide(a,b){const pcs=document.querySelectorAll('#people .pc');
 if(a.alive!==b.alive){countTo(pcs[0].querySelector('b'),a.alive,b.alive,900);if(b.alive<a.alive)pulse(pcs[0],'tick')}
 if(a.dead!==b.dead){countTo(pcs[1].querySelector('b'),a.dead,b.dead,900);pulse(pcs[1],'tick')}
 document.querySelectorAll('#meters .meter').forEach((m,i)=>{if(a.stats[i]===b.stats[i])return;slideBar(m.querySelector('.meter-fill'),a.stats[i],b.stats[i]);countTo(m.querySelector('.num'),a.stats[i],b.stats[i],900);pulse(m,b.stats[i]>a.stats[i]?'up':'down')});
 if(a.ren!==b.ren){slideBar(document.querySelector('#rival .meter-fill'),a.ren,b.ren);countTo(document.querySelector('.ren-num'),a.ren,b.ren,900);pulse(document.querySelector('#rival'),b.ren>a.ren?'down':'up')}}

/* ---------- side panels ---------- */
function render(){
 $('#islandName').textContent=state.name;
 const al=alive(state),cur={alive:al,dead:state.dead,stats:[...state.stats],ren:state.ren},open=overlayOpen(),from=shown&&!open?shown:null;if(!shown||!open)shown=cur;mapDirty=true;
 $('#people').innerHTML=`<div class="pc"><b>${al}</b><span>Survivors</span></div><div class="pc lost ${state.dead?'hit':''}"><b>${state.dead}</b><span>Lives lost</span></div>${state.fled?`<div class="pc"><b>${state.fled}</b><span>Fled</span></div>`:''}`;
 const b=BEATS[state.step],done=state.phase!=='map';
 $('#roundLabel').textContent=`STEP ${stepNum()} OF ${TOTAL_STEPS}`;
 $('#stepTag').textContent=state.started?`Step ${stepNum()} of ${TOTAL_STEPS}`:'About 30 minutes';
 $('#missionTitle').textContent=done?'Your ending':b.title;
 $('#missionGoal').textContent=done?'See your ending, then turn it in.':`Decision ${state.step+1} of 8. Every choice costs something.`;
 $('#objective').textContent=done?'Island story complete':`Go to: ${locations[b.loc].name}`;
 $('#travel').innerHTML=done?'Open my ending <span>↗</span>':'Go to mission <span>↗</span>';
 $('#meters').innerHTML=state.stats.map((n,i)=>`<div class="meter ${n<=25?'low':''}" style="--c:${n<=25?'#ee9b83':colors[i]}"><div class="meter-head"><span>${labels[i]}</span><strong><span class="num">${n}</span><small> /100</small></strong></div><div class="meter-track" role="meter" aria-label="${labels[i]}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}"><div class="meter-fill" style="width:${n}%"></div></div></div>`).join('');
 const [rs,rc]=renStatus();
 $('#rival').innerHTML=`<div class="rival-head"><div class="portrait ren-face" style="--c:#d7a272"></div><div><div class="eyebrow" style="color:${rc}">RIVAL · ${rs}</div><strong>Ren</strong></div><b class="ren-num" style="color:${rc}">${state.ren}</b></div><div class="meter-track ren-track" role="meter" aria-label="Ren's power" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.ren}"><div class="meter-fill" style="width:${state.ren}%;--c:${rc}"></div><i class="ren-line" title="Takeover line"></i></div><p class="ren-quote">“${esc(state.renSay)}”</p><small class="ren-warn">At 75, Ren can take over.</small>`;
 $('#progressBar').style.width=((stepNum()-1)/TOTAL_STEPS*100)+'%';$('#progressText').textContent=`${state.phase==='map'?state.step:8} of 8 decisions · ${state.events.length} disaster${state.events.length===1?'':'s'}`;
 $('#cacheCount').textContent=`${state.collected.length} / 6 crates found`;$('#logCount').textContent=state.log.length;$('#weather').textContent=stormy()?'• Storm':'• Clear skies';
 $('#waterTag').textContent=`Water • ${['Unmanaged','Shared rules','Repaired'][state.flags.water]||'Unmanaged'}`;$('#rulesTag').textContent=`Rules • ${state.flags.rules?'In place':'None'}`;$('#powerTag').textContent=`Power • ${state.flags.power}`;
 const low=Math.min(...state.stats),li=state.stats.indexOf(low);
 $('#campCondition').textContent=low<=20?'Camp in crisis':low<=35?'Under pressure':low>=55?'Holding together':'A fragile balance';
 $('#campDetail').textContent=low>=55?'Steady. Keep the balance.':low<=15&&li<2?`${labels[li]} ${low}. People will die tonight.`:`Weakest: ${labels[li]} (${low}). Low meters cause disasters.`;
 $('#radio').innerHTML=[['Jo','#a3c5a3',state.stats[0]<=25?'Food’s almost gone. Grab green crates.':state.dead>=8?`We’ve buried ${state.dead}. We can’t lose more.`:state.dead?`We lost ${state.dead}. Keep the rest alive.`:'Safe camp, steady work. That’s how we eat.'],['Ash','#b9a4d3',state.stats[3]<=30?'We need our voice back.':state.stats[3]>=70?'Free to speak. Let’s use it.':'A rule needs a reason.'],['Ren','#d7a272',state.renSay]].map(([n,c,t])=>`<div class="message"><div class="portrait" style="--c:${c}"></div><div><strong>${n}</strong><p>${esc(t)}</p></div></div>`).join('');
 $('#blueprintItems').innerHTML=BEATS.map(x=>x.concept).map(n=>`<div class="blueprint-step ${state.concepts.includes(n)?'done':''}"><b>${state.concepts.includes(n)?'✓':'○'}</b>${n}</div>`).join('');
 if(from)animateSide(from,cur);
}

/* ---------- decision cards ---------- */
function choiceButton(c,i){const short=c.need&&state.stats[0]<c.need;return `<button class="choice" data-choice="${i}" ${short?'disabled':''}><span class="letter">${i+1}</span><span><span class="ct">${esc(c.t)}</span><span class="fx">${short?`Need ${c.need} supplies. You have ${state.stats[0]}.`:esc(c.sub)}</span></span></button>`}

/* Read first: choices unlock after a few seconds so nobody can click through without reading. Pauses while the tab is hidden. */
let readTimer=null;
function readSecs(...t){const w=t.join(' ').split(/\s+/).filter(Boolean).length;return Math.max(5,Math.min(8,Math.round(w/5)))}
function readLock(sec){clearInterval(readTimer);const btns=()=>document.querySelectorAll('#choiceList [data-choice], #choiceList [data-purpose]');const keep=new Set([...btns()].filter(b=>b.disabled));btns().forEach(b=>b.disabled=true);const foot=$('#eventFoot'),orig=foot.textContent;let left=sec;const tick=()=>{foot.textContent=`Read the story first. Choices open in ${left}…`};tick();
 readTimer=setInterval(()=>{if(document.hidden)return;left--;if(left<=0){clearInterval(readTimer);btns().forEach(b=>{if(!keep.has(b))b.disabled=false});foot.textContent=orig;const f=document.querySelector('#choiceList button:not([disabled])');if(f)f.focus()}else tick()},1000)}
function openBeat(){
 if(state.phase!=='map'||state.pending||state.openEvent||!state.started)return;
 target=null;keys={};const b=BEATS[state.step];
 $('#eventCard').classList.remove('surprise');$('#event').classList.remove('is-breaking');
 $('#eventLocation').textContent=locations[b.loc].name.toUpperCase();$('#eventDay').textContent=`STEP ${state.step+1} OF ${TOTAL_STEPS}`;
 $('#eventArt').innerHTML=sceneArt(b.loc)+(b.id==='storm'?impactArt('storm','STORM DAMAGE'):'');
 $('#eventType').textContent=b.tag;$('#eventTitle').textContent=b.title;$('#eventStory').textContent=b.story(state);$('#decisionEcho').hidden=true;
 if(b.pick2){charterPicks=[];$('#choiceList').innerHTML=`<div class="charter-grid">${b.choices.map((c,i)=>`<button class="purpose" data-purpose="${i}" aria-pressed="false"><b>${esc(c.t)}</b><small>${esc(c.sub)}</small><em>${c.d.map((n,j)=>n?`${labels[j]} ${n>0?'+':''}${n}`:'').filter(Boolean).join(' · ')}</em></button>`).join('')}</div><button class="primary wide" id="signCharter" disabled>Pick 2 promises</button>`;$('#eventFoot').textContent='The six purposes in the U.S. Preamble. Keep two.';}
 else{$('#choiceList').innerHTML=b.choices.map(choiceButton).join('');$('#eventFoot').textContent='Every choice costs something. Keys 1, 2, 3 work.';}
 $('#event').hidden=false;readLock(state.step===0?8:readSecs(b.story(state),...b.choices.map(c=>c.t)));beep(440);
}
function openSurprise(){
 const e=EVENTS.find(x=>x.id===state.openEvent);if(!e)return;target=null;keys={};
 $('#eventCard').classList.add('surprise');$('#event').classList.add('is-breaking');
 $('#eventLocation').textContent=`⚡ BREAKING · DISASTER ${state.events.length+1}`;$('#eventDay').textContent=locations[e.loc].name.toUpperCase();
 $('#eventArt').innerHTML=sceneArt(e.loc)+impactArt(e.art,e.title.toUpperCase());
 const caused=state.openCause&&!/luck/i.test(state.openCause);
 $('#eventType').textContent=caused?'BREAKING · YOUR CHOICES DID THIS':'BREAKING · BAD LUCK STRIKES';$('#eventTitle').textContent=e.title;$('#eventStory').textContent=e.story;
 $('#decisionEcho').hidden=false;$('#decisionEchoText').textContent=state.openCause||e.cause(state);
 $('#choiceList').innerHTML=e.choices.map(choiceButton).join('');$('#eventFoot').textContent='Deal with it. Lives are on the line.';
 $('#event').hidden=false;readLock(readSecs(e.story,...e.choices.map(c=>c.t+' '+c.sub)));beep(250,.25);flash(false);
}
function choose(i){
 if(choiceLocked||state.pending)return;const isEvent=!!state.openEvent;
 const src=isEvent?EVENTS.find(e=>e.id===state.openEvent):BEATS[state.step];const c=src&&src.choices[i];if(!c||src.pick2)return;
 if(c.need&&state.stats[0]<c.need){toast('Not enough supplies for that.');return}
 choiceLocked=true;const snap=snapshot();const out=resolveChoice(state,c);let gather=null,toll=[];
 if(isEvent){state.events.push(src.id);state.eventPicks[src.id]=i;}else{state.picks[src.id]=i;gather=dailyGather(state);toll=nightToll(state);if(!state.concepts.includes(src.concept))state.concepts.push(src.concept);if(state.flags.water===2)state.flags.shelter=Math.max(state.flags.shelter,1);}
 const res=typeof out.res==='function'?out.res(state):out.res,learn=isEvent?src.learn:out.learn;state.renSay=out.say;
 const entry={kind:isEvent?'event':'beat',id:src.id,title:src.title,choice:c.t,key:out.key||c.t,result:res,learn:plain(learn),gather,toll,...changes(snap,[...out.news,...toll])};
 state.log.push(entry);state.pending={...entry,head:out.head,learnHtml:learn,say:out.say};if(isEvent){state.openEvent=null;state.openCause=''}
 save();$('#event').hidden=true;showResult();render();setTimeout(()=>choiceLocked=false,300);
}
/* Before/after a decision: meter changes, Ren change, deaths, people who fled. */
function snapshot(){return {stats:[...state.stats],ren:state.ren,dead:state.dead,fled:state.fled,alive:alive(state)}}
function changes(a,news){return {delta:state.stats.map((n,i)=>n-a.stats[i]),renDelta:state.ren-a.ren,die:state.dead-a.dead,lost:a.alive-alive(state),news}}
/* Red flash on disasters (just a color change when reduced motion is on). */
function flash(big=true){const b=document.body;b.classList.remove('disaster','alarm');void b.offsetWidth;b.classList.add(big?'disaster':'alarm');setTimeout(()=>b.classList.remove('disaster','alarm'),900)}
function signCharter(){
 if(choiceLocked||charterPicks.length!==2)return;choiceLocked=true;const b=BEATS[7],snap=snapshot();
 charterPicks.forEach(i=>resolveChoice(state,b.choices[i]));const toll=nightToll(state);const names=charterPicks.map(i=>b.choices[i].t);state.picks.charter=[...charterPicks];
 const say=charterPicks.some(i=>i===2||i===3)?'Order and defense. Now you’re learning.':charterPicks.some(i=>i===1||i===5)?'Fancy words. Words don’t stop pirates.':'Promises are easy. Keeping them is hard.';state.renSay=say;
 if(!state.concepts.includes(b.concept))state.concepts.push(b.concept);
 const learn='Those promises are from the <b>Preamble</b> (opening) of the U.S. Constitution, which lists six purposes of government.';
 const entry={kind:'beat',id:'charter',title:b.title,choice:names.join(' + '),key:names.join(' + '),result:`Your charter promises to ${names[0].toLowerCase()} and ${names[1].toLowerCase()}.`,learn:plain(learn),gather:null,toll,...changes(snap,toll)};
 state.log.push(entry);state.pending={...entry,head:'The charter is signed',learnHtml:learn,say};save();$('#event').hidden=true;showResult();render();setTimeout(()=>choiceLocked=false,300);
}
function showResult(){const p=state.pending;if(!p)return;const hit=!!(p.news&&p.news.length);
 $('#resultSymbol').textContent=hit?'✕':p.kind==='event'?'⚡':'✓';$('#resultSymbol').classList.toggle('dead',hit);$('#resultEyebrow').textContent=p.kind==='event'?'DISASTER · RESULT':'YOUR DECISION';
 $('#resultTitle').textContent=p.head;$('#resultText').textContent=p.result;
 const bk=$('#breaking');bk.hidden=!hit;if(hit){bk.innerHTML=`<b>BREAKING</b><ul>${p.news.map(n=>`<li>${esc(n)}.</li>`).join('')}</ul><span>Survivors left: <strong class="bk-alive">${alive(state)}</strong> of 30 · Lives lost: <strong class="bk-dead">${state.dead}</strong></span>`;countTo($('.bk-alive'),alive(state)+(p.lost||0),alive(state),900,undefined,650,()=>pulse($('.bk-alive'),'ticked'));countTo($('.bk-dead'),state.dead-(p.die||0),state.dead,900,undefined,650,()=>pulse($('.bk-dead'),'ticked'))}
 const al=alive(state),cells=p.delta.map((n,i)=>[n,labels[i],'',state.stats[i]-n,state.stats[i]]).concat([[p.renDelta,'Ren’s power','ren',state.ren-p.renDelta,state.ren],[-(p.lost||0),'Survivors','ppl',(al+(p.lost||0))/.3,al/.3]]);
 $('#deltas').innerHTML=cells.map(([n,l,k,a,b],i)=>{const bad=k==='ren'?n>0:n<0;return `<div class="delta ${k}" style="--i:${i}"><b class="${n===0?'zero':bad?'negative':''}">${n>0?'+':''}${n}</b>${l}<i class="dbar ${n===0?'zero':bad?'bad':''}"><i style="--from:${Math.round(a)}%;--to:${Math.round(b)}%"></i></i></div>`}).join('');
 document.querySelectorAll('#deltas .delta b').forEach((el,i)=>countTo(el,0,cells[i][0],650,signed,380+i*80));$('#result').classList.toggle('is-hit',hit);
 $('#gather').hidden=p.gather===null;$('#gather').textContent=p.gather?`End of day: +${p.gather} supplies gathered (included above).${p.gather<8?' Safety and Trust 40+ bring more.':''}`:'End of day: +0 supplies. Camp too unsafe and divided to gather.';
 if(hit)flash(true);
 $('#renSays').innerHTML=`<div class="portrait" style="--c:#d7a272"></div><p><b>REN:</b> “${esc(p.say)}”</p>`;
 $('#learning').innerHTML=`<strong>THE IDEA</strong><br>${p.learnHtml}`;
 $('#continue').textContent=(p.kind==='beat'&&p.id==='charter')?'See your ending →':'Back to the island →';
 $('#result').hidden=false;beep(p.kind==='event'?300:660,.15);
 if(p.kind==='beat'&&PROVE[p.id])renderProof(p.id);else{$('#continue').disabled=false;$('#continue').focus();}
}

let proofTimer=null;
function renderProof(id,feedback){
 state.proof=state.proof||{};const q=PROVE[id],st=state.proof[id]||(state.proof[id]={first:null,done:false});
 let box=$('#proof');if(!box){box=document.createElement('div');box.id='proof';box.className='proof';$('#learning').after(box)}
 const needLog=id==='emergency';const logOk=()=>!needLog||(state.logNote||'').trim().split(/\s+/).filter(Boolean).length>=8;
 const cont=$('#continue');const setCont=()=>{cont.disabled=!(st.done&&logOk());cont.title=cont.disabled?'Answer the question first':''};
 if(st.done){box.innerHTML=`<div class="proof-head">✓ PROVE IT</div><p class="proof-ok">${esc(q.q)}<br><b>✓ ${esc(q.opts.find(o=>o[0]===q.ans)[1])}</b></p>`+(needLog?logHtml():'');wireLog();setCont();if(!cont.disabled)cont.focus();return}
 const opts=reshuffle('p-'+id,q.opts);
 box.innerHTML=`<div class="proof-head">PROVE IT · new situation, same idea</div><p class="proof-q">${esc(q.q)}</p><div class="proof-opts">${opts.map(([k,t])=>`<button class="choice proof-opt" data-proof="${k}"><span class="ct">${esc(t)}</span></button>`).join('')}</div><div id="proofHint" class="task-hint ${feedback?'try-again':''}" role="status">${feedback?esc(feedback):''}</div>`;
 setCont();
 box.querySelectorAll('[data-proof]').forEach(b=>b.onclick=()=>{
  if(b.dataset.proof===q.ans){if(st.first===null)st.first=true;st.done=true;if(window.classFirstTry)classFirstTry.right('prove-'+id);save();beep(700);renderProof(id)}
  else{if(st.first===null)st.first=false;if(window.classFirstTry)classFirstTry.wrong();save();beep(220);renderProof(id,'Not quite. '+q.hint+' The answers moved.');lockProof(8)}
 });
 if(!feedback){const f=box.querySelector('[data-proof]');if(f)f.focus()}
 function logHtml(){return `<div class="captain-log"><label for="logNote"><b>Captain’s log:</b> Why that call? Use <i>limits</i> or <i>rights</i>. (8+ words)</label><div class="stem">I made that call because…</div><textarea id="logNote" rows="3" maxlength="300">${esc(state.logNote||'')}</textarea><div id="logHint" class="task-hint" role="status"></div></div>`}
 function wireLog(){const t=$('#logNote');if(!t)return;const upd=()=>{state.logNote=t.value;save();const n=t.value.trim().split(/\s+/).filter(Boolean).length;$('#logHint').textContent=n>=8?'✓ Saved to your captain’s log.':`${n} of 8 words`;setCont()};t.oninput=upd;upd();if(cont.disabled)t.focus()}
}
function lockProof(sec){clearInterval(proofTimer);const bs=()=>document.querySelectorAll('[data-proof]');bs().forEach(b=>b.disabled=true);let left=sec;const h=$('#proofHint'),base=h.textContent;const tick=()=>{h.textContent=base+` Try again in ${left}…`};tick();proofTimer=setInterval(()=>{if(document.hidden)return;left--;if(left<=0){clearInterval(proofTimer);bs().forEach(b=>b.disabled=false);h.textContent=base}else tick()},1000)}

function next(){const p=state.pending;if(!p)return;if(p.kind==='beat'&&PROVE[p.id]&&!(state.proof&&state.proof[p.id]&&state.proof[p.id].done))return;if(p.id==='emergency'&&p.kind==='beat'&&(state.logNote||'').trim().split(/\s+/).filter(Boolean).length<8)return;const pr=$('#proof');if(pr)pr.remove();state.pending=null;$('#result').hidden=true;
 if(p.kind!=='event'){state.step++;if(state.step<BEATS.length){const ev=nextEvent(state);if(ev){state.openEvent=ev.id;state.openCause=ev.cause(state);save();render();setTimeout(openSurprise,300);return}}}
 if(state.step>=BEATS.length){state.phase='ending';state.ending=endingFor(state);save();render();showEnding();return}
 save();render();toast(`Next: ${BEATS[state.step].title} · ${locations[BEATS[state.step].loc].name}`);
}

/* ---------- ending, final check, sentence, score, turn-in ---------- */
const OPTS={
 power:[['leg','Legislative: making the rules'],['exe','Executive: carrying out the rules'],['jud','Judicial: judging what rules mean'],['sov','Sovereignty: final say over land']],
 state:[['pop','Population: the people living there'],['ter','Territory: the land and borders'],['sov','Sovereignty: final say over itself'],['gov','Government: the group in charge']],
 origin:[['sc','Social contract: people agreed'],['evo','Evolutionary: grew from families'],['div','Divine right: God chose the ruler'],['for','Force: taken by strength']],
 limits:[['lim','Limited government: leaders have limits'],['div','Divine right: leaders answer to God'],['dir','Direct democracy: all vote on rules'],['def','Common defense: guarding from outsiders']]};
function questions(){const p=state.picks,Q={};
 const pw=[['Jo carried out the council’s rules and ran the night watch. Which power is that?','exe','Executive power carries out rules.','Jo didn’t write rules or judge anyone.'],['All 30 of you voted to write each rule. Which power was that?','leg','Legislative power makes rules.','Voting to write a rule creates it.'],['Ren decided who broke the rules and what they meant. Which power is that?','jud','Judicial power judges rules and disputes.','Think judging, not writing or enforcing.']][p.power??0];
 Q.power={q:pw[0],opts:OPTS.power,ans:pw[1],why:pw[2],clue:pw[3]};
 const st=[['You told the ship, “We rule ourselves here.” Which feature of a state did you claim?','sov','Sovereignty is the final say over your own land.','You already had people and land. What did you refuse to give up?'],['You paid the company, and now it controls your choices. What did your island lose?','sov','Outsiders controlling you weakens sovereignty.','You still have people, land, and leaders.'],['Ren gave the company the north beach. What part of your state did he give away?','ter','Territory is a state’s land.','What physical thing did the company get?']][p.ship??0];
 Q.state={q:st[0],opts:OPTS.state,ans:st[1],why:st[2],clue:st[3]};
 const og=state.events.includes('coup')?['Ren’s crew grabbed the ridge and made everyone obey. Which origin theory is that?','for','Force theory: power taken by strength.','Did Ren win a vote, or take it?']:[['Your camp elected its leader. Which origin theory is that?','sc','Social contract: power comes from the people.','Who gave the leader power in an election?'],['Mara’s family led because big families always had. Which origin theory is that?','evo','Evolutionary theory: government grew from families.','Why did Mara’s family get to lead?'],['Ren said God chose him to rule. Which origin theory is that?','div','Divine right: the ruler claims God chose them.','Where did Ren say his power came from?']][p.claim??0];
 Q.origin={q:og[0],opts:OPTS.origin,ans:og[1],why:og[2],clue:og[3]};
 const lm=[['You told Ren leaders follow rules too, and speech stays free. Which idea is that?','You kept limits on leaders.'],['You let Ren ban criticism and search any tent, with no end date. Which idea did that break?','Power with no limits breaks limited government.'],['You said Ren’s crew needs a judge’s OK to search. Which idea does that protect?','A judge’s OK is a limit on power.']][p.emergency??0];
 Q.limits={q:lm[0],opts:OPTS.limits,ans:'lim',why:lm[1],clue:'What did your choice do to the leaders’ power?'};
 return Q;}
function finalScore(){const end=state.check?Object.values(state.check.first).filter(Boolean).length:0;const pf=Object.values(state.proof||{}).filter(x=>x&&x.first).length;const first=end+pf;return {first,score:scoreFor(state,first),parts:scoreParts(state,first)}}
function bodyCount(){const a=alive(state);return state.dead===0?`Everyone made it. ${a} of 30 alive.`:`${state.dead} dead${state.fled?` · ${state.fled} fled`:''} · ${a} of 30 left`}
function endingArt(kind){
 const base=(sky,ground)=>`<rect width="560" height="170" fill="${sky}"/><path d="M0 130Q140 112 280 126T560 120V170H0Z" fill="${ground}"/>`;
 const people=(x,n,c)=>Array.from({length:n},(_,i)=>`<g class="pp" style="animation-delay:-${(i*.53).toFixed(2)}s"><circle cx="${x+i*18}" cy="${116-(i%2)*4}" r="6" fill="#dbb48b"/><path d="M${x+i*18-8} ${136-(i%2)*4}q8-16 16 0Z" fill="${c}"/></g>`).join('');
 const art={
  republic:base('#2f6f6b','#5d8a57')+`<circle class="sun" cx="470" cy="45" r="24" fill="#f6d68a"/><ellipse cx="280" cy="132" rx="140" ry="16" fill="#b9a874"/><path d="M280 128V30" stroke="#d9c79a" stroke-width="4"/><g class="flag"><path d="M282 32h52l-10 13 10 13h-52Z" fill="#f6be68"/><path d="m306 38 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#fff6dc"/></g>`+people(180,12,'#90ccb0'),
  dictatorship:base('#4a2a2c','#3b3a33')+`<path class="sweep" d="M280 40 120 0h-60Z" fill="#f6d0b0" opacity=".12"/><path d="M250 132V40h60v92Z" fill="#2a2426"/><path d="M240 40h80l-40-28Z" fill="#7d2f2a"/><path d="M280 12V-2" stroke="#999" stroke-width="3"/><rect x="262" y="58" width="36" height="46" fill="#a3312a"/><text x="280" y="90" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="26" fill="#f6d0b0">R</text>`+people(110,5,'#555')+people(350,5,'#555')+`<path d="M95 112h90M345 112h90" stroke="#999" stroke-width="2"/>`,
  revolution:base('#5a3a2a','#4d4a36')+`<path d="M330 132 380 60" stroke="#7c5b3a" stroke-width="6"/><g transform="rotate(25 380 60)"><path class="flag" d="M380 60l40 10-8 30-44-8Z" fill="#a3312a"/></g>`+people(120,10,'#c58a5a')+[140,212,284].map(x=>`<path d="M${x} 108V80" stroke="#7c5b3a" stroke-width="3"/><path class="torch" d="M${x} 82q-8-10 0-22 8 12 0 22Z" fill="#f6a043"/>`).join(''),
  collapse:base('#3c4a4c','#4b4f3c')+`<g class="drift"><circle cx="150" cy="50" r="30" fill="#6f7a78" opacity=".6"/><circle cx="190" cy="35" r="38" fill="#6f7a78" opacity=".45"/></g><path d="m120 132 40-46 30 46Z" fill="#7a6a50" transform="rotate(-18 150 110)"/><path d="m300 132 34-40 38 40Z" fill="#6c5f48"/><path d="M300 132 372 92" stroke="#2b2b28" stroke-width="5"/><path d="M420 132l30-30 30 30Z" fill="#7a6a50" transform="rotate(14 450 120)"/>`,
  fragile:base('#2f5c63','#5f7f56')+`<path d="m110 132 45-52 45 52Z" fill="#c59b61"/><path d="m360 132 45-52 45 52Z" fill="#9aaa8a"/><path class="rope" d="M200 112Q280 140 360 112" stroke="#d9c79a" stroke-width="3" fill="none" stroke-dasharray="6 5"/><circle class="sun" cx="280" cy="40" r="20" fill="#f6d68a" opacity=".7"/><path d="M260 40h40" stroke="#2f5c63" stroke-width="22"/>`};
 return `<svg viewBox="0 0 560 170" aria-hidden="true">${art[kind]}</svg>`}
function keyMoments(){const ren=state.ending==='dictatorship'||(state.ending==='revolution'&&renOnTop(state));const w=state.stats.indexOf(Math.min(...state.stats));let list,fmt;
 if(state.dead>=6&&!ren){list=[...state.log].filter(l=>l.die>0).sort((a,b)=>b.die-a.die);fmt=l=>`${l.die} died`}
 else if(ren){list=[...state.log].filter(l=>l.renDelta>0).sort((a,b)=>b.renDelta-a.renDelta);fmt=l=>`Ren +${l.renDelta}`}
 else if(state.ending==='republic'){list=[...state.log].filter(l=>l.renDelta<0).sort((a,b)=>a.renDelta-b.renDelta);fmt=l=>`Ren ${l.renDelta}`}
 else{list=[...state.log].filter(l=>l.delta[w]<0).sort((a,b)=>a.delta[w]-b.delta[w]);fmt=l=>`${labels[w]} ${l.delta[w]}`}
 list=list.slice(0,2);if(!list.length)return '';return `<p class="key-moments"><b>Choices that led here:</b> ${list.map(l=>`“${esc(l.key)}” (${fmt(l)})`).join(' · ')}</p>`}
function showEnding(){
 if(state.phase==='map')return;target=null;keys={};const e=ENDINGS[state.ending];const box=$('#endingBody');$('#ending').hidden=false;
 if(state.phase==='ending'){
  box.innerHTML=`<div class="ending-art">${endingArt(state.ending)}</div><div class="eyebrow">STEP 9 OF 10 · YOUR ENDING</div><h2 class="ending-title">${e.badge} ${esc(e.title)}</h2><p class="body-count ${state.dead?'hit':''}">${bodyCount()}</p><p class="ending-why">${e.why(state)}</p>${keyMoments()}<div id="endingStats">${state.stats.map((n,i)=>`<span><strong>${n}</strong>${labels[i]}</span>`).join('')}<span class="ren-stat"><strong>${state.ren}</strong>Ren</span><span class="dead-stat"><strong>${state.dead}</strong>Lives lost</span></div><p class="fine-note">A game outcome, not a prediction about real countries.</p><button class="primary wide" id="toCheck">Next: 4 quick questions →</button>`;
  document.querySelectorAll('#endingStats strong').forEach((el,i)=>countTo(el,0,+el.textContent,800,undefined,900+i*90));$('#toCheck').onclick=()=>{state.phase='check';if(!state.check)state.check={order:shuffle(['power','state','origin','limits']),idx:0,first:{}};save();render();showEnding()};$('#toCheck').focus();
 }else if(state.phase==='check')renderCheck();
 else if(state.phase==='write'){
  box.innerHTML=`<div class="eyebrow">STEP 9 OF 10 · ONE SENTENCE</div><h2 class="stage-title">Explain your island</h2><p class="stage-help">Name one real moment from your game. (8+ words.)</p><label class="stem" for="sentence">Our island needed a government because…</label><textarea id="sentence" rows="4" maxlength="400" placeholder="…people were dying over water, and when we…">${esc(state.sentence)}</textarea><div id="writeHint" class="task-hint" role="status"></div><button class="primary wide" id="toScore">See my score →</button>`;
  $('#sentence').oninput=e=>{state.sentence=e.target.value;save()};
  $('#toScore').onclick=()=>{const w=state.sentence.trim().split(/\s+/).filter(Boolean);if(w.length<8){$('#writeHint').textContent=`Add a little more. You have ${w.length} words. Write at least 8.`;$('#writeHint').className='task-hint try-again';$('#sentence').focus();return}const f=finalScore();state.score=f.score;state.rank=rankFor(f.score,state.ending,state);state.phase='score';save();render();showEnding();beep(880,.3)};
  $('#sentence').focus();
 }else if(state.phase==='score'){
  const f=finalScore(),pt=f.parts,sg=n=>(n>=0?'+':'−')+Math.abs(n);
  box.innerHTML=`<div class="eyebrow">STEP 10 OF 10 · FINAL SCORE</div><div class="score-row"><div class="score-big"><b>${state.score}</b><span>/100</span></div><div class="lives-big ${state.dead?'hit':''}"><b>${state.dead}</b><span>lives lost</span></div></div><div class="rank">${esc(state.rank)}</div><p class="ending-line">${e.badge} ${esc(e.title)} · ${alive(state)} of 30 survived · ${f.first} of ${CHECK_TOTAL} first-try</p><p class="compare">Compare with your class: highest score, fewest deaths.</p><div class="score-parts"><span>Meters <b>${sg(pt.meters)}</b></span><span>Questions <b>${sg(pt.checks)}</b></span><span>Ending <b>${sg(pt.ending)}</b></span><span class="${pt.lives<0?'neg':''}">Lives <b>${sg(pt.lives)}</b></span>${pt.ren?`<span class="neg">Ren <b>${sg(pt.ren)}</b></span>`:''}</div><p class="fine-note">Lives: start at +20, −3 per death, −1 per person who fled.</p>
  <div class="turnin"><label for="studentName">First name + last initial (like Jordan M.)</label><input id="studentName" maxlength="40" autocomplete="off" value="${esc(state.studentName)}" placeholder="Jordan M."><button class="primary wide" id="turnIn">Turn in to my teacher</button><div id="turnStatus" role="status" class="turn-status ${state.submitted?'ok':''}">${state.submitted?'✓ Turned in! Your teacher can see your work. You can send it again if you need to.':''}</div></div>
  <div class="end-actions"><button class="text-button" id="finalDownload">Download my island report ↓</button><button class="text-button" id="journalEnd">Read my captain’s log</button><button class="text-button" id="replay">Play again</button></div>`;
  $('.score-big b').style.minWidth=String(state.score).length+'ch';$('.lives-big b').style.minWidth=String(state.dead).length+'ch';
  countTo($('.score-big b'),0,state.score,1300,undefined,250,()=>pulse($('.score-big'),'landed'));countTo($('.lives-big b'),0,state.dead,900,undefined,500);
  $('#studentName').oninput=e=>{state.studentName=e.target.value;save()};$('#turnIn').onclick=turnIn;$('#finalDownload').onclick=download;$('#journalEnd').onclick=journal;$('#replay').onclick=restart;
 }
}
function renderCheck(feedback){
 const c=state.check,Q=questions();if(c.idx>=c.order.length){state.phase='write';save();render();showEnding();return}
 const id=c.order[c.idx],q=Q[id];const opts=reshuffle('c-'+id,q.opts);
 $('#endingBody').innerHTML=`<div class="eyebrow">STEP 9 OF 10 · FINAL CHECK · QUESTION ${c.idx+1} OF ${c.order.length}</div><h2 class="stage-title">About your game</h2><p class="check-q">${esc(q.q)}</p><div class="check-opts">${opts.map(([k,t])=>`<button class="choice check-opt" data-opt="${k}"><span class="ct">${esc(t)}</span></button>`).join('')}</div><div id="checkHint" class="task-hint ${feedback?'try-again':''}" role="status">${feedback?esc(feedback):''}</div><button class="primary wide" id="checkNext" hidden>Next →</button>`;
 document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{
  if(b.dataset.opt===q.ans){if(!(id in c.first))c.first[id]=true;if(window.classFirstTry)classFirstTry.right('stranded-'+id);save();document.querySelectorAll('[data-opt]').forEach(x=>{x.disabled=true});b.classList.add('right');$('#checkHint').className='task-hint';$('#checkHint').textContent='✓ Right. '+q.why;$('#checkNext').hidden=false;$('#checkNext').focus();beep(700);}
  else{if(!(id in c.first))c.first[id]=false;if(window.classFirstTry)classFirstTry.wrong();save();beep(220);renderCheck('Not quite. '+q.clue+' The answers were reshuffled. Try again.');}
 });
 const nb=$('#checkNext');nb.onclick=()=>{c.idx++;save();renderCheck()};
 if(!feedback)$('.check-opt').focus();
}
function decisionAnswers(){const names={barrel:'1. Water barrel',power:'2. Who holds power',thief:'3. Food thief',ship:'4. The ship',claim:'5. Right to rule',storm:'6. The storm',emergency:'7. Emergency powers',charter:'8. Charter promises'};const out={};state.log.filter(l=>l.kind==='beat').forEach(l=>{out[names[l.id]]=l.key});return out}
function buildAnswers(){const f=finalScore();return {Standard:STANDARD,'First-try correct':`${f.first} of ${CHECK_TOTAL}`,Score:`${state.score??f.score} / 100`,Rank:state.rank||rankFor(f.score,state.ending,state),Ending:ENDINGS[state.ending]?.title||'','Lives lost':`${state.dead} of 30 (survivors left: ${alive(state)}${state.fled?`, fled: ${state.fled}`:''})`,...decisionAnswers(),'Disasters':state.log.filter(l=>l.kind==='event').map(l=>`${l.title} → ${l.key}`).join('; ')||'None','Captain’s log (emergency powers)':state.logNote?('I made that call because '+state.logNote.trim()):'—','My sentence':'Our island needed a government because '+state.sentence.trim(),'Final meters':`Supplies ${state.stats[0]} · Safety ${state.stats[1]} · Trust ${state.stats[2]} · Freedom ${state.stats[3]} · Ren ${state.ren}`}}
async function turnIn(){
 const name=$('#studentName').value.trim(),st=$('#turnStatus'),btn=$('#turnIn');const say=(t,ok)=>{st.textContent=t;st.className='turn-status '+(ok?'ok':'bad')};
 if(!name){say('Type your first name + last initial (like Jordan M.).');$('#studentName').focus();return}
 if(typeof window.classTurnIn!=='function'){say('Turn-in is not available right now. Keep this page open and tell your teacher.');return}
 btn.disabled=true;say('Sending…',true);
 try{const res=await classTurnIn(SUBMIT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentName:name,assignmentId:ASSIGNMENT_ID,answers:buildAnswers()})});const data=await res.json().catch(()=>({}));
  if(res.ok){state.submitted=true;state.studentName=name;save();say('✓ Turned in! Your teacher can see your work now.',true);beep(900,.2)}else say(data.error||'That didn’t go through. Check your name and try again.');}
 catch{say('Could not reach the class site. Keep this page open and try again.')}finally{btn.disabled=false}
}
function journal(){$('#journalTitle').textContent=`${state.name}: captain’s log`;$('#journalEntries').innerHTML=state.log.length?state.log.map((l,n)=>`<article class="log-entry"><span>${l.kind==='event'?'⚡ DISASTER':'DECISION'}</span><h3>${esc(l.title)}</h3><p>You chose: ${esc(l.choice)}</p><p>${esc(l.result)}</p>${l.news&&l.news.length?`<p class="log-dead">BREAKING: ${esc(l.news.join('. '))}.</p>`:''}<small>${esc(l.learn)}</small></article>`).join(''):'<p>Your first decision is waiting at the water station.</p>';$('#journalDialog').showModal();}
function download(){const e=ENDINGS[state.ending],f=finalScore();const lines=[`STRANDED: GOVERN OR COLLAPSE · ISLAND REPORT`,`Island: ${state.name}`,`Standards: ${STANDARD}`,`Ending: ${e?e.title:'In progress'}`,state.score!=null?`Score: ${state.score}/100 · Rank: ${state.rank} · First try: ${f.first} of ${CHECK_TOTAL}`:'',`Lives lost: ${state.dead} of 30 · Survivors: ${alive(state)}${state.fled?` · Fled: ${state.fled}`:''}`,`Meters: ${labels.map((n,i)=>`${n} ${state.stats[i]}`).join(' | ')} | Ren's power ${state.ren}`,'',...state.log.map(l=>`${l.kind==='event'?'DISASTER':'DECISION'}: ${l.title}\n  Choice: ${l.choice}\n  Result: ${l.result}${l.news&&l.news.length?`\n  Breaking: ${l.news.join('. ')}`:''}\n  Concept: ${l.learn}\n`),state.sentence?`My sentence: Our island needed a government because ${state.sentence.trim()}`:'','','Game outcomes are fictional. They are not facts about real countries.'];const blob=new Blob([lines.filter(x=>x!==undefined).join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stranded-island-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function restart(){if(confirm('Start over? Your island on this device will be erased.')){localStorage.removeItem(KEY);try{window.classFirstTry&&classFirstTry.reset()}catch{}location.reload()}}
/* ===== Island map =====
   Static art (sea, island, trails, trunks) is painted once into two cached layers and rebuilt only on resize.
   Each frame only redraws the moving parts. The loop stops while the tab is hidden, holds one still frame
   behind a card (redrawing under a blur is the costliest thing a Chromebook can do here), drops optional effects if a frame gets slow, and freezes ambient motion for prefers-reduced-motion. */
const canvas=$('#map'),mainCtx=canvas.getContext('2d');let ctx=mainCtx,vw=0,vh=0,dpr=1,scale=1,ox=0,oy=0,clock=0,lastTime=0,T=0;
var mapDirty=true;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');function calm(){return motionQuery.matches}
const TAU=Math.PI*2;
const land=[ [152,464],[184,372],[267,304],[337,238],[420,225],[471,177],[564,195],[614,245],[711,230],[764,278],[808,362],[854,409],[860,492],[815,566],[808,643],[733,690],[687,753],[599,775],[537,812],[447,779],[368,794],[292,748],[236,683],[207,612],[166,560] ];
const cacheSpots=[{x:226,y:422},{x:584,y:245},{x:794,y:546},{x:594,y:730},{x:266,y:600},{x:607,y:350}];
function rand(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function polygon(points,fill){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function inside(x,y){let c=false;for(let i=0,j=land.length-1;i<land.length;j=i++){const a=land[i],b=land[j];if(((a[1]>y)!=(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
/* Smooth coastline through the same points the walking rules use. */
function coastPath(pts){const p=new Path2D(),n=pts.length,P=i=>pts[(i+n)%n];p.moveTo(P(0)[0],P(0)[1]);for(let i=0;i<n;i++){const a=P(i-1),b=P(i),c=P(i+1),d=P(i+2);p.bezierCurveTo(b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(d[0]-b[0])/6,c[1]-(d[1]-b[1])/6,c[0],c[1])}p.closePath();return p}
const scaledPts=(s,sy=s)=>land.map(([x,y])=>[500+(x-500)*s,500+(y-500)*sy]);
const COAST=coastPath(land),GRASS=coastPath(scaledPts(.95)),GRASS2=coastPath(scaledPts(.87,.88));
const nearIsland=(x,y,m)=>inside(500+(x-500)/m,500+(y-500)/m);
/* Fixed decoration lists, worked out once instead of every frame. */
const PALMS=[];for(let i=0;i<62;i++){const x=220+rand(i+112)*570,y=260+rand(i+55)*475;if(inside(x,y)&&Object.values(locations).every(p=>Math.hypot(p.x-x,p.y-y)>68)&&cacheSpots.every(p=>Math.hypot(p.x-x,p.y-y)>27))PALMS.push({x,y,s:.7+rand(i+774)*.55,ph:rand(i+31)*TAU,flip:rand(i+9)>.5?1:-1})}
PALMS.push({x:263,y:656,s:.8,ph:1.3,flip:1});PALMS.sort((a,b)=>a.y-b.y);
const GLINTS=[],RIPPLES=[];
for(let i=0;i<110;i++){const x=rand(i+300)*1150-75,y=rand(i+500)*1040-40;if(!nearIsland(x,y,1.12))GLINTS.push({x,y,ph:rand(i+700)*TAU,sp:.5+rand(i+800)*1.1,len:4+rand(i+900)*8})}
for(let i=0;i<120;i++){const x=rand(i+100)*1100,y=rand(i+200)*1000;if(!nearIsland(x,y,1.07))RIPPLES.push({x,y,ph:i})}
const VCOL=['#bd9864','#9bb3a0','#bd999e','#829eb0'],SKIN=['#dbb48b','#c79a72','#a8795a','#e3c09a'],HAIR=['#453c2e','#2d2620','#6b4a2e','#3a3530'];

/* ---------- cached layers ---------- */
let seaLayer=null,islandLayer=null,canopy=null,cloudImg=null,cloudDark=null;const CW=80,CH=54;
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function paintInto(c,fn,tf=[dpr,0,0,dpr,0,0]){const prev=ctx;ctx=c.getContext('2d');ctx.setTransform(...tf);fn();ctx=prev}
function mapSpace(){ctx.translate(ox,oy);ctx.scale(scale,scale)}
function scaledFill(path,s,sy,fill){ctx.save();ctx.translate(500,500);ctx.scale(s,sy);ctx.translate(-500,-500);ctx.fillStyle=fill;ctx.fill(path);ctx.restore()}
function palmTrunk(p){ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.s*p.flip,p.s);ellipse(9,9,22,7,'rgba(12,60,53,.26)');ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(5,-20,-1,-38);ctx.strokeStyle='#7e5f3e';ctx.lineWidth=5.5;ctx.stroke();ctx.beginPath();ctx.moveTo(-1.2,4);ctx.quadraticCurveTo(3.6,-20,-2.2,-36);ctx.strokeStyle='#ad8a5c';ctx.lineWidth=1.8;ctx.stroke();for(let k=1;k<6;k++){const t=k/6,x=(1-t)*(1-t)*0+2*(1-t)*t*5+t*t*-1,y=(1-t)*(1-t)*5+2*(1-t)*t*-20+t*t*-38;line(x-2.6,y,x+2.6,y+1,'#6a4f33',1)}ctx.restore()}
function buildCanopy(){const k=scale*dpr*1.3;canopy=makeCanvas(CW*k,CH*k);paintInto(canopy,()=>{
 const frond=(a,len,col,rib)=>{const dx=Math.cos(a)*len,dy=Math.sin(a)*len*.5+5;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(dx*.35+dy*.18,dy*.35-12,dx,dy);ctx.quadraticCurveTo(dx*.55-dy*.12,dy*.6-1,0,0);ctx.fillStyle=col;ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(dx*.45,dy*.45-7,dx*.96,dy*.96);ctx.strokeStyle=rib;ctx.lineWidth=.8;ctx.stroke()};
 for(let i=0;i<7;i++)frond(i*TAU/7+.45,28,'#24654a','#1d553e');
 for(let i=0;i<7;i++)frond(i*TAU/7,31,i%2?'#3b8a5c':'#4c9a63','#7dbb84');
 ellipse(-2,1,2.6,2.6,'#6b4f2e');ellipse(2,2,2.4,2.4,'#5d4327');ellipse(0,-1.5,2.2,2.2,'#7a5a35');},[k,0,0,k,CW/2*k,CH/2*k])}
function buildClouds(){const blob=(c,col)=>paintInto(c,()=>{[[70,80,46],[120,62,58],[175,78,48],[140,92,44],[95,95,36]].forEach(([x,y,r])=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+'ff');g.addColorStop(.6,col+'aa');g.addColorStop(1,col+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()})},[1,0,0,1,0,0]);
 cloudImg=makeCanvas(256,140);blob(cloudImg,'#f1f5ea');cloudDark=makeCanvas(256,140);blob(cloudDark,'#0c2630')}
function buildLayers(){
 seaLayer=makeCanvas(vw*dpr,vh*dpr);paintInto(seaLayer,()=>{
  const g=ctx.createLinearGradient(0,0,vw,vh);g.addColorStop(0,'#113c4b');g.addColorStop(.55,'#1c6870');g.addColorStop(1,'#113f4f');ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);
  mapSpace();
  ctx.beginPath();for(let x=0;x<1100;x+=80){ctx.moveTo(x,-200);ctx.lineTo(x,1200)}for(let y=0;y<1000;y+=80){ctx.moveTo(-300,y);ctx.lineTo(1300,y)}ctx.strokeStyle='rgba(181,218,192,.035)';ctx.lineWidth=1;ctx.stroke();
  ctx.filter=`blur(${Math.max(2,10*scale)}px)`;[[1.22,'rgba(70,170,165,.07)'],[1.15,'rgba(80,185,175,.1)'],[1.1,'rgba(98,198,184,.14)'],[1.055,'rgba(120,212,192,.2)'],[1.025,'rgba(150,222,200,.24)']].forEach(([s,c])=>scaledFill(COAST,s,s*.985,c));ctx.filter='none';
  [[120,706,22,11,'#5b8379','#9aa795',[[100,703],[115,682],[138,700]]],[870,690,25,12,'#3d6969','#839b8c',[[850,687],[867,665],[888,685]]],[795,170,18,8,'#55837a','#8da28e',[[780,168],[795,153],[812,167]]]].forEach(([x,y,rx,ry,c1,c2,tri])=>{ellipse(x,y+3,rx+8,ry+4,'rgba(150,222,200,.16)');ellipse(x,y,rx,ry,c1);polygon(tri,c2);polygon([tri[0],tri[1],[(tri[0][0]+tri[2][0])/2,tri[2][1]+1]],'rgba(255,255,240,.12)')});
  ctx.save();ctx.translate(900,820);ctx.strokeStyle='#badcc177';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,27,0,TAU);ctx.stroke();polygon([[0,-23],[6,8],[0,3],[-6,8]],'#cde4c477');polygon([[0,23],[6,-8],[0,-3],[-6,-8]],'#9dc7b133');ctx.fillStyle='#cde4c4aa';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('N',0,-34);ctx.restore();
 });
 islandLayer=makeCanvas(vw*dpr,vh*dpr);paintInto(islandLayer,()=>{mapSpace();
  ctx.fillStyle='#cdbd88';ctx.fill(COAST);
  ctx.save();ctx.clip(COAST);ctx.strokeStyle='#a99a6a';ctx.lineWidth=9;ctx.stroke(COAST);ctx.strokeStyle='rgba(240,232,196,.55)';ctx.lineWidth=2;ctx.save();ctx.translate(500,500);ctx.scale(.982,.982);ctx.translate(-500,-500);ctx.stroke(COAST);ctx.restore();ctx.restore();
  let g=ctx.createLinearGradient(250,220,800,800);g.addColorStop(0,'#93a96d');g.addColorStop(1,'#78915d');ctx.fillStyle=g;ctx.fill(GRASS);ctx.strokeStyle='rgba(70,95,55,.28)';ctx.lineWidth=3;ctx.stroke(GRASS);
  g=ctx.createLinearGradient(250,220,800,800);g.addColorStop(0,'#6f955f');g.addColorStop(1,'#5d8455');ctx.fillStyle=g;ctx.fill(GRASS2);
  for(let i=0;i<110;i++){const x=200+rand(i+412)*630,y=220+rand(i+688)*540;if(inside(x,y))ellipse(x,y,3+rand(i+90)*9,1.5,'#b0b87844')}
  ctx.save();ctx.clip(COAST);const rg=ctx.createRadialGradient(420,360,40,520,520,470);rg.addColorStop(0,'rgba(255,248,210,.13)');rg.addColorStop(.55,'rgba(255,248,210,0)');rg.addColorStop(1,'rgba(4,34,34,.22)');ctx.fillStyle=rg;ctx.fillRect(100,100,800,800);ctx.restore();
  const path=(a,b)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+15,(a.y+b.y)/2-8,b.x,b.y);ctx.lineCap='round';ctx.strokeStyle='rgba(70,80,45,.18)';ctx.lineWidth=15;ctx.stroke();ctx.strokeStyle='#b3aa77';ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle='#cdc08b45';ctx.lineWidth=4;ctx.stroke()};
  [['dock','hall'],['hall','water'],['hall','watch'],['hall','camp'],['camp','grove'],['camp','water']].forEach(([a,b])=>path(locations[a],locations[b]));
  ellipse(580,597,47,27,'#4d775a');ellipse(580,591,38,23,'#3c7a76');ellipse(579,589,31,17,'#6fa092');ellipse(570,584,12,4,'rgba(230,248,236,.35)');
  for(let i=0;i<11;i++){const x=650+rand(i+76)*88,y=245+rand(i+56)*52;polygon([[x-10,y+6],[x,y-14],[x+17,y+5]],'#829378');polygon([[x,y-14],[x+17,y+5],[x+4,y+3]],'#a2ad8b')}
  PALMS.forEach(palmTrunk);
 });
 buildCanopy();if(!cloudImg)buildClouds();
}

/* ---------- moving pieces ---------- */
function figure(x,y,c,size,ph,mv,face,skin='#dbb48b',hair='#453c2e'){ctx.save();ctx.translate(x,y);ctx.scale(size*face,size);
 const sw=Math.sin(ph)*mv,bob=Math.abs(Math.cos(ph))*1.5*mv+(1-mv)*(Math.sin(ph*.35)*.45+.45);
 ellipse(1,8,9.5-bob*.5,3.6,'rgba(10,41,43,.3)');
 ctx.lineCap='round';ctx.strokeStyle='#183b43';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-2.4,2-bob*.4);ctx.lineTo(-2.4-sw*3.4,9-Math.max(0,sw)*1.4);ctx.moveTo(2.4,2-bob*.4);ctx.lineTo(2.4+sw*3.4,9-Math.max(0,-sw)*1.4);ctx.stroke();
 ctx.translate(sw*.4,-bob);
 line(-4.6,-4,-4.6+sw*3,2.5,skin,2.4);
 roundRect(-6,-7.5,12,13,4,c);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-5,-6.5,3,10);
 line(4.6,-4,4.6-sw*3,2.5,skin,2.4);
 ellipse(.4,-11,5,5.6,skin);ellipse(-.6,-14.2,5.3,2.8,hair);ellipse(-3.4,-12.4,2.2,3,hair);
 ctx.restore()}
function person(x,y,c='#bca278',size=1){figure(x,y,c,size,T*1.6,0,1)}
function tent(x,y,s=1,c='#c59b61',side='#92754c'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ellipse(4,11,30,10,'#163e3444');polygon([[-27,7],[0,-29],[28,7]],c);polygon([[0,-29],[28,7],[43,-2],[17,-35]],side);polygon([[-12,7],[0,-14],[12,7]],'#163c3c');line(0,-29,0,7,'#e6c58c',1);line(-27,7,-36,15,'#8a7652');line(28,7,34,15,'#8a7652');ctx.restore()}
function crate(x,y,glow=false,i=0){if(glow){const k=.5+.5*Math.sin(T*2.6+i);ellipse(x,y+7,22,11,`rgba(145,210,174,${.08+k*.08})`);ctx.strokeStyle=`rgba(149,224,182,${.18+.25*k})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y+2,17+k*4,11+k*2.5,0,0,TAU);ctx.stroke()}
 roundRect(x-9,y-8,18,18,2,'#a67a46');polygon([[x-9,y-8],[x-4,y-12],[x+13,y-12],[x+9,y-8]],'#d5b16b');polygon([[x+9,y-8],[x+13,y-12],[x+13,y+5],[x+9,y+10]],'#785d39');line(x-6,y-5,x+6,y+6,'#d8b97c',2);line(x+6,y-5,x-6,y+6,'#d8b97c',2);
 if(glow){ctx.fillStyle=`rgba(180,243,189,${.6+.4*Math.sin(T*2.6+i)})`;ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('+',x,y-18-Math.sin(T*2.6+i)*2)}}
function glow(x,y,r,rgb,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function flame(x,y,h,w,seed){const f=Math.sin(T*11+seed)*.12+Math.sin(T*17.3+seed*2)*.08,top=y-h*(1+f),lean=Math.sin(T*3+seed)*w*.35;
 ctx.beginPath();ctx.moveTo(x-w,y);ctx.quadraticCurveTo(x-w*.9,y-h*.5,x+lean,top);ctx.quadraticCurveTo(x+w*.9,y-h*.5,x+w,y);ctx.closePath();ctx.fillStyle='#ef8a45';ctx.fill();
 ctx.beginPath();ctx.moveTo(x-w*.5,y);ctx.quadraticCurveTo(x-w*.45,y-h*.35,x+lean*.6,y-h*.62*(1+f));ctx.quadraticCurveTo(x+w*.45,y-h*.35,x+w*.5,y);ctx.closePath();ctx.fillStyle='#ffd27a';ctx.fill()}
function smoke(x,y,n,rise,size,col,a,speed=.22){for(let k=0;k<n;k++){const f=(T*speed+k/n)%1,r=size*(.35+f),px=x+Math.sin(f*3+k)*size*.4+f*rise*.35,py=y-f*rise;ctx.fillStyle=`rgba(${col},${a*Math.sin(f*Math.PI)})`;ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.fill()}}
function campfire(x,y){ellipse(x,y,13,6,'#5f6452');for(let i=0;i<6;i++){const a=i*1.05;ellipse(x+Math.cos(a)*12,y+Math.sin(a)*5,3,2,'#9d9a7b')}
 ctx.globalCompositeOperation='lighter';glow(x,y-4,34+Math.sin(T*9)*2,'255,170,80',.22);ctx.globalCompositeOperation='source-over';
 flame(x-3,y,13,5,1);flame(x+3,y,10,4,4);ellipse(x,y-1,5,2,'#ffe2a6');
 if(!lowQ)smoke(x+2,y-16,4,34,6,'214,225,200',.16)}
function blaze(x,y){ctx.globalCompositeOperation='lighter';glow(x,y-10,130+Math.sin(T*7)*6,'255,120,50',.32);glow(x,y-14,60,'255,190,90',.28);ctx.globalCompositeOperation='source-over';
 smoke(x+6,y-40,6,150,22,'40,38,40',.38,.16);flame(x-24,y+8,30,10,2);flame(x+20,y+18,26,9,5);flame(x-2,y+24,20,7,8)}
function waveFlag(x,y,w,h,col){const t=T*4;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+w*.5,y+Math.sin(t)*2.5,x+w,y+h*.25+Math.sin(t+1)*2);ctx.lineTo(x+w,y+h*.55+Math.sin(t+1)*2);ctx.quadraticCurveTo(x+w*.5,y+h+Math.sin(t+.6)*2.5,x,y+h);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
function drawLocation(key){const p=locations[key],x=p.x,y=p.y;ctx.save();ctx.translate(x,y);
if(key==='water'){ellipse(0,0,37,19,'#5e8a6244');for(let i=0;i<(state.flags.water===2?3:1);i++){ellipse(-15+i*15,-4-i%2*5,9,6,'#b8aaa0');roundRect(-24+i*15,-15-i%2*5,18,12,2,'#427586');ellipse(-15+i*15,-15-i%2*5,9,4,'#84b8bd');ellipse(-17+i*15+Math.sin(T*1.5+i)*2,-16-i%2*5,3,1,'rgba(230,250,250,.55)');line(-21+i*15,-11-i%2*5,-9+i*15,-11-i%2*5,'#abc4bd',1)}if(state.flags.water===2){line(-26,8,31,8,'#7e9c8b',5);roundRect(22,3,9,16,2,'#50787b');ellipse(26,20,12,4,'#8ad6cf80');const d=(T*1.6)%1;ellipse(26,8+d*11,1.3,2,`rgba(170,230,230,${1-d})`)}else if(state.step>=5){line(-24,-10,22,9,'#6e5f49',4);line(10,-14,-17,18,'#8a7554',4)}}
if(key==='camp'){const burnt=state.events.includes('fire');tent(-27,-4,1.1,burnt?'#7a6450':'#c59b61',burnt?'#4f4235':'#92754c');tent(26,21,.85,'#9aaa8a');if(state.flags.shelter)tent(27,-38,.8,'#bd9669');if(state.flags.shelter===2)tent(-48,37,.8,'#8da58e');campfire(-4,35)}
if(key==='hall'){ellipse(0,0,40,25,'#c4b183');ellipse(0,0,32,19,'#9ca071');for(let i=0;i<7;i++){const a=i*TAU/7;ellipse(Math.cos(a)*35,Math.sin(a)*20,7,4,'#8e8c6a')}roundRect(-15,-11,30,19,3,'#92714e');polygon([[-15,-11],[-7,-16],[23,-16],[15,-11]],'#b7935c');if(state.flags.rules){line(40,4,40,-31,'#796244',4);roundRect(26,-35,31,23,2,'#c4a173');for(let i=0;i<3;i++)line(31,-29+i*6,51,-29+i*6,'#4e5c45',1.5)}}
if(key==='watch'){polygon([[-35,12],[-17,-18],[7,-25],[34,5],[22,18]],'#7a8f7a');polygon([[-17,-18],[7,-25],[34,5],[8,-1]],'#a1aa8b');if(state.flags.guard){line(-12,0,-10,-43,'#896f4c',5);line(12,0,10,-43,'#896f4c',5);line(-14,-43,14,-43,'#bfa375',5);line(-11,-27,10,-13,'#896f4c',2);line(-11,-13,10,-27,'#896f4c',2);polygon([[-24,-44],[0,-61],[24,-44]],'#bd9c60');if(state.flags.guard===2)person(0,-42,'#91c1ac',.8)}else{line(-10,0,-10,-39,'#967c56',4);waveFlag(-10,-39,26,15,state.flags.power.includes('Ren')?'#d59571':'#f0c779')}}
if(key==='dock'){ctx.rotate(-.2);polygon([[-45,8],[-37,-18],[28,-18],[49,4],[27,20],[-28,20]],'#79573c');polygon([[-33,-10],[23,-10],[32,4],[22,12],[-25,12]],'#b49461');for(let i=0;i<6;i++)line(-23+i*9,-10,-23+i*9,12,'#7f6546',2);line(-45,8,14,-26,'#ad8d5b',4);ctx.rotate(.2);crate(38,22);line(-65,-4,-49,-12,'#96794d',4)}
if(key==='grove'){tent(-17,2,.8,'#93ad83');tent(20,-16,.7,'#b7a176');roundRect(7,15,19,8,2,'#a7936c')}
ctx.restore()}
/* Small stones by the family grove, one for each life lost. */
function drawMemorial(){const n=Math.min(state.dead,30);for(let i=0;i<n;i++){const x=352+(i%6)*10+(Math.floor(i/6)%2)*5,y=672+Math.floor(i/6)*9;ellipse(x+1,y+4,4,1.6,'rgba(20,50,40,.3)');roundRect(x-2.6,y-4,5.2,8,[2.6,2.6,1,1],'#c4bda8');ctx.fillStyle='rgba(90,90,80,.25)';ctx.fillRect(x+.6,y-3,1.6,7)}}
function canopyAt(cx,cy,s,flip,ph){const w=weather,sw=Math.sin(T*.9+ph)*.05+Math.sin(T*2.3+ph*1.7)*.015*(1+w*3)+w*(.1+Math.sin(T*3.1+ph)*.07);ctx.save();ctx.translate(cx+sw*14*s,cy);ctx.rotate(sw);ctx.scale(flip*(1+Math.sin(T*1.1+ph)*.025),1);ctx.drawImage(canopy,-CW/2*s,-CH/2*s,CW*s,CH*s);ctx.restore()}
function drawCanopies(){for(const p of PALMS)canopyAt(p.x-p.flip*p.s,p.y-37*p.s,p.s,p.flip,p.ph)}
function drawVillagers(){const al=alive(state);let n=Math.round(16*al/START_PEOPLE);if(al>0)n=Math.max(1,n);const locs=Object.values(locations),list=[];
 for(let i=0;i<n;i++){if(state.stats[2]<=25&&i>8)continue;const home=locs[i%6],dur=5.5+rand(i+40)*3.5,u=T/dur+rand(i+70)*10,k=Math.floor(u),f=u-k;
  const wp=j=>{const a=rand(i*13+j*7)*TAU,r=30+rand(i*17+j*3)*28;let x=home.x+18+Math.cos(a)*r,y=home.y+22+Math.sin(a)*r*.45;if(!inside(x,y)){x=home.x+18;y=home.y+24}return [x,y]};
  const A=wp(k),B=wp(k+1),m=f<.42?f/.42:1,e=m*m*(3-2*m),mv=f<.42?Math.min(1,Math.sin(Math.PI*m)*3):0;
  list.push([A[0]+(B[0]-A[0])*e,A[1]+(B[1]-A[1])*e,i,mv,B[0]>=A[0]?1:-1])}
 list.sort((a,b)=>a[1]-b[1]).forEach(([x,y,i,mv,face])=>figure(x,y,VCOL[i%4],.8,T*9+i*1.7,mv,face,SKIN[i%4],HAIR[i%4]))}
function drawBeacon(){if(!(state.phase==='map'&&state.started&&BEATS[state.step]))return;const p=locations[BEATS[state.step].loc],pl=state.player,near=Math.hypot(p.x-pl.x,p.y-pl.y)<50,boost=near?1.35:1;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(p.x,p.y+9);ctx.scale(1,.55);glow(0,0,62,'246,190,104',.26*boost);ctx.restore();
 ctx.save();ctx.translate(p.x,p.y+9);ctx.scale(1,.55);for(let k=0;k<3;k++){const f=(T*.42+k/3)%1,r=16+f*46,a=(calm()?.5:Math.pow(1-f,1.4)*.85)*boost;ctx.strokeStyle=`rgba(246,199,124,${Math.min(1,a)})`;ctx.lineWidth=(2.4-f*1.6)/.75;ctx.beginPath();ctx.arc(0,0,calm()?24+k*12:r,0,TAU);ctx.stroke()}ctx.restore();
 const by=p.y-70+Math.sin(T*2.2)*4;
 ctx.save();ctx.globalCompositeOperation='lighter';const bg=ctx.createLinearGradient(0,by,0,p.y+8);bg.addColorStop(0,'rgba(246,196,119,0)');bg.addColorStop(.35,`rgba(246,196,119,${.10*boost})`);bg.addColorStop(1,`rgba(246,196,119,${.22*boost})`);ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(p.x-5,by);ctx.lineTo(p.x+5,by);ctx.lineTo(p.x+10,p.y+8);ctx.lineTo(p.x-10,p.y+8);ctx.closePath();ctx.fill();glow(p.x,by,26+Math.sin(T*2.2)*3,'255,214,140',.38*boost);ctx.restore();
 if(!lowQ)for(let k=0;k<5;k++){const f=(T*.35+k/5)%1;ctx.fillStyle=`rgba(255,226,166,${Math.sin(f*Math.PI)*.8})`;ctx.beginPath();ctx.arc(p.x+Math.sin(k*2.3+T*1.2)*14,p.y+4-f*64,1.3,0,TAU);ctx.fill()}
 const turn=calm()?1:.72+.28*Math.abs(Math.cos(T*1.3)),w=10*turn;
 ctx.save();ctx.translate(p.x,by);polygon([[0,-13],[-w,0],[0,0]],'#ffe3a8');polygon([[0,-13],[w,0],[0,0]],'#f6c477');polygon([[-w,0],[0,13],[0,0]],'#e3a453');polygon([[w,0],[0,13],[0,0]],'#c98a3e');ellipse(0,0,2.2,2.2,'#274544');ctx.restore()}
const chipW={};
function drawChips(){ctx.font='600 11px Arial';ctx.textAlign='center';Object.entries(locations).forEach(([key,p])=>{const active=state.phase==='map'&&BEATS[state.step]?.loc===key;const label=p.name.toUpperCase(),w=chipW[label]??=ctx.measureText(label).width+18;roundRect(p.x-w/2,p.y+41,w,22,4,active?'#143331ee':'#12383ac9');if(active){ctx.strokeStyle=`rgba(246,199,123,${.45+.25*Math.sin(T*2.2)})`;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(p.x-w/2+.5,p.y+41.5,w-1,21,4);ctx.stroke()}ctx.fillStyle=active?'#f6c77b':'#b4cbb9';ctx.fillText(label,p.x,p.y+56)})}
/* Player: gait follows real distance walked; footprints and a soft trail fade behind. */
let prevP=null,walkPh=0,face=1,moveAmt=0,printDist=0,printSide=1;const prints=[],trail=[];
function trackPlayer(){const p=state.player;if(!prevP){prevP={x:p.x,y:p.y};return}const dx=p.x-prevP.x,dy=p.y-prevP.y,d=Math.hypot(dx,dy);prevP={x:p.x,y:p.y};if(d>80)return;
 if(Math.abs(dx)>.25)face=dx>0?1:-1;walkPh+=d*.12;moveAmt+=((d>.15?1:0)-moveAmt)*.3;
 if(d>0){printDist+=d;if(printDist>12){printDist=0;printSide=-printSide;const a=Math.atan2(dy,dx);prints.push({x:p.x-Math.sin(a)*2.6*printSide,y:p.y+8+Math.cos(a)*1.3*printSide,a,t:clock});if(prints.length>40)prints.shift()}trail.push({x:p.x,y:p.y,t:clock})}
 while(trail.length&&clock-trail[0].t>.5)trail.shift();while(prints.length&&clock-prints[0].t>2.4)prints.shift()}
function drawPrints(){if(calm())return;for(const f of prints){const a=1-(clock-f.t)/2.4;if(a<=0)continue;ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);ellipse(0,0,2.6,1.3,`rgba(60,48,28,${a*.32})`);ctx.restore()}
 if(trail.length>2){ctx.lineCap='round';ctx.lineJoin='round';for(let i=1;i<trail.length;i++){const a=1-(clock-trail[i].t)/.5;ctx.strokeStyle=`rgba(255,240,205,${a*.22})`;ctx.lineWidth=2+a*5;ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y+2);ctx.lineTo(trail[i].x,trail[i].y+2);ctx.stroke()}}}
function drawPlayer(){const p=state.player,pulse=calm()?0:Math.sin(T*2.4);
 ellipse(p.x,p.y+8,16+pulse*1.5,8+pulse*.7,'rgba(231,246,206,.14)');ctx.strokeStyle='rgba(229,244,221,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y+8,13,6,0,0,TAU);ctx.stroke();
 figure(p.x,p.y,state.color,1.4,calm()?0:walkPh,calm()?0:moveAmt,face);
 const ly=p.y-39-(calm()?0:Math.abs(Math.cos(walkPh))*1.5*moveAmt);roundRect(p.x-15,ly,30,16,4,'#e8efdb');polygon([[p.x-3,ly+15.5],[p.x+3,ly+15.5],[p.x,ly+19]],'#e8efdb');ctx.fillStyle='#254945';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.fillText('YOU',p.x,ly+11)}
function drawTarget(){if(!target)return;const p=state.player;ctx.save();ctx.strokeStyle='rgba(246,199,123,.6)';ctx.setLineDash([3,6]);ctx.lineDashOffset=-clock*14;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y+7);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.restore();const k=(clock*1.5)%1;ctx.strokeStyle=`rgba(246,199,123,${1-k})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(target.x,target.y,3+k*9,1.8+k*5,0,0,TAU);ctx.stroke();ellipse(target.x,target.y,3,2,'#f6c77b')}
/* The company ship waits offshore while it matters to the story. */
function drawShip(){const on=(state.phase==='map'&&state.step===3&&!state.pending)||['raiders','squeeze'].includes(state.openEvent);if(!on)return;const x=902,y=262+Math.sin(T*1.2)*2.5,r=Math.sin(T*1.2+.8)*.04;
 ctx.strokeStyle='rgba(220,245,235,.35)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-46,y+12);ctx.quadraticCurveTo(x-70,y+16,x-96,y+12);ctx.moveTo(x-40,y+16);ctx.quadraticCurveTo(x-60,y+22,x-82,y+22);ctx.stroke();
 ctx.save();ctx.translate(x,y);ctx.rotate(r);ellipse(0,15,48,7,'rgba(8,30,38,.35)');polygon([[-44,0],[44,0],[34,14],[-36,14]],'#4a3a35');polygon([[-44,0],[44,0],[42,4],[-42,4]],'#7a2f2a');line(-6,0,-6,-58,'#5d4a3a',3);line(18,0,18,-40,'#5d4a3a',2.5);polygon([[-5,-55],[-5,-10],[24+Math.sin(T*2)*2,-14]],'#e8ddc4');polygon([[19,-38],[19,-8],[36+Math.sin(T*2+1)*1.5,-10]],'#d9ccb0');waveFlag(-6,-58,12,7,'#c43d34');ctx.restore()}
function drawSea(){
 ctx.beginPath();for(const r of RIPPLES){const x=r.x+Math.sin(T*.45+r.ph)*7,y=r.y+Math.cos(T*.35+r.ph*1.3)*2;ctx.moveTo(x,y);ctx.quadraticCurveTo(x+7,y+2.6,x+14,y)}ctx.strokeStyle=`rgba(170,222,210,${.11+weather*.1})`;ctx.lineWidth=1.2;ctx.stroke();
 if(!lowQ&&!calm()){ctx.lineCap='round';for(const g of GLINTS){const a=Math.pow(Math.max(0,Math.sin(T*g.sp+g.ph)),6)*(.6-weather*.3);if(a<.04)continue;ctx.strokeStyle=`rgba(244,252,236,${a})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+g.len,g.y);ctx.stroke()}}
 for(let k=0;k<3;k++){const f=calm()?k/3+.15:(T*.15+k/3)%1,s=1.085-f*.075,a=Math.sin(f*Math.PI)*(.3+weather*.25);ctx.save();ctx.translate(500,500);ctx.scale(s,s*.99);ctx.translate(-500,-500);ctx.strokeStyle=`rgba(214,244,232,${a})`;ctx.lineWidth=(1+f*1.8)/s;ctx.stroke(COAST);ctx.restore()}
 const surge=Math.sin(T*1.25);ctx.save();ctx.strokeStyle=`rgba(236,250,242,${.32+weather*.15})`;ctx.lineWidth=7+surge*2+weather*4;ctx.stroke(COAST);if(!lowQ){ctx.setLineDash([9,8,3,8]);ctx.lineDashOffset=-T*6;ctx.strokeStyle=`rgba(245,253,248,${.5+surge*.12})`;ctx.lineWidth=12+surge*3+weather*5;ctx.stroke(COAST)}ctx.restore();
 drawShip()}
function drawSky(){const w=weather;
 for(let i=0;i<3;i++){const cw=300+i*50,ch=cw*.55,x=((T*5+i*560)%1700)-350,y=120+i*270;if(!lowQ){ctx.globalAlpha=.09+w*.07;ctx.drawImage(cloudDark,x+60,y+90,cw,ch)}ctx.globalAlpha=.17*(1-w);ctx.drawImage(cloudImg,x,y,cw,ch);if(w>.02){ctx.globalAlpha=.32*w;ctx.drawImage(cloudDark,x,y,cw,ch)}}ctx.globalAlpha=1;
 if(w<.95){ctx.beginPath();for(let fl=0;fl<2;fl++){const fx=((T*15+fl*640)%1350)-170,fy=150+fl*120+Math.sin(T*.3+fl)*18;for(let j=0;j<3;j++){const x=fx-j*15-(j%2)*4,y=fy+j*9-(j===2?14:0),flap=Math.sin(T*7+j*1.9+fl)*4;ctx.moveTo(x-6,y+flap*.6);ctx.quadraticCurveTo(x-3,y-2-flap*.4,x,y);ctx.quadraticCurveTo(x+3,y-2-flap*.4,x+6,y+flap*.6)}}ctx.strokeStyle=`rgba(214,233,222,${.75*(1-w)})`;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.stroke()}}
let weather=0,boltAt=-99,nextBolt=0;
function drawWeather(){const w=weather;if(w<.01)return;ctx.fillStyle=`rgba(8,24,38,${.38*w})`;ctx.fillRect(0,0,vw,vh);
 if(!calm()){const n=Math.round((lowQ?55:110)*w),W=vw+120;ctx.beginPath();for(let i=0;i<n;i++){const sp=560+rand(i+3)*260,y=((T*sp+rand(i+40)*2000)%(vh+40))-20,x=((rand(i+8)*W+T*70+y*.3)%W)-60;ctx.moveTo(x,y);ctx.lineTo(x-4.5,y+13)}ctx.strokeStyle=`rgba(200,228,234,${.38*w})`;ctx.lineWidth=1;ctx.stroke();
  if(w>.7){if(T>nextBolt){boltAt=T;nextBolt=T+7+Math.random()*7}const a=Math.max(0,1-(T-boltAt)/.55);if(a>0){ctx.fillStyle=`rgba(226,240,255,${a*a*.15})`;ctx.fillRect(0,0,vw,vh)}}}}
function drawEventFx(){const ev=state.openEvent&&EVENTS.find(e=>e.id===state.openEvent);if(ev&&ev.art==='fire'){const p=locations[ev.loc];blaze(p.x,p.y)}
 const fi=state.log.findIndex(l=>l.kind==='event'&&l.id==='fire');if(fi>=0&&!(ev&&ev.art==='fire')){const since=state.log.slice(fi+1).filter(l=>l.kind==='beat').length;if(since<3)smoke(locations.camp.x-30,locations.camp.y-30,5,120,16,'48,46,46',.3*(1-since*.3),.14)}}
function sceneArt(loc){const icon=locations[loc].icon;const col=loc==='water'?'#86b9bb':loc==='watch'?'#c9b888':'#c29f69';let shapes='';if(icon==='water')shapes='<path d="M185 100V58h115v42" fill="#497c83"/><ellipse cx="242" cy="58" rx="58" ry="17" fill="#81b7b9"/><path d="M183 69h118M183 89h118" stroke="#aec6b6" stroke-width="4"/>';else if(icon==='watch')shapes='<path d="M220 110V44m55 66V44m-55 10 55 40m-55 0 55-40" stroke="#bda579" stroke-width="9"/><path d="m197 45 50-32 50 32Z" fill="#d7b673"/>';else if(icon==='camp'||icon==='grove')shapes='<path d="m160 108 75-86 80 86Z" fill="#cfb07b"/><path d="m235 22 80 86 60-21-80-74Z" fill="#947a52"/><path d="m210 108 25-40 30 40Z" fill="#1c4142"/>';else if(icon==='hall')shapes='<ellipse cx="260" cy="108" rx="120" ry="28" fill="#6a8160"/><path d="M211 96V65h91v31Z" fill="#b18f5e"/><path d="m211 65 15-10h90l-14 10Z" fill="#c9ae7c"/><path d="M355 106V26" stroke="#a68a5c" stroke-width="7"/><rect x="324" y="20" width="64" height="49" rx="3" fill="#cbb384"/><path d="M336 34h40m-40 10h32m-32 10h40" stroke="#52694f" stroke-width="3"/>';else shapes='<path d="m160 70 36 38h120l40-38Z" fill="#b59161"/><path d="M245 85V13m-1 4 62 54h-62" fill="#ddd1ad" stroke="#ab9265" stroke-width="5"/>';
return `<svg viewBox="0 0 560 120" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#1d424b"/><stop offset="1" stop-color="#4f7260"/></linearGradient></defs><rect width="560" height="120" fill="url(#sky)"/><circle cx="440" cy="35" r="23" fill="#c8c58c" opacity=".3"/><path d="M0 107Q90 73 165 100T340 94T560 89V120H0" fill="#3d6652"/><path d="M0 115Q140 95 260 113T560 105V120H0" fill="#687e54"/>${shapes}<path class="scene-palm" d="M70 118 78 40m0 0Q45 12 30 55q18-6 48-15m0 0q25-30 47-4-18-2-47 4m0 0q-4-33-22-34 5 20 22 34" stroke="#35674e" fill="#35674e" stroke-width="6"/></svg>`;}
function resize(){const r=canvas.getBoundingClientRect();vw=r.width;vh=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);scale=Math.min(vw/1000,vh/970)*1.03;ox=(vw-1000*scale)/2;oy=(vh-940*scale)/2;seaLayer=null;mapDirty=true}
new ResizeObserver(resize).observe(canvas);
let rafId=0,lastDraw=0,drawCost=5,lowQ=false,lastOvKey='';
function draw(dt){T=calm()?0:clock;const tw=stormy()?1:0;weather=calm()?tw:weather+(tw-weather)*Math.min(1,dt*.8);trackPlayer();
 if(!seaLayer)buildLayers();const M=[dpr*scale,0,0,dpr*scale,dpr*ox,dpr*oy];
 ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(seaLayer,0,0);ctx.setTransform(...M);drawSea();
 ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(islandLayer,0,0);ctx.setTransform(...M);
 drawMemorial();drawCanopies();Object.keys(locations).sort((a,b)=>locations[a].y-locations[b].y).forEach(drawLocation);
 cacheSpots.forEach((p,i)=>{if(!state.collected.includes(i))crate(p.x,p.y,true,i)});
 drawPrints();drawVillagers();drawEventFx();drawBeacon();drawChips();drawTarget();drawPlayer();drawSky();
 ctx.setTransform(dpr,0,0,dpr,0,0);drawWeather()}
function frame(t){rafId=requestAnimationFrame(frame);const dt=Math.min((t-lastTime)/1000,.2)||.016;lastTime=t;clock=t/1000;update(dt);
 const moved=prevP&&(prevP.x!==state.player.x||prevP.y!==state.player.y);
 const ov=overlayOpen(),ovKey=ov+'|'+state.openEvent+'|'+state.step;if(ov){if(ovKey===lastOvKey&&!mapDirty)return;weather=stormy()?1:0}lastOvKey=ovKey;
 if(calm()&&!mapDirty&&!moved&&!target)return;
 const ddt=Math.min((t-lastDraw)/1000,.25)||.016;lastDraw=t;mapDirty=false;const c0=performance.now();draw(ddt);
 drawCost=drawCost*.92+(performance.now()-c0)*.08;if(drawCost>10)lowQ=true;else if(drawCost<5)lowQ=false}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(rafId);rafId=0;keys={}}else if(!rafId){lastTime=performance.now();mapDirty=true;rafId=requestAnimationFrame(frame)}});
motionQuery.addEventListener?.('change',()=>{mapDirty=true});

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
rafId=requestAnimationFrame(frame);
