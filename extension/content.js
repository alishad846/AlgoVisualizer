(() => {

if(window.algoVisionInjected) return;
window.algoVisionInjected=true;

function clean(text){

return (text||"")
.replace(/\u00A0/g," ")
.replace(/\s+/g," ")
.replace(/[\u200B-\u200D\uFEFF]/g,"")
.trim();

}

function first(selectors){

for(const selector of selectors){

const el=document.querySelector(selector);

if(el){

const text=clean(el.innerText||el.textContent);

if(text.length>2){

return text;

}

}

}

return "";

}

function getTitle(){

let title=first([

"h1",

'[data-cy="question-title"]',

".text-title-large",

".mr-2.text-title-large",

".text-title-large a",

'[class*="title"]'

]);

if(title) return title;

const match=document.title.match(/^\d+\.\s*(.*?)\s*-\s*LeetCode$/);

if(match){

return clean(match[1]);

}

return "";

}

function getDifficulty(){

const text=document.body.innerText;

if(/\bEasy\b/i.test(text)) return "Easy";

if(/\bMedium\b/i.test(text)) return "Medium";

if(/\bHard\b/i.test(text)) return "Hard";

return "Unknown";

}

function getDescription(){

const selectors=[

'div[data-track-load="description_content"]',

'article',

'.elfjS',

'.content__u3I1',

'[class*="description"]',

'.xFUwe',

'.content__1Y2H',

'div[data-key="description-content"]'

];

for(const selector of selectors){

const el=document.querySelector(selector);

if(!el) continue;

const text=clean(el.innerText);

if(text.length>150){

return text;

}

}

const paragraphs=[...document.querySelectorAll("p")]

.map(p=>clean(p.innerText))

.filter(t=>t.length>20);

return paragraphs.join("\n");

}

function getExamples(){

const examples=[];

document.querySelectorAll("pre").forEach(pre=>{

const txt=clean(pre.innerText);

if(txt.length>5){

examples.push(txt);

}

});

return [...new Set(examples)];

}

function getTags(){

const ignore=[

"Register",
"Log in",
"Premium",
"Editorial",
"Solutions",
"Submissions",
"Description",
"Companies",
"Discuss",
"Interview",
"Store",
"Explore",
"Playground",
"Avatar",
"Jobs",
"Articles",
"Hint"

];

const tags=[];

const strongTags=[

"Array",
"String",
"Hash Table",
"Binary Search",
"Tree",
"Binary Tree",
"Binary Search Tree",
"Graph",
"DFS",
"BFS",
"Heap",
"Priority Queue",
"Queue",
"Stack",
"Trie",
"Dynamic Programming",
"Backtracking",
"Recursion",
"Greedy",
"Sliding Window",
"Linked List",
"Doubly Linked List",
"Math",
"Bit Manipulation",
"Union Find",
"Segment Tree",
"Fenwick Tree",
"Monotonic Stack",
"Monotonic Queue"

];

document.querySelectorAll("a,span,div").forEach(el=>{

const text=clean(el.innerText);

if(

text.length<3||

text.length>40||

ignore.includes(text)

){

return;

}

for(const tag of strongTags){

if(text===tag){

tags.push(tag);

break;

}

}

});

return [...new Set(tags)];

}

function buildProblem(){

return{

platform:"LeetCode",

url:location.href,

title:getTitle(),

difficulty:getDifficulty(),

description:getDescription(),

examples:getExamples(),

tags:getTags()

};

}

chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{

if(request.action!=="extractProblem") return;

const waitUntilReady=()=>{

const problem=buildProblem();

if(

problem.title&&
problem.description&&
problem.description.length>100

){

sendResponse({

success:true,

data:problem

});

return;

}

setTimeout(waitUntilReady,250);

};

waitUntilReady();

return true;

});

let previousUrl=location.href;

new MutationObserver(()=>{

if(location.href!==previousUrl){

previousUrl=location.href;

setTimeout(()=>{

const problem=buildProblem();

console.clear();

console.log("AlgoVision Loaded");

console.log(problem);

},800);

}

}).observe(document.body,{

childList:true,

subtree:true

});

function initialize(){

const timer=setInterval(()=>{

const problem=buildProblem();

if(

problem.title&&
problem.description&&
problem.description.length>100

){

clearInterval(timer);

console.log("AlgoVision Loaded");

console.log(problem);

}

},500);

}

if(document.readyState==="loading"){

window.addEventListener(

"DOMContentLoaded",

initialize

);

}else{

initialize();

}

})();