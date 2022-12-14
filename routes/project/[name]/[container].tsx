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

export const handler: Handlers<Container | null> = {
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
      console.error(
        `Error while executing process: ${process.pid}`,
        decoder.decode(await process.stderrOutput()),
      );
      return ctx.render(null);
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

export default function Home({ data }: PageProps<Container | null>) {
  if (!data) {
    return <div>Container not found</div>;
  }

  return (
    <div>
      <Header />

      <h1 class="mt-7 ml-6 text-lg">CONTAINER:</h1>
      <div class="flex flex-wrap mx-3">
        <div class="w-full">
          <a class="bg-white shadow-md rounded-xl p-7 m-2 bg-clip-padding border border-gray-200 block">
            <small class="float-right text-gray-500 font-thin">
              {data.id}
            </small>
            <h1 class="pb-1">
              <span>Name:</span> {data.name}
            </h1>
            <ul class="font-thin text-sm space-y-2 break-all">
              <li>
                Image: <pre class="inline">{data.config.image}</pre>
              </li>
              <li>
                Created:{" "}
                <pre class="inline">{data.created.toLocaleString()}</pre>
              </li>
              <li>
                Path: <pre class="inline">{data.path}</pre>
              </li>
              <li>
                Args: <pre class="inline">{data.args.join(", ")}</pre>
              </li>
              <li>
                State: <pre class="inline">{data.state.status}</pre>
              </li>
              <li>
                Running: <pre class="inline">
                  {data.state.running ? "Yes" : "No"}
                </pre>
              </li>
              <li>
                Paused:{" "}
                <pre class="inline">{data.state.paused ? "Yes" : "No"}</pre>
              </li>
              <li>
                Restarting: <pre class="inline">
                  {data.state.restarting ? "Yes" : "No"}
                </pre>
              </li>
              <li>
                OOMKilled: <pre class="inline">
                  {data.state.oomKilled ? "Yes" : "No"}
                </pre>
              </li>
              <li>
                Dead: <pre class="inline">{data.state.dead ? "Yes" : "No"}</pre>
              </li>
              <li>
                PID: <pre class="inline">{data.state.pid}</pre>
              </li>
              <li>
                ExitCode: <pre class="inline">{data.state.exitCode}</pre>
              </li>
              <li>
                Error: <pre class="inline">{data.state.error}</pre>
              </li>
              <li>
                StartedAt: <pre class="inline">
                  {data.state.startedAt.toLocaleString()}
                </pre>
              </li>
              <li>
                FinishedAt: <pre class="inline">
                  {data.state.finishedAt.toLocaleString()}
                </pre>
              </li>
              <li>
                RestartCount: <pre class="inline">{data.restartCount}</pre>
              </li>
              <li>
                Platform: <pre class="inline">{data.platform}</pre>
              </li>
              <li>
                RestartPolicy:{" "}
                <pre class="inline">{data.restartPolicy.name}</pre>
              </li>
              <li>
                MaximumRetryCount: <pre class="inline">
                  {data.restartPolicy.maximumRetryCount}
                </pre>
              </li>
              <li>
                CPUCount: <pre class="inline">{data.cpuCount}</pre>
              </li>
              <li>
                CPUPercent: <pre class="inline">{data.cpuPercent}</pre>
              </li>
              {data.networkSettings.networks.map((network) => (
                network.ipAddress
                  ? (
                    <li>
                      {network.name}: <pre class="inline">
                        IP: {network.ipAddress} Gateway: {network.gateway}
                      </pre>
                    </li>
                  )
                  : null
              ))}
            </ul>
          </a>
        </div>
      </div>
    </div>
  );
}
