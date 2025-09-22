/* eslint-disable @typescript-eslint/no-non-null-assertion */
// This could be simplified, but provides a decent framework for working with turbobuild when --watch doesn't work.

// It just rebuilds grassroots-shared when appropriate, and triggers a rebuild in a watching grassroots-backend once
// grassroots-shared is built.

import { execSync, spawn } from "child_process";
import { watch } from "chokidar";
import { writeFile } from "fs/promises";

function asyncSpawn(
  bin: string,
  args: string[],
  options: { cwd: string },
): Promise<void> {
  return new Promise((resolve) => {
    const t = performance.now();

    const r = spawn(bin, args, {
      stdio: "inherit",
      shell: true,
      cwd: options.cwd,
    });
    r.on("exit", () => {
      console.log(
        `${bin} ${args.join(" ")}: ${String((performance.now() - t) / 1000)}`,
      );
      resolve();
    });

    r.on("exit", (code, signal) => {
      if (code == 0) {
        return;
      }
      throw new Error(
        `Child process exited with code ${String(code)} and signal ${String(signal)}`,
      );
    });
  });
}

// This is incomplete.
interface RawTaskGraph {
  tasks: {
    inputs: Record<string, string>;
    package: string;
  }[];
}

// Key is package name.
const taskGraph = new Map<string, { inputs: string[] }>();

const graphBytes = execSync(`turbo run build --dry=json`);
const graphStr = graphBytes.toString();
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const graph: RawTaskGraph = JSON.parse(graphStr) as RawTaskGraph;
const tasks = graph.tasks;

for (const task of tasks) {
  const inputs = Object.keys(task.inputs)
    .filter((x) => !x.startsWith("src"))
    .map((x: string) => "./" + task.package + "/" + x);
  inputs.push(`./${task.package}/src`);
  taskGraph.set(task.package, {
    inputs,
  });
}

const grassrootsShared = taskGraph.get("grassroots-shared")!;

export function WatchDeps(): void {
  watch(grassrootsShared.inputs, {
    ignoreInitial: true,
    awaitWriteFinish: true,
  }).on("all", (event, path) => {
    void (async (): Promise<void> => {
      console.log(`${event} in ${path}`);
      void asyncSpawn("pnpm", ["run", "build"], {
        cwd: "/app/grassroots-shared",
      });
      await writeFile(
        "./src/util/LastDependencyUpdateTime.ts",
        `
// This file is updated when grassroots-shared is done building to trigger a rebuild in watch mode.
export const LAST_DEPENDENCY_UPDATE_TIME = ${String(performance.now())}
`,
      );
    })();
  });
}
