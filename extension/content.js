chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "ANALYZE_LEETCODE_PROBLEM") {
    return;
  }

  try {
    const pageTitle = document.title
      .replace(/\s*-\s*LeetCode.*$/i, "")
      .trim();

    sendResponse({
      success: true,
      data: {
        title: pageTitle || "Unknown problem",
        url: window.location.href
      }
    });
  } catch (error) {
    sendResponse({
      success: false,
      message: "Unable to read the LeetCode problem."
    });
  }
});