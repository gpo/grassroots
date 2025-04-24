import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ContactsModule } from "./contacts/contacts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ContactEntityOutDTO } from "./grassroots-shared/contact.entity.dto";

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
      envFilePath: "../dev.env",
      isGlobal: true,
    }),
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
