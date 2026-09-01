/* ==========================================
   TYCOON X
   AUTOMATIC 2D BUSINESS SIMULATOR
========================================== */


/* ==========================================
   BUSINESS DATABASE
========================================== */

const BUSINESS_TYPES = {

tech:{
name:"TECH LABS",
icon:"💻",
price:5000,
income:900,
performance:78,
stockCost:900
},

food:{
name:"FOOD EMPIRE",
icon:"🍔",
price:3500,
income:650,
performance:72,
stockCost:600
},

auto:{
name:"AUTO WORKS",
icon:"🚗",
price:9000,
income:1500,
performance:68,
stockCost:1400
},

game:{
name:"GAME STUDIO",
icon:"🎮",
price:7000,
income:1100,
performance:82,
stockCost:1000
},

energy:{
name:"ENERGY CORP",
icon:"⚡",
price:12000,
income:2100,
performance:65,
stockCost:1900
},

fashion:{
name:"FASHION HOUSE",
icon:"👕",
price:6000,
income:950,
performance:74,
stockCost:850
},

space:{
name:"SPACE TECH",
icon:"🚀",
price:25000,
income:4200,
performance:58,
stockCost:4000
}

};


/* ==========================================
   GAME STATE
========================================== */

let game={

started:false,

player:"",
company:"",

cash:10000,

day:1,

minute:8*60,

level:1,

xp:0,

market:100,

demand:100,

economy:100,

risk:0,

businesses:[],

news:[],

rivals:[

{
name:"NEXUS GLOBAL",
value:150000,
power:82
},

{
name:"APEX INDUSTRIES",
value:110000,
power:71
},

{
name:"ORBIT GROUP",
value:210000,
power:88
},

{
name:"VANTAGE CORP",
value:85000,
power:62
}

]

};


/* ==========================================
   SAVE
========================================== */

function save(){

localStorage.setItem(
"TYCOON_X_SAVE",
JSON.stringify(game)
);

}


/* ==========================================
   LOAD
========================================== */

function load(){

const saved=
localStorage.getItem("TYCOON_X_SAVE");

if(!saved)return;

try{

game=JSON.parse(saved);

document
.getElementById("startScreen")
.classList.add("hidden");

document
.getElementById("game")
.classList.remove("hidden");

render();

}catch(e){

localStorage.removeItem(
"TYCOON_X_SAVE"
);

}

}


/* ==========================================
   START
========================================== */

function startGame(){

const player=
document
.getElementById("playerName")
.value
.trim();

const company=
document
.getElementById("companyName")
.value
.trim();

const type=
document
.getElementById("starterType")
.value;

if(!player||!company){

toast("ENTER CEO AND COMPANY NAME");

return;

}

game.started=true;
game.player=player;
game.company=company;
game.cash=10000;
game.day=1;
game.minute=8*60;
game.level=1;
game.xp=0;
game.market=100;
game.demand=100;
game.economy=100;
game.risk=0;
game.businesses=[];
game.news=[];

createBusiness(type);

addNews(
"🏢 "+
company+
" HAS BEEN ESTABLISHED."
);

addNews(
"📡 AUTOMATIC OPERATIONS ONLINE."
);

addNews(
"⚔ COMPETITORS DETECTED."
);

document
.getElementById("startScreen")
.classList.add("hidden");

document
.getElementById("game")
.classList.remove("hidden");

save();

render();

toast("CORPORATION ONLINE");

}


/* ==========================================
   MONEY
========================================== */

function money(n){

return "$"+
Math.round(n)
.toLocaleString();

}


/* ==========================================
   CREATE BUSINESS
========================================== */

function createBusiness(type){

const d=
BUSINESS_TYPES[type];

if(!d)return;

const b={

id:
Date.now()+
Math.random(),

type,

name:d.name,

icon:d.icon,

cash:0,

value:d.price,

performance:d.performance,

stock:100,

stockCapacity:100,

income:d.income,

stockCost:d.stockCost,

upgrade:1,

employees:0,

loan:0,

loanDays:0,

active:true

};

game.businesses.push(b);

return b;

}


