import { describe, it, expect } from "bun:test";

const testUser = process.env.TEST_USER || "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3001";
const API_TOKEN = process.env.API_TOKEN!;

describe("/api/vector/search endpoint", () => {
  it("should return search results for a valid query", async () => {
    const query = "memfree";

    const response = await fetch(`${host}/api/vector/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify({
        query: query,
        userId: testUser,
      }),
    });

    const json = await response.json();
    console.log(json);
    expect(response.status).toBe(200);
    expect(json).toEqual(expect.any(Object));
  }, 100000);

  it("seaech with url", async () => {
    const query = "memfree";

    const response = await fetch(`${host}/api/vector/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify({
        query: query,
        userId: testUser,
        url: "https://www.memfree.me/",
      }),
    });

    const json = await response.json();
    console.log(json);
    expect(response.status).toBe(200);
    expect(json).toEqual(expect.any(Object));
  }, 100000);

  it("should return empty results for not found user", async () => {
    const query = "memfree";
    const notFoundUser = "notFoundUser";

    const response = await fetch(`${host}/api/vector/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
      body: JSON.stringify({
        query: query,
        userId: notFoundUser,
      }),
    });

    const json = await response.json();
    console.log(json);
    expect(response.status).toBe(200);
    expect(json).toEqual([]);
  }, 10000);

  it("should return 401", async () => {
    const query = "memfree";
    const notFoundUser = "notFoundUser";

    const response = await fetch(`${host}/api/vector/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        userId: notFoundUser,
      }),
    });

    const json = await response.json();
    console.log(json);
    expect(response.status).toBe(401);
  }, 10000);
});
