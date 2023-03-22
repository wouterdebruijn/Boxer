import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";

const DockerEventWorker = new Worker(
  new URL("worker.ts", import.meta.url).href,
  { type: "module" },
);

const events: Record<string, unknown>[] = [];

DockerEventWorker.addEventListener("message", (event) => {
  events.push(event.data);
});

const app = new Application();

app.use((ctx) => {
  ctx.response.body = events;
});

await app.listen({ port: 8000 });
