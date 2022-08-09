/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../../utils/twind.ts";

import Header from "../../components/Header.tsx";
import IconInfo from "../../components/IconInfo.tsx";
import Button from "../../components/Button.tsx";

const decoder = new TextDecoder();

interface Publisher {
  url: string;
  targetPort: number;
  publishedPort: number;
  protocol: string;
}
interface DockerContainer {
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

export const handler: Handlers<DockerContainer[]> = {
  async GET(_, ctx) {
    const process = Deno.run({
      cmd: [
        "docker",
        "compose",
        "-p",
        ctx.params.project,
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
      return new Response("Command returned an error.");
    }

    // Get the output of the command
    const output = JSON.parse(decoder.decode(await process.output()));

    const containers = output.map((container: Record<string, any>) => {
      return {
        id: container?.ID,
        name: container?.Name,
        command: container?.Command,
        project: container?.Project,
        service: container?.Service,
        state: container?.State,
        health: container?.Health,
        exitCode: +container?.ExitCode,
        publishers: container?.Publishers?.map(
          (port: Record<string, string>) => {
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

    return ctx.render(containers);
  },
};

export default function Project(
  { data, params }: PageProps<DockerContainer[]>,
) {
  return (
    <div>
      <Header />

      <div class={tw`relative mx-6 my-6`}>
        <h1 class={tw`text-lg`}>{params.project}:</h1>
        <div class={tw`absolute right-0 top-0 flex`}>
          <div class={tw`ml-2`}>
            <Button>
              Start
            </Button>
          </div>
          <div class={tw`ml-2`}>
            <Button>
              Stop
            </Button>
          </div>
          <div class={tw`ml-2`}>
            <Button>
              Restart
            </Button>
          </div>
        </div>
      </div>

      <div class={tw`flex flex-wrap mx-3`}>
        {data.map((container) => <Container container={container} />)}
      </div>
    </div>
  );
}

function Container({ container }: { container: DockerContainer }) {
  return (
    <div class={tw`w-full xl:w-1/2`}>
      <a
        class={tw`bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 block`}
        href={`/project/${container.project}/${container.id}`}
      >
        <p class={tw`float-right font-thin`}>
          <IconInfo /> {container.state}
        </p>
        <h1 class={tw`pb-1`}>
          Container: {container.name} {container.health ? "(healthy)" : ""}
        </h1>
        <div>
          <small
            class={tw`text-gray-500 font-thin leading-tight block truncate`}
          >
            ID: {container.id}
          </small>
          <small
            class={tw`text-gray-500 font-thin leading-tight block truncate`}
          >
            Command: {container.command}
          </small>
        </div>
        <div class={tw`float-right`}>
        </div>
      </a>
    </div>
  );
}
