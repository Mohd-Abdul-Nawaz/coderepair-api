/** HTTP server for coderepair-api (zero runtime dependencies). */
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { AttemptStore, getPublicTask, listPublicTasks } from "./store.js";

const store = new AttemptStore();

function send(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createApp(): Server {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = (req.method ?? "GET").toUpperCase();

    if (method === "GET" && url.pathname === "/health") {
      send(res, 200, { status: "ok", version: "0.1.0" });
      return;
    }
    if (method === "GET" && url.pathname === "/tasks") {
      send(res, 200, { tasks: listPublicTasks() });
      return;
    }
    const taskMatch = url.pathname.match(/^\/tasks\/([\w-]+)$/);
    if (method === "GET" && taskMatch) {
      const task = getPublicTask(taskMatch[1]);
      if (!task) {
        send(res, 404, { error: "task not found" });
        return;
      }
      send(res, 200, { task });
      return;
    }
    const attemptsMatch = url.pathname.match(/^\/tasks\/([\w-]+)\/attempts$/);
    if (method === "GET" && attemptsMatch) {
      const task = getPublicTask(attemptsMatch[1]);
      if (!task) {
        send(res, 404, { error: "task not found" });
        return;
      }
      send(res, 200, { attempts: store.forTask(task.id) });
      return;
    }
    if (method === "POST" && url.pathname === "/attempts") {
      let payload: any;
      try {
        payload = JSON.parse((await readBody(req)) || "{}");
      } catch {
        send(res, 400, { error: "invalid JSON body" });
        return;
      }
      const result = store.submit(
        String(payload.taskId ?? ""),
        String(payload.author ?? ""),
        String(payload.code ?? "")
      );
      if ("error" in result) {
        send(res, 400, result);
        return;
      }
      send(res, result.passed ? 201 : 200, { attempt: result });
      return;
    }
    if (method === "GET" && url.pathname === "/leaderboard") {
      send(res, 200, { leaderboard: store.leaderboard() });
      return;
    }
    send(res, 404, { error: "not found" });
  });
}

export function start(port: number): Server {
  const server = createApp();
  server.listen(port, () => {
    console.log(`coderepair-api listening on http://localhost:${port}`);
  });
  return server;
}
