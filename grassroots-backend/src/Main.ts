import { NestFactory } from "@nestjs/core";
import { AppModule, listenAndConfigureApp } from "./app/App.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import openapiTS, { astToString } from "openapi-typescript";
import { stringify } from "safe-stable-stringify";
import { MikroORM } from "@mikro-orm/core";
import backendMetadataPromise from "./metadata.js";
import sharedMetadataPromise from "grassroots-shared/metadata";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  addValidationErrorsToOpenAPI,
  throwOnInvalidType,
} from "./util/PostProcessOpenAPI.js";
import { graphDependencies } from "./util/GraphDependencies.js";
import { writeFormatted } from "./util/FormattingWriter.js";
import { ValidationErrorOutDTO } from "grassroots-shared/dtos/ValidationError.dto";

// Needs to show up somewhere.
import "reflect-metadata";

const openAPISchemaPath = "./openAPI.json";
const openAPITSSchemaPath = "../openapi-paths/src/OpenAPI.gen.ts";

// Promise<Awaited<...>> is just to make the linter happy that this async method is
// returning a promise.
async function getunifiedMetadata(): Promise<
  Awaited<ReturnType<typeof backendMetadataPromise>>
> {
  const backendMetadata = await backendMetadataPromise();
  const sharedMetadata = await sharedMetadataPromise();

  return {
    "@nestjs/swagger": {
      // @ts-expect-error This doesn't line up since the models are different,
      // and these end up with types equivalent to their values.
      models: sharedMetadata["@nestjs/swagger"].models,
      controllers: backendMetadata["@nestjs/swagger"].controllers,
    },
  };
}

async function writeOpenAPI(app: NestExpressApplication): Promise<void> {
  performance.mark("writeOpenAPI");
  const config = new DocumentBuilder()
    .setTitle("Grassroots")
    .setDescription("The Grassroots API description")
    .setVersion("0.0")
    .build();

  await SwaggerModule.loadPluginMetadata(getunifiedMetadata);
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
}

const port = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3000;
void bootstrap(port);
