function makeFrame(arr, states, pointer, log, found, type = "info") {
  return {
    arr: [...arr],
    states: { ...states },
    pointer,
    log,
    found: found ?? -1,
    type
  };
}

export function linearSearchSteps(arr, target) {
  const frames = [];

  for (let i = 0; i < arr.length; i++) {
    const isFound = arr[i] === target;
    const st = { [i]: isFound ? "found" : "comparing" };

    frames.push(
      makeFrame(
        arr,
        st,
        i,
        `Check arr[${i}] = ${arr[i]} ${
          isFound ? "→ FOUND!" : "≠ " + target
        }`,
        isFound ? i : -1,
        isFound ? "done" : "compare"
      )
    );

    if (isFound) break;
  }

  if (!frames.some(frame => frame.found >= 0)) {
    frames.push(
      makeFrame(
        arr,
        {},
        -1,
        `Target ${target} not found in array`,
        -1,
        "info"
      )
    );
  }

  return frames;
}

export function binarySearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];

  let lo = 0;
  let hi = sorted.length - 1;

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Array sorted: [${sorted.join(", ")}]. Searching for ${target}`,
      -1,
      "info"
    )
  );

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const st = {};

    for (let i = lo; i <= hi; i++) {
      st[i] = "current";
    }

    const isFound = sorted[mid] === target;
    st[mid] = isFound ? "found" : "comparing";

    frames.push(
      makeFrame(
        sorted,
        st,
        mid,
        `lo=${lo}, hi=${hi}, mid=${mid} → arr[${mid}]=${
          sorted[mid]
        } ${
          isFound
            ? "= FOUND!"
            : sorted[mid] < target
              ? "< target, search right"
              : "> target, search left"
        }`,
        isFound ? mid : -1,
        isFound ? "done" : "compare"
      )
    );

    if (isFound) {
      break;
    }

    if (sorted[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (!frames.some(frame => frame.found >= 0)) {
    frames.push(
      makeFrame(
        sorted,
        {},
        -1,
        `Target ${target} not found`,
        -1,
        "info"
      )
    );
  }

  return frames;
}

export function jumpSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];

  const step = Math.max(1, Math.floor(Math.sqrt(sorted.length)));

  let prev = 0;
  let curr = step;

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Block size = √${sorted.length} ≈ ${step}. Jumping through blocks...`,
      -1,
      "info"
    )
  );

  while (curr < sorted.length && sorted[curr] < target) {
    const st = {};

    for (let i = prev; i <= curr; i++) {
      st[i] = "current";
    }

    st[curr] = "comparing";

    frames.push(
      makeFrame(
        sorted,
        st,
        curr,
        `Jump to index ${curr}: arr[${curr}]=${sorted[curr]} < ${target}, skip block`,
        -1,
        "compare"
      )
    );

    prev = curr;
    curr += step;
  }

  const end = Math.min(curr, sorted.length - 1);

  frames.push(
    makeFrame(
      sorted,
      {},
      prev,
      `Target may be in range [${prev}...${end}]. Start linear scan`,
      -1,
      "info"
    )
  );

  for (let i = prev; i <= end; i++) {
    const isFound = sorted[i] === target;
    const st = { [i]: isFound ? "found" : "comparing" };

    frames.push(
      makeFrame(
        sorted,
        st,
        i,
        `Check arr[${i}] = ${sorted[i]} ${
          isFound ? "→ FOUND!" : "≠ " + target
        }`,
        isFound ? i : -1,
        isFound ? "done" : "compare"
      )
    );

    if (isFound) break;
  }

  if (!frames.some(frame => frame.found >= 0)) {
    frames.push(
      makeFrame(
        sorted,
        {},
        -1,
        `Target ${target} not found`,
        -1,
        "info"
      )
    );
  }

  return frames;
}

