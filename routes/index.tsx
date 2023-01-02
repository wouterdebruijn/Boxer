import { Handlers, PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";

import Header from "../components/Header.tsx";
import IconInfo from "../components/icons/IconInfo.tsx";
import {
  ComposeProject,
  ProjectController,
} from "../controllers/ProjectController.ts";

export const handler: Handlers<ComposeProject[]> = {
  async GET(_, ctx) {
    return ctx.render(await ProjectController.get());
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
