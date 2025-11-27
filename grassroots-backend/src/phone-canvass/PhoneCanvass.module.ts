import { Module, OnModuleInit } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassModelFactory } from "./Scheduler/PhoneCanvassModelFactory.js";
import { ServerMetaModule } from "../server-meta/ServerMeta.module.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import { mkdir } from "fs/promises";

export const LOG_DIR = "../logs";
export const VOICEMAIL_STORAGE_DIR = "../storage";

@Module({
  controllers: [PhoneCanvassController],
  providers: [PhoneCanvassService, TwilioService, PhoneCanvassModelFactory],
  imports: [MikroOrmModule.forFeature([PhoneCanvassEntity]), ServerMetaModule],
})
export class PhoneCanvassModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await mkdir(LOG_DIR, { recursive: true });
  }
}