/* ==========================================
   BUY BUSINESS
========================================== */

function buyBusiness(type){

const d=
BUSINESS_TYPES[type];

if(game.cash<d.price){

toast("NOT ENOUGH EMPIRE CASH");

return;

}

game.cash-=d.price;

createBusiness(type);

game.xp+=25;

checkLevel();

addNews(
"🏢 ACQUIRED "+
d.name
);

closeBuyMenu();

toast(
"NEW BUSINESS ACQUIRED"
);

render();

save();

}


/* ==========================================
   PERFORMANCE
========================================== */

function calculatePerformance(b){

const base=
BUSINESS_TYPES[b.type].performance;

let performance=base;

performance+=
(b.upgrade-1)*4;

performance+=
Math.min(
15,
b.employees*2
);

performance+=
(game.market-100)*0.12;

performance+=
(game.demand-100)*0.08;

performance+=
(game.economy-100)*0.05;

performance+=
Math.random()*2-1;

return Math.max(
10,
Math.min(
99,
performance
)
);

}


/* ==========================================
   IMPROVED PROFIT SYSTEM
========================================== */

function calculatePayout(b){

/*
Base business income.
*/

let payout=b.income;


/*
Business performance.
*/

payout*=
b.performance/100;


/*
Every upgrade makes the
company significantly stronger.
*/

payout*=
1+
((b.upgrade-1)*0.30);


/*
Employees increase production.
*/

payout*=
1+
(b.employees*0.04);


/*
Market conditions.
*/

payout*=
game.market/100;


/*
Customer demand.
*/

payout*=
game.demand/100;


/*
Economic conditions.
*/

payout*=
game.economy/100;


/*
Small natural variation.
*/

payout*=
0.90+
Math.random()*0.20;


/*
Minimum useful payout.
*/

return Math.max(
100,
Math.round(payout)
);

}


/* ==========================================
   AUTOMATIC BUSINESS
========================================== */

function operateBusiness(b){

if(!b.active)return;


/*
Update performance.
*/

b.performance=
calculatePerformance(b);


/*
If stock reaches zero,
the company stops.
*/

if(b.stock<=0){

b.stock=0;
b.active=false;

addNews(
"🚨 "+
b.name+
" STOCK EMPTY — OPERATIONS STOPPED."
);

return;

}


/*
100% → 0%
takes approximately 10 real minutes.

0.5% every 3 seconds.

2% crossed every ~12 seconds.
*/

const stockLoss=0.5;

const oldStock=b.stock;

b.stock-=stockLoss;

if(b.stock<0)
b.stock=0;


/*
Detect every 2% stock boundary.

98 → 96 → 94...
*/

const oldBoundary=
Math.floor(oldStock/2);

const newBoundary=
Math.floor(b.stock/2);

if(newBoundary<oldBoundary){

const payout=
calculatePayout(b);

b.cash+=payout;

game.xp+=
Math.max(
1,
Math.round(payout/500)
);

showProfit(
b,
payout
);

}


/*
Employee running cost.
*/

const employeeCost=
b.employees*2;

b.cash-=employeeCost;


/*
Business value changes
according to performance.
*/

b.value+=
Math.round(
(b.performance-50)*3
);

b.value=
Math.max(
500,
b.value
);


/*
Critical warnings.
*/

if(
b.stock<=20 &&
b.stock>19
){

addNews(
"⚠ "+
b.name+
" STOCK BELOW 20%."
);

}

if(
b.stock<=10 &&
b.stock>9
){

addNews(
"🚨 "+
b.name+
" STOCK CRITICAL."
);

}

}


/* ==========================================
   PROFIT ANIMATION
========================================== */

