import { describe, it, expect } from "bun:test";

const testUser = "localTest";
const host = "http://localhost:3001";

describe("/api/vector/callback endpoint", () => {
  it("should respond with Success on valid request", async () => {
    const response = await fetch(`${host}/api/vector/callback`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.memfree.me/",
        userId: testUser,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.json();
    expect(response.status).toBe(200);
    expect(text).toBe("Success");
  }, 50000);

  it("should respond with Failed to search on error", async () => {
    const mockUrl = "invalidURL";

    const response = await fetch(`${host}/api/vector/callback`, {
      method: "POST",
      body: JSON.stringify({ url: mockUrl, userId: testUser }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.json();
    expect(response.status).toBe(400);
    expect(text).toBe("Invalid URL format");
  });
});
