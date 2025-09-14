import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";

process.chdir("../grassroots-shared");

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({
      introspectComments: true,
      pathToSource: "./src",
      esmCompatible: true,
    }),
  ],
  outputDir: "",
  filename: "./src/metadata.ts",
  watch: false,
  tsconfigPath: "./tsconfig.formetadata.json",
});
