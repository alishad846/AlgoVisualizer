const browserAPI = globalThis.browser || globalThis.chrome;

const analyzeButton = document.getElementById("analyzeButton");
const openVisualizerButton = document.getElementById(
  "openVisualizerButton"
);
const statusMessage = document.getElementById("statusMessage");

let detectedProblem = null;

function setAnalyzing(isAnalyzing) {
  analyzeButton.disabled = isAnalyzing;
  analyzeButton.textContent = isAnalyzing
    ? "Analyzing..."
    : "Analyze Current Problem";
}

analyzeButton.addEventListener("click", async () => {
  if (analyzeButton.disabled) {
    return;
  }

  setAnalyzing(true);

  statusMessage.textContent =
    "Reading the current LeetCode problem...";

  statusMessage.style.whiteSpace = "pre-line";

  openVisualizerButton.disabled = true;
  detectedProblem = null;

  try {
    if (!browserAPI) {
      throw new Error(
        "The browser extension API is not available."
      );
    }

    const tabs = await browserAPI.tabs.query({
      active: true,
      currentWindow: true
    });

    const activeTab = tabs[0];

    if (!activeTab || !activeTab.id || !activeTab.url) {
      throw new Error("No active browser tab was found.");
    }

    if (
      !activeTab.url.startsWith(
        "https://leetcode.com/problems/"
      )
    ) {
      throw new Error(
        "Open a LeetCode problem page and try again."
      );
    }

    const executionResults =
      await browserAPI.scripting.executeScript({
        target: {
          tabId: activeTab.id
        },
        func: analyzeLeetCodePage
      });

    const problemData = executionResults[0]?.result;

    if (!problemData) {
      throw new Error(
        "The problem information could not be read."
      );
    }

    detectedProblem = problemData;

    const outputLines = [
      `Problem: ${problemData.title}`,
      `Category: ${problemData.category}`
    ];

    const inputEntries = Object.entries(
      problemData.inputs || {}
    );

    if (inputEntries.length > 0) {
      outputLines.push("Detected inputs:");

      inputEntries.forEach(([name, value]) => {
        const displayedValue =
          typeof value === "string"
            ? value
            : JSON.stringify(value);

        outputLines.push(`${name}: ${displayedValue}`);
      });
    } else {
      outputLines.push("Inputs: Not detected");
    }

    const isTwoSum =
      problemData.title.toLowerCase().includes("two sum");

    const hasNums =
      Array.isArray(problemData.inputs?.nums) &&
      problemData.inputs.nums.length > 0;

    const hasTarget =
      typeof problemData.inputs?.target === "number";

    openVisualizerButton.disabled = false;

    outputLines.push("");

    const normalizedTitle =
  problemData.title.toLowerCase();

const isBinarySearch =
  normalizedTitle.includes("binary search") ||
  normalizedTitle.includes("search insert position");
  
const isLinearSearch =
  normalizedTitle.includes("linear search");

if (
  (isTwoSum || isBinarySearch || isLinearSearch) && 
  hasNums &&
  hasTarget
) {
  outputLines.push(
    `${
  isTwoSum
    ? "Two Sum"
    : isBinarySearch
      ? "Binary Search"
      : "Linear Search"
} visualization is ready.`
  );
} else {
  outputLines.push(
    "This problem can be opened in AlgoVision. Automatic visualization is currently available for Two Sum and Binary Search."
  );
}

    statusMessage.textContent = outputLines.join("\n");
  } catch (error) {
    statusMessage.textContent =
      error?.message ||
      "Unable to analyze the current problem.";

    openVisualizerButton.disabled = true;
    detectedProblem = null;

    console.error(
      "AlgoVision extension error:",
      error
    );
  } finally {
    setAnalyzing(false);
  }
});

