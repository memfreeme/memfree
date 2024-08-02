import { serve } from "bun";
import { urlToMarkdown } from "./reader";
import { browserService } from "./browser";

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const { method } = req;

  if (path === "/" && method === "GET") {
    const targetUrl = url.searchParams.get("url");
    if (targetUrl) {
      try {
        const markdown = await urlToMarkdown(targetUrl);
        return new Response(markdown);
      } catch (error) {
        console.error(`Failed to fetch markdown ${error}`);
        return new Response(`Failed to fetch markdown ${error}`, {
          status: 400,
        });
      }
    }
    return new Response("Welcome to mdreader");
  }
  return new Response("Welcome to mdreader");
}

const server = serve({
  port: Number(process.env.PORT) || 3000,
  fetch: handleRequest,
});

console.log(`Server is running on port ${server.port}`);

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await browserService.close();
  process.exit();
});
