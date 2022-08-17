import { Handlers } from "$fresh/server.ts";
import { DockerContainer } from "./containers/[project].ts";

const decoder = new TextDecoder();

export const handler: Handlers<DockerContainer[] | null> = {
  async PUT(req) {
    const body = await req.json();

    if (typeof body.state !== "string" || typeof body.project !== "string") {
      return new Response();
    }

    const acceptedStates = ["start", "stop", "restart"];

    if (!acceptedStates.includes(body.state)) {
      return new Response();
    }

    const process = Deno.run({
      cmd: [
        "docker",
        "compose",
        "-p",
        body.project,
        body.state,
      ],
      stderr: "piped",
      stdout: "piped",
    });
    const status = await process.status();

    if (!status.success) {
      console.error(decoder.decode(await process.stderrOutput()));
      return new Response();
    }

    return new Response(decoder.decode(await process.output()));
  },
};
