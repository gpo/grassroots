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
