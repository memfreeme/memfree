const host = process.env.VECTOR_HOST;
const API_TOKEN = process.env.API_TOKEN!;

async function sendRequest(userId: string): Promise<void> {
  const response = await fetch(`${host}/api/vector/change-embedding`, {
    method: "POST",
    body: JSON.stringify({ userId }),
    headers: {
      "Content-Type": "application/json",
      Authorization: API_TOKEN,
    },
  });

  const text = await response.json();
  console.log(
    `change-embedding response for userId: ${userId}`,
    text,
    " status ",
    response.status
  );
  if (response.status !== 200 || text !== "Success") {
    throw new Error(`Request failed for userId: ${userId}`);
  }
}

import pLimit from "p-limit";
const limiter = pLimit(5);

async function processUserIds(userIds: string[]): Promise<void> {
  const promises = userIds.map((userId) =>
    limiter(() =>
      sendRequest(userId).catch((error) => {
        console.error(`Error processing userId: ${userId}`, error);
      })
    )
  );

  await Promise.all(promises);
}

const userIds = ["testUser"];

processUserIds(userIds)
  .then(() => console.log("All requests completed successfully"))
  .catch((error) => console.error("Error processing requests:", error));
