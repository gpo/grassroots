import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { readFile, writeFile } from "fs/promises";

process.chdir("/app/grassroots-shared/");

const METADATA_TMP_DIR = "/tmp/";
const METADATA_TMP_FILENAME = "metadata.withbadpaths.ts";
const METADATA_TMP_PATH = METADATA_TMP_DIR + METADATA_TMP_FILENAME;

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({ introspectComments: true, pathToSource: "./src" }),
  ],
  outputDir: METADATA_TMP_DIR,
  filename: METADATA_TMP_FILENAME,
  watch: false,
  tsconfigPath: "tsconfig.json",
});

void (async (): Promise<void> => {
  let result = await readFile(METADATA_TMP_PATH, "utf8");
  // Rewrite  import("User.dto"
  // to:      import("User.dto.js"
  // Leave out the trailing slash because some of the imports have extra params.
  result = result.replaceAll(/import\("([^"]*)"/g, 'import("$1.js"');
  // There's some bug where we end up with resolution mode nonsense. Remove it.
  result = result.replaceAll(', { with: { "resolution-mode": "import" } }', "");
  result = result.replaceAll(', { with: { "resolution-mode": "import"', "");
  result = result.replaceAll(
    '\\", { with: { \\"resolution-mode\\": \\"import"',
    '"',
  );
  await writeFile("./src/metadata.ts", result);
})();
