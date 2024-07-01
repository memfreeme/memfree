import { search } from "./db";
import { incSearchCount } from "./redis";
import { isValidUrl } from "./util";
import { build_vector_for_url } from "./web";

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
      // Without awaiting incSearchCount to avoid blocking response time
      incSearchCount(userId).catch((error) => {
        console.error(
          `Failed to increment search count for user ${userId}:`,
          error
        );
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

      console.error(unknownError);
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
      await build_vector_for_url(url, userId);
      return Response.json("Success");
    } catch (error) {
      console.error(error);
      return Response.json("Failed to search", { status: 500 });
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
