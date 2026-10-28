/* Short application questions. Answers assess civics knowledge, not political views. */
(function(root){
'use strict';
const q=(id,scene,ask,answer,wrong1,wrong2,why)=>({id,scene,ask,answer,choices:[answer,wrong1,wrong2],why});
const systems={
polity:{
democracy:[
q('direct-park','People vote on a park law themselves.','Who decides in this direct democracy?','The voters','Only the president','Only business owners','In a direct democracy, people vote on laws themselves.'),
q('direct-school','A town must choose a school rule. It uses direct democracy.','What happens next?','People vote on the rule','One leader decides alone','A small group decides for everyone','Direct democracy lets people vote on the rule itself.')],
republic:[
q('republic-library','Voters elect lawmakers. The lawmakers vote on library funding.','What makes this a constitutional republic?','Elected leaders act within constitutional limits','Every voter must vote on every law','The leader can ignore the Constitution','A constitutional republic uses elected leaders whose power has limits.'),
q('republic-limit','A president wins an election, then bans all criticism.','In a constitutional republic, what still limits the president?','The Constitution and people’s rights','Nothing after an election','Only the president’s wishes','Winning an election does not remove constitutional limits.')],
oligarchy:[
q('oligarchy-five','Five powerful families choose the laws. Most people have little say.','Which clue shows an oligarchy?','A small group holds most power','Many people own shops','People vote on each law','Oligarchy means rule by a small group. Wealth alone does not prove it.'),
q('oligarchy-vote','A small council keeps control. Most citizens cannot replace it.','Where is most political power?','With the small council','With all citizens equally','With each voter directly','In an oligarchy, a small group controls most political power.')],
autocracy:[
q('autocracy-mayor','One ruler makes the final decisions. People cannot freely replace that ruler.','What is the key clue?','One leader holds most power','Private owners run shops','States share power','Autocracy describes who holds political power: one leader.'),
q('autocracy-court','A ruler gives orders that no other branch can stop.','What makes this an autocracy?','Few real limits on one ruler','People vote on every order','Power is shared equally','An autocracy gives one ruler most power, with few real checks.')],
totalitarian:[
q('total-news','The state controls news, groups, and which beliefs people may share.','What makes this totalitarian?','Control reaches into daily life','The country has traffic laws','Businesses compete for customers','A totalitarian regime tries to control politics and daily life.'),
q('total-clubs','Leaders ban independent clubs and punish people for their beliefs.','What kind of control is shown?','Control of daily life and beliefs','Only a rule about sharing state power','A vote by business ownership','Totalitarian rule reaches beyond government into people’s daily lives.')]
},
division:{
federal:[
q('federal-schools','National laws protect rights. States also run public schools.','What shows federalism?','National and state governments share power','Only states have any power','Only the national government has power','Federalism means national and state governments share power.'),
q('federal-defense','The national government handles defense. States make many school rules.','How is power divided?','Different levels have different powers','The president owns each school','Every state is a separate country','A federal system divides power between national and state governments.')],
unitary:[
q('unitary-town','The national government can change the powers of local councils.','What shows a unitary system?','National leaders hold most power','States control the national government','Each town is an independent country','In a unitary system, most power rests with the national government.'),
q('unitary-school','A local council wants a new power. National leaders must grant it.','Where does most power sit?','The national government','Each local council equally','A group of independent states','Unitary systems place most power at the national level.')],
confederate:[
q('confed-aid','States form a union but keep most power. The central body asks states for money.','What makes this a confederation?','Member states keep most power','The central body has all power','The president owns most businesses','In a confederation, states give limited jobs to a central body.'),
q('confed-jobs','States agree that a central body may handle only trade talks.','Who gives the central body its powers?','The member states','One ruler with total control','Private shop owners','The member states grant limited powers to a confederation’s central body.')]
},
approach:{
consult:[
q('consult-hearing','Before a new law, a leader hears from voters, states, and Congress.','What is the leader trying to build?','Agreement through public input','Control without any limits','A ban on disagreement','Hearing from others helps leaders build agreement.'),
q('consult-change','Families explain a problem at a public meeting. The leader changes the plan.','What influenced the decision?','Public input','A ban on public meetings','The leader acting alone','Public input means hearing people affected by a decision.')],
firm:[
q('firm-emergency','A leader acts fast in an emergency. Courts can still review the action.','What keeps firm action within limits?','Checks by other branches','Giving the leader unlimited power','Canceling all future elections','Firm leadership can act quickly while keeping checks and legal limits.'),
q('firm-budget','A leader asks Congress for emergency funds instead of taking money alone.','What limit is the leader respecting?','Congress’s role in spending','The right to cancel Congress','Private ownership of all taxes','Congress has a role in public spending, even during an emergency.')],
hard:[
q('command-order','A leader skips Congress and orders everyone to follow a new rule.','What is the leader concentrating?','Decision-making power','Public input','Equal power in every branch','Rule by command puts more decisions under the leader’s control.'),
q('command-rights','A leader stops critics from speaking to avoid delays.','What can people lose?','Freedom to criticize the government','The need for any public budget','The power to choose shop prices','Concentrating power can put civil liberties, such as speech, at risk.')]
},
ownership:{
capitalism:[
q('capital-shop','Maya owns a bakery. She competes for customers and keeps profits.','Which clue shows capitalism?','Private ownership and selling for profit','The state owns every bakery','No one may own a business','Capitalism includes private business ownership, markets, and profit.'),
q('capital-market','Private owners run two shops. Customers choose where to buy.','Which economic system does this show?','Capitalism','Communism’s shared-ownership idea','Government ownership of all shops','Private ownership and market choices are key parts of capitalism.')],
mixed:[
q('mixed-bus','Private owners run shops. The city also runs a public bus service.','Why is this a mixed economy?','Private markets and public services both have a role','The government owns every business','There are no private owners','A mixed economy combines private markets with a government role.'),
q('mixed-us','A country has private restaurants, public schools, and business laws.','Which label fits this mix?','Mixed economy','No government role at all','Shared ownership of every business','Private businesses can exist alongside public services and rules.')],
socialism:[
q('social-workers','Workers or the public own major businesses, rather than private investors.','Which idea does this show?','Socialism','Private ownership as the main rule','Direct votes on every law','Socialism focuses on public or worker ownership of major resources.'),
q('social-not-ruler','You know that workers own major factories. You know nothing about elections.','What can you identify from this fact alone?','An idea about economic ownership','Exactly who rules the country','Whether the country has free elections','Ownership tells us about the economy. It does not fully tell us who rules.')],
communism:[
q('communism-idea','A plan calls for shared ownership and no social classes.','Which idea is being described?','Communism','Private ownership for profit','Power shared between national and state governments','Communism is an idea of shared ownership and a classless society.'),
q('communism-label','A government calls itself communist. You want to know if people can replace its leaders.','What else must you check?','Its elections and real political powers','Only the economic label','Only the country’s flag','An economic label does not tell the full story of who has political power.')]
}
};
const rounds=[
[
q('housing-levels','A town and national leaders disagree about housing rules.','Which civics question matters here?','Which level of government has this power?','Who should own the housing companies?','What steps would give people a fair hearing?','Federalism asks how power is shared across levels of government.'),
q('housing-check','A court stops a housing order that breaks the Constitution.','What is the court doing?','Checking the leader’s power','Giving the leader unlimited power','Becoming the owner of every house','Courts can check whether government actions follow the Constitution.')],
[
q('border-hearing','A person asks for safety. Officials must hear the case fairly.','Which idea is this?','Due process: fair legal steps','The leader may ignore all courts','Capitalism: private ownership','Due process means fair legal steps, including a fair hearing.'),
q('border-limits','An emergency does not erase the right to a fair hearing.','What still limits government action?','People’s legal rights','Only how popular the leader is','The size of the national flag','Government power still has legal limits during an emergency.')],
[
q('gun-court','A president acts without required court hearings. Judges review the order.','Which idea does this show?','Checks and balances','A leader with no limits','Private ownership of courts','Checks and balances let branches limit one another’s power.'),
q('gun-congress','A safety plan must become a law. Congress debates it and votes.','Which job is Congress doing?','Making laws','Deciding every court case','Running every local police station','Congress is the national lawmaking branch.')],
[
q('care-states','Two states have different health care laws.','Which question is about federalism?','Should states or national leaders set this rule?','Should private companies own hospitals?','What steps would give a patient a fair hearing?','Federalism concerns the powers of state and national governments.'),
q('care-review','Congress passes a health law. A court checks whether it follows the Constitution.','Why can the court do this?','Government power has constitutional limits','Congress can never pass health laws','Every court owns a hospital','Courts can review laws. This is a check on government power.')],
[
q('heat-money','A leader opens cooling centers. Lives are saved, but less emergency money remains.','What is the trade-off?','More safety now, less budget room later','More safety and unlimited money','No change to safety or the budget','A trade-off means gaining one benefit while giving up something else.'),
q('heat-fan','Emergency money buys a palace fan. Hospitals lose backup power.','Which cause led to harm?','Needed services lost emergency funds','Hospitals gained more backup power','Public hearings gave the leader advice','A budget choice can leave people without the services they need.')],
[
q('health-bill','A president wants a lasting national health care law.','Which step includes the lawmaking branch?','Ask Congress to debate and vote','Close Congress and act alone','Let the flag designer pass the law','Congress makes national laws. A president cannot replace the whole process.'),
q('health-order','A president sets prices by order. Congress challenges the action.','What question should a court consider?','Did the president stay within legal powers?','Did the order win the most public support?','Does Congress prefer the same policy?','A court can review whether an executive order stays within legal limits.')],
[
q('election-loss','A leader cancels an election to stay in office.','Which power are voters losing?','The chance to replace leaders','The right to vote directly on every law','The power to overturn every court ruling','Free elections let voters choose and replace leaders.'),
q('election-count','Election workers show how votes were counted and checked.','How can this help public trust?','People can see evidence about the count','Leaders may choose the winner secretly','Every claim becomes true automatically','Public trust can grow when people can check evidence about decisions.')],
[
q('privacy-data','An agency gathers everyone’s private messages without legal limits.','Which civil liberty is at risk?','Privacy','The power of courts to interpret laws','The power to set state budgets','Civil liberties include privacy and protection from government overreach.'),
q('privacy-permission','A company must ask before selling a person’s private details.','What does this rule protect?','Control over personal information','A company’s right to hide every mistake','The president’s power to cancel elections','Privacy rules can give people more control over their own information.')],
[
q('students-rights','Two states disagree about school rules, but both must follow the U.S. Constitution.','Which statement is correct?','States have powers, but constitutional rights still matter','States may ignore every national limit','The president runs every classroom','Federalism gives states powers. It does not erase constitutional rights.'),
q('students-court','Students say a school rule breaks their constitutional rights.','Which branch can review that legal claim?','The courts','The president acting alone','A vote by business owners','Courts review claims about laws and constitutional rights.')]
];
const review=[
[
q('review-capital','A family owns a shop and sells goods for profit.','Which feature is shown?','Capitalism: private business ownership','Communism: shared ownership and no classes','Unitary rule: national political power','Capitalism describes private ownership, markets, and profit.'),
q('review-capital-2','Private owners open competing shops. Customers choose where to buy.','What economic idea is shown?','Capitalism','Totalitarian control of beliefs','Confederation among states','Private business ownership and competition are features of capitalism.')],
[
q('review-republic','Citizens elect lawmakers. A Constitution limits those lawmakers.','Which system is shown?','Constitutional republic','Autocracy','Direct democracy on every law','A constitutional republic has elected leaders and constitutional limits.'),
q('review-republic-2','Voters choose representatives to vote on laws.','How does this differ from direct democracy?','Representatives vote on laws for the voters','Every voter votes on each law directly','One ruler has unlimited power','In direct democracy, people vote on laws themselves. Representatives act for voters in a republic.')],
[
q('review-mixed','A country has private stores, public roads, and government business rules.','Which economic label fits?','Mixed economy','Shared ownership of every business','No government role in the economy','A mixed economy has both private markets and a government role.'),
q('review-mixed-2','The city opens a public library while private shops stay open.','Must the whole economy now be socialist?','No. Public services can be part of a mixed economy','Yes. One public library decides the whole system','Yes. Private businesses must all close','One public service does not define the whole economy. Look at the wider ownership system.')]
];
const api={systems,rounds,review};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CountryKnowledge=api;
})(typeof window!=='undefined'?window:this);
