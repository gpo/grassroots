import { Module } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import { ContactsController } from "./Contacts.controller";
import { EntityManagerModule } from "../orm/EntityManager.module";

@Module({
  imports: [EntityManagerModule],
  controllers: [ContactsController],
  providers: [ContactsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactsModule {}
