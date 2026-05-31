// Returns array of frames: { arr, states, log, swaps, type }
// type: "compare"|"swap"|"info"|"done" â€” used for step log coloring

function makeFrame(arr, states, log, swaps, type = "info") {
  return { arr: [...arr], states: { ...states }, log, swaps, type };
}

// â”€â”€ BUBBLE SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function bubbleSortSteps(input) {
  const arr = [...input];
  const frames = [];
  const sorted = new Set();
  let swaps = 0;

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      const states = {};
      sorted.forEach(s => { states[s] = "sorted"; });
      states[j] = "comparing"; states[j + 1] = "comparing";
      frames.push(makeFrame(arr, states, `Comparing arr[${j}]=${arr[j]} and arr[${j+1}]=${arr[j+1]}`, swaps, "compare"));

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        const st2 = {}; sorted.forEach(s => { st2[s] = "sorted"; });
        st2[j] = "comparing"; st2[j + 1] = "comparing";
        frames.push(makeFrame(arr, st2, `Swapped ${arr[j]} â†” ${arr[j+1]}`, swaps, "swap"));
      }
    }
    sorted.add(arr.length - i - 1);
    frames.push(makeFrame(arr, Object.fromEntries([...sorted].map(s=>[s,"sorted"])), `Position ${arr.length-i-1} is now sorted âœ“`, swaps, "info"));
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Bubble Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ SELECTION SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function selectionSortSteps(input) {
  const arr = [...input];
  const frames = [];
  const sorted = new Set();
  let swaps = 0;

  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    frames.push(makeFrame(arr, { [i]: "pivot" }, `Starting pass ${i+1}: assume min = arr[${i}]=${arr[i]}`, swaps, "info"));
    for (let j = i + 1; j < arr.length; j++) {
      const states = {};
      sorted.forEach(s => { states[s] = "sorted"; });
      states[minIdx] = "pivot"; states[j] = "comparing";
      frames.push(makeFrame(arr, states, `Comparing min ${arr[minIdx]} with arr[${j}]=${arr[j]}`, swaps, "compare"));
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        frames.push(makeFrame(arr, { ...states, [j]: "pivot" }, `New min found: ${arr[j]} at index ${j}`, swaps, "info"));
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      frames.push(makeFrame(arr, {}, `Swapped arr[${i}] â†” arr[${minIdx}] â†’ placed ${arr[i]}`, swaps, "swap"));
    }
    sorted.add(i);
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Selection Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ INSERTION SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function insertionSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i]; let j = i - 1;
    frames.push(makeFrame(arr, { [i]: "pivot" }, `Pick key = arr[${i}] = ${key}, insert into sorted portion`, swaps, "info"));
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      frames.push(makeFrame(arr, { [j]: "comparing", [j+1]: "comparing" }, `Shift arr[${j}]=${arr[j]} right to position ${j+1}`, swaps, "swap"));
      j--; swaps++;
    }
    arr[j + 1] = key;
    frames.push(makeFrame(arr, { [j+1]: "current" }, `Inserted ${key} at position ${j+1}`, swaps, "info"));
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Insertion Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ MERGE SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function mergeSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;

  function merge(l, m, r) {
    const L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    frames.push(makeFrame(arr, {}, `Merging subarrays [${l}..${m}] and [${m+1}..${r}]`, swaps, "info"));
    while (i < L.length && j < R.length) {
      frames.push(makeFrame(arr, { [k]: "comparing" }, `Compare L[${i}]=${L[i]} vs R[${j}]=${R[j]}`, swaps, "compare"));
      if (L[i] <= R[j]) { arr[k++] = L[i++]; }
      else { arr[k++] = R[j++]; swaps++; }
    }
    while (i < L.length) arr[k++] = L[i++];
    while (j < R.length) arr[k++] = R[j++];
    const st = {}; for (let x = l; x <= r; x++) st[x] = "current";
    frames.push(makeFrame(arr, st, `Merged [${l}..${r}] â†’ [${arr.slice(l,r+1).join(",")}]`, swaps, "swap"));
  }

  function sort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    frames.push(makeFrame(arr, {}, `Dividing [${l}..${r}] at mid=${m}`, swaps, "info"));
    sort(l, m); sort(m + 1, r); merge(l, m, r);
  }
  sort(0, arr.length - 1);
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Merge Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ QUICK SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function quickSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;
    frames.push(makeFrame(arr, { [high]: "pivot" }, `Pivot = arr[${high}] = ${pivot}`, swaps, "info"));
    for (let j = low; j < high; j++) {
      frames.push(makeFrame(arr, { [high]: "pivot", [j]: "comparing" }, `Compare arr[${j}]=${arr[j]} with pivot ${pivot}`, swaps, "compare"));
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        frames.push(makeFrame(arr, { [high]: "pivot", [i]: "current", [j]: "current" }, `arr[${j}] â‰¤ pivot â†’ swap arr[${i}] â†” arr[${j}]`, swaps, "swap"));
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    frames.push(makeFrame(arr, { [i+1]: "sorted" }, `Pivot ${pivot} placed at final position ${i+1}`, swaps, "info"));
    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }
  sort(0, arr.length - 1);
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Quick Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ HEAP SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function heapSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;
  const sorted = new Set();

  function heapify(n, i) {
    let largest = i, l = 2*i+1, r = 2*i+2;
    frames.push(makeFrame(arr, { [i]: "pivot" }, `Heapify node ${i} (val=${arr[i]})`, swaps, "info"));
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      frames.push(makeFrame(arr, { [i]: "comparing", [largest]: "comparing" }, `Swap arr[${i}]=${arr[i]} â†” arr[${largest}]=${arr[largest]}`, swaps, "swap"));
      heapify(n, largest);
    }
  }

  frames.push(makeFrame(arr, {}, "Building max-heap...", swaps, "info"));
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr.length, i);
  frames.push(makeFrame(arr, {}, "Max-heap built. Extracting elements...", swaps, "info"));

  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++; sorted.add(i);
    const st = {}; sorted.forEach(s => { st[s] = "sorted"; });
    frames.push(makeFrame(arr, st, `Extract max ${arr[i]}, place at end`, swaps, "swap"));
    heapify(i, 0);
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Heap Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ COUNTING SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function countingSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);

  frames.push(makeFrame(arr, {}, `Max value = ${max}, creating count array of size ${max+1}`, swaps, "info"));
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
    frames.push(makeFrame(arr, { [i]: "comparing" }, `count[${arr[i]}]++ â†’ ${count[arr[i]]}`, swaps, "compare"));
  }

  let idx = 0;
  for (let v = 0; v <= max; v++) {
    while (count[v] > 0) {
      arr[idx] = v; count[v]--;
      frames.push(makeFrame(arr, { [idx]: "current" }, `Place value ${v} at index ${idx}`, swaps, "swap"));
      idx++;
    }
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Counting Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ RADIX SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function radixSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;
  const max = Math.max(...arr);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    frames.push(makeFrame(arr, {}, `Processing digit place: ${exp === 1 ? "ones" : exp === 10 ? "tens" : "hundreds"}`, swaps, "info"));
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      frames.push(makeFrame(arr, { [i]: "comparing" }, `arr[${i}]=${arr[i]}, digit=${digit}, count[${digit}]=${count[digit]}`, swaps, "compare"));
    }

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = output[i];
    }
    swaps++;
    frames.push(makeFrame(arr, {}, `After sorting by ${exp === 1 ? "ones" : exp === 10 ? "tens" : "hundreds"}: [${arr.join(",")}]`, swaps, "swap"));
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Radix Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ SHELL SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function shellSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;

  let gap = Math.floor(arr.length / 2);
  while (gap > 0) {
    frames.push(makeFrame(arr, {}, `Starting pass with gap = ${gap}`, swaps, "info"));
    for (let i = gap; i < arr.length; i++) {
      let temp = arr[i], j = i;
      frames.push(makeFrame(arr, { [i]: "pivot" }, `Key = arr[${i}] = ${temp}, gap = ${gap}`, swaps, "info"));
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        frames.push(makeFrame(arr, { [j]: "comparing", [j-gap]: "comparing" }, `arr[${j-gap}]=${arr[j]} > ${temp}, shift right`, swaps, "swap"));
        j -= gap; swaps++;
      }
      arr[j] = temp;
      frames.push(makeFrame(arr, { [j]: "current" }, `Placed ${temp} at position ${j}`, swaps, "info"));
    }
    gap = Math.floor(gap / 2);
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Shell Sort complete! âœ“", swaps, "done"));
  return frames;
}

// â”€â”€ BUCKET SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function bucketSortSteps(input) {
  const arr = [...input];
  const frames = [];
  let swaps = 0;
  const max = Math.max(...arr);
  const n = arr.length;
  const buckets = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    const bi = Math.floor((arr[i] / (max + 1)) * n);
    buckets[bi].push(arr[i]);
    frames.push(makeFrame(arr, { [i]: "comparing" }, `arr[${i}]=${arr[i]} â†’ bucket[${bi}]`, swaps, "info"));
  }

  let idx = 0;
  for (let b = 0; b < n; b++) {
    buckets[b].sort((a, z) => a - z);
    for (const v of buckets[b]) {
      arr[idx] = v;
      frames.push(makeFrame(arr, { [idx]: "current" }, `From bucket ${b}: place ${v} at index ${idx}`, swaps, "swap"));
      idx++;
    }
  }
  const fin = {}; arr.forEach((_, i) => { fin[i] = "sorted"; });
  frames.push(makeFrame(arr, fin, "Bucket Sort complete! âœ“", swaps, "done"));
  return frames;
}
