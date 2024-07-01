import { describe, it, expect } from "bun:test";

const testUser = "localTest";

const host = "http://localhost:3001";

describe("/api/queue endpoint", () => {
  it("should return search results for a valid query", async () => {
    const params = new URLSearchParams({
      userId: testUser,
      batchId: "04201743-1a4d-4582-a31e-299878acce94",
    }).toString();
    const response = await fetch(`${host}/api/task-status?${params}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody).toHaveProperty("status");
  }, 10000);
});