openVisualizerButton.addEventListener("click", async () => {
  if (openVisualizerButton.disabled) {
    return;
  }

  if (!detectedProblem) {
    statusMessage.textContent =
      "Analyze the LeetCode problem first.";
    return;
  }

  openVisualizerButton.disabled = true;
  openVisualizerButton.textContent =
    "Opening AlgoVision...";

  try {
    const problemTitle =
      detectedProblem.title?.toLowerCase() || "";

    const nums = detectedProblem.inputs?.nums;
    const target = detectedProblem.inputs?.target;

    let visualizerUrl =
      "http://localhost:5173/dashboard";

    const hasSearchInputs =
      Array.isArray(nums) &&
      typeof target === "number";

    if (
      problemTitle.includes("two sum") &&
      hasSearchInputs
    ) {
      const params = new URLSearchParams({
        nums: JSON.stringify(nums),
        target: String(target),
        autoStart: "true"
      });

      visualizerUrl =
        `http://localhost:5173/searching/two-sum?${params.toString()}`;
    } else if (
      (
  problemTitle.includes("binary search") ||
  problemTitle.includes("search insert position")
)  &&
      hasSearchInputs
    ) {
      const params = new URLSearchParams({
        nums: JSON.stringify(nums),
        target: String(target),
        autoStart: "true"
      });

      visualizerUrl =
        `http://localhost:5173/searching/binary-search?${params.toString()}`;
    } else if (
      problemTitle.includes("linear search") &&
      hasSearchInputs
    ) {
      const params = new URLSearchParams({
        nums: JSON.stringify(nums),
        target: String(target),
        autoStart: "true"
      });

      visualizerUrl =
        `http://localhost:5173/searching/linear-search?${params.toString()}`;
    }

    await browserAPI.tabs.create({
      url: visualizerUrl
    });
  } catch (error) {
    statusMessage.textContent =
      error?.message ||
      "Unable to open AlgoVision.";

    console.error(
      "AlgoVision open error:",
      error
    );
  } finally {
    openVisualizerButton.disabled = false;
    openVisualizerButton.textContent =
      "Open in AlgoVision";
  }
});

