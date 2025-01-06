import { log } from "./log";
import {
  clearUserIndexing,
  isUserFullIndexed,
  isUserIndexing,
  markUserFullIndexed,
  markUserIndexing,
} from "./redis";
import { ingest_text_content } from "./ingest";

import { checkAuth } from "./auth";
import { DatabaseFactory } from "./db";
import { dbConfig } from "./config";
import { documentSchema } from "./schema";
import { processAllUserSearchMessages } from "./memfree_index";

const allowedOrigins = ["http://localhost:3000", "https://www.memfree.me"];

const db = DatabaseFactory.createDatabase(dbConfig, documentSchema);

async function handleRequest(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  const { method } = req;

  // if (method === "OPTIONS") {
  //   const origin = req.headers.get("Origin");
  //   if (origin && allowedOrigins.includes(origin)) {
  //     return new Response("OK", {
  //       headers: {
  //         "Access-Control-Allow-Origin": origin,
  //         "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  //         "Access-Control-Allow-Headers": "Authorization, Content-Type, Token",
  //       },
  //     });
  //   } else {
  //     return new Response("Forbidden", { status: 403 });
  //   }
  // }

  let authResponse = checkAuth(req, path);
  if (authResponse) {
    return authResponse;
  }

  if (path === "/api/vector/search" && method === "POST") {
    const { query, userId } = await req.json();
    try {
      const result = await db.search(userId, query, {
        selectFields: ["title", "text", "url", "image"],
      });
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

      log({
        service: "vector-search",
        action: `error-search`,
        error: `${errorMessage}`,
        query: query,
        userId: userId,
      });
      if (errorMessage) {
        return Response.json("Failed to search", { status: 500 });
      }
    }
  }

  if (path === "/api/vector/delete" && method === "POST") {
    const { urls, userId } = await req.json();
    try {
      await db.deleteUrls(userId, urls);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-delete-urls",
        error: `${error}`,
        urls: urls,
        userId: userId,
      });
      return Response.json("Failed to delete urls", { status: 500 });
    }
  }

  if (path === "/api/vector/compact" && method === "POST") {
    const { userId } = await req.json();
    try {
      console.time(`compact-${userId}`);
      await db.compact(userId);
      console.timeEnd(`compact-${userId}`);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-compact",
        error: `${error}`,
        userId: userId,
      });
      return Response.json("Failed to compact", { status: 500 });
    }
  }

  if (path === "/api/index/full" && method === "POST") {
    const { userId } = await req.json();
    try {
      const indexed = await isUserFullIndexed(userId);
      if (indexed) {
        return Response.json("Already indexed", { status: 200 });
      }

      const indexing = await isUserIndexing(userId);
      if (indexing) {
        return Response.json("Indexing in progress", { status: 409 }); // 409 Conflict
      }

      await markUserIndexing(userId);

      const success = await processAllUserSearchMessages(userId);
      if (!success) {
        return Response.json("Failed to index all users", { status: 500 });
      }
      await markUserFullIndexed(userId);
      await clearUserIndexing(userId);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "history-full-index",
        error: `${error}`,
        userId: userId,
      });
      await clearUserIndexing(userId);
      return Response.json(`Failed to search ${error}`, { status: 500 });
    }
  }

  if (path === "/api/index/single" && method === "POST") {
    const { url, userId, text, title } = await req.json();
    try {
      if (!userId || !text || !title) {
        return Response.json("Invalid parameters", { status: 400 });
      }
      console.log("Indexing single", url, userId, text.length, title);
      await ingest_text_content(url, userId, text, title);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-index-md",
        error: `${error}`,
        url: url,
        userId: userId,
      });
      return Response.json("Failed to index markdown", { status: 500 });
    }
  }

  if (path === "/") return Response.json("Welcome to memfree vector service!");
  return Response.json("Page not found", { status: 404 });
}

export const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: handleRequest,
});

console.log(`Listening on ${server.url}, is dev: ${server.development}`);
