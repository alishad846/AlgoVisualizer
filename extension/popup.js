const analyzeButton = document.getElementById("analyzeButton");
const statusMessage = document.getElementById("statusMessage");

analyzeButton.addEventListener("click", async () => {
  statusMessage.textContent = "Reading the current LeetCode problem...";

  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!activeTab?.id || !activeTab.url) {
      throw new Error("No active browser tab was found.");
    }

    if (!activeTab.url.startsWith("https://leetcode.com/problems/")) {
      throw new Error("Open a LeetCode problem page and try again.");
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },

      func: () => {
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

        const description =
          descriptionElement?.innerText?.trim() || "";

        function extractNumberArray(variableName) {
          const pattern = new RegExp(
            `${variableName}\\s*=\\s*\\[([^\\]]*)\\]`,
            "i"
          );

          const match = description.match(pattern);

          if (!match?.[1]) {
            return [];
          }

          return match[1]
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => !Number.isNaN(value));
        }

        function extractNumber(variableName) {
          const pattern = new RegExp(
            `${variableName}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)`,
            "i"
          );

          const match = description.match(pattern);

          return match ? Number(match[1]) : null;
        }

        const nums = extractNumberArray("nums");
        const nums1 = extractNumberArray("nums1");
        const nums2 = extractNumberArray("nums2");
        const target = extractNumber("target");

        return {
          title:
            titleElement?.textContent?.trim() ||
            pageTitle ||
            "Unknown problem",

          description,
          url: window.location.href,

          sampleInput: {
            nums,
            nums1,
            nums2,
            target
          }
        };
      }
    });

    const problemData = results?.[0]?.result;

    if (!problemData?.description) {
      throw new Error("The problem description could not be found.");
    }

    const { nums, nums1, nums2, target } =
      problemData.sampleInput;

    const outputLines = [
      `Problem: ${problemData.title}`
    ];

    if (nums.length > 0) {
      outputLines.push(`Array: [${nums.join(", ")}]`);
    }

    if (nums1.length > 0) {
      outputLines.push(`Array 1: [${nums1.join(", ")}]`);
    }

    if (nums2.length > 0) {
      outputLines.push(`Array 2: [${nums2.join(", ")}]`);
    }

    if (target !== null) {
      outputLines.push(`Target: ${target}`);
    } else {
      outputLines.push("Target: Not required");
    }

    if (
      nums.length === 0 &&
      nums1.length === 0 &&
      nums2.length === 0
    ) {
      outputLines.push("Input arrays: Not found");
    }

    statusMessage.textContent = outputLines.join("\n");
    statusMessage.style.whiteSpace = "pre-line";
  } catch (error) {
    statusMessage.textContent =
      error.message || "Unable to analyze the current problem.";

    console.error("AlgoVision extension error:", error);
  }
});