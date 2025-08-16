import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { readFile, writeFile } from "fs/promises";

const METADATA_TMP_DIR = "/tmp/";
const METADATA_TMP_FILENAME = "metadata.withbadpaths.ts";
const METADATA_TMP_PATH = METADATA_TMP_DIR + METADATA_TMP_FILENAME;

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [
    new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname }),
  ],
  outputDir: METADATA_TMP_DIR,
  filename: METADATA_TMP_FILENAME,
  watch: false,
  tsconfigPath: "tsconfig.json",
});

(async () => {
  const withBadPaths = await readFile(METADATA_TMP_PATH, "utf8");
  // Rewrite  import("../src/User.dto")
  // to:      import("grassroots-shared").UserDTO
  const fixed = withBadPaths; /*.replace(
    /import\("\.\.\/src\/([^"]+)"\)/g,
    'import("grassroots-shared")',
  );*/
  await writeFile("./src/metadata.ts", fixed);
})();
