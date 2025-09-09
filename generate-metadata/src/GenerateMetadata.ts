import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";

process.chdir("/app/grassroots-backend/src/grassroots-shared");

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: "./",
      esmCompatible: true,
    }),
  ],
  outputDir: ".",
  filename: "metadata.ts",
  watch: false,
  tsconfigPath: "tsconfig.formetadata.json",
});
