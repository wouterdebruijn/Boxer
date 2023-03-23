import { Handlers, PageProps } from "$fresh/server.ts";

import Header from "../../../components/Header.tsx";

import {
  Container,
  ContainerController,
} from "../../../controllers/ContainerController.ts";

export const handler: Handlers<Container | null> = {
  async GET(_, ctx) {
    return ctx.render(await ContainerController.getOne(ctx.params.container));
  },
};

export default function Home({ data }: PageProps<Container | null>) {
  if (!data) {
    return <div>Container not found</div>;
  }

  return (
    <div>
      <Header />

      <h1 class="mt-7 ml-6 text-lg">Container:</h1>
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
