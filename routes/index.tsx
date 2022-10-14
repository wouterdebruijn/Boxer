import { Handlers, PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";

import Header from "../components/Header.tsx";
import IconInfo from "../components/IconInfo.tsx";

const decoder = new TextDecoder();

interface ComposeProject {
  name: string;
  state: string;
  configPath: string;
}

export const handler: Handlers<ComposeProject[]> = {
  async GET(_, ctx) {
    const process = Deno.run({
      cmd: ["docker", "compose", "ls", "-a", "--format", "json"],
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

    // Create clean objects from the JSON output.
    const projects: ComposeProject[] = output.map(
      (project: Record<string, never>) => {
        return {
          name: project?.Name,
          state: project?.Status,
          configPath: project?.ConfigFiles,
        };
      },
    );

    return ctx.render(projects);
  },
};

export default function Home({ data }: PageProps<ComposeProject[]>) {
  return (
    <div>
      <Header />

      <h1 class="mt-7 ml-6 text-lg">Running containers:</h1>
      <div class="flex flex-wrap mx-3">
        {data.map((project) => <Project project={project} />)}
      </div>
    </div>
  );
}

function Project(props: { project: ComposeProject }) {
  const [project] = useState(props.project);
  return (
    <div class="w-full md:w-1/2 xl:w-4/12">
      <a
        class="bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 hover:-translate-y-0.5 cursor-pointer block truncate"
        href={`/project/${project.name}`}
      >
        <p class="float-right font-thin">
          <IconInfo /> {project.state}
        </p>
        <h1 class="pb-1">
          <span>Name:</span> {project.name}
        </h1>
        <small class="text-gray-500 font-thin truncate block">
          {project.configPath}
        </small>
      </a>
    </div>
  );
}
