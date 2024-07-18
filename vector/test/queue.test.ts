import { describe, it, expect } from "bun:test";

const testUser = "localTest";
const host = process.env.TEST_QUEUE_HOST || "http://localhost:3000";

describe("/api/vector/queue endpoint", () => {
  it("should return search results for a valid query", async () => {
    const response = await fetch(`${host}/api/enqueue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN || "",
      },
      body: JSON.stringify({
        userId: testUser,
        urls: ["https://www.memfree.me/blog", "https://www.memfree.me/"],
      }),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("taskId");
  }, 10000);
});