function showProfit(b,amount){

const popup=
document.createElement("div");

popup.className="profitPopup";

popup.textContent=
"+ "+
money(amount)+
"  💰";

popup.style.left=
(25+
Math.random()*50)+
"%";

popup.style.top=
"55%";

document
.body
.appendChild(popup);

setTimeout(
()=>{
popup.remove();
},
1500
);

}


/* ==========================================
   RESTOCK
========================================== */

function refillBusiness(id){

const b=
findBusiness(id);

if(!b)return;

const missing=
100-b.stock;

if(missing<=0){

toast("STOCK ALREADY FULL");

return;

}


/*
Higher stock prices when
market is bad.
*/

let cost=
missing/100*
b.stockCost;

cost*=
1+
((100-game.market)/200);

cost=
Math.round(cost);


if(game.cash<cost){

toast(
"NOT ENOUGH EMPIRE CASH"
);

addNews(
"🚨 "+
b.name+
" COULD NOT BE RESTOCKED."
);

return;

}

game.cash-=cost;

b.stock=100;
b.active=true;

addNews(
"📦 "+
b.name+
" RESTOCKED FOR "+
money(cost)
);

toast("STOCK REFILLED");

render();

save();

}


/* ==========================================
   UPGRADE
========================================== */

function upgradeBusiness(id){

const b=
findBusiness(id);

if(!b)return;

const cost=
Math.round(
BUSINESS_TYPES[b.type].price*
0.45*
Math.pow(
1.55,
b.upgrade-1
)
);

if(game.cash<cost){

toast(
"NOT ENOUGH EMPIRE CASH"
);

return;

}

game.cash-=cost;

b.upgrade++;

b.income+=
Math.round(
b.income*0.20
);

b.stockCapacity+=5;

b.performance+=3;

game.xp+=35;

checkLevel();

addNews(
"⬆ "+
b.name+
" UPGRADED TO LEVEL "+
b.upgrade
);

toast(
"BUSINESS UPGRADED"
);

render();

save();

}


/* ==========================================
   EMPLOYEE
========================================== */

function hireBusinessEmployee(id){

const b=
findBusiness(id);

if(!b)return;

const cost=
900+
b.employees*350;

if(game.cash<cost){

toast("NOT ENOUGH CASH");

return;

}

game.cash-=cost;

b.employees++;

b.performance+=2;

game.xp+=10;

checkLevel();

addNews(
"👨‍💼 NEW EMPLOYEE JOINED "+
b.name
);

toast("EMPLOYEE HIRED");

render();

save();

}


/* ==========================================
   LOAN
========================================== */

function businessLoan(id){

const b=
findBusiness(id);

if(!b)return;

if(b.loan>0){

toast(
"BUSINESS ALREADY HAS A LOAN"
);

return;

}

const amount=10000;

b.loan=
Math.round(
amount*1.08
);

b.cash+=amount;

b.loanDays=0;

game.xp+=10;

addNews(
"🏦 "+
b.name+
" BORROWED $10,000."
);

toast("LOAN APPROVED");

render();

save();

}


/* ==========================================
   REPAY LOAN
========================================== */

function repayBusinessLoan(id){

const b=
findBusiness(id);

if(!b||b.loan<=0){

toast("NO LOAN TO REPAY");

return;

}

const amount=
Math.min(
5000,
b.loan
);

if(b.cash<amount){

toast(
b.name+
" DOES NOT HAVE ENOUGH BUSINESS CASH."
);

return;

}

b.cash-=amount;

b.loan-=amount;

if(b.loan<=0){

b.loan=0;
b.loanDays=0;

addNews(
"🏦 "+
b.name+
" IS NOW DEBT FREE."
);

toast("LOAN FULLY REPAID");

}else{

toast("LOAN PAYMENT MADE");

}

render();

save();

}


/* ==========================================
   BUSINESS VALUE
========================================== */

function calculateBusinessValue(b){

const performance=
b.performance/100;

const upgrades=
1+
(b.upgrade-1)*0.25;

const stock=
0.5+
(b.stock/100)*0.5;

return Math.max(
0,
Math.round(
b.value*
performance*
upgrades*
stock+
b.cash-
b.loan
)
);

}


