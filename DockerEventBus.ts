import { iterateReader } from "https://deno.land/std@0.180.0/streams/iterate_reader.ts";

export class DockerEventBus {
  private events: Record<string, unknown>[] = [];
  private textDecoder = new TextDecoder();

  private process = Deno.run({
    cmd: ["docker", "events", "--format", "{{json .}}"],
    stdout: "piped",
    stderr: "piped",
  });

  private async listenStdout() {
    for await (const chunk of iterateReader(this.process.stdout)) {
      const output = this.textDecoder.decode(chunk).trim();

      output.split("\n").forEach((line) => {
        this.events.push(JSON.parse(line));
      });
    }
  }

  private async listenStderr() {
    for await (const chunk of iterateReader(this.process.stderr)) {
      const output = this.textDecoder.decode(chunk);
      console.error(output);
    }
  }

  public async listen() {
    await Promise.all([
      this.listenStdout(),
      this.listenStderr(),
    ]);
  }

  public getEvents() {
    return this.events;
  }
}
