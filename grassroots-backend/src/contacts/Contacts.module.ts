import { Module } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import { ContactsController } from "./Contacts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntityOutDTO])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactsModule {}
