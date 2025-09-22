import { NestFactory } from "@nestjs/core";
import { AppModule, listenAndConfigureApp } from "./app/App.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import openapiTS, { astToString } from "openapi-typescript";
import { stringify } from "safe-stable-stringify";
import { MikroORM } from "@mikro-orm/core";
import metadata from "./FormattedMetadata.gen.js";
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

const openAPISchemaPath = "./openAPI.json";
const openAPITSSchemaPath = "../openapi-paths/src/OpenAPI.gen.ts";
const METADATA_PATH = "./src/metadata.ts";
const FIXED_METADATA_PATH = "./grassroots-backend/src/FormattedMetadata.gen.ts";

async function writeOpenAPI(app: NestExpressApplication): Promise<void> {
  performance.mark("writeOpenAPI");
  const config = new DocumentBuilder()
    .setTitle("Grassroots")
    .setDescription("The Grassroots API description")
    .setVersion("0.0")
    .build();

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
  console.log("metadata.ts update");

  let metadataTs = await readFile(METADATA_PATH, "utf8");
  const importRegex = /import\("..\/..\/grassroots-shared\/src\/(.*)\.js"\)/g;
  metadataTs = metadataTs.replaceAll(
    importRegex,
    'import("grassroots-shared/$1")',
  );
  await writeFormatted({ filePath: FIXED_METADATA_PATH, text: metadataTs });
  console.log("WRITTEN fixed metadata");
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
    fixMetadataPaths(),
  ];

  await Promise.all(postStartupTasks);

  console.timeEnd("generate files");

  if (process.argv.includes("--gen-files-only")) {
    await app.close();
  }

  watch(METADATA_PATH, { ignoreInitial: true }).on("all", fixMetadataPaths);
}

const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;
void bootstrap(port);
