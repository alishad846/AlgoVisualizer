let detectedRoute = "";
let extractedProblem = null;
let currentResult = null;

const dashboardURL = "http://localhost:5173/dashboard";

function normalize(text){

return (text||"")

.toLowerCase()

.replace(/_/g," ")

.replace(/-/g," ")

.replace(/[^a-z0-9 ]/g," ")

.replace(/\s+/g," ")

.trim();

}

function contains(text,keyword){

return normalize(text)

.includes(normalize(keyword));

}

function scoreField(field,list,points){

let score=0;

let matched=[];

(list||[]).forEach(keyword=>{

if(contains(field,keyword)){

score+=points;

matched.push(keyword);

}

});

return{

score,

matched

};

}

async function getProblemFromPage(){

const [tab]=await chrome.tabs.query({

active:true,

currentWindow:true

});

if(!tab){

return null;

}

return new Promise(resolve=>{

chrome.tabs.sendMessage(

tab.id,

{

action:"extractProblem"

},

response=>{

if(

chrome.runtime.lastError||

!response||

!response.data

){

resolve(null);

return;

}

resolve(response.data);

}

);

});

}

function detectAlgorithm(problem){

const title=normalize(problem.title);
const description=normalize(problem.description);
const tags=normalize((problem.tags||[]).join(" "));
const examples=normalize((problem.examples||[]).join(" "));

const fullText=

`${title} ${description} ${tags} ${examples}`;

let best=null;
let bestScore=-999999;
let matchedKeywords=[];

ALGORITHMS.forEach(algo=>{

let score=0;
let matched=[];

const strong=algo.strongKeywords||[];
const weak=algo.weakKeywords||[];
const negative=algo.negativeKeywords||[];
const aliases=algo.aliases||[];

if(title===normalize(algo.name)){

score+=7000;
matched.push(algo.name);

}

else if(title.includes(normalize(algo.name))){

score+=5000;
matched.push(algo.name);

}

const strongResult=

scoreField(

fullText,

strong,

900

);

score+=strongResult.score;

matched.push(...strongResult.matched);

const weakResult=

scoreField(

`${title} ${description}`,

weak,

250

);

score+=weakResult.score;

matched.push(...weakResult.matched);

const aliasResult=

scoreField(

title,

aliases,

2200

);

score+=aliasResult.score;

matched.push(...aliasResult.matched);

negative.forEach(keyword=>{

if(contains(fullText,keyword)){

score-=2500;

}

});

score+=(algo.priority||0);


if(

algo.category==="Tree"&&(

contains(fullText,"binary tree")||

contains(fullText,"binary search tree")||

contains(fullText,"bst")||

contains(fullText,"tree node")

)

){

score+=3000;

}

if(

algo.category==="Linked List"&&(

contains(fullText,"linked list")||

contains(fullText,"head")||

contains(fullText,"tail")||

contains(fullText,"list node")

)

){

score+=3200;

}

if(

algo.category==="Graph"&&(

contains(fullText,"graph")||

contains(fullText,"vertex")||

contains(fullText,"edge")||

contains(fullText,"adjacency")

)

){

score+=2800;

}

if(

algo.category==="Sorting"&&

contains(fullText,"sort")

){

score+=1800;

}

if(

algo.category==="Searching"&&(

contains(fullText,"binary search")||

contains(fullText,"sorted array")||

contains(fullText,"search")

)

){

score+=2200;

}

if(

algo.category==="Dynamic Programming"&&(

contains(fullText,"dynamic programming")||

contains(fullText,"memoization")||

contains(fullText,"tabulation")||

contains(fullText,"dp")

)

){

score+=2500;

}

if(

algo.category==="Recursion"&&(

contains(fullText,"recursive")||

contains(fullText,"backtracking")

)

){

score+=2200;

}

if(

algo.category==="Machine Learning"&&(

contains(fullText,"classification")||

contains(fullText,"regression")||

contains(fullText,"clustering")

)

){

score+=2200;

}

/* ---------- Tie Breakers ---------- */

if(

contains(fullText,"binary search tree")||

contains(fullText,"bst")

){

if(algo.category==="Tree"){

score+=4500;

}

if(algo.category==="Searching"){

score-=3500;

}

}

if(

contains(fullText,"linked list")

){

if(algo.category==="Linked List"){

score+=4000;

}

if(algo.category==="Tree"){

score-=3000;

}

}

if(

contains(fullText,"graph")

){

if(algo.category==="Graph"){

score+=3500;

}

}

if(

contains(fullText,"inorder")||

contains(fullText,"preorder")||

contains(fullText,"postorder")||

contains(fullText,"level order")

){

if(algo.category==="Tree"){

score+=4500;

}

}

if(score>bestScore){

bestScore=score;

best=algo;

matchedKeywords=[...new Set(matched)];

}

});

if(!best){

return{

algorithm:"Unknown",

category:"General",

difficulty:

problem.difficulty||

"Unknown",

complexity:"-",

confidence:"0%",

reason:

"No suitable algorithm detected.",

matchedKeywords:[],

alternatives:"None",

route:dashboardURL

};

}

return{

algorithm:best.name,

category:best.category,

difficulty:

problem.difficulty||

best.difficulty||

"Unknown",

complexity:

best.complexity||

"-",

confidence:

Math.min(

99,

Math.max(

65,

Math.floor(bestScore/90)

)

)+"%",

reason:

"Detected using priority-based classifier.",

matchedKeywords,

alternatives:

(best.alternatives||[]).join(", "),

route:best.route

};

}

