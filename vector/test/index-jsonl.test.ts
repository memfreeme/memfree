import { describe, it, expect } from "bun:test";

const testUser = process.env.TEST_USER || "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3001";
const API_TOKEN = process.env.API_TOKEN!;

describe("jsonl endpoint", () => {
  it("should respond with Success on valid requests for multiple URLs", async () => {
    const urls = [
      "https://www.memfree.me/docs/extension-user-guide",
      "https://www.memfree.me/docs/index-bookmarks",
      "https://www.memfree.me/docs/search-engine",
      "https://www.memfree.me/docs/one-click-deploy-ai-search",
      "https://www.memfree.me/docs/deploy-searxng-fly-io",
      "https://www.memfree.me/docs/deploy-memfree-fly-io",
      "https://www.memfree.me/docs/deploy-embedding-fly-io",
      "https://www.memfree.me/changelog",
      "https://www.memfree.me/pricing",
      "https://www.memfree.me/blog",
      "https://www.memfree.me/blog/tweet-content-fast-free",
      "https://www.memfree.me/blog/hybrid-ai-search-tech-stack",
      "https://www.memfree.me/blog/serverless-vector-search-lancedb",
      "https://www.memfree.me/blog/fast-local-embedding-service",
      "https://www.memfree.me/blog/memfree-build-4-bun-gpt-4o-stream",
    ];

    const requests = urls.map((url) =>
      fetch(`${host}/api/index/jsonl`, {
        method: "POST",
        body: JSON.stringify({
          url: url,
          userId: testUser,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: API_TOKEN,
        },
      })
    );

    const responses = await Promise.all(requests);

    responses.forEach(async (response) => {
      const text = await response.json();
      expect(response.status).toBe(200);
      expect(text).toBe("Success");
    });
  }, 500000);
});