/* ==========================================
   SELL BUSINESS
========================================== */

function sellBusiness(id){

const b=
findBusiness(id);

if(!b)return;

const value=
calculateBusinessValue(b);

const answer=
confirm(
"SELL "+
b.name+
" FOR "+
money(value)+
"?\n\nThis permanently removes the business."
);

if(!answer)return;

game.cash+=value;

game.businesses=
game.businesses.filter(
x=>x.id!==id
);

game.xp+=15;

checkLevel();

addNews(
"💼 SOLD "+
b.name+
" FOR "+
money(value)
);

closeBusiness();

toast("BUSINESS SOLD");

render();

save();

}


/* ==========================================
   MARKET
========================================== */

function marketTick(){

let movement=
Math.random()*4-2;

game.market+=movement;

game.market=
Math.max(
55,
Math.min(
145,
game.market
)
);

game.economy+=
Math.random()*2-1;

game.economy=
Math.max(
50,
Math.min(
140,
game.economy
)
);

game.demand+=
Math.random()*3-1.5;

game.demand=
Math.max(
55,
Math.min(
150,
game.demand
)
);


/*
Boom.
*/

if(Math.random()<0.015){

game.market+=10;
game.demand+=8;

addNews(
"📈 GLOBAL MARKET BOOM!"
);

}


/*
Crash.
*/

if(Math.random()<0.012){

game.market-=12;
game.demand-=8;

addNews(
"📉 GLOBAL MARKET CRASH!"
);

}

}


/* ==========================================
   RIVALS
========================================== */

function rivalsTick(){

game.rivals.forEach(r=>{

const movement=
Math.random()*0.018-0.009;

r.value+=
r.value*movement;

r.value=
Math.max(
20000,
r.value
);

if(
r.power>75 &&
Math.random()<0.05
){

game.demand-=1;

addNews(
"⚔ "+
r.name+
" TOOK MARKET SHARE."
);

}

});

}


/* ==========================================
   NEW DAY
========================================== */

function newDay(){

game.day++;

addNews(
"🌅 DAY "+
game.day+
" HAS BEGUN."
);


/*
Loans become older.
*/

game.businesses.forEach(b=>{

if(b.loan>0){

b.loanDays++;

if(b.loanDays>=2){

b.loan=
Math.round(
b.loan*1.05
);

b.performance-=4;

game.risk+=8;

addNews(
"🚨 "+
b.name+
" LOAN PAYMENT OVERDUE."
);

}

}


/*
Daily salary.
*/

b.cash-=
b.employees*150;

});


marketTick();
rivalsTick();

game.xp+=20;

checkLevel();

save();

}


/* ==========================================
   LEVEL
========================================== */

function checkLevel(){

let required=
100+
(game.level-1)*100;

while(game.xp>=required){

game.xp-=required;

game.level++;

required=
100+
(game.level-1)*100;

addNews(
"🏆 CEO LEVEL "+
game.level+
" UNLOCKED!"
);

toast(
"LEVEL "+
game.level+
" REACHED!"
);

}

}


/* ==========================================
   RISK
========================================== */

function calculateRisk(){

let risk=0;

game.businesses.forEach(b=>{

if(b.stock<20)
risk+=5;

if(b.performance<40)
risk+=5;

if(b.loan>0)
risk+=3;

if(b.loanDays>=2)
risk+=8;

if(b.cash<0)
risk+=7;

});

if(game.cash<1000)
risk+=10;

if(game.market<70)
risk+=10;

game.risk=
Math.min(
100,
Math.round(risk)
);

}


/* ==========================================
   BANKRUPTCY
========================================== */

