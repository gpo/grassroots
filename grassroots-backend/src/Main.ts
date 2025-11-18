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
import { LAST_DEPENDENCY_UPDATE_TIME } from "./util/LastDependencyUpdateTime.js";
import { watchDeps } from "./build/WatchDeps.js";
import { argv } from "process";
import metadata from "./FormattedMetadata.gen.js";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { OrganizationEntity } from "./organizations/Organization.entity.js";
import { PhoneCanvassService } from "./phone-canvass/PhoneCanvass.service.js";

const watching = argv.includes("--watch") || argv.includes("-w");
const genFilesOnly = argv.includes("--gen-files-only");

// If grassroots-shared changes, rebuild it, and update LAST_DEPENDENCY_UPDATE_TIME to trigger a reload.
if (watching) {
  watchDeps();
}
void LAST_DEPENDENCY_UPDATE_TIME;

const openAPISchemaPath = "./openAPI.json";
const openAPITSSchemaPath = "../openapi-paths/src/OpenAPI.gen.ts";

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
    await mkdir(dirname(openAPITSSchemaPath), { recursive: true });
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

// Ideally this would live in the TwilioService with a lifecycle callback,
// but that runs into tricky lifetime issues with MikroORM initialization.
async function clearTwilioSyncData(app: NestExpressApplication): Promise<void> {
  const phoneCanvassService = app.get(PhoneCanvassService);
  await phoneCanvassService.clearTwilioSyncDatas();
}

async function bootstrap(port: number): Promise<void> {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      snapshot: false,
      abortOnError: false,
    });

  await writeOpenAPI(app);
  if (genFilesOnly) {
    await app.close();
    return;
  }
  await listenAndConfigureApp(app, port);

  const postStartupTasks = [
    writeFormatted({
      filePath: "../docs/DependencyGraph.md",
      text: graphDependencies(app),
    }),
    (async (): Promise<void> => {
      await createMikroORMMigration(app);
      await OrganizationEntity.ensureRootOrganization(app);
    })(),
    clearTwilioSyncData,
  ];

  await Promise.all(postStartupTasks);
}

const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;
void bootstrap(port);
