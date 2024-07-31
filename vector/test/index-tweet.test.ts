import { describe, it, expect } from "bun:test";

const testUser = "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3001";
const API_TOKEN = process.env.API_TOKEN!;

describe("/api/index/md endpoint", () => {
  it("should respond with Success on valid request", async () => {
    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://x.com/ahaapple2023/status/1816118637696279006",
        userId: testUser,
        markdown: "# Sample Markdown",
        title: "memfree twitter",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
    });

    const text = await response.json();
    expect(response.status).toBe(200);
    expect(text).toBe("Success");
  }, 50000);

  it("should respond with Success on valid request", async () => {
    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://x.com/ahaapple2023/status/1811417791528063189",
        userId: testUser,
        markdown: "# Sample Markdown",
        title: "memfree twitter",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
    });

    const text = await response.json();
    expect(response.status).toBe(200);
    expect(text).toBe("Success");
  }, 50000);
});
