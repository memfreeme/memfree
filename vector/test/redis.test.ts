import { expect, describe, it, beforeEach } from "bun:test";
import * as redis from "../redis";

const userId = "test_user_memfree_2024";
const url1 = "https://example.com";
const url2 = "https://another-example.com";

describe("Redis Client Integration Tests", () => {
  beforeEach(async () => {
    await redis.redis.del(
      `${redis.URLS_KEY}${userId}`,
      `${redis.INDEX_COUNT_KEY}${userId}`,
      `${redis.SEARCH_COUNT_KEY}${userId}`
    );
  });

  it("should add a URL and retrieve the latest URL", async () => {
    const initialTotalIndexCount = await redis.getTotalIndexCount();
    await redis.addUrl(userId, url1);
    const latestUrl1 = await redis.getLatestUrl(userId);
    expect(latestUrl1).toBe(url1);

    const userIndexCount = await redis.getIndexCount(userId);
    const totalIndexCount = await redis.getTotalIndexCount();
    expect(userIndexCount).toBe(1);
    expect(totalIndexCount).toBe(initialTotalIndexCount + 1);

    await redis.addUrl(userId, url2);
    const latestUrl2 = await redis.getLatestUrl(userId);
    expect(latestUrl2).toBe(url2);
  });

  it("should increment index count correctly", async () => {
    const initialTotalIndexCount = await redis.getTotalIndexCount();

    await redis.incIndexCount(userId);

    const userIndexCount = await redis.getIndexCount(userId);
    const totalIndexCount = await redis.getTotalIndexCount();

    expect(userIndexCount).toBe(1);
    expect(totalIndexCount).toBe(initialTotalIndexCount + 1);

    await redis.incIndexCount(userId);

    expect(await redis.getIndexCount(userId)).toBe(2);
    expect(await redis.getTotalIndexCount()).toBe(initialTotalIndexCount + 2);
  });

  it("should check if a URL exists", async () => {
    await redis.addUrl(userId, url1);
    expect(await redis.urlExists(userId, url1)).toBe(true);
    expect(await redis.urlExists(userId, url2)).toBe(false);
  });
});
