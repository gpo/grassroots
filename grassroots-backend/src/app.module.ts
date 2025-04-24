import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ContactsModule } from "./contacts/contacts.module";

@Module({
  imports: [ContactsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