function bankruptcyCheck(){

calculateRisk();


game.businesses.forEach(b=>{

if(b.cash<-100000){

b.active=false;

addNews(
"💀 "+
b.name+
" IS BANKRUPT."
);

}

});


const net=
calculateNetWorth();

if(net<=-100000){

alert(
"💀 CORPORATE BANKRUPTCY\n\n"+
"Your net worth dropped below -$100,000.\n\n"+
"THE EMPIRE HAS COLLAPSED."
);

localStorage.removeItem(
"TYCOON_X_SAVE"
);

location.reload();

}

}


/* ==========================================
   NET WORTH
========================================== */

function calculateNetWorth(){

const value=
game.businesses.reduce(
(total,b)=>
total+
calculateBusinessValue(b),
0
);

const debt=
game.businesses.reduce(
(total,b)=>
total+b.loan,
0
);

return game.cash+
value-
debt;

}


/* ==========================================
   NEWS
========================================== */

function addNews(text){

game.news.unshift(text);

game.news=
game.news.slice(
0,
8
);

}


/* ==========================================
   AUTOMATIC BUSINESS ENGINE
========================================== */

setInterval(()=>{

if(!game.started)return;

game.businesses.forEach(
operateBusiness
);

calculateRisk();

bankruptcyCheck();

render();

save();

},3000);


/* ==========================================
   MARKET ENGINE
========================================== */

setInterval(()=>{

if(!game.started)return;

marketTick();

rivalsTick();

render();

save();

},15000);


/* ==========================================
   GAME CLOCK
========================================== */

/*
5 REAL MINUTES = 1 GAME DAY.

1440 game minutes / 300 seconds
= 4.8 game minutes per real second.
*/

setInterval(()=>{

if(!game.started)return;

const speed=
Number(
document
.getElementById("speed")
?.value||1
);

game.minute+=
4.8*speed;

if(game.minute>=1440){

game.minute-=1440;

newDay();

}

updateClock();

},1000);


/* ==========================================
   CLOCK
========================================== */

function updateClock(){

let hours=
Math.floor(
game.minute/60
);

let minutes=
Math.floor(
game.minute%60
);

document
.getElementById("time")
.textContent=
String(hours).padStart(2,"0")
+
":"+
String(minutes).padStart(2,"0");

document
.getElementById("phase")
.textContent=
hours>=6&&hours<18
?
"DAY"
:
"NIGHT";

}


/* ==========================================
   RENDER
========================================== */

function render(){

if(!game.started)return;

calculateRisk();

const businessCash=
game.businesses.reduce(
(t,b)=>t+b.cash,
0
);

const businessValue=
game.businesses.reduce(
(t,b)=>
t+
calculateBusinessValue(b),
0
);

const debt=
game.businesses.reduce(
(t,b)=>t+b.loan,
0
);

const wealth=
calculateNetWorth();


document.getElementById("ceo").textContent=
game.player;

document.getElementById("companyTitle").textContent=
game.company;

document.getElementById("businessCount").textContent=
game.businesses.length;

document.getElementById("day").textContent=
game.day;

document.getElementById("level").textContent=
game.level;

document.getElementById("xp").textContent=
game.xp+
" / "+
(
100+
(game.level-1)*100
);

document.getElementById("totalWealth").textContent=
money(wealth);

document.getElementById("empireCash").textContent=
money(game.cash);

document.getElementById("businessCash").textContent=
money(businessCash);

document.getElementById("investments").textContent=
money(businessValue);

document.getElementById("debt").textContent=
money(debt);

document.getElementById("netWorth").textContent=
money(wealth);

document.getElementById("marketIndex").textContent=
Math.round(game.market);

document.getElementById("marketBig").textContent=
Math.round(game.market);

document.getElementById("demand").textContent=
Math.round(game.demand)+"%";

document.getElementById("economy").textContent=
Math.round(game.economy)+"%";

document.getElementById("marketDemand").textContent=
Math.round(game.demand)+"%";

document.getElementById("marketEconomy").textContent=
Math.round(game.economy)+"%";

document.getElementById("riskNumber").textContent=
game.risk+"%";

document.getElementById("globalRisk").textContent=
"RISK "+game.risk+"%";


const required=
100+
(game.level-1)*100;

const percent=
Math.min(
100,
game.xp/required*100
);

document.getElementById("xpFill")
.style.width=
percent+"%";

document.getElementById("xpLabel")
.textContent=
game.xp+
" / "+
required+
" XP";


const ranks=[

"STARTUP",
"SMALL BUSINESS",
"GROWING COMPANY",
"CORPORATION",
"INDUSTRY LEADER",
"GLOBAL COMPANY",
"BUSINESS TYCOON",
"MEGA EMPIRE",
"BUSINESS LEGEND"

];

document.getElementById("rank")
.textContent=
ranks[
Math.min(
game.level-1,
ranks.length-1
)
];


document.getElementById("marketStatus")
.textContent=
game.market>125
?
"📈 MARKET BOOM"
:
game.market<75
?
"📉 MARKET CRASH"
:
"● STABLE MARKET";


document.getElementById("riskText")
.textContent=
game.risk>70
?
"🚨 CRITICAL: Your empire is in serious danger."
:
game.risk>40
?
"⚠ WARNING: Financial pressure is increasing."
:
"Your empire is stable.";


document.getElementById("systemMessage")
.textContent=
game.risk>70
?
"🚨 CORPORATE RISK CRITICAL"
:
"● AUTOMATIC OPERATIONS ACTIVE";


renderNews();

renderBusinesses();

renderLoans();

renderRivals();

drawGraph();

updateClock();

}


