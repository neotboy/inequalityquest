(function(root){'use strict';
const states=[['MA','Massachusetts'],['NH','New Hampshire'],['RI','Rhode Island'],['CT','Connecticut'],['NY','New York'],['NJ','New Jersey'],['PA','Pennsylvania'],['DE','Delaware'],['MD','Maryland'],['VA','Virginia'],['NC','North Carolina'],['SC','South Carolina'],['GA','Georgia']];
const offers={debt:[1,1,0,1,0,1,2,0,1,1,0,0,1],local:[1,0,1,1,1,0,1,1,0,1,1,0,0]};
const rules=[{title:'States keep most power',text:'The states joined a confederation—a union with a weak national government.'},{title:'One Congress. One vote per state.',text:'Congress had one chamber. Each state had one vote, regardless of its population.'},{title:'No separate national president',text:'Congress had a presiding officer, but no separate executive branch to carry out national laws.'},{title:'No independent national court system',text:'Congress could arrange courts for certain matters, but there was no separate, general national judiciary.'}];
function fresh(){return{version:1,started:false,name:'',stage:0,remaining:900,paused:false,asked:{},tone:'debt',money:0,taxTried:false,paid:false,cargo:8,gate:0,tradeDone:false,tradeLog:[],promise:'repay',votes:7,persuaded:[],borrowed:false,petition:false,amend:null,patches:[],finished:false};}
function request(s,i){if(i<0||i>=13||s.asked[i]!==undefined||s.paid)return null;const amount=offers[s.tone][i];s.asked[i]=amount;s.money+=amount;return amount;}
function pay(s){if(Object.keys(s.asked).length<13||!s.taxTried)return false;s.paid=true;return true;}
function toll(s,choice){if(s.gate>=3||!['pay','deal'].includes(choice))return false;const cost=(choice==='pay'?[2,2,1]:[1,1,0])[s.gate];s.cargo-=cost;s.tradeLog.push({gate:s.gate,choice,cost});s.gate++;return cost;}
function persuade(s,i){if(![4,8].includes(i)||s.persuaded.includes(i))return false;const needed=i===4?'repay':'local';if(s.promise!==needed)return false;s.persuaded.push(i);s.votes++;return true;}
function amend(s,choice){if(!s.petition||s.amend||!['keep','remove'].includes(choice))return false;s.amend=choice;return true;}
function patch(s,id,target){if(id!==target||!['tax','trade','amend','enforce'].includes(id)||s.patches.includes(id))return false;s.patches.push(id);return true;}
function next(s){const ready=[s.paid,s.tradeDone,s.borrowed,!!s.amend,s.patches.length===4][s.stage];if(!ready)return false;if(s.stage===4)s.finished=true;else s.stage++;return true;}
const E={states,rules,fresh,request,pay,toll,persuade,amend,patch,next};if(typeof module!=='undefined'&&module.exports)module.exports=E;else root.ArticlesGame=E;
})(typeof window!=='undefined'?window:this);
