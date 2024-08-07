import pLimit from "p-limit";
import { getAllUrls } from "./redis";

const host = process.env.VECTOR_HOST;
const API_TOKEN = process.env.API_TOKEN!;

async function sendRequest(userId: string, url: string): Promise<void> {
  const response = await fetch(`${host}/api/index/url`, {
    method: "POST",
    body: JSON.stringify({ userId, url }),
    headers: {
      "Content-Type": "application/json",
      Authorization: API_TOKEN,
    },
  });

  const text = await response.json();
  console.log(
    `reindex for userId: ${userId}`,
    text,
    " status ",
    response.status
  );
  if (response.status !== 200 || text !== "Success") {
    throw new Error(`Request failed for userId: ${userId}`);
  }
  console.log(`reindex ${url} completed for userId: ${userId}`);
}

const limiter = pLimit(10);
async function processUserIds(userId: string, urls: string[]): Promise<void> {
  const promises = urls.map((url) =>
    limiter(() =>
      sendRequest(userId, url).catch((error) => {
        console.error(`Error processing userId: ${userId}`, error);
      })
    )
  );
  await Promise.all(promises);
}

async function reindex(userId: string) {
  const urls = await getAllUrls(userId);
  console.log(`Reindexing ${urls.length} urls for userId: ${userId}`);
  await processUserIds(userId, urls);
}

const user = process.argv[2];

if (!user) {
  console.log("Please provide an email as a command line argument.");
  process.exit(1);
}

await reindex(user);
