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
          document.querySelector('[data-track-load="description_content"]') ||
          document.querySelector('[class*="description"]') ||
          document.querySelector("main") ||
          document.body;

        const description =
          descriptionElement?.innerText?.trim() || "";

        const arrayMatch = description.match(
          /nums\s*=\s*\[([^\]]+)\]/i
        );

        const targetMatch = description.match(
          /target\s*=\s*(-?\d+)/i
        );

        let nums = [];

        if (arrayMatch?.[1]) {
          nums = arrayMatch[1]
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => !Number.isNaN(value));
        }

        const target = targetMatch
          ? Number(targetMatch[1])
          : null;

        return {
          title:
            titleElement?.textContent?.trim() ||
            pageTitle ||
            "Unknown problem",

          description,
          url: window.location.href,
          sampleInput: {
            nums,
            target
          }
        };
      }
    });

    const problemData = results?.[0]?.result;

    if (!problemData?.description) {
      throw new Error("The problem description could not be found.");
    }

    const numsText =
      problemData.sampleInput.nums.length > 0
        ? `[${problemData.sampleInput.nums.join(", ")}]`
        : "Not found";

    const targetText =
      problemData.sampleInput.target !== null
        ? problemData.sampleInput.target
        : "Not found";

    statusMessage.innerHTML = `
      <strong>Problem:</strong> ${problemData.title}<br>
      <strong>Array:</strong> ${numsText}<br>
      <strong>Target:</strong> ${targetText}
    `;
  } catch (error) {
    statusMessage.textContent =
      error.message || "Unable to analyze the current problem.";

    console.error("AlgoVision extension error:", error);
  }
});