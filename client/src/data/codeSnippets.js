// Multi-Language Code Snippets for AlgoVisualizer

export const CODE_SNIPPETS = {
  "bubble-sort": {
    C: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    CPlusPlus: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    Java: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    Python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
    JavaScript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`
  },
  "selection-sort": {
    C: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) min_idx = j;
        }
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}`,
    CPlusPlus: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) min_idx = j;
        }
        swap(arr[min_idx], arr[i]);
    }
}`,
    Java: `public void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
    Python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    JavaScript: `function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`
  },
  "insertion-sort": {
    C: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
    CPlusPlus: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    Java: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    Python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
    JavaScript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`
  },
  "merge-sort": {
    C: `void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}
void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
    CPlusPlus: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}`,
    Java: `public void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
    Python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1`,
    JavaScript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}`
  },
  "quick-sort": {
    C: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    }
    int t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t;
    return (i + 1);
}`,
    CPlusPlus: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) swap(arr[++i], arr[j]);
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}`,
    Java: `int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
    }
    int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
    return i + 1;
}`,
    Python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    JavaScript: `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [], right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}`
  },
  "linear-search": {
    C: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    CPlusPlus: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    Java: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    Python: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1`,
    JavaScript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`
  },
  "binary-search": {
    C: `int binarySearch(int arr[], int l, int r, int target) {
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == target) return m;
        if (arr[m] < target) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`,
    CPlusPlus: `int binarySearch(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == target) return m;
        if (arr[m] < target) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`,
    Java: `public int binarySearch(int[] arr, int target) {
    int l = 0, r = arr.length - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == target) return m;
        if (arr[m] < target) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`,
    Python: `def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m # found it
        if nums[m] < target:
            l = m + 1 # target is in the right half
        else:
            r = m - 1 # target is in the left half
    return -1 # not found`,
    JavaScript: `function binarySearch(arr, target) {
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        if (arr[m] === target) return m;
        if (arr[m] < target) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`
  },
  "stack": {
    C: `#define MAX 1000
class Stack {
    int top;
public:
    int a[MAX];
    Stack() { top = -1; }
    bool push(int x) {
        if (top >= (MAX - 1)) return false;
        a[++top] = x;
        return true;
    }
    int pop() {
        if (top < 0) return 0;
        return a[top--];
    }
};`,
    CPlusPlus: `#include <stack>
using namespace std;

void stackDemo() {
    stack<int> s;
    s.push(10);
    s.push(85);
    int topVal = s.top(); // 85
    s.pop();
}`,
    Java: `import java.util.Stack;

public class StackDemo {
    public static void main(String[] args) {
        Stack<Integer> s = new Stack<>();
        s.push(10);
        s.push(85);
        int val = s.pop();
    }
}`,
    Python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.append(item)
    def pop(self):
        return self.items.pop() if self.items else None
    def peek(self):
        return self.items[-1] if self.items else None`,
    JavaScript: `class Stack {
    constructor() { this.items = []; }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop(); }
    peek() { return this.items[this.items.length - 1]; }
}`
  },
  "queue": {
    C: `#define MAX 1000
struct Queue {
    int front, rear;
    int items[MAX];
};
void enqueue(struct Queue* q, int value) {
    q->items[q->rear++] = value;
}
int dequeue(struct Queue* q) {
    return q->items[q->front++];
}`,
    CPlusPlus: `#include <queue>
using namespace std;

void queueDemo() {
    queue<int> q;
    q.push(10);
    q.push(20);
    int frontVal = q.front();
    q.pop();
}`,
    Java: `import java.util.LinkedList;
import java.util.Queue;

public class QueueDemo {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        q.add(10);
        q.add(20);
        int frontVal = q.poll();
    }
}`,
    Python: `from collections import deque

