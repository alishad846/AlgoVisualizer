function makeFrame(arr, states, pointer, log, found, type = "info") {
  return { arr: [...arr], states: { ...states }, pointer, log, found: found ?? -1, type };
}

export function linearSearchSteps(arr, target) {
  const frames = [];
  for (let i = 0; i < arr.length; i++) {
    const isFound = arr[i] === target;
    const st = { [i]: isFound ? "found" : "comparing" };
    frames.push(makeFrame(arr, st, i, `Check arr[${i}] = ${arr[i]} ${isFound ? "→ FOUND!" : "≠ " + target}`, isFound ? i : -1, isFound ? "done" : "compare"));
    if (isFound) break;
  }
  if (!frames.some(f => f.found >= 0)) {
    frames.push(makeFrame(arr, {}, -1, `Target ${target} not found in array`, -1, "info"));
  }
  return frames;
}

export function binarySearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];
  let lo = 0, hi = sorted.length - 1;
  frames.push(makeFrame(sorted, {}, -1, `Array sorted: [${sorted.join(",")}]. Searching for ${target}`, -1, "info"));
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const st = {};
    for (let i = lo; i <= hi; i++) st[i] = "current";
    const isFound = sorted[mid] === target;
    st[mid] = isFound ? "found" : "comparing";
    frames.push(makeFrame(sorted, st, mid,
      `lo=${lo}, hi=${hi}, mid=${mid} → arr[${mid}]=${sorted[mid]} ${isFound ? "= FOUND!" : sorted[mid] < target ? "< target, search right" : "> target, search left"}`,
      isFound ? mid : -1, isFound ? "done" : "compare"));
    if (isFound) break;
    else if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return frames;
}

