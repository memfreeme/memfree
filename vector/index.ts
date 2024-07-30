import { changeEmbedding, deleteUrl, search } from "./db";
import { logError } from "./log";
import { urlExists } from "./redis";
import { isValidUrl } from "./util";
import { ingest_url, ingest_md } from "./ingest";

const API_TOKEN = process.env.API_TOKEN!;
function checkAuth(req: Request) {
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader || authorizationHeader !== `${API_TOKEN}`) {
    return Response.json("Unauthorized", { status: 401 });
  }
}

export async function handleRequest(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  const { method } = req;

  let authResponse = checkAuth(req);
  if (authResponse) {
    return authResponse;
  }

  if (path === "/api/vector/search" && method === "POST") {
    const { query, userId } = await req.json();
    try {
      const result = await search(query, userId);
      return Response.json(result);
    } catch (unknownError) {
      let errorMessage: string | null = null;

      if (unknownError instanceof Error) {
        errorMessage = unknownError.message;
      } else if (typeof unknownError === "string") {
        errorMessage = unknownError;
      }

      if (
        errorMessage &&
        errorMessage.includes("Table") &&
        errorMessage.includes("was not found")
      ) {
        return new Response(JSON.stringify([]), { status: 200 });
      }

      logError(errorMessage || "unkown", "search");
      if (errorMessage)
        return Response.json("Failed to search", { status: 500 });
    }
  }

  if (path === "/api/vector/callback" && method === "POST") {
    const { url, userId } = await req.json();
    console.log("url", url, "userId", userId);
    try {
      if (!isValidUrl(url)) {
        return Response.json("Invalid URL format", { status: 400 });
      }
      if (await urlExists(userId, url)) {
        console.log("url", url, "already exists for user", userId, "deleting");
        await deleteUrl(userId, url);
        console.log("url", url, "already exists for user", userId, "deleted");
      }
      await ingest_url(url, userId);
      return Response.json("Success");
    } catch (error) {
      logError(error as Error, "index");
      return Response.json("Failed to search", { status: 500 });
    }
  }

  if (path === "/api/index/md" && method === "POST") {
    const { url, userId, markdown, title } = await req.json();
    try {
      if (!isValidUrl(url)) {
        return Response.json("Invalid URL format", { status: 400 });
      }

      if (!userId || !markdown || !title) {
        return Response.json("Invalid parameters", { status: 400 });
      }

      console.log(
        "url",
        url,
        "userId",
        userId,
        "markdown",
        markdown.length,
        "title",
        title
      );

      await ingest_md(url, userId, markdown, title);
      return Response.json("Success");
    } catch (error) {
      logError(error as Error, "index-md");
      return Response.json("Failed to index markdown", { status: 500 });
    }
  }

  if (path === "/api/vector/change-embedding" && method === "POST") {
    const { userId } = await req.json();
    try {
      await changeEmbedding(userId);
      return Response.json("Success");
    } catch (error) {
      logError(error as Error, "change-embedding");
      return Response.json("Failed to change embedding", { status: 500 });
    }
  }

  if (path === "/") return Response.json("Welcome to memfree vector service!");
  return Response.json("Page not found", { status: 404 });
}
const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: handleRequest,
});

console.log(`Listening on ${server.url}`);
