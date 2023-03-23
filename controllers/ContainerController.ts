export interface DockerNetwork {
  name: string;
  ipAddress: string;
  networkId: string;
  gateway: string;
}

export interface Container {
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

interface Publisher {
  url: string;
  targetPort: number;
  publishedPort: number;
  protocol: string;
}

export interface ProjectContainer {
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

export class ContainerController {
  private static decoder = new TextDecoder();

  private static formatNetworks(
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

  public static async get(project: string) {
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
      console.error(this.decoder.decode(await process.stderrOutput()));
      return null;
    }

    // Get the output of the command
    const output = JSON.parse(this.decoder.decode(await process.output()));

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
        publishers: (<Array<Record<string, string>>> container?.Publishers)
          ?.map(
            (port) => {
              return {
                url: port?.URL,
                targetPort: +port?.TargetPort,
                publishedPort: +port?.PublishedPort,
                protocol: port?.Protocol,
              };
            },
          ),
      };
    }) as ProjectContainer[];
    return containers;
  }

  public static async getOne(containerId: string) {
    const process = Deno.run({
      cmd: [
        "docker",
        "inspect",
        containerId,
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
        this.decoder.decode(await process.stderrOutput()),
      );
      return null;
    }

    // Get the output of the command
    const output = JSON.parse(this.decoder.decode(await process.output()));

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
        networks: this.formatNetworks(output.NetworkSettings.Networks),
      },
    };
    return container;
  }
}
