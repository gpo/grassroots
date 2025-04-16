import { Module } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactEntityOutDTO } from "src/grassroots-shared/contact.dto.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntityOutDTO])],
  controllers: [ContactController],
  providers: [ContactService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContactModule {}