function displayResult(result){

currentResult=result;

detectedRoute=result.route;

document.getElementById("result").innerHTML=`

<div class="result-card">

<h2>${result.algorithm}</h2>

<p><strong>Category:</strong> ${result.category}</p>

<p><strong>Difficulty:</strong> ${result.difficulty}</p>

<p><strong>Confidence:</strong> ${result.confidence}</p>

<p><strong>Complexity:</strong> ${result.complexity}</p>

<p><strong>Reason:</strong> ${result.reason}</p>

<p>

<strong>Matched:</strong>

${

result.matchedKeywords.length

?

result.matchedKeywords.join(", ")

:

"None"

}

</p>

<p>

<strong>Alternatives:</strong>

${result.alternatives}

</p>

<div class="ready-badge">

✓ Visualizer Ready

</div>

</div>

`;

}

async function analyzeCurrentProblem(){

extractedProblem=

await getProblemFromPage();

if(!extractedProblem){

alert(

"Unable to extract the problem."

);

return;

}

const result=

detectAlgorithm(

extractedProblem

);

displayResult(result);

}

async function analyzeManualInput(){

const text=

document

.getElementById("manualInput")

.value

.trim();

if(!text){

alert(

"Please enter a problem."

);

return;

}

const result=

detectAlgorithm({

title:"Manual Input",

description:text,

difficulty:"Unknown",

tags:[],

examples:[]

});

displayResult(result);

}

function openVisualizer(){

if(!detectedRoute){

alert(

"Analyze a problem first."

);

return;

}

chrome.tabs.create({

url:detectedRoute

});

}

document

.getElementById("analyzeBtn")

.addEventListener(

"click",

analyzeCurrentProblem

);

document

.getElementById("manualBtn")

.addEventListener(

"click",

analyzeManualInput

);

document

.getElementById("openVisualizer")

.addEventListener(

"click",

openVisualizer

);

const dashboardButton=

document.createElement("button");

dashboardButton.innerHTML=

"🏠 Open Dashboard";

dashboardButton.className=

"dashboard-btn";

dashboardButton.id="dashboardBtn";

dashboardButton.addEventListener(

"click",

()=>{

chrome.tabs.create({

url:dashboardURL

});

}

);

document.body.appendChild(

dashboardButton

);

function showReadyState(){

document.getElementById("result").innerHTML=`

<div class="result-card">

<h2>🤖 AlgoVision AI</h2>

<p>

Open any LeetCode problem and click

<strong>Analyze Current Problem</strong>

</p>

</div>

`;

}

showReadyState();

window.addEventListener(

"load",

()=>{

console.log(

"AlgoVision AI Loaded"

);

});

document.addEventListener(

"visibilitychange",

()=>{

if(

document.visibilityState==="visible"

){

currentResult=null;

}

});

setInterval(async()=>{

try{

const [tab]=await chrome.tabs.query({

active:true,

currentWindow:true

});

if(

!tab||

!tab.url||

!tab.url.includes("leetcode.com")

){

return;

}

if(currentResult){

return;

}

const problem=

await getProblemFromPage();

if(problem){

const result=

detectAlgorithm(problem);

displayResult(result);

}

}

catch(err){

console.error(

"AlgoVision:",

err

);

}

},3000);

console.log(

"AlgoVision AI Ready"

);