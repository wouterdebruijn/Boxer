/** @jsx h */
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { tw } from "@twind";
import Button from "../components/Button.tsx";
import { DockerContainer } from "../routes/api/containers/[project].ts";
import IconInfo from "../components/IconInfo.tsx";

const decoder = new TextDecoder();

export default function ProjectDetails(props: { project: string }) {
  const [containers, setContainers] = useState([]);

  async function stopProject() {
    await fetch(`/api/project`, { method: "PUT", body: JSON.stringify({ state: "stop", project: props.project }), headers: { "Content-Type": "application/json" } });
    await fetchContainers(props.project);
  }

  async function startProject() {
    await fetch(`/api/project`, { method: "PUT", body: JSON.stringify({ state: "start", project: props.project }), headers: { "Content-Type": "application/json" } });
    await fetchContainers(props.project);
  }

  async function fetchContainers(
    project: string,
  ): Promise<void> {
    await fetch(`/api/containers/${project}`).then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error("Could not fetch containers.");
      }
    }).then((containers) => {
      return setContainers(containers);
    }).catch((err) => {
      console.error(err);
    });
  }

  useEffect(() => {
    fetchContainers(props.project);
  }, [props.project]);

  return (
    <div>
      <div class={tw`relative mx-6 my-6`}>
        <h1 class={tw`text-lg`}>{props.project ?? ""}:</h1>
        <div class={tw`absolute right-0 top-0 flex`}>
          <div class={tw`ml-2`}>
            <Button onClick={() => startProject()}>
              Start
            </Button>
          </div>
          <div class={tw`ml-2`}>
            <Button onClick={() => stopProject()}>
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
        {containers.map((container) => <Container container={container} />)}
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
