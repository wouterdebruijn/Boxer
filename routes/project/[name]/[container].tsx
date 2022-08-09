/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";

import Header from "../../../components/Header.tsx";

const decoder = new TextDecoder();

interface DockerNetwork {
  name: string;
  ipAddress: string;
  networkId: string;
  gateway: string;
}

interface Container {
  id: string;
  created: Date;
  path: string;
  args: string[];
  state: {
    status: string;
    running: boolean;
    paused: boolean;
    restarting: boolean;
    oomKilled: boolean;
    dead: boolean;
    pid: number;
    exitCode: number;
    error: string;
    startedAt: Date;
    finishedAt: Date;
  };
  image: string;
  name: string;
  restartCount: number;
  platform: string;
  restartPolicy: {
    name: string;
    maximumRetryCount: number;
  };
  cpuCount: number;
  cpuPercent: number;
  config: {
    image: string;
  };
  networkSettings: {
    networks: DockerNetwork[];
  };
}

export const handler: Handlers<any> = {
  async GET(_, ctx) {
    const process = Deno.run({
      cmd: [
        "docker",
        "inspect",
        ctx.params.container,
        "--format",
        "{{json .}}",
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

    // Create clean objects from the JSON output.
    const container: Container = {
      id: output.Id,
      created: new Date(output.Created),
      path: output.Path,
      args: output.Args,
      state: {
        status: output.State.Status,
        running: output.State.Running,
        paused: output.State.Paused,
        restarting: output.State.Restarting,
        oomKilled: output.State.OOMKilled,
        dead: output.State.Dead,
        pid: output.State.Pid,
        exitCode: output.State.ExitCode,
        error: output.State.Error,
        startedAt: new Date(output.State.StartedAt),
        finishedAt: new Date(output.State.FinishedAt),
      },
      image: output.Image,
      config: {
        image: output.Config.Image,
      },
      cpuCount: output.HostConfig.CpuCount,
      cpuPercent: output.HostConfig.CpuPercent,
      name: output.Name,
      restartCount: output.RestartCount,
      platform: output.Platform,
      restartPolicy: {
        name: output.HostConfig.RestartPolicy.Name,
        maximumRetryCount: output.HostConfig.RestartPolicy.MaximumRetryCount,
      },
      networkSettings: {
        networks: formatNetworks(output.NetworkSettings.Networks),
      },
    };

    return ctx.render(container);
  },
};

function formatNetworks(
  networks: Record<string, Record<string, string>>,
): DockerNetwork[] {
  const result: DockerNetwork[] = [];
  Object.keys(networks).every((key) => {
    result.push({
      name: key,
      ipAddress: networks[key].IPAddress,
      networkId: networks[key].NetworkID,
      gateway: networks[key].Gateway,
    });
  });
  return result;
}

export default function Home({ data }: PageProps<Container>) {
  return (
    <div>
      <Header />

      <h1 class={tw`mt-7 ml-6 text-lg`}>CONTAINER:</h1>
      <div class={tw`flex flex-wrap mx-3`}>
        <div class={tw`w-full`}>
          <a
            class={tw`bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 cursor-pointer block`}
          >
            <small class={tw`float-right text-gray-500 font-thin`}>
              {data.id}
            </small>
            <h1 class={tw`pb-1`}>
              <span>Name:</span> {data.name}
            </h1>
            <ul class={tw`font-thin text-sm space-y-2 break-all`}>
              <li>Image: <pre class={tw`inline`}>{data.config.image}</pre></li>
              <li>Created: <pre class={tw`inline`}>{data.created.toLocaleString()}</pre></li>
              <li>Path: <pre class={tw`inline`}>{data.path}</pre></li>
              <li>Args: <pre class={tw`inline`}>{data.args.join(", ")}</pre></li>
              <li>State: <pre class={tw`inline`}>{data.state.status}</pre></li>
              <li>Running: <pre class={tw`inline`}>{data.state.running ? "Yes" : "No"}</pre></li>
              <li>Paused: <pre class={tw`inline`}>{data.state.paused ? "Yes" : "No"}</pre></li>
              <li>Restarting: <pre class={tw`inline`}>{data.state.restarting ? "Yes" : "No"}</pre></li>
              <li>OOMKilled: <pre class={tw`inline`}>{data.state.oomKilled ? "Yes" : "No"}</pre></li>
              <li>Dead: <pre class={tw`inline`}>{data.state.dead ? "Yes" : "No"}</pre></li>
              <li>PID: <pre class={tw`inline`}>{data.state.pid}</pre></li>
              <li>ExitCode: <pre class={tw`inline`}>{data.state.exitCode}</pre></li>
              <li>Error: <pre class={tw`inline`}>{data.state.error}</pre></li>
              <li>StartedAt: <pre class={tw`inline`}>{data.state.startedAt.toLocaleString()}</pre></li>
              <li>FinishedAt: <pre class={tw`inline`}>{data.state.finishedAt.toLocaleString()}</pre></li>
              <li>RestartCount: <pre class={tw`inline`}>{data.restartCount}</pre></li>
              <li>Platform: <pre class={tw`inline`}>{data.platform}</pre></li>
              <li>RestartPolicy: <pre class={tw`inline`}>{data.restartPolicy.name}</pre></li>
              <li>MaximumRetryCount: <pre class={tw`inline`}>{data.restartPolicy.maximumRetryCount}</pre></li>
              <li>CPUCount: <pre class={tw`inline`}>{data.cpuCount}</pre></li>
              <li>CPUPercent: <pre class={tw`inline`}>{data.cpuPercent}</pre></li>
                {data.networkSettings.networks.map((network) => (
                  <li>
                    {network.name}: <pre class={tw`inline`}>IP: {network.ipAddress} Gateway: {network.gateway}</pre>
                  </li>
                ))}
            </ul>
          </a>
        </div>
      </div>
    </div>
  );
}
