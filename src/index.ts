/** Entrypoint: `npm run build && npm start`. */
import { start } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port <= 0) {
  console.error("PORT must be a positive integer");
  process.exit(1);
}

start(port);
