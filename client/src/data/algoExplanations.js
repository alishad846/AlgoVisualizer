// Comprehensive algorithm explanations: theory, how-it-works steps, pseudocode, complexity
export const SORTING_EXPLANATIONS = {
  "bubble-sort": {
    title: "Bubble Sort",
    theory: "Bubble Sort is the simplest sorting algorithm. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until no swaps are needed, which means the list is sorted. It's called 'Bubble' because smaller elements 'bubble' to the top of the list.",
    howItWorks: [
      "Start from the first element, compare it with the next element.",
      "If the first element is greater than the next, swap them.",
      "Move to the next pair and repeat the comparison and swap.",
      "After one complete pass, the largest element is at the end.",
      "Repeat the process for the remaining unsorted portion.",
      "Continue until no more swaps are needed."
    ],
    pseudocode: `for i = 0 to n-1:
  for j = 0 to n-i-2:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
    timeBest: "O(n)", timeAvg: "O(n²)", timeWorst: "O(n²)", space: "O(1)", stable: true, inPlace: true
  },
  "selection-sort": {
    title: "Selection Sort",
    theory: "Selection Sort works by dividing the array into a sorted and unsorted region. It repeatedly selects the smallest (or largest) element from the unsorted region and places it at the beginning of the sorted region. Unlike Bubble Sort, it makes only one swap per pass.",
    howItWorks: [
      "Find the minimum element in the unsorted portion of the array.",
      "Swap it with the first unsorted position.",
      "Move the boundary of the sorted region one position right.",
      "Repeat until the entire array is sorted."
    ],
    pseudocode: `for i = 0 to n-1:
  minIdx = i
  for j = i+1 to n-1:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
    timeBest: "O(n²)", timeAvg: "O(n²)", timeWorst: "O(n²)", space: "O(1)", stable: false, inPlace: true
  },
  "insertion-sort": {
    title: "Insertion Sort",
    theory: "Insertion Sort builds the sorted array one item at a time. It picks each element and inserts it into its correct position among the previously sorted elements — similar to how you sort playing cards in your hand.",
    howItWorks: [
      "Start with the second element (first element is already 'sorted').",
      "Compare it with elements before it, shifting larger elements right.",
      "Insert the element at its correct position.",
      "Move to the next element and repeat.",
      "Continue until the entire array is sorted."
    ],
    pseudocode: `for i = 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
    timeBest: "O(n)", timeAvg: "O(n²)", timeWorst: "O(n²)", space: "O(1)", stable: true, inPlace: true
  },
  "merge-sort": {
    title: "Merge Sort",
    theory: "Merge Sort is a divide-and-conquer algorithm. It divides the array into two halves, recursively sorts each half, then merges the two sorted halves back together. It guarantees O(n log n) performance in all cases, making it more predictable than Quick Sort.",
    howItWorks: [
      "Divide the array into two halves.",
      "Recursively sort each half.",
      "Merge the two sorted halves by comparing elements one by one.",
      "The merge step combines two sorted arrays into one sorted array.",
      "Base case: an array with 0 or 1 element is already sorted."
    ],
    pseudocode: `mergeSort(arr, l, r):
  if l < r:
    mid = (l + r) / 2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)`,
    timeBest: "O(n log n)", timeAvg: "O(n log n)", timeWorst: "O(n log n)", space: "O(n)", stable: true, inPlace: false
  },
  "quick-sort": {
    title: "Quick Sort",
    theory: "Quick Sort is a divide-and-conquer algorithm that picks a 'pivot' element and partitions the array around it — all elements smaller go left, all larger go right. It then recursively sorts the sub-arrays. It's one of the fastest sorting algorithms in practice.",
    howItWorks: [
      "Choose a pivot element (here we use the last element).",
      "Partition: rearrange so elements < pivot are left, > pivot are right.",
      "Place the pivot in its correct sorted position.",
      "Recursively apply Quick Sort to the left and right sub-arrays.",
      "Base case: sub-array with 0 or 1 element."
    ],
    pseudocode: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi-1)
    quickSort(arr, pi+1, high)

partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j = low to high-1:
    if arr[j] <= pivot:
      i++; swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i+1`,
    timeBest: "O(n log n)", timeAvg: "O(n log n)", timeWorst: "O(n²)", space: "O(log n)", stable: false, inPlace: true
  },
  "heap-sort": {
    title: "Heap Sort",
    theory: "Heap Sort uses a binary heap data structure. It first builds a max-heap from the array, then repeatedly extracts the maximum element (root of heap) and places it at the end of the array. The heap property ensures efficient extraction.",
    howItWorks: [
      "Build a max-heap from the input array.",
      "The largest element is now at the root (index 0).",
      "Swap the root with the last element, reduce heap size by 1.",
      "Heapify the root to restore the max-heap property.",
      "Repeat until the heap size is 1."
    ],
    pseudocode: `heapSort(arr):
  buildMaxHeap(arr)
  for i = n-1 down to 1:
    swap(arr[0], arr[i])
    heapify(arr, 0, i)

heapify(arr, i, n):
  largest = i
  if left(i) < n and arr[left] > arr[largest]: largest = left
  if right(i) < n and arr[right] > arr[largest]: largest = right
  if largest != i: swap and recurse`,
    timeBest: "O(n log n)", timeAvg: "O(n log n)", timeWorst: "O(n log n)", space: "O(1)", stable: false, inPlace: true
  },
  "counting-sort": {
    title: "Counting Sort",
    theory: "Counting Sort is a non-comparison sorting algorithm. It counts the number of occurrences of each distinct element, then uses arithmetic to determine each element's position. It works best when the range of input values (k) is small relative to the number of elements (n).",
    howItWorks: [
      "Find the maximum value in the array to determine the range.",
      "Create a count array of size (max+1), initialized to 0.",
      "Count each element's occurrences.",
      "Reconstruct the sorted array from the count array."
    ],
    pseudocode: `countingSort(arr):
  max = max(arr)
  count = new Array(max+1, fill 0)
  for each x in arr: count[x]++
  idx = 0
  for v = 0 to max:
    while count[v] > 0:
      arr[idx++] = v
      count[v]--`,
    timeBest: "O(n+k)", timeAvg: "O(n+k)", timeWorst: "O(n+k)", space: "O(k)", stable: true, inPlace: false
  },
  "radix-sort": {
    title: "Radix Sort",
    theory: "Radix Sort sorts numbers digit by digit, starting from the least significant digit (LSD) to the most significant. It uses a stable sort (like Counting Sort) as a subroutine for each digit. It avoids comparisons entirely.",
    howItWorks: [
      "Find the maximum number to know the number of digits.",
      "Starting from the least significant digit (units place):",
      "Sort all numbers based on the current digit using counting sort.",
      "Move to the next digit (tens, hundreds, ...) and repeat.",
      "After processing all digits, the array is sorted."
    ],
    pseudocode: `radixSort(arr):
  max = max(arr)
  exp = 1
  while max / exp > 0:
    countingSortByDigit(arr, exp)
    exp *= 10`,
    timeBest: "O(n·d)", timeAvg: "O(n·d)", timeWorst: "O(n·d)", space: "O(n+k)", stable: true, inPlace: false
  },
  "shell-sort": {
    title: "Shell Sort",
    theory: "Shell Sort is a generalization of Insertion Sort that allows the exchange of elements that are far apart. It starts by sorting elements far apart from each other (large gap), then progressively reduces the gap. When the gap reaches 1, it becomes a regular Insertion Sort on a nearly-sorted array.",
    howItWorks: [
      "Start with a large gap (typically n/2).",
      "Perform insertion sort on elements separated by the gap.",
      "Reduce the gap by half.",
      "Repeat until the gap is 1.",
      "Final pass is a standard insertion sort on a nearly-sorted array."
    ],
    pseudocode: `shellSort(arr):
  gap = n / 2
  while gap > 0:
    for i = gap to n-1:
      temp = arr[i]
      j = i
      while j >= gap and arr[j-gap] > temp:
        arr[j] = arr[j-gap]
        j -= gap
      arr[j] = temp
    gap /= 2`,
    timeBest: "O(n log n)", timeAvg: "O(n log² n)", timeWorst: "O(n²)", space: "O(1)", stable: false, inPlace: true
  },
  "bucket-sort": {
    title: "Bucket Sort",
    theory: "Bucket Sort distributes elements into several 'buckets', sorts each bucket individually (using insertion sort or another algorithm), then concatenates all buckets. It works best when input is uniformly distributed over a range.",
    howItWorks: [
      "Create n empty buckets.",
      "Distribute each element into the appropriate bucket based on its value.",
      "Sort each bucket individually.",
      "Concatenate all sorted buckets to get the final sorted array."
    ],
    pseudocode: `bucketSort(arr):
  n = length(arr)
  buckets = array of n empty lists
  for each x in arr:
    idx = floor(x * n / (max+1))
    buckets[idx].append(x)
  for each bucket: sort(bucket)
  concatenate all buckets`,
    timeBest: "O(n+k)", timeAvg: "O(n+k)", timeWorst: "O(n²)", space: "O(n)", stable: true, inPlace: false
  },
};

