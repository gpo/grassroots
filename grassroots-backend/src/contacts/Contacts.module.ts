import { Module } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import { ContactsController } from "./Contacts.controller";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [MikroOrmModule.forFeature([ContactEntityOutDTO])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactsModule {}
