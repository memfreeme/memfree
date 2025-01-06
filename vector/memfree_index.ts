import { addVectors, appendData, compact, textSplitter } from "./ingest";
import { LAST_INDEXED_TIME_KEY, redis, USER_SEARCH_KEY } from "./redis";
import type { Search } from "./type";

interface BatchSearchResult {
  searches: Search[];
  lastTimestamp: number;
  hasMore: boolean;
}

async function getBatchSearchesByTimestamp(
  userId: string,
  fromTimestamp: number,
  batchSize: number
): Promise<BatchSearchResult> {
  try {
    const searchIds: string[] = await redis.zrange(
      USER_SEARCH_KEY + userId,
      fromTimestamp,
      "+inf",
      {
        byScore: true,
        offset: 0,
        count: batchSize,
      }
    );

    if (!searchIds || searchIds.length === 0) {
      return {
        searches: [],
        lastTimestamp: fromTimestamp,
        hasMore: false,
      };
    }

    const pipeline = redis.pipeline();
    searchIds.forEach((searchId) => {
      pipeline.hgetall(searchId);
    });

    const results = (await pipeline.exec()) as Search[];

    const lastSearchScore = await redis.zscore(
      USER_SEARCH_KEY + userId,
      searchIds[searchIds.length - 1]
    );

    return {
      searches: results,
      lastTimestamp: lastSearchScore || fromTimestamp,
      hasMore: false,
    };
  } catch (error) {
    console.error("Failed to get batch searches:", error);
    return {
      searches: [],
      lastTimestamp: fromTimestamp,
      hasMore: false,
    };
  }
}

export async function processAllUserSearchMessages(
  userId: string,
  limit: number = 20
) {
  try {
    let lastIndexedTime =
      Number(await redis.get(LAST_INDEXED_TIME_KEY + userId)) || 0;
    let hasError = false;

    console.time("processSearchMessages");
    while (true) {
      console.time(`Processing batch from ${lastIndexedTime}`);

      const { searches, lastTimestamp, hasMore } =
        await getBatchSearchesByTimestamp(userId, lastIndexedTime, limit);

      if (!searches || searches.length === 0) {
        break;
      }

      await Promise.all(
        searches.map(async (search) => {
          try {
            if (!search?.messages || !Array.isArray(search.messages)) {
              return;
            }

            const messageDocumentsPromises = search.messages
              .filter((message) => message.content)
              .map((message) =>
                textSplitter.createDocuments([message.content])
              );

            const titleDocumentsPromise = textSplitter.createDocuments([
              search.title,
            ]);

            const [titleDocuments, ...messageDocumentsArrays] =
              await Promise.all([
                titleDocumentsPromise,
                ...messageDocumentsPromises,
              ]);

            const documents = [
              ...messageDocumentsArrays.flat(),
              ...titleDocuments,
            ];

            const data = await addVectors(
              "",
              search.title,
              search.id,
              documents,
              new Date(search.createdAt).getTime()
            );
            console.log("data length", data.length);
            await appendData(userId, data);

            console.log("search title ", search.title, "search id ", search.id);
          } catch (error) {
            console.error(`Failed to process search ${search.id}:`, error);
            hasError = true;
          }
        })
      );

      if (!hasError) {
        lastIndexedTime = lastTimestamp;
        await redis.set(LAST_INDEXED_TIME_KEY + userId, lastIndexedTime);
      }

      if (!hasMore || hasError) {
        break;
      }
    }

    console.timeEnd("processSearchMessages");

    await compact(userId);

    return !hasError;
  } catch (error) {
    console.error("Failed to process search messages:", error);
    return false;
  }
}
