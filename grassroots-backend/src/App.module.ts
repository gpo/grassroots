import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./App.controller";
import { AppService } from "./App.service";
import { ContactsModule } from "./contacts/Contacts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ContactEntityOutDTO } from "./grassroots-shared/Contact.entity.dto";
import { NestExpressApplication } from "@nestjs/platform-express";

export async function listenAndConfigureApp(
  app: NestExpressApplication,
  desiredPort: number,
): Promise<{ port: number }> {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(desiredPort);
  // We don't always get the port we ask for (e.g., "0" means "next available").
  // Figure out what port we actually got.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { port } = app.getHttpServer().address() as {
    port: number | undefined;
  };
  if (port == undefined) {
    throw new Error("Couldn't start http server.");
  }
  return {
    port,
  };
}

@Module({
  imports: [
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
          database: config.get<string>("POSTGRES_DATABASE"),
          entities: [ContactEntityOutDTO],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      envFilePath: "../.env.development",
      isGlobal: true,
    }),
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
