import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { mkdirSync } from "fs";
import path from "path";
import { argv } from "process";

mkdirSync("./openapi-metadata/gen", { recursive: true });
const watchMode = argv.includes("--watch");

const generator = new PluginMetadataGenerator();

/*process.chdir("../grassroots-shared");

generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: "./src",
      esmCompatible: true,
    }),
  ],
  outputDir: "",
  filename: "../openapi-metadata/gen/grassroots-shared-metadata.ts",
  watch: watchMode,
  tsconfigPath: "./tsconfig.json",
});
/*
process.chdir("../");
*/

process.chdir("../grassroots-backend");

generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: "./src",
      esmCompatible: true,
      dtoFileNameSuffix: ".dto.ts",
    }),
  ],
  outputDir: "",
  filename: "../openapi-metadata/gen/grassroots-backend-metadata.ts",
  watch: watchMode,
  tsconfigPath: "./tsconfig.formetadata.json",
});
