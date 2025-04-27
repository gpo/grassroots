import { Test } from "@nestjs/testing";
import { ContactsController } from "../contacts/contacts.controller";
import { ContactsService } from "../contacts/contacts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactEntityOutDTO } from "../grassroots-shared/contact.entity.dto";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { INestApplication } from "@nestjs/common";

let app: INestApplication | undefined = undefined;

export async function getTestApp(): Promise<INestApplication> {
  if (app) return app;
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: "../test.env",
        isGlobal: true,
      }),
      // https://stackoverflow.com/questions/52570212/nestjs-using-configservice-with-typeormmodule
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
          return {
            type: "postgres",
            host: "localhost",
            port: config.get<number>("POSTGRES_PORT"),
            username: config.get<string>("POSTGRES_USER"),
            password: config.get<string>("POSTGRES_PASSWORD"),
            database: config.get<string>("POSTGRES_DB"),
            entities: [ContactEntityOutDTO],
            synchronize: true,
            connectionTimeout: 30000, // Increased timeout to 30 seconds
          };
        },
        inject: [ConfigService],
      }),
      TypeOrmModule.forFeature([ContactEntityOutDTO]),
    ],
    controllers: [ContactsController],
    providers: [ContactsService],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