class Queue:
    def __init__(self):
        self.q = deque()
    def enqueue(self, val):
        self.q.append(val)
    def dequeue(self):
        return self.q.popleft() if self.q else None`,
    JavaScript: `class Queue {
    constructor() { this.items = []; }
    enqueue(item) { this.items.push(item); }
    dequeue() { return this.items.shift(); }
}`
  },
  "valid-parentheses": {
    C: `bool isValid(char * s){
    int top = -1;
    char stack[10000];
    for(int i=0; s[i]!='\0'; i++){
        if(s[i]=='(' || s[i]=='{' || s[i]=='[') stack[++top] = s[i];
        else {
            if(top==-1) return false;
            if((s[i]==')' && stack[top]!='(') || (s[i]=='}' && stack[top]!='{') || (s[i]==']' && stack[top]!='[')) return false;
            top--;
        }
    }
    return top == -1;
}`,
    CPlusPlus: `bool isValid(string s) {
    stack<char> st;
    for(char c : s) {
        if(c=='(' || c=='{' || c=='[') st.push(c);
        else {
            if(st.empty()) return false;
            if((c==')' && st.top()!='(') || (c=='}' && st.top()!='{') || (c==']' && st.top()!='[')) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
    Java: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<Character>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}`,
    Python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top: return False
        else:
            stack.append(char)
    return not stack`,
    JavaScript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (!map[char]) stack.push(char);
        else if (stack.pop() !== map[char]) return false;
    }
    return stack.length === 0;
}`
  },
  "singly-linked-list": {
    C: `struct Node {
    int data;
    struct Node* next;
};
void insert(struct Node** head, int new_data) {
    struct Node* new_node = (struct Node*)malloc(sizeof(struct Node));
    new_node->data = new_data;
    new_node->next = (*head);
    (*head) = new_node;
}`,
    CPlusPlus: `struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};`,
    Java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}`,
    Python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next`,
    JavaScript: `class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}`
  },
  "bfs": {
    C: `void BFS(int adj[][100], int V, int s) {
    bool visited[100] = {false};
    int queue[100], front = 0, rear = 0;
    visited[s] = true; queue[rear++] = s;
    while(front < rear) {
        int u = queue[front++];
        for(int v=0; v<V; v++) {
            if(adj[u][v] && !visited[v]) {
                visited[v] = true; queue[rear++] = v;
            }
        }
    }
}`,
    CPlusPlus: `void BFS(int s, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[s] = true; q.push(s);
    while(!q.empty()) {
        int u = q.front(); q.pop();
        for(int v : adj[u]) {
            if(!visited[v]) { visited[v] = true; q.push(v); }
        }
    }
}`,
    Java: `public void BFS(int s, List<List<Integer>> adj) {
    boolean visited[] = new boolean[adj.size()];
    Queue<Integer> q = new LinkedList<>();
    visited[s] = true; q.add(s);
    while (q.size() != 0) {
        s = q.poll();
        for (int n : adj.get(s)) {
            if (!visited[n]) { visited[n] = true; q.add(n); }
        }
    }
}`,
    Python: `def bfs(graph, start):
    visited = set([start])
    queue = [start]
    while queue:
        vertex = queue.pop(0)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    JavaScript: `function bfs(graph, start) {
    const visited = new Set([start]);
    const queue = [start];
    while (queue.length > 0) {
        const node = queue.shift();
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}`
  },
  "dfs": {
    C: `void DFSUtil(int u, int adj[][100], int V, bool visited[]) {
    visited[u] = true;
    for(int v=0; v<V; v++)
        if(adj[u][v] && !visited[v]) DFSUtil(v, adj, V, visited);
}`,
    CPlusPlus: `void DFSUtil(int u, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    for(int v : adj[u])
        if(!visited[v]) DFSUtil(v, adj, visited);
}`,
    Java: `void DFSUtil(int v, boolean visited[], List<List<Integer>> adj) {
    visited[v] = true;
    for (int n : adj.get(v))
        if (!visited[n]) DFSUtil(n, visited, adj);
}`,
    Python: `def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited`,
    JavaScript: `function dfs(graph, node, visited = new Set()) {
    visited.add(node);
    for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
    return visited;
}`
  },
  "tower-of-hanoi": {
    C: `void hanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 0) return;
    hanoi(n - 1, from_rod, aux_rod, to_rod);
    printf("Move disk %d from %c to %c\\n", n, from_rod, to_rod);
    hanoi(n - 1, aux_rod, to_rod, from_rod);
}`,
    CPlusPlus: `void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);
    cout << "Move disk " << n << " from " << from << " to " << to << endl;
    hanoi(n - 1, aux, to, from);
}`,
    Java: `public void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, aux, to, from);
}`,
    Python: `def hanoi(n, source, target, auxiliary):
    if n > 0:
        hanoi(n - 1, source, auxiliary, target)
        print(f"Move disk {n} from {source} to {target}")
        hanoi(n - 1, auxiliary, target, source)`,
    JavaScript: `function hanoi(n, from, to, aux) {
    if (n === 0) return;
    hanoi(n - 1, from, aux, to);
    console.log(\`Move disk \${n} from \${from} to \${to}\`);
    hanoi(n - 1, aux, to, from);
}`
  },
  "fibonacci": {
    C: `int fib(int n) {
    int dp[n+2];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
    CPlusPlus: `int fib(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int next = prev + curr;
        prev = curr; curr = next;
    }
    return curr;
}`,
    Java: `public int fib(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
    Python: `def fibonacci(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    JavaScript: `function fibonacci(n) {
    if (n <= 1) return n;
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`
  },
  "k-means": {
    C: `// K-Means clustering iteration logic in C
void updateCentroids(Point pts[], int n, Centroid c[], int k) {
    int count[k] = {0};
    for(int i=0; i<n; i++) {
        int cluster = pts[i].cluster;
        c[cluster].x += pts[i].x; c[cluster].y += pts[i].y;
        count[cluster]++;
    }
    for(int j=0; j<k; j++) {
        if(count[j] > 0) { c[j].x /= count[j]; c[j].y /= count[j]; }
    }
}`,
    CPlusPlus: `void kMeansIteration(vector<Point>& points, vector<Point>& centroids) {
    for (auto& p : points) {
        int bestCluster = 0;
        double minDist = 1e9;
        for (int i = 0; i < centroids.size(); i++) {
            double d = dist(p, centroids[i]);
            if (d < minDist) { minDist = d; bestCluster = i; }
        }
        p.cluster = bestCluster;
    }
}`,
    Java: `public void assignClusters(List<Point> points, List<Point> centroids) {
    for (Point p : points) {
        double minD = Double.MAX_VALUE;
        int cluster = 0;
        for (int i = 0; i < centroids.size(); i++) {
            double d = distance(p, centroids.get(i));
            if (d < minD) { minD = d; cluster = i; }
        }
        p.cluster = cluster;
    }
}`,
    Python: `def k_means_step(points, centroids):
    for p in points:
        distances = [((p['x'] - c['x'])**2 + (p['y'] - c['y'])**2)**0.5 for c in centroids]
        p['cluster'] = distances.index(min(distances))`,
    JavaScript: `function kMeansStep(points, centroids) {
    points.forEach(p => {
        let minDist = Infinity, bestCluster = 0;
        centroids.forEach((c, i) => {
            const d = Math.hypot(p.x - c.x, p.y - c.y);
            if (d < minDist) { minDist = d; bestCluster = i; }
        });
        p.cluster = bestCluster;
    });
}`
  }
};

export function getSnippet(algoKey) {
  if (CODE_SNIPPETS[algoKey]) {
    return CODE_SNIPPETS[algoKey];
  }
  const nameParts = (algoKey || "algorithm").split("-");
  const camelName = nameParts[0] + nameParts.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const snake_name = nameParts.join("_");

  return {
    C: `// Implementation of ${algoKey} in C
void ${camelName}(int data[], int size) {
    for (int i = 0; i < size; i++) {
        // Process step i
    }
}`,
    CPlusPlus: `// Implementation of ${algoKey} in C++
#include <vector>
using namespace std;

void ${camelName}(vector<int>& data) {
    for (size_t i = 0; i < data.size(); i++) {
        // Process step i
    }
}`,
    Java: `// Implementation of ${algoKey} in Java
public class Solution {
    public void ${camelName}(int[] data) {
        for (int i = 0; i < data.length; i++) {
            // Process step i
        }
    }
}`,
    Python: `def ${snake_name}(data):
    for i in range(len(data)):
        # Process step i
        pass
    return data`,
    JavaScript: `function ${camelName}(data) {
    for (let i = 0; i < data.length; i++) {
        // Process step i
    }
    return data;
}`
  };
}