export const SEARCHING_EXPLANATIONS = {
  "two-sum": {
    title: "Two Sum",

    theory:
      "Two Sum finds two numbers in an array whose sum equals the target. A hash map stores previously visited values and their indices, allowing the matching complement to be found efficiently.",

    howItWorks: [
      "Start from the first element of the array.",
      "For the current value, calculate complement = target - current value.",
      "Check whether the complement already exists in the hash map.",
      "If it exists, return the stored index and the current index.",
      "If it does not exist, store the current value and its index.",
      "Continue until the matching pair is found."
    ],

    pseudocode: `twoSum(nums, target):
  map = empty hash map

  for i = 0 to nums.length - 1:
    complement = target - nums[i]

    if complement exists in map:
      return [map[complement], i]

    map[nums[i]] = i

  return []`,

    timeBest: "O(1)",
    timeAvg: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)"
  },

  "linear-search": {
    title: "Linear Search",
    theory: "Linear Search is the simplest search algorithm. It sequentially checks each element of the list until a match is found or the whole list has been searched. It works on both sorted and unsorted arrays.",
    howItWorks: [
      "Start from the first element.",
      "Compare the current element with the target value.",
      "If they match, return the index.",
      "If not, move to the next element.",
      "If the end is reached without a match, the target is not in the array."
    ],
    pseudocode: `linearSearch(arr, target):
  for i = 0 to n-1:
    if arr[i] == target:
      return i
  return -1  // not found`,
    timeBest: "O(1)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(1)"
  },
  "binary-search": {
    title: "Binary Search",
    theory: "Binary Search works on sorted arrays by repeatedly dividing the search interval in half. It compares the target with the middle element — if they match, it's found. If the target is smaller, search the left half; if larger, search the right half. This halving makes it extremely efficient.",
    howItWorks: [
      "The array must be sorted first.",
      "Set low = 0, high = n-1.",
      "Find mid = (low + high) / 2.",
      "If arr[mid] == target → found!",
      "If arr[mid] < target → search right half (low = mid + 1).",
      "If arr[mid] > target → search left half (high = mid - 1).",
      "Repeat until found or low > high."
    ],
    pseudocode: `binarySearch(arr, target):
  low = 0, high = n-1
  while low <= high:
    mid = (low + high) / 2
    if arr[mid] == target: return mid
    else if arr[mid] < target: low = mid + 1
    else: high = mid - 1
  return -1`,
    timeBest: "O(1)", timeAvg: "O(log n)", timeWorst: "O(log n)", space: "O(1)"
  },
  "ternary-search": {
  title: "Ternary Search",
  theory:
    "Ternary Search works on a sorted array by dividing the current search range into three parts using two middle points. It compares the target with both middle values and continues only in the section where the target can exist.",
  howItWorks: [
    "Sort the array before searching.",
    "Calculate two middle positions: mid1 and mid2.",
    "Compare the target with arr[mid1] and arr[mid2].",
    "If the target is smaller than arr[mid1], search the left section.",
    "If the target is larger than arr[mid2], search the right section.",
    "Otherwise, search the middle section.",
    "Repeat until the target is found or the range becomes empty.",
  ],
  pseudocode: `ternarySearch(arr, target):
  lo = 0
  hi = length(arr) - 1

  while lo <= hi:
    third = (hi - lo) / 3
    mid1 = lo + third
    mid2 = hi - third

    if arr[mid1] == target:
      return mid1

    if arr[mid2] == target:
      return mid2

    if target < arr[mid1]:
      hi = mid1 - 1
    else if target > arr[mid2]:
      lo = mid2 + 1
    else:
      lo = mid1 + 1
      hi = mid2 - 1

  return -1`,
  timeBest: "O(1)",
  timeAvg: "O(log₃ n)",
  timeWorst: "O(log₃ n)",
  space: "O(1)",
},
  "jump-search": {
    title: "Jump Search",
    theory: "Jump Search works on sorted arrays. Instead of searching one element at a time (linear) or halving (binary), it jumps ahead by a fixed block size (√n), then does a linear search within the block where the target might be. It's a middle ground between linear and binary search.",
    howItWorks: [
      "Calculate step size as √n.",
      "Jump ahead by step until arr[step] >= target or end of array.",
      "Once the block is identified, do a linear search within it.",
      "If found, return the index; otherwise return not found."
    ],
    pseudocode: `jumpSearch(arr, target):
  step = √n
  prev = 0
  while arr[min(step,n)-1] < target:
    prev = step
    step += √n
    if prev >= n: return -1
  for i = prev to min(step,n):
    if arr[i] == target: return i
  return -1`,
    timeBest: "O(1)", timeAvg: "O(√n)", timeWorst: "O(√n)", space: "O(1)"
  },
  "interpolation-search": {
    title: "Interpolation Search",
    theory: "Interpolation Search is an improvement over Binary Search for uniformly distributed sorted data. Instead of always checking the middle, it estimates where the target might be based on the value — like how you'd search a phone book by name, jumping closer to where you expect the entry to be.",
    howItWorks: [
      "Requires a sorted array with uniformly distributed values.",
      "Estimate position: pos = lo + ((target - arr[lo]) × (hi - lo)) / (arr[hi] - arr[lo]).",
      "If arr[pos] == target → found!",
      "If arr[pos] < target → search right portion.",
      "If arr[pos] > target → search left portion.",
      "Repeat until found or bounds cross."
    ],
    pseudocode: `interpolationSearch(arr, target):
  lo = 0, hi = n-1
  while lo <= hi and target >= arr[lo] and target <= arr[hi]:
    pos = lo + ((target-arr[lo])*(hi-lo)) / (arr[hi]-arr[lo])
    if arr[pos] == target: return pos
    if arr[pos] < target: lo = pos + 1
    else: hi = pos - 1
  return -1`,
    timeBest: "O(1)", timeAvg: "O(log log n)", timeWorst: "O(n)", space: "O(1)"
  },
  "exponential-search": {
    title: "Exponential Search",
    theory: "Exponential Search first finds a range where the target might exist by repeatedly doubling the index (1, 2, 4, 8, 16...), then performs Binary Search within that range. It's particularly useful for unbounded or very large sorted arrays.",
    howItWorks: [
      "Start with index 1, double it each time (1, 2, 4, 8, ...).",
      "Stop when arr[i] >= target or i exceeds array length.",
      "The target must be in range [i/2, min(i, n-1)].",
      "Perform Binary Search within this range."
    ],
    pseudocode: `exponentialSearch(arr, target):
  if arr[0] == target: return 0
  i = 1
  while i < n and arr[i] <= target:
    i *= 2
  return binarySearch(arr, i/2, min(i,n-1), target)`,
    timeBest: "O(1)", timeAvg: "O(log n)", timeWorst: "O(log n)", space: "O(1)"
  },
};