export function interpolationSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];

  let lo = 0;
  let hi = sorted.length - 1;

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Sorted array. Interpolation search for ${target}`,
      -1,
      "info"
    )
  );

  while (
    lo <= hi &&
    target >= sorted[lo] &&
    target <= sorted[hi]
  ) {
    const denominator = sorted[hi] - sorted[lo];

    const pos =
      denominator === 0
        ? lo
        : lo +
          Math.floor(
            ((target - sorted[lo]) * (hi - lo)) / denominator
          );

    const st = {};

    for (let i = lo; i <= hi; i++) {
      st[i] = "current";
    }

    const isFound = sorted[pos] === target;
    st[pos] = isFound ? "found" : "comparing";

    frames.push(
      makeFrame(
        sorted,
        st,
        pos,
        `Estimated position=${pos}, arr[${pos}]=${sorted[pos]} ${
          isFound
            ? "= FOUND!"
            : sorted[pos] < target
              ? "< target, search right"
              : "> target, search left"
        }`,
        isFound ? pos : -1,
        isFound ? "done" : "compare"
      )
    );

    if (isFound) {
      break;
    }

    if (sorted[pos] < target) {
      lo = pos + 1;
    } else {
      hi = pos - 1;
    }
  }

  if (!frames.some(frame => frame.found >= 0)) {
    frames.push(
      makeFrame(
        sorted,
        {},
        -1,
        `Target ${target} not found`,
        -1,
        "info"
      )
    );
  }

  return frames;
}

export function exponentialSearchSteps(arr, target) {
  const sorted = [...arr].sort((a, b) => a - b);
  const frames = [];

  if (sorted.length === 0) {
    return [
      makeFrame(
        [],
        {},
        -1,
        "The array is empty",
        -1,
        "info"
      )
    ];
  }

  if (sorted[0] === target) {
    frames.push(
      makeFrame(
        sorted,
        { 0: "found" },
        0,
        "Found at index 0!",
        0,
        "done"
      )
    );

    return frames;
  }

  let i = 1;

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Exponential doubling phase: finding a range for ${target}`,
      -1,
      "info"
    )
  );

  while (i < sorted.length && sorted[i] <= target) {
    frames.push(
      makeFrame(
        sorted,
        { [i]: "comparing" },
        i,
        `Index ${i}: arr[${i}]=${sorted[i]} ≤ target, double the index`,
        -1,
        "compare"
      )
    );

    i *= 2;
  }

  const lo = Math.floor(i / 2);
  const hi = Math.min(i, sorted.length - 1);

  frames.push(
    makeFrame(
      sorted,
      {},
      -1,
      `Binary search in range [${lo}...${hi}]`,
      -1,
      "info"
    )
  );

  let low = lo;
  let high = hi;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const st = {};

    for (let j = low; j <= high; j++) {
      st[j] = "current";
    }

    const isFound = sorted[mid] === target;
    st[mid] = isFound ? "found" : "comparing";

    frames.push(
      makeFrame(
        sorted,
        st,
        mid,
        `mid=${mid}, arr[${mid}]=${sorted[mid]} ${
          isFound
            ? "= FOUND!"
            : sorted[mid] < target
              ? "< target"
              : "> target"
        }`,
        isFound ? mid : -1,
        isFound ? "done" : "compare"
      )
    );

    if (isFound) {
      break;
    }

    if (sorted[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (!frames.some(frame => frame.found >= 0)) {
    frames.push(
      makeFrame(
        sorted,
        {},
        -1,
        `Target ${target} not found`,
        -1,
        "info"
      )
    );
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
      `Find two numbers whose sum is ${target}`,
      -1,
      "info"
    )
  );

  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];

    frames.push(
      makeFrame(
        arr,
        { [i]: "comparing" },
        i,
        `At index ${i}: value=${arr[i]}, complement=${target} - ${arr[i]} = ${complement}`,
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
          `Found pair: arr[${firstIndex}] + arr[${i}] = ${complement} + ${arr[i]} = ${target}. Indices: [${firstIndex}, ${i}]`,
          i,
          "done"
        )
      );

      return frames;
    }

    seen.set(arr[i], i);

    frames.push(
      makeFrame(
        arr,
        { [i]: "current" },
        i,
        `Store ${arr[i]} at index ${i} in the hash map`,
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
      `No two numbers add up to ${target}`,
      -1,
      "info"
    )
  );

  return frames;
}

export function slidingWindowSteps(arr) {
  const frames = [];
  const lastSeen = new Map();

  let left = 0;
  let bestStart = 0;
  let bestLength = 0;

  frames.push(
    makeFrame(
      arr,
      {},
      -1,
      "Find the longest contiguous window without repeating values",
      -1,
      "info"
    )
  );

  for (let right = 0; right < arr.length; right++) {
    const value = arr[right];

    if (
      lastSeen.has(value) &&
      lastSeen.get(value) >= left
    ) {
      const previousIndex = lastSeen.get(value);

      frames.push(
        makeFrame(
          arr,
          {
            [previousIndex]: "comparing",
            [right]: "comparing"
          },
          right,
          `Duplicate value ${value} found. Move the left pointer from ${left} to ${previousIndex + 1}`,
          -1,
          "compare"
        )
      );

      left = previousIndex + 1;
    }

    lastSeen.set(value, right);

    const states = {};

    for (let i = left; i <= right; i++) {
      states[i] = "current";
    }

    const currentLength = right - left + 1;

    if (currentLength > bestLength) {
      bestLength = currentLength;
      bestStart = left;
    }

    frames.push(
      makeFrame(
        arr,
        states,
        right,
        `Current window [${left}...${right}] has length ${currentLength}. Best length: ${bestLength}`,
        -1,
        "info"
      )
    );
  }

  const finalStates = {};

  for (
    let i = bestStart;
    i < bestStart + bestLength;
    i++
  ) {
    finalStates[i] = "found";
  }

  frames.push(
    makeFrame(
      arr,
      finalStates,
      bestStart,
      `Longest window without repeating values starts at index ${bestStart} and has length ${bestLength}`,
      bestStart,
      "done"
    )
  );

  return frames;
}