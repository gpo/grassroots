import { NestFactory } from "@nestjs/core";
import { AppModule, listenAndConfigureApp } from "./app/App.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import openapiTS, { astToString } from "openapi-typescript";
import { stringify } from "safe-stable-stringify";
import { MikroORM } from "@mikro-orm/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  addValidationErrorsToOpenAPI,
  throwOnInvalidType,
} from "./util/PostProcessOpenAPI.js";
import { graphDependencies } from "./util/GraphDependencies.js";
import { writeFormatted } from "./util/FormattingWriter.js";

// Needs to show up somewhere for decorators to work.
import "reflect-metadata";
import { ValidationErrorOutDTO } from "grassroots-shared/dtos/ValidationError.dto";
import { readFile } from "fs/promises";
import { watch } from "chokidar";
import { LAST_DEPENDENCY_UPDATE_TIME } from "./util/LastDependencyUpdateTime.js";
import { WatchDeps as watchDeps } from "./build/WatchDeps.js";
import { argv, exit } from "process";
import { buildMetadata } from "./build/BuildMetadata.js";
import metadata from "./FormattedMetadata.gen.js";

const watching = argv.includes("--watch") || argv.includes("-w");
const skipMetadata = argv.includes("--skip-metadata");

if (!skipMetadata) {
  buildMetadata(watching);
}

// If grassroots-shared changes, rebuild it, and update LAST_DEPENDENCY_UPDATE_TIME to trigger a reload.
if (watching) {
  watchDeps();
}
void LAST_DEPENDENCY_UPDATE_TIME;

const openAPISchemaPath = "./openAPI.json";
const openAPITSSchemaPath = "../openapi-paths/src/OpenAPI.gen.ts";
const METADATA_PATH = "./src/metadata.ts";
const FIXED_METADATA_PATH = "./src/FormattedMetadata.gen.ts";

async function writeOpenAPI(app: NestExpressApplication): Promise<void> {
  performance.mark("writeOpenAPI");
  const config = new DocumentBuilder()
    .setTitle("Grassroots")
    .setDescription("The Grassroots API description")
    .setVersion("0.0")
    .build();

  await fixMetadataPaths();
  await SwaggerModule.loadPluginMetadata(metadata);

  const openAPI = SwaggerModule.createDocument(app, config, {
    autoTagControllers: true,
    extraModels: [ValidationErrorOutDTO],
  });

  throwOnInvalidType(openAPI);
  addValidationErrorsToOpenAPI(openAPI);

  const openAPIStr = stringify(openAPI, null, 2);

  const openAPISpecWrite = await writeFormatted({
    filePath: openAPISchemaPath,
    text: openAPIStr,
    onlyIfChanged: true,
  });
  if (openAPISpecWrite.noChange) {
    console.log("Skip updating OpenAPI");
  } else {
    console.log("Updating OpenAPI Schema TS bindings");
    const ast = await openapiTS(openAPIStr);
    const contents = astToString(ast);
    await writeFormatted({
      filePath: openAPITSSchemaPath,
      text: contents,
    });
    console.log("Done updating OpenAPI Schema TS bindings");
  }

  performance.measure("writeOpenAPI");
}

async function createMikroORMMigration(
  app: NestExpressApplication,
): Promise<void> {
  const orm = app.get(MikroORM);
  const dbName: string = orm.config.get("dbName");
  const isTestDB: boolean = dbName.includes("test");
  if (!isTestDB) {
    const migrator = orm.getMigrator();
    try {
      await migrator.createMigration().then((migrationResult) => {
        if (migrationResult.fileName === "") {
          console.log("No MikroORM migration required");
        } else {
          console.log("MikroORM migration successful");
        }
      });
      await migrator.up();
    } catch (e) {
      console.error(e);
    }
  }
}

// The nestjs metadata generator produces relative paths, but we need absolute paths.
async function fixMetadataPaths(): Promise<void> {
  let metadata = await readFile(METADATA_PATH, "utf8");

  const importRegex =
    /import\("(..\/..\/)?grassroots-shared\/src\/([^"]*)\.js"\)/g;
  metadata = metadata.replaceAll(importRegex, 'import("grassroots-shared/$2")');

  console.log("CHECKING");
  const changed = await writeFormatted({
    filePath: FIXED_METADATA_PATH,
    text: metadata,
    onlyIfChanged: true,
  });

  // TODO: this doesn't seem to work, we might need to stable sort it somehow?
  if (!changed.noChange) {
    // Alternatively, I think we could use a fancy async compilation / reload to avoid this restart.
    // In the short term, we just assume that if we're skipping computing metadata, then nothing changed.
    //if (!skipMetadata) {
    console.log("Need to rerun to pick up new metadata.");
    exit(1);
  }
}

async function bootstrap(port: number): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await listenAndConfigureApp(app, port);

  console.time("generate files");

  const postStartupTasks = [
    writeOpenAPI(app),
    writeFormatted({
      filePath: "../docs/DependencyGraph.md",
      text: graphDependencies(app),
    }),
    createMikroORMMigration(app),
  ];

  await Promise.all(postStartupTasks);

  if (process.argv.includes("--gen-files-only")) {
    await app.close();
    return;
  }

  // Whenever we update the metadata.ts, we need to create a version with the paths fixed.
  watch(METADATA_PATH, { ignoreInitial: true }).on("all", () => {
    void (async (): Promise<void> => {
      await fixMetadataPaths();
    })();
  });
}

const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;
void bootstrap(port);