export const RECURSION_EXPLANATIONS = {
  "tower-of-hanoi": {
    title: "Tower of Hanoi",
    theory: "The Tower of Hanoi is a classic recursive puzzle. You have three pegs and N disks of decreasing size. The goal is to move all disks from the source peg to the destination peg, moving only one disk at a time, and never placing a larger disk on top of a smaller one.",
    howItWorks: [
      "Move the top N-1 disks from source to auxiliary peg (recursion).",
      "Move the Nth (largest) disk from source to destination.",
      "Move the N-1 disks from auxiliary to destination (recursion).",
      "Base case: if N=1, move the single disk directly."
    ],
    pseudocode: `hanoi(n, from, to, aux):
  if n == 1:
    move disk 1 from 'from' to 'to'
    return
  hanoi(n-1, from, aux, to)
  move disk n from 'from' to 'to'
  hanoi(n-1, aux, to, from)`,
    timeBest: "O(2ⁿ)", timeAvg: "O(2ⁿ)", timeWorst: "O(2ⁿ)", space: "O(n)"
  },
  "n-queens": {
    title: "N-Queens Problem",
    theory: "Place N queens on an N×N chessboard so that no two queens threaten each other — no two queens share the same row, column, or diagonal. It is solved using backtracking: try placing a queen row by row, and backtrack when a conflict is detected.",
    howItWorks: [
      "Start with the first row.",
      "Try placing a queen in each column of the current row.",
      "Check if the placement is safe (no conflicts with previously placed queens).",
      "If safe, recurse to the next row.",
      "If no column works, backtrack to the previous row and try the next column.",
      "A solution is found when all N rows have a queen."
    ],
    pseudocode: `solveNQueens(board, row):
  if row == N:
    return true  // all queens placed
  for col = 0 to N-1:
    if isSafe(board, row, col):
      board[row][col] = 1
      if solveNQueens(board, row+1):
        return true
      board[row][col] = 0  // backtrack
  return false`,
    timeBest: "O(N!)", timeAvg: "O(N!)", timeWorst: "O(N!)", space: "O(N²)"
  },
  "rat-in-maze": {
    title: "Rat in a Maze",
    theory: "A rat starts at the top-left corner of a grid and must reach the bottom-right. Some cells are blocked. The rat can move right or down. This classic backtracking problem explores all valid paths and backtracks when hitting a dead end.",
    howItWorks: [
      "Start at cell (0, 0).",
      "Try moving right or down from the current cell.",
      "If the move leads to a valid cell (not blocked, not visited), recurse.",
      "If we reach the destination (N-1, N-1), a path is found.",
      "If no move works, backtrack by unmarking the current cell."
    ],
    pseudocode: `solveMaze(maze, x, y, path):
  if x == N-1 and y == N-1:
    path[x][y] = 1
    return true
  if isValid(maze, x, y):
    path[x][y] = 1
    if solveMaze(maze, x+1, y, path): return true
    if solveMaze(maze, x, y+1, path): return true
    path[x][y] = 0  // backtrack
  return false`,
    timeBest: "O(2^(N²))", timeAvg: "O(2^(N²))", timeWorst: "O(2^(N²))", space: "O(N²)"
  },
  "subsets": {
    title: "Subset Generation",
    theory: "Generate all possible subsets (power set) of a given set. Each element is either included or excluded from each subset, leading to 2ⁿ total subsets. This is a fundamental recursive pattern used in combinatorics and dynamic programming.",
    howItWorks: [
      "Start with an empty subset and the full set of elements.",
      "For each element, make two recursive calls:",
      "  — Include the element in the current subset.",
      "  — Exclude the element from the current subset.",
      "When all elements are processed, the current subset is one result.",
      "Collect all results to form the power set."
    ],
    pseudocode: `subsets(nums, idx, current, result):
  if idx == len(nums):
    result.add(copy(current))
    return
  // Include nums[idx]
  current.add(nums[idx])
  subsets(nums, idx+1, current, result)
  // Exclude nums[idx]
  current.remove(nums[idx])
  subsets(nums, idx+1, current, result)`,
    timeBest: "O(2ⁿ)", timeAvg: "O(2ⁿ)", timeWorst: "O(2ⁿ)", space: "O(n)"
  },
};