/* ==========================================
   NEWS RENDER
========================================== */

function renderNews(){

const box=
document.getElementById("news");

if(!game.news.length){

box.innerHTML=
"No recent events.";

return;

}

box.innerHTML=
game.news
.map(
n=>
`<div class="newsItem">${n}</div>`
)
.join("");

}


/* ==========================================
   BUSINESS RENDER
========================================== */

function renderBusinesses(){

const box=
document.getElementById("businessList");

const preview=
document.getElementById("businessPreview");


if(!game.businesses.length){

box.innerHTML=
"<div class='card'>NO BUSINESSES OWNED.</div>";

preview.innerHTML=
"<p>Acquire your first business.</p>";

return;

}


box.innerHTML=
game.businesses
.map(
businessHTML
)
.join("");


preview.innerHTML=
game.businesses
.map(
b=>`

<div class="businessCard">

<div class="businessHeader">

<div class="businessIcon">
${b.icon}
</div>

<div>

<h2>${b.name}</h2>

<small>
LEVEL ${b.upgrade}
•
${b.active?"OPERATIONAL":"STOPPED"}
</small>

</div>

<div class="businessHeaderRight">

<b>${money(calculateBusinessValue(b))}</b>

<small>BUSINESS VALUE</small>

</div>

</div>


<div class="businessStats">

<div>
<small>BUSINESS CASH</small>
<b>${money(b.cash)}</b>
</div>

<div>
<small>STOCK</small>
<b>${Math.round(b.stock)}%</b>
</div>

<div>
<small>PERFORMANCE</small>
<b>${Math.round(b.performance)}%</b>
</div>

<div>
<small>EMPLOYEES</small>
<b>${b.employees}</b>
</div>

<div>
<small>DEBT</small>
<b>${money(b.loan)}</b>
</div>

</div>


<div class="stockBar">

<div
class="stockFill"
style="width:${Math.max(0,b.stock)}%"
></div>

</div>


<div class="businessActions">

<button onclick="openBusiness(${b.id})">
MANAGE
</button>

<button onclick="refillBusiness(${b.id})">
RESTOCK
</button>

<button onclick="upgradeBusiness(${b.id})">
UPGRADE
</button>

<button class="sell"
onclick="sellBusiness(${b.id})">
SELL
</button>

</div>

</div>

`
)
.join("");

}


/* ==========================================
   FULL BUSINESS CARD
========================================== */

