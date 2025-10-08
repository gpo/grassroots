import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./App.controller.js";
import { AppService } from "./App.service.js";
import { ContactsModule } from "../contacts/Contacts.module.js";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthModule } from "../auth/Auth.module.js";
import { PassportModuleImport } from "../auth/PassportModuleImport.js";
import { UsersService } from "../users/Users.service.js";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import {
  MikroORM,
  PostgreSqlDriver,
  RequestContext,
} from "@mikro-orm/postgresql";
import expressSession from "express-session";
import passport from "passport";
import mikroORMConfig from "../mikro-orm.config.js";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { notNull } from "grassroots-shared/util/NotNull";
import { OrganizationsModule } from "../organizations/Organizations.module.js";
import { UserDTO } from "grassroots-shared/dtos/User.dto";
import { PhoneCanvassModule } from "../phone-canvass/PhoneCanvass.module.js";
import { getEnvVars } from "../GetEnvVars.js";

export async function listenAndConfigureApp(
  app: NestExpressApplication,
  desiredPort: number,
): Promise<{ port: number }> {
  const envVars = await getEnvVars();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      // TODO: Consider turning off debugging in production - investigate security and performance concerns.
      // https://github.com/gpo/grassroots/issues/177
      enableDebugMessages: true,
      validationError: {
        target: true,
        value: true,
      },
    }),
  );

  const pool = new Pool({
    user: notNull(mikroORMConfig.user, "postgres user is null"),
    host: mikroORMConfig.host,
    database: mikroORMConfig.dbName,
    password: envVars.POSTGRES_PASSWORD,
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
      secret: envVars.SESSION_SECRET,
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

    const orm = app.get(MikroORM);

    RequestContext.create(orm.em, () => {
      usersService
        .findOneById(id)
        .then((user: UserDTO | null) => {
          done(null, user);
        })
        .catch((e: unknown) => {
          throw e;
        });
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
      driver: PostgreSqlDriver,
      useFactory: (): MikroOrmModuleOptions => {
        return mikroORMConfig;
      },
    }),
    ContactsModule,
    AuthModule,
    PassportModuleImport(),
    OrganizationsModule,
    PhoneCanvassModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
