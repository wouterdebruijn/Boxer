export interface ComposeProject {
  name: string;
  state: string;
  configPath: string;
}

export class ProjectController {
  private static decoder = new TextDecoder();

  public static async get() {
    const process = Deno.run({
      cmd: ["docker", "compose", "ls", "-a", "--format", "json"],
      stderr: "piped",
      stdout: "piped",
    });
    const status = await process.status();

    if (!status.success) {
      console.error(this.decoder.decode(await process.stderrOutput()));
      return [];
    }

    // Get the output of the command
    const output = JSON.parse(this.decoder.decode(await process.output()));

    // Create clean objects from the JSON output.
    return output.map(
      (project: Record<string, never>) => {
        return {
          name: project?.Name,
          state: project?.Status,
          configPath: project?.ConfigFiles,
        };
      },
    ) as ComposeProject[];
  }
}
