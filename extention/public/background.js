import { setItem, getItem, incrementItem, getUserId } from "./storage.js";

async function processSelectedBookmarks(ids) {
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

function splitArrayIntoChunks(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function handleStartup() {
  try {
    const remainingChunks = await getItem("remainingChunks");
    const userId = await getUserId();

    if (!remainingChunks || !userId) {
      return;
    }

    const chunk = remainingChunks[0];
    const length = remainingChunks.length;

    const taskId = await indexUrls(chunk, userId);
    await monitorTaskCompletionAndProceed(
      userId,
      taskId,
      remainingChunks.shift(),
      length,
      chunk.length
    );
  } catch (error) {
    console.error("Error during startup:", error);
  }
}

function notifyUser(status, reason = "") {
  const options = {
    type: "basic",
    iconUrl: "icons/icon.png",
    title: "Bookmark Processing Status",
    message:
      status === "success"
        ? "Bookmarks indexed successfully!"
        : `Failed to process bookmarks: ${reason}`,
  };
  chrome.notifications.create(options);
}

chrome.runtime.onStartup.addListener(() => {
  handleStartup();
});

async function monitorTaskCompletionAndProceed(
  userId,
  taskId,
  remainingChunks,
  totalChunks,
  currentChunkSize
) {
  let taskCompleted = false;

  while (!taskCompleted) {
    const status = await checkTaskStatus(taskId);
    console.log(taskId, " Task status:", status);

    if (status === "completed") {
      taskCompleted = true;
      const progressPercentage = Math.round(
        ((totalChunks - remainingChunks.length) / totalChunks) * 100
      );

      console.log("Progress:", progressPercentage + "%");

      await setItem("progress", progressPercentage);
      await incrementItem("totalUrlsIndexed", currentChunkSize);

      if (remainingChunks.length > 0) {
        const nextChunk = remainingChunks.shift();
        const newTaskId = await indexUrls(nextChunk, userId);
        await setItem("remainingChunks", remainingChunks);

        await new Promise((resolve) => setTimeout(resolve, 30000));

        await monitorTaskCompletionAndProceed(
          userId,
          newTaskId,
          remainingChunks,
          totalChunks,
          nextChunk.length
        );
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait and recheck
    }
  }
}

async function indexUrls(chunk, userId) {
  const urls = chunk.map((item) => item.url);
  const jsonString = JSON.stringify({ urls, userId });
  console.log("Sending bookmarks:", jsonString);

  try {
    const response = await fetch("https://www.memfree.me/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsonString,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Task ID received:", data.taskId);
    return data.taskId;
  } catch (error) {
    console.error("Error sending bookmarks:", error);
    throw error;
  }
}

async function checkTaskStatus(taskId) {
  try {
    const response = await fetch("https://www.memfree.me/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(taskId + " Task status:", data.status);
    return data.status;
  } catch (error) {
    console.error("Error checking task status:", error);
    throw error;
  }
}

async function sendBookmarksInBatches(bookmarks, batchSize = 10) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID not found in local storage.");
    }

    const chunks = splitArrayIntoChunks(bookmarks, batchSize);
    console.log("Chunks:", chunks);

    const initialTaskId = await indexUrls(chunks[0], userId);
    await setItem("remainingChunks", chunks.slice(1));

    await new Promise((resolve) => setTimeout(resolve, 30000));
    await monitorTaskCompletionAndProceed(
      userId,
      initialTaskId,
      chunks.slice(1),
      chunks.length,
      chunks[0].length
    );
  } catch (error) {
    console.error("Error processing bookmarks:", error);
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "processBookmarks") {
    console.log("Processing bookmarks:", request.items);
    console.log("bookmarks:", request.items.bookmarks);
    sendResponse({ status: "processing" });

    (async () => {
      try {
        await setItem("progress", 1);
        const simplifiedBookmarks = await processSelectedBookmarks(
          request.items.bookmarks
        );
        console.log("Processed bookmarks:", simplifiedBookmarks);
        await sendBookmarksInBatches(simplifiedBookmarks, 10);

        console.log("Bookmarks index finished");

        notifyUser("success");
      } catch (error) {
        console.error("Error processing bookmarks:", error);
        notifyUser("fail", error.message);
      }
    })();

    return true;
  }

  if (request.action === "log") {
    console.log(`[From ${sender.id}]: ${request.message}`);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendURL") {
    const { urls, userId } = message.data;

    fetch("https://www.memfree.me/api/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls, userId }),
    })
      .then((response) =>
        response.json().then((data) => ({ ok: response.ok, data }))
      )
      .then(({ ok, data }) => {
        console.log("response:", data);
        sendResponse({ ok, data });
      })
      .catch((error) => {
        console.error("Error sending URL:", error);
        sendResponse({ ok: false, error: `${error}` });
      });

    return true;
  }
});
