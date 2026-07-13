// Navigation tree for the sidebar. Pulled out of Sidebar.jsx into its own
// module so that file only exports components (react-refresh/only-export-components).
export const NAV = [
  {
    key: "sorting", title: "Sorting", icon: "sort",
    items: [
      { label: "Bubble Sort", path: "/sorting/bubble-sort" },
      { label: "Selection Sort", path: "/sorting/selection-sort" },
      { label: "Insertion Sort", path: "/sorting/insertion-sort" },
      { label: "Merge Sort", path: "/sorting/merge-sort" },
      { label: "Quick Sort", path: "/sorting/quick-sort" },
      { label: "Heap Sort", path: "/sorting/heap-sort" },
      { label: "Counting Sort", path: "/sorting/counting-sort" },
      { label: "Radix Sort", path: "/sorting/radix-sort" },
      { label: "Shell Sort", path: "/sorting/shell-sort" },
      { label: "Bucket Sort", path: "/sorting/bucket-sort" },
    ]
  },
  {
    key: "searching", title: "Searching", icon: "search",
    items: [
      { label: "Linear Search", path: "/searching/linear-search" },
      { label: "Binary Search", path: "/searching/binary-search" },
      { label: "Jump Search", path: "/searching/jump-search" },
      { label: "Interpolation Search", path: "/searching/interpolation-search" },
      { label: "Exponential Search", path: "/searching/exponential-search" },
    ]
  },
  {
    key: "recursion", title: "Recursion", icon: "rebase_edit",
    items: [
      { label: "Tower of Hanoi", path: "/recursion/tower-of-hanoi" },
      { label: "N-Queens", path: "/recursion/n-queens" },
      { label: "Rat in a Maze", path: "/recursion/rat-in-maze" },
      { label: "Subset Generation", path: "/recursion/subsets" },
    ]
  },
  {
    key: "linked-list", title: "Linked List", icon: "link",
    items: [
      { label: "Reverse List", path: "/linked-list/reverse" },
      { label: "Detect Cycle", path: "/linked-list/detect-cycle" },
      { label: "Merge Sorted", path: "/linked-list/merge-sorted" },
      { label: "Find Middle", path: "/linked-list/find-middle" },
    ]
  },
  {
    key: "stack-queue", title: "Stack & Queue", icon: "view_agenda",
    items: [
      { label: "Stack (Push/Pop)", path: "/stack-queue/stack" },
      { label: "Queue", path: "/stack-queue/queue" },
      { label: "Valid Parentheses", path: "/stack-queue/valid-parentheses" },
      { label: "Next Greater", path: "/stack-queue/next-greater" },
    ]
  },
  {
    key: "tree", title: "Tree", icon: "account_tree",
    items: [
      { label: "In Order", path: "/tree/inorder" },
      { label: "Pre Order", path: "/tree/preorder" },
      { label: "Post Order", path: "/tree/postorder" },
      { label: "Level Order", path: "/tree/level-order" },
      { label: "BST Insert", path: "/tree/bst-insert" },
    ]
  },
  {
    key: "graph", title: "Graph", icon: "hub",
    items: [
      { label: "BFS", path: "/graph/bfs" },
      { label: "DFS", path: "/graph/dfs" },
      { label: "Dijkstra", path: "/graph/dijkstra" },
      { label: "Topological Sort", path: "/graph/topological-sort" },
    ]
  },
  {
    key: "dp", title: "Dynamic Progress", icon: "layers",
    items: [
      { label: "Fibonacci", path: "/dp/fibonacci" },
      { label: "0/1 Knapsack", path: "/dp/knapsack" },
      { label: "LCS", path: "/dp/lcs" },
      { label: "Coin Change", path: "/dp/coin-change" },
    ]
  },
  {
    key: "ml", title: "Machine Learning", icon: "memory",
    items: [
      { label: "Linear Regression", path: "/ml/linear-regression" },
      { label: "K-Means", path: "/ml/k-means" },
      { label: "KNN", path: "/ml/knn" },
      { label: "Decision Tree", path: "/ml/decision-tree" },
    ]
  },
];
