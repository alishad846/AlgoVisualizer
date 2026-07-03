(() => {

if(window.algoVisionInjected) return;
window.algoVisionInjected=true;

function clean(text){

return (text||"")
.replace(/\u00A0/g," ")
.replace(/[\u200B-\u200D\uFEFF]/g,"")
.replace(/\r/g,"")
.replace(/\t/g," ")
.replace(/\s+/g," ")
.trim();

}

function first(selectors){

for(const selector of selectors){

const elements=document.querySelectorAll(selector);

for(const el of elements){

const text=clean(el.innerText||el.textContent);

if(text.length>2){

return text;

}

}

}

return "";

}

function getTitle(){

const selectors=[

'h1 a',
'h1',
'[data-cy="question-title"]',
'.text-title-large',
'.mr-2.text-title-large',
'a[href*="/problems/"]',
'[class*="title"]',
'[class*="Title"]'

];

let title=first(selectors);

if(title){

title=title.replace(/^\d+\.\s*/,"");

return clean(title);

}

const match=document.title.match(/^\d+\.\s*(.*?)\s*-\s*LeetCode$/);

if(match){

return clean(match[1]);

}

return "";

}

function getDifficulty(){

const selectors=[

'[diff]',
'[class*="difficulty"]',
'[class*="text-difficulty"]',
'span[class*="text-olive"]',
'span[class*="text-yellow"]',
'span[class*="text-red"]',
'div[class*="text-olive"]',
'div[class*="text-yellow"]',
'div[class*="text-red"]'

];

for(const selector of selectors){

const elements=document.querySelectorAll(selector);

for(const el of elements){

const text=clean(el.innerText);

if(text==="Easy"||text==="Medium"||text==="Hard"){

return text;

}

}

}

const text=document.body.innerText;

const match=text.match(/\b(Easy|Medium|Hard)\b/);

return match?match[1]:"Unknown";

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
'div[data-key="description-content"]',
'div[class*="content"]'

];

for(const selector of selectors){

const elements=document.querySelectorAll(selector);

for(const el of elements){

const text=clean(el.innerText);

if(text.length>150){

return text;

}

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

const text=clean(pre.innerText);

if(text.length>5){

examples.push(text);

}

});

document.querySelectorAll("code").forEach(code=>{

const text=clean(code.innerText);

if(

text.length>5&&
!examples.includes(text)

){

examples.push(text);

}

});

return [...new Set(examples)];

}

function getTags(){

const tags=[];

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
"Hint",
"Easy",
"Medium",
"Hard"

];

const strongTags=[

"Array",
"String",
"Hash Table",
"Math",
"Sorting",
"Greedy",
"Binary Search",
"Two Pointers",
"Sliding Window",
"Stack",
"Queue",
"Heap",
"Priority Queue",
"Linked List",
"Doubly Linked List",
"Tree",
"Binary Tree",
"Binary Search Tree",
"Trie",
"Graph",
"DFS",
"BFS",
"Recursion",
"Backtracking",
"Dynamic Programming",
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

if(strongTags.includes(text)){

tags.push(text);

}

});

return [...new Set(tags)];

}

function buildProblem(){

const problem={

platform:"LeetCode",

url:location.href,

title:getTitle(),

difficulty:getDifficulty(),

description:getDescription(),

examples:getExamples(),

tags:getTags()

};

return problem;

}

chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{

if(request.action!=="extractProblem") return;

const waitUntilReady=(attempt=0)=>{

const problem=buildProblem();

const ready=

problem.title.length>0&&
problem.description.length>100;

if(ready){

sendResponse({

success:true,

data:problem

});

return;

}

if(attempt>=20){

sendResponse({

success:false,

data:null

});

return;

}

setTimeout(()=>{

waitUntilReady(attempt+1);

},250);

};

waitUntilReady();

return true;

});

let previousUrl=location.href;

new MutationObserver(()=>{

if(location.href===previousUrl){

return;

}

previousUrl=location.href;

setTimeout(()=>{

const problem=buildProblem();

if(

problem.title&&
problem.description.length>100

){

console.clear();

console.log("AlgoVision Loaded");

console.log(problem);

}

},800);

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

console.clear();

console.log("AlgoVision Loaded");

console.log(problem);

}

},500);

setTimeout(()=>{

clearInterval(timer);

},10000);

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