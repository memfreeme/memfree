export const keepAlive = (() => {
  let intervalId;

  return async (state) => {
    if (state && !intervalId) {
      chrome.runtime.getPlatformInfo(() => {});
      intervalId = setInterval(
        () => chrome.runtime.getPlatformInfo(() => {}),
        20000
      );
    } else if (!state && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
})();

export async function processSelectedBookmarks(ids) {
  if (!Array.isArray(ids)) {
    throw new TypeError("Expected an array of IDs");
  }

  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((tree) => {
      const bookmarksMap = new Map();
      function traverse(nodes, parentTags = [], skipFirstLevel = true) {
        nodes.forEach((node) => {
          if (skipFirstLevel && node.children) {
            traverse(node.children, parentTags, false);
          } else if (node.children && node.children.length > 0) {
            traverse(node.children, [...parentTags, node.title], false);
          } else if (node.url) {
            bookmarksMap.set(node.id, {
              url: node.url,
              title: node.title,
              tag: parentTags.join("/"),
            });
          }
        });
      }

      traverse(tree[0].children);

      const selectedNodes = ids
        .map((id) => bookmarksMap.get(id))
        .filter(Boolean);

      console.log("Selected bookmarks:", selectedNodes);

      resolve(selectedNodes);
    });
  });
}

export function splitArrayIntoChunks(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function indexUrls(chunk, userId) {
  const urls = chunk.map((item) => item.url);
  const jsonString = JSON.stringify({ urls, userId });
  console.log("Sending bookmarks:", jsonString);

  const maxRetries = 3;
  let attempt = 0;
  let sleepTime = 1000;

  while (attempt < maxRetries) {
    try {
      const response = await fetch("https://www.memfree.me/api/index2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonString,
      });

      if (!response.ok) {
        console.error("HTTP error! status:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("index response:", data);
      return true;
    } catch (error) {
      console.error("Error sending bookmarks:", error);
      attempt++;
      if (attempt < maxRetries) {
        console.log(`Retrying in ${sleepTime / 1000} seconds...`);
        await sleep(sleepTime);
        sleepTime *= 2;
      } else {
        console.error("Max retries reached. Failed to send bookmarks.");
        return false;
      }
    }
  }

  return false;
}
