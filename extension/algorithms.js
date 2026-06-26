const ALGORITHMS=[

{

name:"Bubble Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/bubble-sort",

difficulty:"Easy",

complexity:"O(n²)",

priority:70,

strongKeywords:[

"bubble sort",
"adjacent swap",
"swap adjacent",
"repeatedly swap",
"largest element to end"

],

weakKeywords:[

"sort",
"sorting",
"array"

],

negativeKeywords:[

"merge",
"quick",
"heap",
"binary search",
"linked list",
"tree"

],

alternatives:[

"Selection Sort",
"Insertion Sort"

]

},

{

name:"Selection Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/selection-sort",

difficulty:"Easy",

complexity:"O(n²)",

priority:72,

strongKeywords:[

"selection sort",
"minimum element",
"select minimum",
"find minimum"

],

weakKeywords:[

"sort",
"array"

],

negativeKeywords:[

"merge",
"quick",
"heap"

],

alternatives:[

"Insertion Sort"

]

},

{

name:"Insertion Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/insertion-sort",

difficulty:"Easy",

complexity:"O(n²)",

priority:74,

strongKeywords:[

"insertion sort",
"sorted prefix",
"insert into sorted",
"insert element"

],

weakKeywords:[

"sort",
"array"

],

negativeKeywords:[

"merge",
"quick",
"heap"

],

alternatives:[

"Selection Sort"

]

},

{

name:"Merge Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/merge-sort",

difficulty:"Medium",

complexity:"O(n log n)",

priority:78,

strongKeywords:[

"merge sort",
"divide and conquer",
"merge halves",
"split array"

],

weakKeywords:[

"merge",
"sort"

],

negativeKeywords:[

"merge k lists",
"linked list",
"bst"

],

alternatives:[

"Quick Sort"

]

},

{

name:"Quick Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/quick-sort",

difficulty:"Medium",

complexity:"O(n log n)",

priority:78,

strongKeywords:[

"quick sort",
"pivot",
"partition",
"lomuto",
"hoare partition"

],

weakKeywords:[

"partition",
"sort"

],

negativeKeywords:[

"binary search",
"tree"

],

alternatives:[

"Merge Sort"

]

},

{

name:"Heap Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/heap-sort",

difficulty:"Medium",

complexity:"O(n log n)",

priority:80,

strongKeywords:[

"heap sort",
"heapify",
"build heap",
"max heap",
"min heap"

],

weakKeywords:[

"heap",
"priority queue"

],

negativeKeywords:[

"dijkstra",
"shortest path"

],

alternatives:[

"Quick Sort",
"Merge Sort"

]

},

{

name:"Counting Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/counting-sort",

difficulty:"Medium",

complexity:"O(n+k)",

priority:76,

strongKeywords:[

"counting sort",
"frequency array",
"count occurrences",
"count values"

],

weakKeywords:[

"frequency",
"count"

],

negativeKeywords:[

"hash map",
"prefix sum"

],

alternatives:[

"Radix Sort"

]

},

{

name:"Radix Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/radix-sort",

difficulty:"Hard",

complexity:"O(d(n+k))",

priority:82,

strongKeywords:[

"radix sort",
"least significant digit",
"most significant digit",
"digit by digit"

],

weakKeywords:[

"digit",
"radix"

],

negativeKeywords:[

"bit manipulation"

],

alternatives:[

"Counting Sort"

]

},

{

name:"Shell Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/shell-sort",

difficulty:"Medium",

complexity:"O(n log²n)",

priority:72,

strongKeywords:[

"shell sort",
"gap sequence",
"shell gaps"

],

weakKeywords:[

"gap"

],

negativeKeywords:[

"sliding window"

],

alternatives:[

"Insertion Sort"

]

},

{

name:"Bucket Sort",

category:"Sorting",

route:"http://localhost:5173/sorting/bucket-sort",

difficulty:"Medium",

complexity:"O(n+k)",

priority:74,

strongKeywords:[

"bucket sort",
"bucket",
"distribute into buckets"

],

weakKeywords:[

"bucket"

],

negativeKeywords:[

"hash bucket"

],

alternatives:[

"Radix Sort"

]

},

{

name:"Linear Search",

category:"Searching",

route:"http://localhost:5173/searching/linear-search",

difficulty:"Easy",

complexity:"O(n)",

priority:65,

strongKeywords:[

"linear search",
"scan array",
"find element",
"iterate through array"

],

weakKeywords:[

"search",
"find"

],

negativeKeywords:[

"binary search",
"binary search tree",
"bst"

],

alternatives:[

"Binary Search"

]

},

{

name:"Binary Search",

category:"Searching",

route:"http://localhost:5173/searching/binary-search",

difficulty:"Easy",

complexity:"O(log n)",

priority:95,

strongKeywords:[

"binary search",
"sorted array",
"mid element",
"lower bound",
"upper bound"

],

weakKeywords:[

"binary",
"sorted"

],

negativeKeywords:[

"binary search tree",
"bst",
"tree"

],

alternatives:[

"Linear Search"

]

},

{

name:"Jump Search",

category:"Searching",

route:"http://localhost:5173/searching/jump-search",

difficulty:"Medium",

complexity:"O(√n)",

priority:70,

strongKeywords:[

"jump search",
"block search",
"square root decomposition"

],

weakKeywords:[

"jump",
"block"

],

negativeKeywords:[

"dynamic programming",
"graph"

],

alternatives:[

"Binary Search"

]

},

{

name:"Interpolation Search",

category:"Searching",

route:"http://localhost:5173/searching/interpolation-search",

difficulty:"Medium",

complexity:"O(log log n)",

priority:74,

strongKeywords:[

"interpolation search",
"uniform distribution",
"estimated position"

],

weakKeywords:[

"interpolation"

],

negativeKeywords:[

"binary search tree"

],

alternatives:[

"Binary Search"

]

},

{

name:"Exponential Search",

category:"Searching",

route:"http://localhost:5173/searching/exponential-search",

difficulty:"Medium",

complexity:"O(log n)",

priority:74,

strongKeywords:[

"exponential search",
"doubling search",
"search range"

],

weakKeywords:[

"exponential"

],

negativeKeywords:[

"binary search tree"

],

alternatives:[

"Binary Search"

]

},

{

name:"Tower of Hanoi",

category:"Recursion",

route:"http://localhost:5173/recursion/tower-of-hanoi",

difficulty:"Medium",

complexity:"O(2ⁿ)",

priority:75,

strongKeywords:[

"tower of hanoi",
"three rods",
"move disks",
"recursive disks"

],

weakKeywords:[

"disk",
"rod"

],

negativeKeywords:[

"queen",
"maze"

],

alternatives:[

"N Queens"

]

},

{

name:"N Queens",

category:"Recursion",

route:"http://localhost:5173/recursion/n-queens",

difficulty:"Hard",

complexity:"O(n!)",

priority:110,

strongKeywords:[

"n queens",
"n queens ii",
"queen",
"queens",
"chessboard",
"place queens",
"attack queens"

],

weakKeywords:[

"backtracking",
"chess"

],

negativeKeywords:[

"tower of hanoi",
"maze"

],

alternatives:[

"Rat in Maze"

]

},

{

name:"Rat in Maze",

category:"Recursion",

route:"http://localhost:5173/recursion/rat-in-maze",

difficulty:"Medium",

complexity:"O(4^(n²))",

priority:105,

strongKeywords:[

"rat in maze",
"maze",
"maze path",
"path finding",
"backtracking maze"

],

weakKeywords:[

"backtracking",
"path"

],

negativeKeywords:[

"queen",
"chessboard"

],

alternatives:[

"N Queens"

]

},

{

name:"Subset Generation",

category:"Recursion",

route:"http://localhost:5173/recursion/subset-generation",

difficulty:"Medium",

complexity:"O(2ⁿ)",

priority:90,

strongKeywords:[

"subset",
"power set",
"generate subsets",
"all subsets"

],

weakKeywords:[

"backtracking",
"subset"

],

negativeKeywords:[

"combination sum"

],

alternatives:[

"N Queens"

]

},

{

name:"Reverse Linked List",

category:"Linked List",

route:"http://localhost:5173/linked-list/reverse",

difficulty:"Easy",

complexity:"O(n)",

priority:100,

strongKeywords:[

"reverse linked list",
"reverse list",
"reverse nodes",
"reverse a linked list"

],

weakKeywords:[

"linked list",
"head",
"tail"

],

negativeKeywords:[

"tree",
"graph",
"binary tree"

],

alternatives:[

"Find Middle"

]

},

{

name:"Detect Cycle",

category:"Linked List",

route:"http://localhost:5173/linked-list/detect-cycle",

difficulty:"Medium",

complexity:"O(n)",

priority:102,

strongKeywords:[

"linked list cycle",
"detect cycle",
"floyd cycle",
"tortoise and hare",
"cycle in linked list"

],

weakKeywords:[

"cycle",
"slow fast pointer"

],

negativeKeywords:[

"graph cycle",
"tree"

],

alternatives:[

"Reverse Linked List"

]

},

{

name:"Merge Sorted Lists",

category:"Linked List",

route:"http://localhost:5173/linked-list/merge-sorted",

difficulty:"Easy",

complexity:"O(n+m)",

priority:98,

strongKeywords:[

"merge sorted lists",
"merge two sorted lists",
"merge linked lists",
"sorted linked list"

],

weakKeywords:[

"linked list",
"merge"

],

negativeKeywords:[

"merge sort",
"array"

],

alternatives:[

"Reverse Linked List"

]

},

{

name:"Find Middle",

category:"Linked List",

route:"http://localhost:5173/linked-list/find-middle",

difficulty:"Easy",

complexity:"O(n)",

priority:96,

strongKeywords:[

"middle of linked list",
"middle node",
"slow fast pointer",
"find middle"

],

weakKeywords:[

"linked list",
"middle"

],

negativeKeywords:[

"tree",
"graph"

],

alternatives:[

"Detect Cycle"

]

},

{

name:"Stack",

category:"Stack & Queue",

route:"http://localhost:5173/stack-queue/stack",

difficulty:"Easy",

complexity:"O(1)",

priority:75,

strongKeywords:[

"stack",
"push",
"pop",
"lifo"

],

weakKeywords:[

"stack"

],

negativeKeywords:[

"queue"

],

alternatives:[

"Queue"

]

},

{

name:"Queue",

category:"Stack & Queue",

route:"http://localhost:5173/stack-queue/queue",

difficulty:"Easy",

complexity:"O(1)",

priority:75,

strongKeywords:[

"queue",
"enqueue",
"dequeue",
"fifo"

],

weakKeywords:[

"queue"

],

negativeKeywords:[

"stack"

],

alternatives:[

"Stack"

]

},

{

name:"Valid Parentheses",

category:"Stack & Queue",

route:"http://localhost:5173/stack-queue/valid-parentheses",

difficulty:"Easy",

complexity:"O(n)",

priority:108,

strongKeywords:[

"valid parentheses",
"balanced parentheses",
"balanced brackets",
"matching brackets",
"parentheses"

],

weakKeywords:[

"stack",
"brackets"

],

negativeKeywords:[

"tree",
"graph"

],

alternatives:[

"Next Greater Element"

]

},

{

name:"Next Greater Element",

category:"Stack & Queue",

route:"http://localhost:5173/stack-queue/next-greater",

difficulty:"Medium",

complexity:"O(n)",

priority:104,

strongKeywords:[

"next greater element",
"next greater",
"monotonic stack",
"nge"

],

weakKeywords:[

"greater",
"stack"

],

negativeKeywords:[

"priority queue"

],

alternatives:[

"Stack"

]

},

{

name:"Inorder Traversal",

category:"Tree",

route:"http://localhost:5173/tree/inorder",

difficulty:"Easy",

complexity:"O(n)",

priority:80,

strongKeywords:[

"inorder traversal",
"inorder",
"left root right"

],

weakKeywords:[

"binary tree"

],

negativeKeywords:[

"linked list",
"graph",
"binary search",
"bst",
"dfs",
"bfs",
"tree traversal"

],

alternatives:[

"Preorder Traversal",
"Postorder Traversal"

]

},

{

name:"Preorder Traversal",

category:"Tree",

route:"http://localhost:5173/tree/preorder",

difficulty:"Easy",

complexity:"O(n)",

priority:80,

strongKeywords:[

"preorder traversal",
"preorder",
"root left right"

],

weakKeywords:[

"binary tree"

],

negativeKeywords:[

"linked list",
"graph",
"inorder"

],

alternatives:[

"Inorder Traversal"

]

},

{

name:"Postorder Traversal",

category:"Tree",

route:"http://localhost:5173/tree/postorder",

difficulty:"Easy",

complexity:"O(n)",

priority:80,

strongKeywords:[

"postorder traversal",
"postorder",
"left right root"

],

weakKeywords:[

"binary tree"

],

negativeKeywords:[

"linked list",
"graph",
"inorder"

],

alternatives:[

"Preorder Traversal"

]

},

{

name:"Level Order Traversal",

category:"Tree",

route:"http://localhost:5173/tree/level-order",

difficulty:"Medium",

complexity:"O(n)",

priority:88,

strongKeywords:[

"level order traversal",
"level order",
"binary tree level order traversal"

],

weakKeywords:[

"binary tree"

],

negativeKeywords:[

"graph bfs",
"linked list"

],

alternatives:[

"BFS"

]

},

{

name:"BST Insert",

category:"Tree",

route:"http://localhost:5173/tree/bst-insert",

difficulty:"Easy",

complexity:"O(log n)",

priority:120,

strongKeywords:[

"binary search tree",
"bst",
"insert into bst",
"unique binary search trees",
"validate binary search tree",
"recover binary search tree"

],

weakKeywords:[

"binary tree"

],

negativeKeywords:[

"binary search",
"sorted array"

],

alternatives:[

"Inorder Traversal"

]

},

{

name:"BFS",

category:"Graph",

route:"http://localhost:5173/graph/bfs",

difficulty:"Easy",

complexity:"O(V+E)",

priority:95,

strongKeywords:[

"breadth first search",
"graph bfs",
"bfs",
"graph traversal"

],

weakKeywords:[

"graph",
"queue"

],

negativeKeywords:[

"binary tree",
"level order traversal"

],

alternatives:[

"DFS"

]

},

{

name:"DFS",

category:"Graph",

route:"http://localhost:5173/graph/dfs",

difficulty:"Easy",

complexity:"O(V+E)",

priority:95,

strongKeywords:[

"depth first search",
"graph dfs",
"dfs",
"graph traversal"

],

weakKeywords:[

"graph",
"stack"

],

negativeKeywords:[

"binary tree",
"preorder",
"inorder"

],

alternatives:[

"BFS"

]

},

{

name:"Dijkstra",

category:"Graph",

route:"http://localhost:5173/graph/dijkstra",

difficulty:"Medium",

complexity:"O(V log V)",

priority:115,

strongKeywords:[

"dijkstra",
"shortest path",
"weighted graph",
"minimum distance",
"single source shortest path"

],

weakKeywords:[

"priority queue",
"graph"

],

negativeKeywords:[

"binary tree",
"linked list"

],

alternatives:[

"BFS"

]

},

{

name:"Topological Sort",

category:"Graph",

route:"http://localhost:5173/graph/topological-sort",

difficulty:"Medium",

complexity:"O(V+E)",

priority:118,

strongKeywords:[

"topological sort",
"course schedule",
"prerequisite",
"dependency graph",
"dag"

],

weakKeywords:[

"graph"

],

negativeKeywords:[

"binary tree"

],

alternatives:[

"DFS"

]

},

{

name:"Fibonacci",

category:"Dynamic Programming",

route:"http://localhost:5173/dp/fibonacci",

difficulty:"Easy",

complexity:"O(n)",

priority:90,

strongKeywords:[

"fibonacci",
"memoization",
"tabulation",
"dp fibonacci"

],

weakKeywords:[

"dynamic programming",
"dp"

],

negativeKeywords:[

"tree",
"graph"

],

alternatives:[

"0/1 Knapsack"

]

},

{

name:"0/1 Knapsack",

category:"Dynamic Programming",

route:"http://localhost:5173/dp/01-knapsack",

difficulty:"Medium",

complexity:"O(nW)",

priority:110,

strongKeywords:[

"0/1 knapsack",
"knapsack",
"weight capacity",
"maximize value"

],

weakKeywords:[

"dp",
"capacity"

],

negativeKeywords:[

"coin change"

],

alternatives:[

"Coin Change"

]

},

{

name:"LCS",

category:"Dynamic Programming",

route:"http://localhost:5173/dp/lcs",

difficulty:"Medium",

complexity:"O(nm)",

priority:108,

strongKeywords:[

"longest common subsequence",
"lcs",
"common subsequence"

],

weakKeywords:[

"subsequence",
"dp"

],

negativeKeywords:[

"substring"

],

alternatives:[

"Edit Distance"

]

},

{

name:"Coin Change",

category:"Dynamic Programming",

route:"http://localhost:5173/dp/coin-change",

difficulty:"Medium",

complexity:"O(n×amount)",

priority:112,

strongKeywords:[

"coin change",
"minimum coins",
"number of coins",
"make amount"

],

weakKeywords:[

"coins",
"dp"

],

negativeKeywords:[

"knapsack"

],

alternatives:[

"0/1 Knapsack"

]

},

{

name:"Linear Regression",

category:"Machine Learning",

route:"http://localhost:5173/ml/linear-regression",

difficulty:"Easy",

complexity:"O(n)",

priority:100,

strongKeywords:[

"linear regression",
"regression",
"continuous prediction",
"best fit line"

],

weakKeywords:[

"prediction"

],

negativeKeywords:[

"classification",
"clustering"

],

alternatives:[

"Decision Tree"

]

},

{

name:"K Means",

category:"Machine Learning",

route:"http://localhost:5173/ml/k-means",

difficulty:"Medium",

complexity:"O(nkt)",

priority:105,

strongKeywords:[

"k means",
"k-means",
"clustering",
"cluster"

],

weakKeywords:[

"unsupervised"

],

negativeKeywords:[

"classification"

],

alternatives:[

"KNN"

]

},

{

name:"KNN",

category:"Machine Learning",

route:"http://localhost:5173/ml/knn",

difficulty:"Easy",

complexity:"O(n)",

priority:100,

strongKeywords:[

"knn",
"k nearest neighbor",
"k nearest neighbours",
"nearest neighbor"

],

weakKeywords:[

"classification"

],

negativeKeywords:[

"clustering"

],

alternatives:[

"Decision Tree"

]

},

{

name:"Decision Tree",

category:"Machine Learning",

route:"http://localhost:5173/ml/decision-tree",

difficulty:"Medium",

complexity:"O(n log n)",

priority:104,

strongKeywords:[

"decision tree",
"classification tree",
"tree classifier"

],

weakKeywords:[

"classification"

],

negativeKeywords:[

"binary tree"

],

alternatives:[

"KNN"

]

}

];

window.ALGORITHMS=ALGORITHMS;