export const STACKQUEUE_EXPLANATIONS = {
  "stack": {
    title: "Stack (LIFO)",
    theory: "A Stack is a linear data structure that follows the Last In, First Out (LIFO) principle. The last element added is the first to be removed. Think of a stack of plates — you add and remove from the top only.",
    howItWorks: [
      "Push: Add an element to the top of the stack.",
      "Pop: Remove and return the top element.",
      "Peek: View the top element without removing it.",
      "The stack grows and shrinks from one end only (the top)."
    ],
    pseudocode: `push(stack, value):
  stack.top++
  stack[stack.top] = value

pop(stack):
  if stack.top == -1: error "underflow"
  value = stack[stack.top]
  stack.top--
  return value`,
    timeBest: "O(1)", timeAvg: "O(1)", timeWorst: "O(1)", space: "O(n)"
  },
  "queue": {
    title: "Queue (FIFO)",
    theory: "A Queue is a linear data structure that follows the First In, First Out (FIFO) principle. The first element added is the first to be removed — like a line of people waiting.",
    howItWorks: [
      "Enqueue: Add an element to the back of the queue.",
      "Dequeue: Remove and return the front element.",
      "Front/Peek: View the front element without removing it.",
      "Elements enter from the rear and leave from the front."
    ],
    pseudocode: `enqueue(queue, value):
  queue.rear++
  queue[queue.rear] = value

dequeue(queue):
  if queue.front > queue.rear: error "underflow"
  value = queue[queue.front]
  queue.front++
  return value`,
    timeBest: "O(1)", timeAvg: "O(1)", timeWorst: "O(1)", space: "O(n)"
  },
  "valid-parentheses": {
    title: "Valid Parentheses",
    theory: "Given a string containing brackets — '(', ')', '{', '}', '[', ']' — determine if the input string is valid. A string is valid if every open bracket is closed by the same type and in the correct order. This is a classic stack application.",
    howItWorks: [
      "Iterate through each character in the string.",
      "If it's an opening bracket, push it onto the stack.",
      "If it's a closing bracket, check if the stack top has the matching opener.",
      "If they match, pop the stack. If not, the string is invalid.",
      "At the end, the stack must be empty for the string to be valid."
    ],
    pseudocode: `isValid(s):
  stack = []
  map = {')':'(', '}':'{', ']':'['}
  for char in s:
    if char in '({[':
      stack.push(char)
    else:
      if stack.empty() or stack.top() != map[char]:
        return false
      stack.pop()
  return stack.empty()`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(n)"
  },
  "next-greater": {
    title: "Next Greater Element",
    theory: "For each element in an array, find the next greater element — the first element to its right that is larger. If no such element exists, the answer is -1. A stack-based approach solves this in O(n) by processing elements from right to left.",
    howItWorks: [
      "Initialize an empty stack and result array.",
      "Iterate the array from right to left.",
      "Pop elements from the stack that are ≤ current element.",
      "If the stack is non-empty, the top is the next greater element.",
      "If the stack is empty, there's no greater element → -1.",
      "Push the current element onto the stack."
    ],
    pseudocode: `nextGreater(arr):
  stack = [], result = [-1] * n
  for i = n-1 down to 0:
    while stack not empty and stack.top() <= arr[i]:
      stack.pop()
    if stack not empty:
      result[i] = stack.top()
    stack.push(arr[i])
  return result`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(n)"
  },
};

