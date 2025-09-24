import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";

export function buildMetadata(watch: boolean): void {
  const generator = new PluginMetadataGenerator();
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
    filename: "./src/metadata.ts",
    watch,
    tsconfigPath: "./tsconfig.formetadata.json",
  });
}
