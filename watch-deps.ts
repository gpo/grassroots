/* eslint-disable @typescript-eslint/no-non-null-assertion */
// This mostly reimplements a simplified version of turbo watch.
// It also gets around some issues with both grassroots-shared and generate-metadata depending on grassroots-shared/dtos.

// See https://github.com/gpo/grassroots/issues/210 for some thoughts.

// This assumes you're running the grassroots-backend and grassroots-frontend via pnpm start.

import { execSync, spawn } from "child_process";
import { argv } from "process";
import { watch } from "chokidar";

const buildForBgE2eTests = argv.includes("--bge2e");
// Packages where just running build-watch and tsc-watch is sufficient.
const REGULAR_PACKAGES = ["grassroots-shared-net", "openapi-paths"];
if (buildForBgE2eTests) {
  REGULAR_PACKAGES.push("grassroots-backend");
}

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
        `Child process ${bin} ${args.join(" ")} exited with code ${String(code)} and signal ${String(signal)}`,
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

void (async function main(): Promise<void> {
  await asyncSpawn("turbo", ["build"], {
    cwd: "/app/generate-metadata",
  });

  // Writes to grassroots-shared/src/metadata.ts when grassroots-shared/src/dtos changes.
  void asyncSpawn("turbo", ["gen-metadata-watch"], { cwd: "/app" });

  const grassrootsShared = taskGraph.get("grassroots-shared")!;

  // We currently assume that dto modification will always update src/metadata.ts.
  // This lets us avoid a double update in grassroots-shared on dto updates, but
  // does risk things getting stale when a dto update doesn't impact src/metadata.ts.
  watch(grassrootsShared.inputs, {
    ignoreInitial: true,
    ignored: "/app/grassroots-shared/dtos",
    awaitWriteFinish: true,
  }).on("all", (event, path) => {
    console.log(`${event} in ${path}`);
    void asyncSpawn("pnpm", ["run", "build"], {
      cwd: "/app/grassroots-shared",
    });
    void asyncSpawn("pnpm", ["run", "tsc"], { cwd: "/app/grassroots-shared" });
  });

  for (const pkg of REGULAR_PACKAGES) {
    const path = "/app/" + pkg;
    void asyncSpawn("pnpm", ["run", "build-watch"], {
      cwd: path,
    });
    void asyncSpawn("pnpm", ["run", "tsc-watch"], {
      cwd: path,
    });
  }
})();