export const LINKEDLIST_EXPLANATIONS = {
  "reverse": {
    title: "Reverse Linked List",
    theory: "Reversing a linked list means changing the direction of all pointers so that the last node becomes the head and the head becomes the tail. It's one of the most fundamental linked list operations, often done iteratively using three pointers.",
    howItWorks: [
      "Initialize three pointers: prev = null, current = head, next = null.",
      "Traverse the list: save next = current.next.",
      "Reverse the pointer: current.next = prev.",
      "Move prev and current one step forward.",
      "When current is null, prev is the new head."
    ],
    pseudocode: `reverse(head):
  prev = null
  current = head
  while current != null:
    next = current.next
    current.next = prev
    prev = current
    current = next
  return prev  // new head`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(1)"
  },
  "detect-cycle": {
    title: "Detect Cycle (Floyd's)",
    theory: "Floyd's Cycle Detection algorithm uses two pointers — slow (moves 1 step) and fast (moves 2 steps). If there's a cycle, the fast pointer will eventually meet the slow pointer inside the cycle. If fast reaches null, there's no cycle.",
    howItWorks: [
      "Initialize slow and fast pointers at the head.",
      "Move slow one step and fast two steps at a time.",
      "If slow == fast at any point, a cycle exists.",
      "If fast or fast.next becomes null, no cycle exists."
    ],
    pseudocode: `hasCycle(head):
  slow = head
  fast = head
  while fast != null and fast.next != null:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
      return true
  return false`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(1)"
  },
  "merge-sorted": {
    title: "Merge Two Sorted Lists",
    theory: "Merge two sorted linked lists into one sorted linked list. Use a two-pointer technique: compare the heads of both lists, pick the smaller one, and advance that pointer. This is the merge step used in Merge Sort.",
    howItWorks: [
      "Create a dummy head node for the result list.",
      "Compare the current nodes of both lists.",
      "Append the smaller node to the result and advance that pointer.",
      "Repeat until one list is exhausted.",
      "Append the remaining nodes from the other list."
    ],
    pseudocode: `mergeTwoLists(l1, l2):
  dummy = new Node(0)
  tail = dummy
  while l1 != null and l2 != null:
    if l1.val <= l2.val:
      tail.next = l1; l1 = l1.next
    else:
      tail.next = l2; l2 = l2.next
    tail = tail.next
  tail.next = l1 or l2
  return dummy.next`,
    timeBest: "O(n+m)", timeAvg: "O(n+m)", timeWorst: "O(n+m)", space: "O(1)"
  },
  "find-middle": {
    title: "Find Middle Node",
    theory: "Find the middle node of a linked list using the slow-fast pointer technique. The slow pointer moves one step while the fast pointer moves two steps. When fast reaches the end, slow is at the middle.",
    howItWorks: [
      "Initialize slow and fast pointers at the head.",
      "Move slow one step and fast two steps.",
      "When fast reaches the end (null or last node), slow is at the middle.",
      "For even-length lists, this gives the second middle node."
    ],
    pseudocode: `findMiddle(head):
  slow = head
  fast = head
  while fast != null and fast.next != null:
    slow = slow.next
    fast = fast.next.next
  return slow  // middle node`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(1)"
  },
};

