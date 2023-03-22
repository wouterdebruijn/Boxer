import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DockerEventBus } from "./DockerEventBus.ts";

const app = new Application();
const dockerEventBus = new DockerEventBus();

app.use((ctx) => {
  ctx.response.body = dockerEventBus.getEvents();
});

Promise.all([
    dockerEventBus.listen(),
    app.listen({ port: 8000 }),
]);