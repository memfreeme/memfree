import { describe, it, expect } from "bun:test";

const testUser = process.env.TEST_USER || "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3002";
const API_TOKEN = process.env.API_TOKEN!;

it("should return search results for a valid query", async () => {
  const response = await fetch(`${host}/api/vector/compact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_TOKEN,
    },
    body: JSON.stringify({
      userId: testUser,
    }),
  });

  const json = await response.json();
  console.log(json);
  expect(response.status).toBe(200);
}, 1000000);
