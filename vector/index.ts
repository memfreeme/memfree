import { changeEmbedding, compact, deleteUrls, search } from "./db";
import { log, logError } from "./log";
import { addErrorUrl, addUrl, urlExists } from "./redis";
import { isValidUrl } from "./util";
import {
  ingest_url,
  ingest_md,
  ingest_jsonl,
  ingest_text_content,
} from "./ingest";

import { getFileContent } from "./parser";
import { checkAuth, getToken } from "./auth";

const allowedOrigins = ["http://localhost:3000", "https://www.memfree.me"];

async function handleRequest(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  const { method } = req;

  if (method === "OPTIONS") {
    const origin = req.headers.get("Origin");
    if (origin && allowedOrigins.includes(origin)) {
      return new Response("OK", {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type, Token",
        },
      });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  let authResponse = checkAuth(req, path);
  if (authResponse) {
    return authResponse;
  }

  if (path === "/api/vector/search" && method === "POST") {
    const { query, userId, url } = await req.json();
    try {
      const result = await search(query, userId, url);
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
      if (errorMessage)
        return Response.json("Failed to search", { status: 500 });
    }
  }

  if (path === "/api/vector/delete" && method === "POST") {
    const { urls, userId } = await req.json();
    try {
      await deleteUrls(userId, urls);
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
      await compact(userId);
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

  if (path === "/api/index/url" && method === "POST") {
    const { url, userId } = await req.json();
    try {
      if (!isValidUrl(url)) {
        return Response.json("Invalid URL format", { status: 400 });
      }
      await ingest_url(url, userId);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-index-url",
        error: `${error}`,
        url: url,
        userId: userId,
      });
      await addErrorUrl(userId, url);
      return Response.json(`Failed to search ${error}`, { status: 500 });
    }
  }

  if (path === "/api/index/local-file" && method === "POST") {
    const startTime = new Date().getTime();
    const token = await getToken(req, server.development);
    if (!token) {
      return Response.json("Unauthorized", { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = token.sub;
    let url = file.name;
    try {
      const fileContent = await getFileContent(file);
      const { type, markdown } = fileContent;
      url = fileContent.url;
      const title = file.name;

      if (!userId || !markdown || !title) {
        return Response.json("Invalid parameters", { status: 400 });
      }

      const existedUrl = await urlExists(userId, url);
      if (existedUrl) {
        await deleteUrls(userId, [url]);
        log({
          service: "vector-index",
          action: "delete-local-file",
          userId: userId,
          url: url,
        });
      }

      switch (type) {
        case "md":
          await ingest_md(url, userId, markdown, title);
          break;
        case "pdf":
        case "docx":
        case "pptx":
          await ingest_text_content(url, userId, markdown, title);
          break;
        default:
          return Response.json("Invalid file type", { status: 400 });
      }

      const indexCount = await addUrl(userId, url);
      if (indexCount % 50 === 0) {
        await compact(userId);
        log({
          service: "vector-index",
          action: "compact-local-file",
          userId: userId,
          url: url,
        });
      }

      log({
        service: "vector-index",
        action: "index-local-file",
        userId: userId,
        size: markdown.length,
        time: new Date().getTime() - startTime,
      });

      const response = Response.json([
        {
          url: url,
          name: file.name,
          type: file.type,
        },
      ]);
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      return response;
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-index-file",
        error: `${error}`,
        url: url,
        userId: userId,
      });
      return Response.json("Failed to index markdown", { status: 500 });
    }
  }

  if (path === "/api/index/file" && method === "POST") {
    const { url, userId, markdown, title, type } = await req.json();
    try {
      if (!userId || !markdown || !title) {
        return Response.json("Invalid parameters", { status: 400 });
      }
      switch (type) {
        case "md":
          await ingest_md(url, userId, markdown, title);
          break;
        case "pdf":
        case "docx":
        case "pptx":
          await ingest_text_content(url, userId, markdown, title);
          break;
        default:
          return Response.json("Invalid file type", { status: 400 });
      }
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-index-file",
        error: `${error}`,
        url: url,
        userId: userId,
      });
      return Response.json("Failed to index markdown", { status: 500 });
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
      await ingest_md(url, userId, markdown, title);
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

  if (path === "/api/index/jsonl" && method === "POST") {
    const { url, userId } = await req.json();
    try {
      if (!isValidUrl(url)) {
        return Response.json("Invalid URL format", { status: 400 });
      }
      await ingest_jsonl(url, userId);
      return Response.json("Success");
    } catch (error) {
      log({
        service: "vector-index",
        action: "error-index-jsonl",
        error: `${error}`,
        url: url,
        userId: userId,
      });
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

export const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch: handleRequest,
});

console.log(`Listening on ${server.url}, is dev: ${server.development}`);
