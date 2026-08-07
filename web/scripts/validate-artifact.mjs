import { readFile } from "node:fs/promises";

const workerPath = new URL("../dist/server/index.js", import.meta.url);
const hostingPath = new URL("../dist/.openai/hosting.json", import.meta.url);

JSON.parse(await readFile(hostingPath, "utf8"));

const workerUrl = new URL(workerPath);
workerUrl.searchParams.set("validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);

if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error("dist/server/index.js must export default.fetch(request, env, ctx)");
}

console.log("Validated production artifact and hosting manifest.");
