import { Redis } from "@upstash/redis";
import pLimit from "p-limit";
import { fetchWithRetry, sleep } from "./utils";
import { randomUUID } from "node:crypto";
import { Axiom } from "@axiomhq/js";

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN || "",
});

export const TASK_STATUS_KEY = "task_status:";
export const TASK_KEY = "tasks:";

const url = process.env.UPSTASH_REDIS_REST_URL as string;
const token = process.env.UPSTASH_REDIS_REST_TOKEN as string;
const redis = new Redis({
  url: url,
  token: token,
  enableAutoPipelining: true,
});

const indexUrl = process.env.INDEX_URL as string;

const concurrencyStr = process.env.CONCURRENCY;
const concurrency = concurrencyStr ? parseInt(concurrencyStr, 10) : 5;
const limit = pLimit(concurrency);

const API_TOKEN = process.env.API_TOKEN!;

async function build_vector_for_url(
  url: string,
  userId: string
): Promise<void> {
  const response = await fetchWithRetry(indexUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${API_TOKEN}`,
    },
    body: JSON.stringify({ url, userId }),
  });

  if (response.status === 400) {
    console.warn(`Bad Request for URL ${url}: ${response.statusText}`);
  } else if (!response.ok) {
    throw new Error(
      `Failed to fetch vector for URL ${url}: ${response.statusText}`
    );
  }
}

function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

async function processUrl(url: string, userId: string, taskId: string) {
  let retryCount = 0;
  const maxRetries = 5;
  const taskKey = `${TASK_KEY}${taskId}`;

  if (!isValidUrl(url)) {
    // TODO: use RPOPLPUSH later
    axiom.ingest("memfree", [
      {
        service: "queue",
        time: 0,
        success: false,
        url: url,
        userId: userId,
        taskId: taskId,
      },
    ]);
    await redis.lpop(taskKey);
    return;
  }

  while (retryCount < maxRetries) {
    try {
      const start = Date.now();
      await build_vector_for_url(url as string, userId);
      const time = Date.now() - start;
      axiom.ingest("memfree", [
        {
          service: "queue",
          time: time,
          success: true,
          url: url,
          userId: userId,
          taskId: taskId,
        },
      ]);

      // TODO: use RPOPLPUSH later
      await redis.lpop(taskKey);
      return;
    } catch (error) {
      retryCount++;
      console.error(
        `Failed to process URL ${url} for task ${taskId}:`,
        error,
        `. Retrying... (${retryCount}/${maxRetries})`
      );
      axiom.ingest("memfree", [
        {
          service: "queue",
          success: false,
          retry: retryCount,
          url: url,
          userId: userId,
          taskId: taskId,
        },
      ]);

      if (retryCount >= maxRetries) {
        // dead-letter queue
        await redis.rpush(`${taskId}:dlq`, url);
        console.warn(
          `URL ${url} pushed to DLQ after ${maxRetries} failed retries`
        );
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }
}

async function processTask(taskId: string) {
  const [userId, batchId] = taskId.split(":");
  const taskKey = `${TASK_KEY}${taskId}`;

  while (true) {
    const urls = await redis.lrange(taskKey, 0, -1);

    if (urls.length === 0) break;

    const urlPromises = urls.map((url) =>
      limit(() => processUrl(url, userId, taskId))
    );

    await Promise.all(urlPromises);

    if ((await redis.llen(taskKey)) === 0) {
      await redis.hdel(TASK_STATUS_KEY, taskId);
      axiom.ingest("memfree", [
        {
          service: "queue",
          action: "remove-task",
          success: true,
          userId: userId,
          taskId: taskId,
        },
      ]);
      break;
    }
  }
}

async function processPendingTasks(pendingTasks: string[]) {
  for (let taskId of pendingTasks) {
    await processTask(taskId);
  }

  // TDOD:
  // const promises = pendingTasks.map((taskKey) =>
  //   limit(() => processTask(taskKey))
  // );
  // await Promise.all(promises);
}

const intervalTimeStr = process.env.INTERVAL_TIME;
const MIN_INTERVAL = 1000;
const MAX_INTERVAL = intervalTimeStr ? parseInt(intervalTimeStr, 10) : 60000;
let currentInterval = MIN_INTERVAL;

export async function processTasks() {
  while (true) {
    // TODO: improve this
    const allTasks = await redis.hkeys(TASK_STATUS_KEY);
    const pendingTasks = allTasks.filter(
      async (key) => (await redis.hget(TASK_STATUS_KEY, key)) === "pending"
    );
    if (pendingTasks.length > 0) {
      axiom.ingest("memfree", [
        { service: "queue", pendingTasks: pendingTasks.length },
      ]);
      currentInterval = MIN_INTERVAL;
    } else {
      currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL);
    }

    await processPendingTasks(pendingTasks);
    await sleep(currentInterval);
  }
}

export async function addUrlsToQueue(
  userId: string,
  urls: string[]
): Promise<string> {
  const batchId = randomUUID();
  const taskId = `${userId}:${batchId}`;
  const taskKey = `${TASK_KEY}${userId}:${batchId}`;
  await Promise.all(urls.map((url) => redis.rpush(taskKey, url)));

  await redis.hset(TASK_STATUS_KEY, { [taskId]: "pending" });

  return taskId;
}

export async function getTaskStatus(taskId: string): Promise<string> {
  const status = (await redis.hget(TASK_STATUS_KEY, taskId)) as string | null;
  console.log(`Task ${taskId} status: ${status}`);
  return status ?? "completed";
}
