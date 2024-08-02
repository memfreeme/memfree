import { setItem, getItem, incrementItem, getUserId } from "./storage.js";
import {
  keepAlive,
  splitArrayIntoChunks,
  processSelectedBookmarks,
  indexUrls,
} from "./utils.js";

async function processChunks(chunks, userId) {
  const totalChunkNumber = chunks.length;

  for (let i = 0; i < totalChunkNumber; i++) {
    const chunk = chunks[i];
    const isSuccessful = await indexUrls(chunk, userId);

    if (!isSuccessful) {
      throw new Error(`Failed to index URLs for chunk ${i + 1}`);
    }

    await incrementItem("totalUrlsIndexed", chunk.length);
    const progressPercentage = Math.round(((i + 1) / totalChunkNumber) * 100);
    await setItem("progress", progressPercentage);

    const remainingChunks = chunks.slice(i + 1);
    await setItem("remainingChunks", remainingChunks);
  }
}

async function handleStartup() {
  try {
    const remainingChunks = await getItem("remainingChunks");
    const userId = await getUserId();

    if (!remainingChunks || !userId || remainingChunks.length === 0) {
      return;
    }

    await keepAlive(true);
    await processChunks(remainingChunks, userId);
  } catch (error) {
    console.error("Error during startup:", error);
  } finally {
    await keepAlive(false);
  }
}

chrome.runtime.onStartup.addListener(() => {
  handleStartup();
});

async function sendBookmarksInBatches(bookmarks, batchSize = 5) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID not found in local storage.");
    }

    await keepAlive(true);

    const chunks = splitArrayIntoChunks(bookmarks, batchSize);
    console.log("Chunks:", chunks);
    await processChunks(chunks, userId);
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
        await keepAlive(true);
        await setItem("hasEoor", false);

        await setItem("progress", 1);
        const simplifiedBookmarks = await processSelectedBookmarks(
          request.items.bookmarks
        );
        console.log("Processed bookmarks:", simplifiedBookmarks);
        await sendBookmarksInBatches(simplifiedBookmarks, 5);

        console.log("Bookmarks index finished");
      } catch (error) {
        await setItem("hasEoor", true);
        console.error("Error processing bookmarks:", error);
      } finally {
        await keepAlive(false);
      }
    })();

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendURL") {
    const { url, userId, markdown, title } = message.data;

    (async () => {
      try {
        await keepAlive(true);

        const response = await fetch("https://www.memfree.me/api/index-md", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, userId, markdown, title }),
        });
        const data = await response.json();
        sendResponse({ ok: "ok", title });
      } catch (error) {
        console.error("Error sending URL:", error);
        sendResponse({ ok: false, error: `${error}` });
      } finally {
        await keepAlive(false);
      }
    })();

    return true; // Keep the message channel open for sendResponse
  }
});