function analyzeLeetCodePage() {
  const pageTitle = document.title
    .replace(/\s*-\s*LeetCode.*$/i, "")
    .trim();

  const titleElement =
    document.querySelector('[data-cy="question-title"]') ||
    document.querySelector("h1") ||
    document.querySelector("h2");

  const descriptionElement =
    document.querySelector(
      '[data-track-load="description_content"]'
    ) ||
    document.querySelector('[class*="description"]') ||
    document.querySelector("main") ||
    document.body;

  const problemSlug =
  window.location.pathname
    .split("/problems/")[1]
    ?.split("/")[0] || "";

const slugTitle = problemSlug
  .split("-")
  .map(
    (word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
  )
  .join(" ");

const title =
  slugTitle ||
  pageTitle ||
  titleElement?.textContent?.trim() ||
  "Unknown problem";
    titleElement?.textContent?.trim() ||
    pageTitle ||
    "Unknown problem";

  const description =
    descriptionElement?.innerText?.trim() || "";

  const firstInputLine =
    extractFirstInputLine(description);

  const inputs =
    parseInputAssignments(firstInputLine);

  const category =
    detectCategory(title, description);

  return {
    title,
    description,
    category,
    inputs,
    url: window.location.href
  };

 function extractFirstInputLine(text) {
  if (!text) {
    return "";
  }

  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim());

  const inputIndex = lines.findIndex((line) =>
    /^Input\s*:?\s*/i.test(line)
  );

  if (inputIndex === -1) {
    return "";
  }

  const inputLines = [];

  const firstLine = lines[inputIndex]
    .replace(/^Input\s*:?\s*/i, "")
    .trim();

  if (firstLine) {
    inputLines.push(firstLine);
  }

  for (
    let index = inputIndex + 1;
    index < lines.length;
    index += 1
  ) {
    const line = lines[index];

    if (
      /^(Output|Explanation|Constraints|Follow[- ]?up|Example\s*\d+)\s*:?\s*/i.test(
        line
      )
    ) {
      break;
    }

    if (line) {
      inputLines.push(line);
    }
  }

  return inputLines.join("\n");
}

 function parseInputAssignments(inputText) {
  if (!inputText) {
    return {};
  }

  const normalizedInput = inputText
    .replace(/\r/g, "")
    .trim();

  const lines = normalizedInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (
    lines.length === 2 &&
    lines[0].startsWith("[") &&
    lines[1].startsWith("[")
  ) {
    return {
      operations: parseValue(lines[0]),
      arguments: parseValue(lines[1])
    };
  }

  const singleLineInput =
    normalizedInput.replace(/\n+/g, ",");

  const parts =
    splitOutsideBrackets(singleLineInput);

  const parsedInputs = {};

  parts.forEach((part, index) => {
    const cleanedPart = part.trim();

    if (!cleanedPart) {
      return;
    }

    const equalPosition =
      cleanedPart.indexOf("=");

    if (equalPosition === -1) {
      parsedInputs[`input${index + 1}`] =
        parseValue(cleanedPart);

      return;
    }

    const variableName = cleanedPart
      .slice(0, equalPosition)
      .trim();

    const rawValue = cleanedPart
      .slice(equalPosition + 1)
      .trim();

    if (variableName) {
      parsedInputs[variableName] =
        parseValue(rawValue);
    }
  });

  return parsedInputs;
}

  function splitOutsideBrackets(text) {
    const parts = [];

    let currentPart = "";
    let bracketDepth = 0;
    let activeQuote = null;

    for (
      let index = 0;
      index < text.length;
      index += 1
    ) {
      const character = text[index];
      const previousCharacter =
        text[index - 1];

      if (
        (character === '"' ||
          character === "'") &&
        previousCharacter !== "\\"
      ) {
        if (activeQuote === character) {
          activeQuote = null;
        } else if (!activeQuote) {
          activeQuote = character;
        }
      }

      if (!activeQuote) {
        if (
          character === "[" ||
          character === "{" ||
          character === "("
        ) {
          bracketDepth += 1;
        }

        if (
          character === "]" ||
          character === "}" ||
          character === ")"
        ) {
          bracketDepth -= 1;
        }
      }

      if (
        character === "," &&
        bracketDepth === 0 &&
        !activeQuote
      ) {
        parts.push(currentPart.trim());
        currentPart = "";
      } else {
        currentPart += character;
      }
    }

    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  function parseValue(rawValue) {
    const value = rawValue.trim();

    if (!value) {
      return "";
    }

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    if (value === "null") {
      return null;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      return Number(value);
    }

    if (
      (value.startsWith("[") &&
        value.endsWith("]")) ||
      (value.startsWith("{") &&
        value.endsWith("}"))
    ) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  }

  function detectCategory(
    problemTitle,
    problemDescription
  ) {
    const combinedText =
      `${problemTitle} ${problemDescription}`.toLowerCase();

    if (
      combinedText.includes("linked list") ||
      combinedText.includes("listnode")
    ) {
      return "Linked List";
    }

    if (
      combinedText.includes("binary tree") ||
      combinedText.includes("treenode")
    ) {
      return "Tree";
    }

    if (
      combinedText.includes("graph") ||
      combinedText.includes("edges")
    ) {
      return "Graph";
    }

    if (combinedText.includes("two sum")) {
      return "Array / Hash Map";
    }

    if (
      combinedText.includes("binary search") ||
      combinedText.includes("sorted array")
    ) {
      return "Searching";
    }

    if (
      combinedText.includes("sort") ||
      combinedText.includes("sorting")
    ) {
      return "Sorting";
    }

    if (
      combinedText.includes("string") ||
      combinedText.includes("substring")
    ) {
      return "String";
    }

    if (
      combinedText.includes("array") ||
      combinedText.includes("nums")
    ) {
      return "Array";
    }

    return "General DSA";
  }
}