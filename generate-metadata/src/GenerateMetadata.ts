import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { argv, chdir } from "process";

chdir("../grassroots-shared");

const watch = argv.includes("--watch");

const METADATA_PATH = "./src/metadata.ts";

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: "./src",
      esmCompatible: true,
      debug: true,
    }),
  ],
  outputDir: "",
  filename: METADATA_PATH,
  watch,
  tsconfigPath: "./tsconfig.formetadata.json",
  printDiagnostics: true,
});
