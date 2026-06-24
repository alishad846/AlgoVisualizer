```javascript
function extractLeetCodeProblem() {
  const titleElement =
    document.querySelector('[data-cy="question-title"]') ||
    document.querySelector('a[href*="/problems/"] h1') ||
    document.querySelector("h1") ||
    document.querySelector("h2");

  const descriptionElement =
    document.querySelector('[data-track-load="description_content"]') ||
    document.querySelector('[class*="elfjS"]') ||
    document.querySelector('[class*="description"]') ||
    document.querySelector("main");

  const pageTitle = document.title
    .replace(/\s*-\s*LeetCode.*$/i, "")
    .trim();

  const title =
    titleElement?.textContent?.trim() ||
    pageTitle ||
    "Unknown problem";

  const description =
    descriptionElement?.innerText?.trim() || "";

  return {
    title,
    description,
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "ANALYZE_LEETCODE_PROBLEM") {
    return;
  }

  try {
    const problemData = extractLeetCodeProblem();

    if (!problemData.description) {
      sendResponse({
        success: false,
        message: "The problem description could not be found."
      });

      return;
    }

    sendResponse({
      success: true,
      data: problemData
    });
  } catch (error) {
    console.error("AlgoVision content script error:", error);

    sendResponse({
      success: false,
      message: "An error occurred while reading the problem."
    });
  }
});
```
