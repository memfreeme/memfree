import { setItem, getItem, incrementItem, getUserId } from "./storage.js";
import {
  keepAlive,
  splitArrayIntoChunks,
  processSelectedBookmarks,
  indexUrls,
  checkTaskStatus,
  notifyUser,
} from "./utils.js";

async function handleStartup() {
  try {
    const remainingChunks = await getItem("remainingChunks");
    const userId = await getUserId();

    if (!remainingChunks || !userId) {
      return;
    }

    const length = remainingChunks.length;
    const chunk = remainingChunks.shift();
    await setItem("remainingChunks", remainingChunks);

    const taskId = await indexUrls(chunk, userId);
    await monitorTaskCompletionAndProceed(
      userId,
      taskId,
      remainingChunks,
      length,
      chunk.length
    );
  } catch (error) {
    console.error("Error during startup:", error);
  }
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

  await keepAlive(true);

  try {
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

          await new Promise((resolve) => setTimeout(resolve, 20000));

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
  } finally {
    keepAlive(false);
  }
}

async function sendBookmarksInBatches(bookmarks, batchSize = 10) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID not found in local storage.");
    }

    await keepAlive(true);

    const chunks = splitArrayIntoChunks(bookmarks, batchSize);
    console.log("Chunks:", chunks);

    const initialTaskId = await indexUrls(chunks[0], userId);
    await setItem("remainingChunks", chunks.slice(1));

    await new Promise((resolve) => setTimeout(resolve, 20000));
    await monitorTaskCompletionAndProceed(
      userId,
      initialTaskId,
      chunks.slice(1),
      chunks.length,
      chunks[0].length
    );
  } catch (error) {
    console.error("Error processing bookmarks:", error);
  } finally {
    await keepAlive(false);
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "processBookmarks") {
    console.log("Processing bookmarks:", request.items);
    console.log("bookmarks:", request.items.bookmarks);
    sendResponse({ status: "processing" });

    (async () => {
      try {
        keepAlive(true);

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
      } finally {
        keepAlive(false);
      }
    })();

    return true;
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
