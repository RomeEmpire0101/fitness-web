import { copyFile, mkdir } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const hostingSource = new URL(".openai/hosting.json", projectRoot);
const hostingDirectory = new URL("dist/.openai/", projectRoot);
const hostingTarget = new URL("hosting.json", hostingDirectory);

await mkdir(hostingDirectory, { recursive: true });
await copyFile(hostingSource, hostingTarget);

console.log("Prepared dist/.openai/hosting.json for Sites.");
