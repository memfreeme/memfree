function processBookmarks(nodes, parentTags = [], skipFirstLevel = true) {
  let processed = [];

  nodes.forEach((node) => {
    if (skipFirstLevel && node.children) {
      processed = processed.concat(processBookmarks(node.children, [], false));
    } else if (node.children && node.children.length > 0) {
      processed = processed.concat(
        processBookmarks(node.children, [...parentTags, node.title], false)
      );
    } else if (node.url) {
      processed.push({
        url: node.url,
        title: node.title,
        tag: parentTags.join("/"),
      });
    }
  });

  return processed;
}

function splitArrayIntoChunks(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(
    ["pendingBookmarkBatches"],
    async ({ pendingBookmarkBatches }) => {
      if (pendingBookmarkBatches && pendingBookmarkBatches.length > 0) {
        await processPendingBatches(pendingBookmarkBatches);
      }
    }
  );
});

async function processPendingBatches(pendingBatches) {
  const totalUrlsIndexed = await new Promise((resolve, reject) => {
    chrome.storage.local.get(["totalUrlsIndexed"], (items) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error retrieving from storage:",
          chrome.runtime.lastError
        );
        reject(chrome.runtime.lastError);
      } else {
        resolve(items.totalUrlsIndexed || 0);
      }
    });
  });

  for (const batch of pendingBatches) {
    const taskId = await sendRequestWithRetry(batch.chunk, batch.userId);
    await monitorTaskCompletionAndProceed(
      batch.userId,
      taskId,
      batch.remainingChunks,
      pendingBatches.length,
      totalUrlsIndexed
    );
  }
}

async function monitorTaskCompletionAndProceed(
  userId,
  taskId,
  remainingChunks,
  totalChunks,
  totalUrlsIndexed
) {
  let taskCompleted = false;

  while (!taskCompleted) {
    const status = await checkTaskStatus(taskId);

    if (status === "completed") {
      taskCompleted = true;
      const progressPercentage = Math.round(
        ((totalChunks - remainingChunks.length) / totalChunks) * 100
      );

      console.log("Progress:", progressPercentage + "%");

      chrome.storage.local.set(
        {
          progress: progressPercentage,
          totalUrlsIndexed: totalUrlsIndexed,
        },
        () => console.log("Progress and URL count updated in storage")
      );

      if (remainingChunks.length > 0) {
        const nextChunk = remainingChunks.shift();
        await savePendingState(
          { chunk: nextChunk, userId },
          remainingChunks,
          totalUrlsIndexed
        );
        const newTaskId = await sendRequestWithRetry(nextChunk, userId);
        await new Promise((resolve) => setTimeout(resolve, 30000));
        totalUrlsIndexed += nextChunk.length;
        await monitorTaskCompletionAndProceed(
          userId,
          newTaskId,
          remainingChunks,
          totalChunks,
          totalUrlsIndexed
        );
      } else {
        chrome.storage.local.remove("pendingBookmarkBatches");
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait and recheck
    }
  }
}

async function savePendingState(
  currentBatch,
  remainingChunks,
  totalUrlsIndexed
) {
  await new Promise((resolve) => {
    chrome.storage.local.set(
      {
        pendingBookmarkBatches: [{ ...currentBatch, remainingChunks }],
        totalUrlsIndexed: totalUrlsIndexed,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving state:", chrome.runtime.lastError);
        } else {
          console.log("Pending state saved successfully.");
        }
        resolve();
      }
    );
  });
}

async function sendRequestWithRetry(chunk, userId) {
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
    const user = await new Promise((resolve, reject) => {
      chrome.storage.local.get(["user"], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Storage get failed:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.user);
        }
      });
    });

    const userId = user ? user.id : null;

    if (!userId) {
      throw new Error("User ID not found in local storage.");
    }

    const chunks = splitArrayIntoChunks(bookmarks, batchSize);
    await savePendingState({ chunk: chunks[0], userId }, chunks.slice(1));

    const initialTaskId = await sendRequestWithRetry(chunks[0], userId);
    await new Promise((resolve) => setTimeout(resolve, 30000));
    let totalUrlsIndexed = chunks[0].length;
    await monitorTaskCompletionAndProceed(
      userId,
      initialTaskId,
      chunks.slice(1),
      chunks.length,
      totalUrlsIndexed
    );
  } catch (error) {
    console.error("Error processing bookmarks:", error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processBookmarks") {
    chrome.bookmarks.getTree(async (tree) => {
      const simplifiedBookmarks = processBookmarks(tree[0].children).slice(
        0,
        10
      );

      console.log("Processed bookmarks:", simplifiedBookmarks);
      await sendBookmarksInBatches(simplifiedBookmarks, 2);

      console.log("Bookmarks index finished, sendResponse");
      sendResponse({ status: "success" });
    });

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
