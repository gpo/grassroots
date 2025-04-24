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
export class ContactsModule {}
