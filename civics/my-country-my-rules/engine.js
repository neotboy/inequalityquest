(function(root){
'use strict';
const words={
 democracy:{name:'Direct democracy',text:'Citizens vote directly on public decisions.',group:'Who rules?'},
 republic:{name:'Democratic republic',text:'People elect representatives. Leaders must follow laws and respect political rights.',group:'Who rules?'},
 autocracy:{name:'Autocracy',text:'One ruler holds power with little meaningful public accountability. This is authoritarian rule.',group:'Who rules?'},
 totalitarian:{name:'Totalitarian',text:'An authoritarian government seeks control over politics and daily life, including information and beliefs.',group:'Who rules?'},
 unitary:{name:'Unitary',text:'The national government holds ultimate authority. It can give tasks to regional offices.',group:'Where is power?'},
 federal:{name:'Federal',text:'National and regional governments each have their own assigned powers.',group:'Where is power?'},
 confederate:{name:'Confederate',text:'Member governments keep most power and give limited powers to a central body.',group:'Where is power?'},
 socialism:{name:'Socialism',text:'Major productive resources are socially or publicly owned or controlled. This alone does not tell you who rules.',group:'Ownership'},
 communism:{name:'Communism',text:'The ideal is common ownership in a classless, stateless society. Historical communist-party states instead used strong state ownership and party control.',group:'Ownership'}
};
function fresh(){return{version:4,name:'My absolutely normal country',leader:'Me, obviously',polity:'republic',division:'federal',ownership:'mixed',regions:['Duck District','Drama District','Snack District'],rules:[],marks:[],strokes:[],flag:[],flagBg:'#6b40cb',nextId:1};}
function addRule(s,text){text=String(text).trim().slice(0,120);if(!text)return false;s.rules.push({id:s.nextId++,text});return true;}
function ruleProcess(polity){return{democracy:'Citizens vote directly on your proposed laws.',republic:'Elected representatives consider your proposed laws within legal limits.',autocracy:'You have final political power. People have little meaningful way to hold you accountable.',totalitarian:'Your government seeks control across politics and daily life.'}[polity];}
function regionTest(division){return{unitary:{quote:'“We want our own regional flag!”',answer:'Your central government can direct the regional offices. You can also choose to let them design it.'},federal:{quote:'“We want our own regional flag!”',answer:'In this country, regional flags are an assigned regional power. The national government cannot simply take over that decision.'},confederate:{quote:'“We want our own regional flag!”',answer:'The member governments keep this power. Your central body needs their agreement.'}}[division];}
const E={words,fresh,addRule,ruleProcess,regionTest};if(typeof module!=='undefined'&&module.exports)module.exports=E;else root.CountryCreator=E;
})(typeof window!=='undefined'?window:this);
