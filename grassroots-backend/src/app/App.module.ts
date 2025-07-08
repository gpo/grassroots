import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./App.controller";
import { AppService } from "./App.service";
import { ContactsModule } from "../contacts/Contacts.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthModule } from "../auth/Auth.module";
import { PassportModuleImport } from "../auth/PassportModuleImport";
import { UsersService } from "../users/Users.service";
import { UserEntity } from "../users/User.entity";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import expressSession from "express-session";
import passport from "passport";
import mikroORMConfig from "../mikro-orm.config";
import { getEnvFilePaths } from "../GetEnvFilePaths";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { notNull } from "../grassroots-shared/util/NotNull";
import { OrganizationsModule } from "../organizations/Organizations.module";

export async function listenAndConfigureApp(
  app: NestExpressApplication,
  desiredPort: number,
): Promise<{ port: number }> {
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidUnknownValues: true }),
  );
  const config = app.get<ConfigService>(ConfigService);
  const SESSION_SECRET = config.get<string>("SESSION_SECRET");
  if (SESSION_SECRET === undefined) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }
  const pool = new Pool({
    user: notNull(mikroORMConfig.user, "postgres user is null"),
    host: mikroORMConfig.host,
    database: mikroORMConfig.dbName,
    password: notNull(
      process.env.POSTGRES_PASSWORD,
      "postgres password is null",
    ),
    port: mikroORMConfig.port,
  });
  const PgStore = connectPgSimple(expressSession);
  app.use(
    expressSession({
      store: new PgStore({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      // TODO: update once we're using https. Make sure oauth redirection still works.
      cookie: { secure: false, sameSite: "lax" },
    }),
  );

  app.use(passport.initialize());
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const usersService = app.get<UsersService>(UsersService);
    usersService
      .findOneById(id)
      .then((user: UserEntity | null) => {
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
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
