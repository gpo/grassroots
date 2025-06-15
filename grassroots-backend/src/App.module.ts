import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./App.controller";
import { AppService } from "./App.service";
import { ContactsModule } from "./contacts/Contacts.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthModule } from "./auth/Auth.module";
import { PassportModuleImport } from "./auth/PassportModuleImport";
import { UsersService } from "./users/Users.service";
import { UserEntity } from "./grassroots-shared/User.entity";
import { AuthController } from "./auth/Auth.controller";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import expressSession from "express-session";
import passport from "passport";
import mikroORMConfig from "./mikro-orm.config";
import { getEnvFilePaths } from "./GetEnvFilePaths";

export async function listenAndConfigureApp(
  app: NestExpressApplication,
  desiredPort: number,
): Promise<{ port: number }> {
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: true }),
  );
  // TODO: migrate to a real session store (https://github.com/expressjs/session?tab=readme-ov-file#compatible-session-stores)
  app.use(
    expressSession({
      secret: "your-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // TODO: change to true once we're using https.
    }),
  );

  const config = app.get<ConfigService>(ConfigService);
  const SESSION_SECRET = config.get<string>("SESSION_SECRET");
  if (SESSION_SECRET === undefined) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }
  // TODO: migrate to a real session store (https://github.com/expressjs/session?tab=readme-ov-file#compatible-session-stores)
  app.use(
    expressSession({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // TODO: change to true once we're using https.
    }),
  );

  app.use(passport.initialize());
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.email);
  });

  passport.deserializeUser((email: string, done) => {
    const usersService = app.get<UsersService>(UsersService);
    usersService
      .findOrCreate({ email })
      .then((user: UserEntity | undefined) => {
        done(null, user);
      })
      .catch((e: unknown) => {
        throw e;
      });
  });
  app.use(passport.session());

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
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      driver: PostgreSqlDriver,
      useFactory: (config: ConfigService): MikroOrmModuleOptions => {
        void config;
        return mikroORMConfig;
      },
      // While we don't have an explicit dependency here, we need the ConfigModule to
      // initialize process.env before this runs.
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      // First file takes precedence.
      envFilePath: getEnvFilePaths(),
      isGlobal: false,
    }),
    ContactsModule,
    AuthModule,
    PassportModuleImport(),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
