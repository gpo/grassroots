import { Module } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import { ContactsController } from "./Contacts.controller";
import { ContactEntity } from "./entities/Contact.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [MikroOrmModule.forFeature([ContactEntity])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactsModule {}
