const process = Deno.run({
  cmd: ["docker", "events", "--format", "{{json .}}"],
  stdout: "piped",
  stderr: "piped",
});

const decoder = new TextDecoder("utf-8");

const buffer = new Uint8Array(1024);

while (true) {
  const read = await process.stdout.read(buffer);

  if (read === null) {
    break;
  }

  const output = decoder.decode(buffer.subarray(0, read));

  // Gives an error in VSCode, but works fine in Deno.
  self.postMessage(JSON.parse(output)); // Property 'postMessage' does not exist on type 'Window & typeof globalThis'.deno-ts(2339)
}
