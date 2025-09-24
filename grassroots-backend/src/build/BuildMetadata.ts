import { PluginMetadataGenerator } from "@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator.js";
import { ReadonlyVisitor } from "@nestjs/swagger/dist/plugin/index.js";
import { argv, chdir, exit } from "process";
import { readFile, unlink } from "fs/promises";
import { watch } from "chokidar";
import { writeFormatted } from "../util/FormattingWriter.js";
import { existsSync } from "fs";

// Must be run from within the grassroots-backend package.

chdir(import.meta.dirname + "/../..");

const METADATA_PATH = "./src/metadata.ts";
const FIXED_METADATA_PATH = "./src/FormattedMetadata.gen.ts";

const watching = argv.includes("--watch");

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
    filename: METADATA_PATH,
    watch,
    tsconfigPath: "./tsconfig.formetadata.json",
  });
}

// The nestjs metadata generator produces relative paths, but we need absolute paths.
async function fixMetadataPaths(): Promise<void> {
  let metadata = await readFile(METADATA_PATH, "utf8");

  const importRegex =
    /import\("(..\/..\/)?grassroots-shared\/src\/([^"]*)\.js"\)/g;
  metadata = metadata.replaceAll(importRegex, 'import("grassroots-shared/$2")');

  await writeFormatted({
    filePath: FIXED_METADATA_PATH,
    text: metadata,
    onlyIfChanged: true,
  });
}

if (!watching) {
  buildMetadata(false);
  await fixMetadataPaths();
  exit(0);
}

// Whenever we update the metadata.ts, we need to create a version with the paths fixed.
watch(METADATA_PATH, { ignoreInitial: true })
  .on("all", () => {
    void (async (): Promise<void> => {
      await fixMetadataPaths();
    })();
  })
  .on("ready", () => {
    void (async (): Promise<void> => {
      // Make sure we trigger once, even if metadata hasn't changed, just to ensure everything is up to date.
      if (existsSync(METADATA_PATH)) {
        await unlink(METADATA_PATH);
      }
      buildMetadata(watching);
    })();
  });