export const TREE_EXPLANATIONS = {
  "inorder": {
    title: "Inorder Traversal",
    theory: "Inorder traversal visits nodes in the order: Left → Root → Right. For a Binary Search Tree, this produces nodes in sorted (ascending) order. It's the most common traversal for BSTs.",
    howItWorks: [
      "Recursively traverse the left subtree.",
      "Visit (process) the current node.",
      "Recursively traverse the right subtree.",
      "Base case: if the node is null, return."
    ],
    pseudocode: `inorder(node):
  if node == null: return
  inorder(node.left)
  visit(node)
  inorder(node.right)`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(h)"
  },
  "preorder": {
    title: "Preorder Traversal",
    theory: "Preorder traversal visits nodes in the order: Root → Left → Right. It's useful for creating a copy of the tree, or generating a prefix expression from an expression tree.",
    howItWorks: [
      "Visit (process) the current node first.",
      "Recursively traverse the left subtree.",
      "Recursively traverse the right subtree.",
      "Base case: if the node is null, return."
    ],
    pseudocode: `preorder(node):
  if node == null: return
  visit(node)
  preorder(node.left)
  preorder(node.right)`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(h)"
  },
  "postorder": {
    title: "Postorder Traversal",
    theory: "Postorder traversal visits nodes in the order: Left → Right → Root. It's used for deleting a tree (children before parent) and evaluating postfix expressions.",
    howItWorks: [
      "Recursively traverse the left subtree.",
      "Recursively traverse the right subtree.",
      "Visit (process) the current node last.",
      "Base case: if the node is null, return."
    ],
    pseudocode: `postorder(node):
  if node == null: return
  postorder(node.left)
  postorder(node.right)
  visit(node)`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(h)"
  },
  "level-order": {
    title: "Level Order Traversal (BFS)",
    theory: "Level Order traversal visits nodes level by level, from left to right. It uses a queue (BFS approach). This is the only traversal that visits nodes by their depth — first all nodes at depth 0, then depth 1, and so on.",
    howItWorks: [
      "Start by enqueuing the root node.",
      "While the queue is not empty:",
      "  — Dequeue a node and visit it.",
      "  — Enqueue its left child (if exists).",
      "  — Enqueue its right child (if exists).",
      "This naturally processes nodes level by level."
    ],
    pseudocode: `levelOrder(root):
  if root == null: return
  queue = [root]
  while queue not empty:
    node = queue.dequeue()
    visit(node)
    if node.left: queue.enqueue(node.left)
    if node.right: queue.enqueue(node.right)`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(n)"
  },
  "bst-insert": {
    title: "BST Insert",
    theory: "Inserting into a Binary Search Tree (BST) maintains the BST property: left child < parent < right child. Starting from the root, compare the value to insert and go left or right until finding a null spot.",
    howItWorks: [
      "Start at the root.",
      "If the value is less than the current node, go left.",
      "If the value is greater, go right.",
      "When a null position is found, insert the new node there.",
      "The BST property is preserved after insertion."
    ],
    pseudocode: `insert(root, val):
  if root == null:
    return new Node(val)
  if val < root.val:
    root.left = insert(root.left, val)
  else:
    root.right = insert(root.right, val)
  return root`,
    timeBest: "O(log n)", timeAvg: "O(log n)", timeWorst: "O(n)", space: "O(h)"
  },
};

