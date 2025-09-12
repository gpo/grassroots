import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { readFile, writeFile } from "fs/promises";

process.chdir("/app/grassroots-shared");

const METADATA_TMP_DIR = "/tmp/";
const METADATA_TMP_FILENAME = "metadata.withbadpaths.ts";
const METADATA_TMP_PATH = METADATA_TMP_DIR + METADATA_TMP_FILENAME;

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
  filename: METADATA_TMP_PATH,
  watch: false,
  tsconfigPath: "./tsconfig.formetadata.json",
});

void (async (): Promise<void> => {
  let result = await readFile(METADATA_TMP_PATH, "utf8");
  // Rewrite to refer to dist, or openapi.json generation fails.
  result = result.replaceAll(/"\.\/dtos\//g, '"../dist/dtos/');
  await writeFile("./src/metadata.ts", result);
})();
