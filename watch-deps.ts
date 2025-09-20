/* eslint-disable @typescript-eslint/no-non-null-assertion */
// This mostly reimplements a simplified version of turbo watch.
// It also gets around some issues with both grassroots-shared and generate-metadata depending on grassroots-shared/dtos.

// See https://github.com/gpo/grassroots/issues/210 for some thoughts.

// This assumes you're running the grassroots-backend and grassroots-frontend via pnpm start.

import { execSync, spawn } from "child_process";
import { argv } from "process";
import { watch } from "chokidar";
import { readFile, writeFile } from "fs/promises";
import * as prettier from "prettier";

const METADATA_PATH = "/app/grassroots-backend/src/metadata.ts";
const FIXED_METADATA_PATH =
  "/app/grassroots-backend/src/FormattedMetadata.gen.ts";

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

void (async function main(): Promise<void> {
  // Fix paths in metadata.ts. The metadata builder uses the paths we give to tsc, which are to ts files, not the built js.
  watch(METADATA_PATH, { ignoreInitial: true }).on("all", () => {
    console.log("METADATA UPDATE");
    void (async (): Promise<void> => {
      console.log("metadata.ts update");

      const metadataTs = await readFile(METADATA_PATH, "utf8");
      let formatted = await prettier.format(metadataTs, {
        filepath: FIXED_METADATA_PATH,
      });
      const importRegex = /import\("..\/..\/grassroots-shared\/src\/(.*)"\)/g;
      formatted = formatted.replaceAll(
        importRegex,
        'import("../../grassroots-shared/dist/$1")',
      );
      console.log("WRITING");
      await writeFile(FIXED_METADATA_PATH, formatted);
    })();
  });

  await writeFile("/tmp/foo", "foo");

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
  });

  /*
const filters = [...directDependents].map((x) => `--filter=${x}`);

function run(): void {
  spawnSync("turbo", ["run", "build", ...filters], {
    stdio: "inherit",
    shell: true,
  });

  spawnSync("turbo", ["run", "tsc", ...filters], {
    stdio: "inherit",
    shell: true,
  });
}

run();

watch(inputs, {
  ignoreInitial: true,
  ignored: outputs,
}).on("all", (event, path) => {
  console.log(`${event} in ${path}`);
  run();
});
*/
})();

/*
// This mostly reimplements a simplified version of turbo watch.
// It errs in the direction of over-executing tasks, in the interest of simplicity.
// We may want to tighten this up at some point.

// See https://github.com/gpo/grassroots/issues/210 for some ideas.

import { execSync, spawnSync } from "child_process";
import { argv } from "process";
import { watch } from "chokidar";

const [command, targetPkg] = argv.slice(2);
if (targetPkg === undefined) {
  throw new Error("Missing target package.");
}

// This is incomplete.
interface TaskGraph {
  tasks: {
    inputs: Record<string, string>;
    outputs: string[];
    package: string;
    dependents: string[];
  }[];
}

const turboArgs = ["run", command, `--filter=${targetPkg}`];

const graphBytes = execSync(`turbo ${turboArgs.join(" ")} --dry=json`);
const graphStr = graphBytes.toString();
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const graph: TaskGraph = JSON.parse(graphStr) as TaskGraph;
const tasks = graph.tasks;

let inputs: string[] = [];
let outputs: string[] = [];
const directDependents = new Set<string>();
for (const task of tasks) {
  const pkg = task.package;
  inputs = inputs.concat(
    Object.keys(task.inputs).map((x: string) => pkg + "/" + x),
  );
  // Handle new files in src.
  inputs.push(`${pkg}/src/**`);
  outputs = outputs.concat(task.outputs.map((x: string) => pkg + "/" + x));
  if (task.dependents.includes(`${targetPkg}#build`)) {
    directDependents.add(pkg);
  }
}

const filters = [...directDependents].map((x) => `--filter=${x}`);

function run(): void {
  spawnSync("turbo", ["run", "build", ...filters], {
    stdio: "inherit",
    shell: true,
  });

  spawnSync("turbo", ["run", "tsc", ...filters], {
    stdio: "inherit",
    shell: true,
  });
}

run();

watch(inputs, {
  ignoreInitial: true,
  ignored: outputs,
}).on("all", (event, path) => {
  console.log(`${event} in ${path}`);
  run();
});

*/
