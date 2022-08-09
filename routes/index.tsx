/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Header } from "../components/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";

const decoder = new TextDecoder();

interface ComposeProject {
  name: string;
  state: string;
  configPath: string;
}

export const handler: Handlers<ComposeProject[]> = {
  async GET(_, ctx) {
    const process = Deno.run({
      cmd: ["docker", "compose", "ls", "-a"],
      stderr: "piped",
      stdout: "piped",
    });
    const status = await process.status();

    if (!status.success) {
      console.error(decoder.decode(await process.stderrOutput()));
      return new Response("Command returned an error.");
    }

    // Get the output of the command
    const output = decoder.decode(await process.output());

    // Split the table style output into an array divided by the whitespace and linebreak.
    const separatedOutput = output.split(/( {2,})|\n|\r/);

    // Remove any whitespace and linebreaks from the split array.
    const cleanedOutput = separatedOutput.filter((item) => {
      // Remove non string items
      if (typeof item !== "string" || item.length == 0) return;

      // Remove spaces and whitespace
      if (item.match(/( {1,})|\n|\r/) === null) {
        return ctx.render([]);
      }
      return;
    });

    // Create storage for the about to be created projects
    const projects: ComposeProject[] = [];

    // Create projects using the data from the parsed docker compose command.
    for (let i = 2; i < cleanedOutput.length; i += 3) {
      projects.push({
        name: cleanedOutput[i],
        state: cleanedOutput[i + 1],
        configPath: cleanedOutput[i + 2],
      });
    }
    return ctx.render(projects);
  },
};

export default function Home({ data }: PageProps<ComposeProject[]>) {
  return (
    <div>
      <Header />

      <h1 class={tw`mt-7 ml-6 text-lg`}>Running containers:</h1>
      <div class={tw`flex flex-wrap mx-3`}>
        {data.map((project) => <Project project={project} />)}
      </div>
    </div>
  );
}

function Project(props: { project: ComposeProject }) {
  const [project] = useState(props.project);
  return (
    <div class={tw`w-full md:w-1/2 xl:w-4/12`}>
      <a
        class={tw`bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 truncate hover:-translate-y-0.5 cursor-pointer block`}
        href={`/project/${project.name}`}
      >
        <p class={tw`float-right font-thin`}>{project.state}</p>
        <h1 class={tw`pb-1`}>
          <span>Name:</span> {project.name}
        </h1>
        <small class={tw`text-gray-500 font-thin`}>
          {project.configPath}
        </small>
      </a>
    </div>
  );
}