function businessHTML(b){

return `

<div class="businessCard">

<div class="businessHeader">

<div class="businessIcon">
${b.icon}
</div>

<div>

<h2>${b.name}</h2>

<small>
LEVEL ${b.upgrade}
•
${b.active?"OPERATIONAL":"STOPPED"}
</small>

</div>

<div class="businessHeaderRight">

<b>${money(b.cash)}</b>

<small>BUSINESS CASH</small>

</div>

</div>


<div class="businessStats">

<div>
<small>VALUE</small>
<b>${money(calculateBusinessValue(b))}</b>
</div>

<div>
<small>STOCK</small>
<b>${Math.round(b.stock)}%</b>
</div>

<div>
<small>PERFORMANCE</small>
<b>${Math.round(b.performance)}%</b>
</div>

<div>
<small>EMPLOYEES</small>
<b>${b.employees}</b>
</div>

<div>
<small>LOAN</small>
<b>${money(b.loan)}</b>
</div>

</div>


<div class="stockBar">

<div
class="stockFill"
style="width:${Math.max(0,b.stock)}%"
></div>

</div>


<div class="businessActions">

<button onclick="openBusiness(${b.id})">
MANAGE
</button>

<button onclick="refillBusiness(${b.id})">
RESTOCK
</button>

<button onclick="upgradeBusiness(${b.id})">
UPGRADE
</button>

<button class="sell"
onclick="sellBusiness(${b.id})">
SELL
</button>

</div>

</div>

`;

}


/* ==========================================
   BUSINESS DETAIL
========================================== */

function openBusiness(id){

const b=
findBusiness(id);

if(!b)return;

const payout=
calculatePayout(b);

document
.getElementById("businessDetail")
.innerHTML=

`

<div class="sectionTitle">

<small>
${b.icon} BUSINESS CONTROL
</small>

<h1>${b.name}</h1>

</div>


<div class="businessStats">

<div>
<small>BUSINESS CASH</small>
<b>${money(b.cash)}</b>
</div>

<div>
<small>VALUE</small>
<b>${money(calculateBusinessValue(b))}</b>
</div>

<div>
<small>PERFORMANCE</small>
<b>${Math.round(b.performance)}%</b>
</div>

<div>
<small>STOCK</small>
<b>${Math.round(b.stock)}%</b>
</div>

<div>
<small>2% PAYOUT</small>
<b>${money(payout)}</b>
</div>

</div>


<div class="card" style="margin-top:15px">

<h3>BUSINESS INTELLIGENCE</h3>

<p>

Every time the business consumes another
2% of stock, it generates approximately

<strong>${money(payout)}</strong>

in business cash.

</p>

<br>

<p>

Higher performance, employees, upgrades,
market conditions and demand increase
your profit.

</p>

</div>


<div class="businessActions">

<button onclick="refillBusiness(${b.id})">
📦 RESTOCK
</button>

<button onclick="upgradeBusiness(${b.id})">
⬆ UPGRADE
</button>

<button onclick="hireBusinessEmployee(${b.id})">
👨‍💼 HIRE
</button>

<button onclick="businessLoan(${b.id})">
🏦 BORROW $10K
</button>

<button onclick="repayBusinessLoan(${b.id})">
💳 REPAY $5K
</button>

<button class="sell"
onclick="sellBusiness(${b.id})">
💼 SELL
</button>

</div>

`;

document
.getElementById("businessModal")
.classList.remove("hidden");

}


function closeBusiness(){

document
.getElementById("businessModal")
.classList.add("hidden");

}


/* ==========================================
   BUY MENU
========================================== */

function openBuyMenu(){

const box=
document.getElementById("buyList");

box.innerHTML=
Object.entries(BUSINESS_TYPES)
.map(
([type,b])=>

`

<div class="buyOption">

<div class="buyIcon">
${b.icon}
</div>

<div>

<strong>${b.name}</strong>

<small>
Starting Price:
${money(b.price)}
</small>

<small>
Performance:
${b.performance}%
</small>

<small>
Base Profit:
${money(b.income)}
/ 2% stock
</small>

</div>

<button onclick="buyBusiness('${type}')">
BUY
</button>

</div>

`
)
.join("");

document
.getElementById("buyModal")
.classList.remove("hidden");

}