export function ternarySearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];

  let lo = 0;
  let hi = sorted.length - 1;

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Array sorted: [${sorted.join(",")}]. Searching for ${target}`,
      -1,
      "info"
    )
  );

  while (lo <= hi) {
    const third = Math.floor((hi - lo) / 3);
    const mid1 = lo + third;
    const mid2 = hi - third;

    const st = {};

    for (let i = lo; i <= hi; i++) {
      st[i] = "current";
    }

    st[mid1] = "comparing";
    st[mid2] = "comparing";

    const foundAtMid1 = sorted[mid1] === target;
    const foundAtMid2 = sorted[mid2] === target;

    if (foundAtMid1) {
      st[mid1] = "found";

      frames.push(
        makeFrame(
          sorted,
          st,
          mid1,
          `lo=${lo}, hi=${hi}, mid1=${mid1}, mid2=${mid2} → arr[${mid1}]=${sorted[mid1]} = FOUND!`,
          mid1,
          "done"
        )
      );

      break;
    }

    if (foundAtMid2) {
      st[mid2] = "found";

      frames.push(
        makeFrame(
          sorted,
          st,
          mid2,
          `lo=${lo}, hi=${hi}, mid1=${mid1}, mid2=${mid2} → arr[${mid2}]=${sorted[mid2]} = FOUND!`,
          mid2,
          "done"
        )
      );

      break;
    }

    let message = "";

    if (target < sorted[mid1]) {
      message =
        `${target} < arr[${mid1}]=${sorted[mid1]}, discard middle and right sections`;
      hi = mid1 - 1;
    } else if (target > sorted[mid2]) {
      message =
        `${target} > arr[${mid2}]=${sorted[mid2]}, discard left and middle sections`;
      lo = mid2 + 1;
    } else {
      message =
        `${target} lies between arr[${mid1}]=${sorted[mid1]} and arr[${mid2}]=${sorted[mid2]}, search middle section`;
      lo = mid1 + 1;
      hi = mid2 - 1;
    }

    frames.push(
      makeFrame(
        sorted,
        st,
        mid1,
        `lo=${lo}, hi=${hi}, mid1=${mid1}, mid2=${mid2} → ${message}`,
        -1,
        "compare"
      )
    );
  }

  if (
    frames.length === 1 ||
    frames[frames.length - 1].type !== "done"
  ) {
    frames.push(
      makeFrame(
        sorted,
        {},
        -1,
        `${target} was not found in the array`,
        -1,
        "done"
      )
    );
  }

  return frames;
}

export function jumpSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];
  const step = Math.floor(Math.sqrt(sorted.length));
  let prev = 0, curr = step;
  frames.push(makeFrame(sorted, {}, -1, `Block size = √${sorted.length} ≈ ${step}. Jumping through blocks...`, -1, "info"));
  while (curr < sorted.length && sorted[curr] < target) {
    const st = {};
    for (let i = prev; i <= curr; i++) st[i] = "current";
    st[curr] = "comparing";
    frames.push(makeFrame(sorted, st, curr, `Jump to index ${curr}: arr[${curr}]=${sorted[curr]} < ${target}, skip block`, -1, "compare"));
    prev = curr; curr += step;
  }
  const end = Math.min(curr, sorted.length - 1);
  frames.push(makeFrame(sorted, {}, prev, `Target in range [${prev}..${end}]. Linear scan...`, -1, "info"));
  for (let i = prev; i <= end; i++) {
    const isFound = sorted[i] === target;
    const st = { [i]: isFound ? "found" : "comparing" };
    frames.push(makeFrame(sorted, st, i, `Check arr[${i}] = ${sorted[i]} ${isFound ? "→ FOUND!" : "≠ " + target}`, isFound ? i : -1, isFound ? "done" : "compare"));
    if (isFound) break;
  }
  return frames;
}

export function interpolationSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];
  let lo = 0, hi = sorted.length - 1;
  frames.push(makeFrame(sorted, {}, -1, `Sorted array. Interpolation search for ${target}`, -1, "info"));
  while (lo <= hi && target >= sorted[lo] && target <= sorted[hi]) {
    const denom = sorted[hi] - sorted[lo];
    const pos = denom === 0 ? lo : lo + Math.floor(((target - sorted[lo]) * (hi - lo)) / denom);
    const st = {};
    for (let i = lo; i <= hi; i++) st[i] = "current";
    const isFound = sorted[pos] === target;
    st[pos] = isFound ? "found" : "comparing";
    frames.push(makeFrame(sorted, st, pos,
      `Estimated pos=${pos}, arr[${pos}]=${sorted[pos]} ${isFound ? "= FOUND!" : sorted[pos] < target ? "< target, search right" : "> target, search left"}`,
      isFound ? pos : -1, isFound ? "done" : "compare"));
    if (isFound) break;
    else if (sorted[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  if (!frames.some(f => f.found >= 0)) {
    frames.push(makeFrame(sorted, {}, -1, `Target ${target} not found`, -1, "info"));
  }
  return frames;
}

export function exponentialSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];
  if (sorted[0] === target) {
    frames.push(makeFrame(sorted, { 0: "found" }, 0, "Found at index 0!", 0, "done"));
    return frames;
  }
  let i = 1;
  frames.push(makeFrame(sorted, {}, -1, `Exponential doubling phase: finding range for ${target}`, -1, "info"));
  while (i < sorted.length && sorted[i] <= target) {
    frames.push(makeFrame(sorted, { [i]: "comparing" }, i, `Index ${i}: arr[${i}]=${sorted[i]} ${sorted[i] <= target ? "≤ target, double" : "> target, stop"}`, -1, "compare"));
    i *= 2;
  }
  const lo = Math.floor(i / 2), hi = Math.min(i, sorted.length - 1);
  frames.push(makeFrame(sorted, {}, -1, `Binary search in range [${lo}..${hi}]`, -1, "info"));
  let low = lo, high = hi;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const st = {};
    for (let j = low; j <= high; j++) st[j] = "current";
    const isFound = sorted[mid] === target;
    st[mid] = isFound ? "found" : "comparing";
    frames.push(makeFrame(sorted, st, mid,
      `mid=${mid}, arr[${mid}]=${sorted[mid]} ${isFound ? "= FOUND!" : sorted[mid] < target ? "< target" : "> target"}`,
      isFound ? mid : -1, isFound ? "done" : "compare"));
    if (isFound) break;
    else if (sorted[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return frames;
}
export function twoSumSteps(arr, target) {
  const frames = [];
  const seen = new Map();

  frames.push(
    makeFrame(
      arr,
      {},
      -1,
      `Start Two Sum with target ${target}.`,
      -1,
      "info"
    )
  );

  for (let i = 0; i < arr.length; i += 1) {
    const current = arr[i];
    const complement = target - current;

    frames.push(
      makeFrame(
        arr,
        { [i]: "comparing" },
        i,
        `At index ${i}, value is ${current}. Required complement is ${complement}.`,
        -1,
        "compare"
      )
    );

    if (seen.has(complement)) {
      const firstIndex = seen.get(complement);

      frames.push(
        makeFrame(
          arr,
          {
            [firstIndex]: "found",
            [i]: "found"
          },
          i,
          `Found pair: arr[${firstIndex}] = ${complement} and arr[${i}] = ${current}. Output indices: [${firstIndex}, ${i}].`,
          i,
          "done"
        )
      );

      return frames;
    }

    seen.set(current, i);

    frames.push(
      makeFrame(
        arr,
        { [i]: "current" },
        i,
        `Store value ${current} with index ${i} in the hash map.`,
        -1,
        "info"
      )
    );
  }

  frames.push(
    makeFrame(
      arr,
      {},
      -1,
      `No two numbers add up to ${target}.`,
      -1,
      "info"
    )
  );

  return frames;
}
