import { addUrlsToQueue, axiom, getTaskStatus, processTasks } from "./queue";

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

  if (path === "/api/enqueue" && method === "POST") {
    const { userId, urls } = await req.json();
    try {
      const start = Date.now();

      const taskId = await addUrlsToQueue(userId, urls);

      axiom.ingest("memfree", [
        {
          service: "queue",
          action: "enqueue",
          time: Date.now() - start,
          success: true,
          urls: urls,
          userId: userId,
          taskId: taskId,
        },
      ]);
      return Response.json({ taskId: taskId }, { status: 201 });
    } catch (error) {
      axiom.ingest("memfree", [
        {
          service: "queue",
          action: "enqueue",
          success: false,
          urls: urls,
          userId: userId,
        },
      ]);
      return Response.json("Failed to enqueue URLs", { status: 500 });
    }
  }

  if (path === "/api/task-status" && method === "GET") {
    const start = Date.now();
    const { searchParams } = new URL(req.url);
    const { taskId } = Object.fromEntries(searchParams);
    const status = await getTaskStatus(taskId);
    axiom.ingest("memfree", [
      {
        service: "queue",
        action: "status",
        success: true,
        taskId: taskId,
        time: Date.now() - start,
      },
    ]);
    return Response.json({ status: status });
  }

  if (path === "/") return Response.json("Welcome to Bun!");
  return Response.json("Page not found", { status: 404 });
}
const server = Bun.serve({
  port: Bun.env.PORT || 3000,
  fetch: handleRequest,
});

processTasks();

console.log(`Listening on ${server.url}`);