function closeBuyMenu(){

document
.getElementById("buyModal")
.classList.add("hidden");

}


/* ==========================================
   LOANS
========================================== */

function renderLoans(){

const box=
document.getElementById("loanBusinessList");

let total=0;

box.innerHTML=
game.businesses
.map(b=>{

total+=b.loan;

return `

<div class="loanRow">

<div class="loanTop">

<strong>
${b.icon} ${b.name}
</strong>

<b>${money(b.loan)}</b>

</div>

<small>
Loan age: ${b.loanDays} day(s)
</small>

<br>

<button onclick="businessLoan(${b.id})">
BORROW $10K
</button>

<button onclick="repayBusinessLoan(${b.id})">
REPAY $5K
</button>

</div>

`;

})
.join("");


document.getElementById("bankDebt")
.textContent=
money(total);


document.getElementById("bankWarning")
.textContent=
total>50000
?
"⚠ Debt is becoming dangerous."
:
total>0
?
"Loans are active. Manage repayments carefully."
:
"No major debt pressure.";

}


/* ==========================================
   RIVALS
========================================== */

function renderRivals(){

const box=
document.getElementById("rivalList");

const net=
calculateNetWorth();

box.innerHTML=
game.rivals
.map(
r=>

`

<div class="rival">

<div class="rivalIcon">
${r.name.slice(0,2)}
</div>

<div>

<h3>${r.name}</h3>

<p>
Corporate Power:
${r.power}/100
</p>

</div>

<div class="rivalRight">

<b>${money(r.value)}</b>

<span class="${net>r.value?"green":"red"}">

${
net>r.value
?
"YOU ARE AHEAD"
:
"RIVAL IS AHEAD"
}

</span>

</div>

</div>

`
)
.join("");

}


/* ==========================================
   GRAPH
========================================== */

function drawGraph(){

const graph=
document.getElementById("marketGraph");

graph.innerHTML="";

for(
let i=0;
i<45;
i++
){

const dot=
document.createElement("div");

dot.className="graphDot";

dot.style.left=
(i*2.25)+"%";

dot.style.top=
(
50+
Math.sin(i*.55)*25+
Math.random()*10
)+"%";

graph.appendChild(dot);

}

}


/* ==========================================
   NAVIGATION
========================================== */

function page(id,btn){

document
.querySelectorAll(".page")
.forEach(
x=>x.classList.remove("active")
);

document
.getElementById(id)
.classList.add("active");

document
.querySelectorAll("nav button")
.forEach(
x=>x.classList.remove("active")
);

btn.classList.add("active");

render();

}


/* ==========================================
   SETTINGS
========================================== */

function openSettings(){

document
.getElementById("settings")
.classList.remove("hidden");

}


function closeSettings(){

document
.getElementById("settings")
.classList.add("hidden");

}


/* ==========================================
   RESET
========================================== */

function resetGame(){

const first=
confirm(
"⚠ WARNING ⚠\n\n"+
"This will delete your entire corporation."
);

if(!first)return;

const second=
confirm(
"FINAL WARNING ⚠\n\n"+
"ALL businesses, money, upgrades, loans, levels and progress will be deleted.\n\n"+
"RESET ACCOUNT?"
);

if(!second)return;

localStorage.removeItem(
"TYCOON_X_SAVE"
);

location.reload();

}


/* ==========================================
   TOAST
========================================== */

function toast(text){

const t=
document.getElementById("toast");

t.textContent=text;

t.classList.add("show");

setTimeout(
()=>{
t.classList.remove("show");
},
2200
);

}


/* ==========================================
   INITIALIZE
========================================== */

load();
