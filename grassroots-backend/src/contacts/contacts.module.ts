import { Module } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { ContactsController } from "./contacts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactEntityOutDTO } from "../grassroots-shared/contact.entity.dto";

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntityOutDTO])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactsModule {}
