import { describe, it, expect } from "bun:test";

const testUser = "localTest";
const host = process.env.TEST_VECTOR_HOST || "http://localhost:3001";
const API_TOKEN = process.env.API_TOKEN!;

describe("/api/index/md endpoint", () => {
  it("should respond with Success on valid request", async () => {
    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.memfree.com/",
        userId: testUser,
        markdown: "# Sample Markdown",
        title: "Sample Title",
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

  it("should respond with 400 when missing fields", async () => {
    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.memfree.com/",
        userId: testUser,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
    });

    const text = await response.json();
    expect(response.status).toBe(400);
    expect(text).toBe("Invalid parameters");
  }, 50000);

  it("should respond with 400 when invalid url", async () => {
    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "invalid-url",
        userId: testUser,
        markdown: "# Sample Markdown",
        title: "Sample Title",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: API_TOKEN,
      },
    });

    const text = await response.json();
    expect(response.status).toBe(400);
    expect(text).toBe("Invalid URL format");
  }, 50000);

  it("should respond with Success on valid request with complex markdown", async () => {
    const complexMarkdown = `
# Complex Markdown
This is a paragraph with an image.

![Alt text](https://www.example.com/image.jpg)

Another paragraph with **bold** text and *italic* text.

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

- List item 1
- List item 2
    `;

    const response = await fetch(`${host}/api/index/md`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.memfree.com/",
        userId: testUser,
        markdown: complexMarkdown,
        title: "Complex Markdown Title",
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
