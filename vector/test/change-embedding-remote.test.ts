import { describe, it, expect } from "bun:test";

const testUser = "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3001";
const API_TOKEN = process.env.API_TOKEN!;

describe("change embedding endpoint", () => {
  it("should respond with Success on valid request", async () => {
    const response = await fetch(`${host}/api/vector/change-embedding`, {
      method: "POST",
      body: JSON.stringify({
        userId: testUser,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
    });

    const text = await response.json();
    expect(response.status).toBe(200);
    expect(text).toBe("Success");
  }, 5000000);
});
