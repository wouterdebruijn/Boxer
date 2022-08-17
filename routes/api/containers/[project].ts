import { Handlers } from "$fresh/server.ts";

const decoder = new TextDecoder();

interface Publisher {
  url: string;
  targetPort: number;
  publishedPort: number;
  protocol: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  command: string;
  project: string;
  service: string;
  state: string;
  health: string;
  exitCode: number;
  publishers: Publisher[];
}

async function fetchContainers(
  project: string,
): Promise<DockerContainer[] | null> {
  const process = Deno.run({
    cmd: [
      "docker",
      "compose",
      "-p",
      project,
      "ps",
      "--format",
      "json",
    ],
    stderr: "piped",
    stdout: "piped",
  });
  const status = await process.status();

  if (!status.success) {
    console.error(decoder.decode(await process.stderrOutput()));
    return null;
  }

  // Get the output of the command
  const output = JSON.parse(decoder.decode(await process.output()));

  const containers = output.map((container: Record<string, unknown>) => {
    return {
      id: container?.ID,
      name: container?.Name,
      command: container?.Command,
      project: container?.Project,
      service: container?.Service,
      state: container?.State,
      health: container?.Health,
      exitCode: +<string> container?.ExitCode,
      publishers: (<Array<Record<string, string>>> container?.Publishers)?.map(
        (port) => {
          return {
            url: port?.URL,
            targetPort: +port?.TargetPort,
            publishedPort: +port?.PublishedPort,
            protocol: port?.Protocol,
          };
        },
      ),
    } as DockerContainer;
  });
  return containers;
}

export const handler: Handlers<DockerContainer[] | null> = {
  async GET(_, ctx) {
    const containers = await fetchContainers(ctx.params.project);
    return new Response(JSON.stringify(containers));
  },
};
