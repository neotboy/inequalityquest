(function(root){
'use strict';
const words={
 democracy:{name:'Direct democracy',text:'Voters decide public questions themselves, such as through a ballot measure. The United States uses representative government at the national level.',group:'Who rules?'},
 republic:{name:'Constitutional republic',text:'Voters elect representatives, and a written Constitution limits government power and protects rights. The United States is a constitutional federal republic.',group:'Who rules?'},
 autocracy:{name:'Autocracy',text:'One ruler holds power with few effective checks or ways for the public to hold that leader accountable. This is authoritarian rule.',group:'Who rules?'},
 totalitarian:{name:'Totalitarian',text:'An authoritarian government seeks control over politics and daily life, including information, organizations, and beliefs.',group:'Who rules?'},
 unitary:{name:'Unitary',text:'The national government holds final authority and can direct local governments. The United States is not a unitary system.',group:'Where is power?'},
 federal:{name:'Federal',text:'Power is divided between a national government and state governments. The U.S. Constitution assigns powers and sets limits on both.',group:'Where is power?'},
 confederate:{name:'Confederate',text:'States or member governments keep most power and give a central body only limited authority. The Articles of Confederation created a weak national government.',group:'Where is power?'},
 socialism:{name:'Socialism',text:'Major productive resources are socially or publicly owned or controlled. This alone does not tell you who rules.',group:'Ownership'},
 communism:{name:'Communism',text:'The ideal is common ownership in a classless, stateless society. Historical communist-party states instead used strong state ownership and party control.',group:'Ownership'}
};
function fresh(){return{version:4,name:'',leader:'',polity:'republic',division:'federal',approach:'consult',ownership:'mixed',regions:['State One','State Two','State Three'],rules:[],marks:[],strokes:[],flag:[],flagBg:'#16364a',nextId:1};}
function addRule(s,text){text=String(text).trim().slice(0,120);if(!text)return false;s.rules.push({id:s.nextId++,text});return true;}
function ruleProcess(polity){return{democracy:'Citizens vote directly on proposed laws. The U.S. national government uses elected representatives instead.',republic:'Elected representatives consider proposed laws. The Constitution, Bill of Rights, and checks and balances limit government power.',autocracy:'You have final political power. People have little meaningful way to hold you accountable.',totalitarian:'Your government seeks control across politics and daily life.'}[polity];}
function regionTest(division){return{unitary:{quote:'“Our state wants to set its own public school rules.”',answer:'In a unitary system, the national government has final authority and can set the rules for local governments.'},federal:{quote:'“Our state wants to set its own public school rules.”',answer:'Education is mainly run by states and local communities in the United States, while federal laws and funding can still shape schools. A federal government must respect the powers assigned to each level.'},confederate:{quote:'“Our state wants to set its own public school rules.”',answer:'In a confederation, the member governments keep most authority. A central body has limited power unless the states grant it.'}}[division];}
const E={words,fresh,addRule,ruleProcess,regionTest};if(typeof module!=='undefined'&&module.exports)module.exports=E;else root.CountryCreator=E;
})(typeof window!=='undefined'?window:this);
