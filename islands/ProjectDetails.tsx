import { useEffect, useState } from "preact/hooks";
import { ProjectContainer } from "../controllers/ContainerController.ts";

import Button from "../components/Button.tsx";
import IconInfo from "../components/icons/IconInfo.tsx";
import Spinner from "../components/icons/Spinner.tsx";

interface ActionButton {
  label: string;
  action: () => void | Promise<void>;
  loading?: boolean;
}

export default function ProjectDetails(props: { project: string }) {
  const [containers, setContainers] = useState([]);

  const [actionButtons, setActionButtons] = useState<ActionButton[]>([
    {
      label: "Start",
      action: async () => {
        setButtonLoading("Start", true);
        await fetch(`/api/project`, {
          method: "PUT",
          body: JSON.stringify({ state: "start", project: props.project }),
          headers: { "Content-Type": "application/json" },
        });
        await fetchContainers(props.project);
        setButtonLoading("Start", false);
      },
      loading: false,
    },
    {
      label: "Stop",
      action: async () => {
        setButtonLoading("Stop", true);
        await fetch(`/api/project`, {
          method: "PUT",
          body: JSON.stringify({ state: "stop", project: props.project }),
          headers: { "Content-Type": "application/json" },
        });
        await fetchContainers(props.project);
        setButtonLoading("Stop", false);
      },
      loading: false,
    },
    {
      label: "Restart",
      action: async () => {
        setButtonLoading("Restart", true);
        await fetch(`/api/project`, {
          method: "PUT",
          body: JSON.stringify({ state: "restart", project: props.project }),
          headers: { "Content-Type": "application/json" },
        });
        await fetchContainers(props.project);
        setButtonLoading("Restart", false);
      },
      loading: false,
    },
  ]);

  function setButtonLoading(label: string, loading: boolean) {
    const buttons = [...actionButtons];
    const button = buttons.find((b) => b.label === label);
    if (button) {
      button.loading = loading;
    }

    setActionButtons(buttons);
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

  if (containers.length === 0) {
    return (
      <div class="p-10 text-yellow-400 flex items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div>
      <div class="relative mx-6 my-6">
        <h1 class="text-lg">{props.project ?? ""}:</h1>
        <div class="absolute right-0 top-0 flex">
          {actionButtons.map((button) => (
            <div class="ml-2">
              <Button
                onClick={button.action}
              >
                {button.label}
                {button.loading && (
                  <span class="ml-2">
                    <Spinner />
                  </span>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div class="flex flex-wrap mx-3">
        {containers.map((container) => <Container container={container} />)}
      </div>
    </div>
  );
}

function Container({ container }: { container: ProjectContainer }) {
  return (
    <div class="w-full xl:w-1/2">
      <a
        class="bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 block"
        href={`/project/${container.project}/${container.id}`}
      >
        <p class="float-right font-thin">
          <IconInfo /> {container.state}
        </p>
        <h1 class="pb-1">
          Container: {container.name} {container.health ? "(healthy)" : ""}
        </h1>
        <div>
          <small class="text-gray-500 font-thin leading-tight block truncate">
            ID: {container.id}
          </small>
          <small class="text-gray-500 font-thin leading-tight block truncate">
            Command: {container.command}
          </small>
        </div>
        <div class="float-right">
        </div>
      </a>
    </div>
  );
}