export const GRAPH_EXPLANATIONS = {
  "bfs": {
    title: "Breadth-First Search (BFS)",
    theory: "BFS explores a graph level by level using a queue. It visits all neighbors of a node before moving to the next level. BFS finds the shortest path in unweighted graphs and is the basis for many graph algorithms.",
    howItWorks: [
      "Start from the source node, enqueue it and mark as visited.",
      "Dequeue a node and process it.",
      "Enqueue all unvisited neighbors.",
      "Repeat until the queue is empty.",
      "This explores nodes in order of their distance from the source."
    ],
    pseudocode: `BFS(graph, start):
  queue = [start]
  visited = {start}
  while queue not empty:
    node = queue.dequeue()
    process(node)
    for neighbor in graph[node]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`,
    timeBest: "O(V+E)", timeAvg: "O(V+E)", timeWorst: "O(V+E)", space: "O(V)"
  },
  "dfs": {
    title: "Depth-First Search (DFS)",
    theory: "DFS explores a graph by going as deep as possible along each branch before backtracking. It uses a stack (or recursion). DFS is used for topological sorting, cycle detection, finding connected components, and solving maze problems.",
    howItWorks: [
      "Start from the source node, push it onto the stack.",
      "Pop a node and process it.",
      "Push all unvisited neighbors onto the stack.",
      "Repeat until the stack is empty.",
      "This explores depth-first, backtracking when hitting dead ends."
    ],
    pseudocode: `DFS(graph, start):
  stack = [start]
  visited = {start}
  while stack not empty:
    node = stack.pop()
    process(node)
    for neighbor in graph[node]:
      if neighbor not in visited:
        visited.add(neighbor)
        stack.push(neighbor)`,
    timeBest: "O(V+E)", timeAvg: "O(V+E)", timeWorst: "O(V+E)", space: "O(V)"
  },
  "dijkstra": {
    title: "Dijkstra's Algorithm",
    theory: "Dijkstra's algorithm finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights. It uses a priority queue (min-heap) to greedily select the closest unvisited node.",
    howItWorks: [
      "Set distance to source = 0, all others = ∞.",
      "Add source to the priority queue.",
      "Extract the node with the smallest distance.",
      "For each neighbor, calculate new distance via current node.",
      "If the new distance is shorter, update it and add to the queue.",
      "Repeat until the queue is empty."
    ],
    pseudocode: `dijkstra(graph, source):
  dist = {v: ∞ for v in graph}
  dist[source] = 0
  pq = [(0, source)]
  while pq not empty:
    (d, u) = pq.extractMin()
    if d > dist[u]: continue
    for (v, weight) in graph[u]:
      if dist[u] + weight < dist[v]:
        dist[v] = dist[u] + weight
        pq.insert((dist[v], v))
  return dist`,
    timeBest: "O((V+E) log V)", timeAvg: "O((V+E) log V)", timeWorst: "O((V+E) log V)", space: "O(V)"
  },
  "topological-sort": {
    title: "Topological Sort",
    theory: "Topological sort produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every edge u→v, u appears before v. It's used in task scheduling, build systems, and dependency resolution.",
    howItWorks: [
      "Compute in-degree (number of incoming edges) for each node.",
      "Enqueue all nodes with in-degree 0.",
      "Dequeue a node, add it to the result order.",
      "Decrease the in-degree of all its neighbors by 1.",
      "If a neighbor's in-degree becomes 0, enqueue it.",
      "Repeat until the queue is empty."
    ],
    pseudocode: `topologicalSort(graph):
  inDegree = computeInDegrees(graph)
  queue = [v for v if inDegree[v] == 0]
  order = []
  while queue not empty:
    node = queue.dequeue()
    order.append(node)
    for neighbor in graph[node]:
      inDegree[neighbor]--
      if inDegree[neighbor] == 0:
        queue.enqueue(neighbor)
  return order`,
    timeBest: "O(V+E)", timeAvg: "O(V+E)", timeWorst: "O(V+E)", space: "O(V)"
  },
};

export const DP_EXPLANATIONS = {
  "fibonacci": {
    title: "Fibonacci (DP)",
    theory: "The Fibonacci sequence is defined as F(n) = F(n-1) + F(n-2) with base cases F(0)=0, F(1)=1. A naïve recursive solution has exponential time. Dynamic programming stores previously computed values in a table, reducing it to O(n).",
    howItWorks: [
      "Create a DP array of size n+1.",
      "Set base cases: dp[0] = 0, dp[1] = 1.",
      "For i = 2 to n: dp[i] = dp[i-1] + dp[i-2].",
      "Each value is computed once and stored for reuse.",
      "Return dp[n]."
    ],
    pseudocode: `fibonacci(n):
  dp = [0, 1]
  for i = 2 to n:
    dp[i] = dp[i-1] + dp[i-2]
  return dp[n]`,
    timeBest: "O(n)", timeAvg: "O(n)", timeWorst: "O(n)", space: "O(n)"
  },
  "knapsack": {
    title: "0/1 Knapsack",
    theory: "Given items with weights and values, and a knapsack with a weight capacity, maximize the total value without exceeding the capacity. Each item can be taken or left (0/1 choice). This is solved using a 2D DP table.",
    howItWorks: [
      "Create a 2D table dp[i][w] for items 0..i with capacity w.",
      "Base case: dp[0][w] = 0 for all w.",
      "For each item i and capacity w:",
      "  — If item fits: dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w-weight[i]]).",
      "  — If item doesn't fit: dp[i][w] = dp[i-1][w].",
      "Answer is dp[n][W]."
    ],
    pseudocode: `knapsack(weights, values, W):
  dp = 2D array of 0s, size (n+1) x (W+1)
  for i = 1 to n:
    for w = 0 to W:
      if weights[i-1] <= w:
        dp[i][w] = max(dp[i-1][w],
          values[i-1] + dp[i-1][w-weights[i-1]])
      else:
        dp[i][w] = dp[i-1][w]
  return dp[n][W]`,
    timeBest: "O(nW)", timeAvg: "O(nW)", timeWorst: "O(nW)", space: "O(nW)"
  },
  "lcs": {
    title: "Longest Common Subsequence",
    theory: "Given two strings, find the length of their longest common subsequence (LCS). A subsequence is a sequence that appears in the same relative order but not necessarily contiguous. LCS is used in diff tools, DNA analysis, and version control.",
    howItWorks: [
      "Create a 2D table dp[i][j] for first i chars of s1 and first j chars of s2.",
      "If s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1.",
      "Otherwise: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
      "Base case: dp[0][j] = dp[i][0] = 0.",
      "Answer is dp[m][n]."
    ],
    pseudocode: `LCS(s1, s2):
  m, n = len(s1), len(s2)
  dp = 2D array of 0s, size (m+1) x (n+1)
  for i = 1 to m:
    for j = 1 to n:
      if s1[i-1] == s2[j-1]:
        dp[i][j] = dp[i-1][j-1] + 1
      else:
        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  return dp[m][n]`,
    timeBest: "O(mn)", timeAvg: "O(mn)", timeWorst: "O(mn)", space: "O(mn)"
  },
  "coin-change": {
    title: "Coin Change",
    theory: "Given a set of coin denominations and a target amount, find the minimum number of coins needed to make that amount. This is a classic DP problem where we build up solutions for each amount from 0 to the target.",
    howItWorks: [
      "Create a DP array of size amount+1, initialized to ∞.",
      "Base case: dp[0] = 0 (zero coins for amount 0).",
      "For each amount from 1 to target:",
      "  — For each coin denomination:",
      "  — If coin ≤ amount: dp[amount] = min(dp[amount], dp[amount - coin] + 1).",
      "Answer is dp[target] (or -1 if still ∞)."
    ],
    pseudocode: `coinChange(coins, amount):
  dp = [∞] * (amount + 1)
  dp[0] = 0
  for i = 1 to amount:
    for coin in coins:
      if coin <= i:
        dp[i] = min(dp[i], dp[i-coin] + 1)
  return dp[amount] if dp[amount] != ∞ else -1`,
    timeBest: "O(n·k)", timeAvg: "O(n·k)", timeWorst: "O(n·k)", space: "O(n)"
  },
};

