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
import { readFile, writeFile } from "fs/promises";
import { watch } from "chokidar";
import { existsSync } from "fs";
import { LAST_DEPENDENCY_UPDATE_TIME } from "./util/LastDependencyUpdateTime.js";

// This is updated when grassroots-shared is built when in watch mode, to trigger a reload.
void LAST_DEPENDENCY_UPDATE_TIME;

const openAPISchemaPath = "./openAPI.json";
const openAPITSSchemaPath = "../openapi-paths/src/OpenAPI.gen.ts";
const METADATA_PATH = "./src/metadata.ts";
const FIXED_METADATA_PATH = "./src/FormattedMetadata.gen.ts";
const LAST_METADATA_PATH = "/tmp/lastmetadata.ts";

async function writeOpenAPI(app: NestExpressApplication): Promise<void> {
  performance.mark("writeOpenAPI");
  const config = new DocumentBuilder()
    .setTitle("Grassroots")
    .setDescription("The Grassroots API description")
    .setVersion("0.0")
    .build();

  if (!existsSync(METADATA_PATH)) {
    // In watch mode, this will write the metadata, and then restart.
    // Otherwise, we need to have run --gen-files-only before running.
    // TODO
    console.log("Missing metadata");
    return;
  }
  await fixMetadataPaths();
  const metadata = (await import("./FormattedMetadata.gen.js")).default;
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

async function fixMetadataPaths(): Promise<void> {
  let lastMetadata: string | null = null;
  try {
    lastMetadata = await readFile(LAST_METADATA_PATH, "utf8");
  } catch {
    /* empty */
  }
  let metadata = await readFile(METADATA_PATH, "utf8");
  if (metadata === lastMetadata) {
    return;
  }
  await writeFile(LAST_METADATA_PATH, metadata);

  const importRegex = /import\("..\/..\/grassroots-shared\/src\/(.*)\.js"\)/g;
  metadata = metadata.replaceAll(importRegex, 'import("grassroots-shared/$1")');
  await writeFormatted({ filePath: FIXED_METADATA_PATH, text: metadata });
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

  console.timeEnd("generate files");

  if (process.argv.includes("--gen-files-only")) {
    await app.close();
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