export const ML_EXPLANATIONS = {
  "linear-regression": {
    title: "Linear Regression",
    theory: "Linear Regression fits a straight line y = mx + b to data points by minimizing the sum of squared errors (SSE). It uses gradient descent to iteratively adjust the slope (m) and intercept (b) to find the best fit.",
    howItWorks: [
      "Initialize slope m = 0 and intercept b = 0.",
      "For each iteration, compute predictions ŷ = mx + b for all points.",
      "Calculate gradients: ∂loss/∂m and ∂loss/∂b.",
      "Update: m -= learning_rate × ∂loss/∂m, b -= learning_rate × ∂loss/∂b.",
      "Repeat until convergence (loss stabilizes)."
    ],
    pseudocode: `linearRegression(points, lr, iters):
  m = 0, b = 0
  for iter = 1 to iters:
    dm = 0, db = 0
    for (x, y) in points:
      pred = m * x + b
      dm += -2 * x * (y - pred)
      db += -2 * (y - pred)
    m -= lr * dm / n
    b -= lr * db / n
  return m, b`,
    timeBest: "O(n·i)", timeAvg: "O(n·i)", timeWorst: "O(n·i)", space: "O(n)"
  },
  "k-means": {
    title: "K-Means Clustering",
    theory: "K-Means partitions data into K clusters by iteratively assigning points to the nearest centroid and then moving centroids to the mean of their assigned points. It converges when assignments stabilize.",
    howItWorks: [
      "Randomly initialize K centroids.",
      "Assign each data point to the nearest centroid (by Euclidean distance).",
      "Recompute each centroid as the mean of its assigned points.",
      "Repeat assignment and update until convergence.",
      "The algorithm minimizes within-cluster sum of squares."
    ],
    pseudocode: `kMeans(points, K, maxIter):
  centroids = randomInit(K)
  for iter = 1 to maxIter:
    // Assign step
    for p in points:
      p.cluster = argmin_k dist(p, centroids[k])
    // Update step
    for k = 0 to K-1:
      cluster = points where cluster == k
      centroids[k] = mean(cluster)
  return centroids, assignments`,
    timeBest: "O(n·K·i)", timeAvg: "O(n·K·i)", timeWorst: "O(n·K·i)", space: "O(n)"
  },
  "knn": {
    title: "K-Nearest Neighbors",
    theory: "KNN is a simple, non-parametric classification algorithm. To classify a new point, it finds the K closest points in the training data and assigns the majority class. It requires no training phase — all computation happens at prediction time.",
    howItWorks: [
      "Store all training data points with their labels.",
      "Given a new point, compute distance to every training point.",
      "Select the K nearest neighbors.",
      "Assign the majority class among those K neighbors.",
      "The choice of K affects smoothness — small K = noisy, large K = smooth."
    ],
    pseudocode: `KNN(train, testPoint, K):
  distances = []
  for point in train:
    d = distance(testPoint, point)
    distances.append((d, point.label))
  distances.sort()
  neighbors = distances[:K]
  return majorityVote(neighbors)`,
    timeBest: "O(n)", timeAvg: "O(n log n)", timeWorst: "O(n log n)", space: "O(n)"
  },
  "decision-tree": {
    title: "Decision Tree",
    theory: "A Decision Tree classifies data by learning a hierarchy of if-else rules from features. At each internal node, it selects the feature and threshold that best splits the data (maximizes information gain or minimizes Gini impurity). Leaf nodes represent class predictions.",
    howItWorks: [
      "Start with all data at the root.",
      "Find the best feature and threshold to split the data.",
      "Split the data into left (≤ threshold) and right (> threshold).",
      "Recursively build subtrees for each split.",
      "Stop when max depth is reached or data is pure (all same class).",
      "Leaf nodes predict the majority class."
    ],
    pseudocode: `buildTree(data, depth):
  if depth == maxDepth or data is pure:
    return Leaf(majorityClass(data))
  bestFeature, bestThreshold = findBestSplit(data)
  left = data where feature <= threshold
  right = data where feature > threshold
  return Node(bestFeature, bestThreshold,
    left=buildTree(left, depth+1),
    right=buildTree(right, depth+1))`,
    timeBest: "O(n·m·d)", timeAvg: "O(n·m·d)", timeWorst: "O(n·m·d)", space: "O(n)"
  },
};
