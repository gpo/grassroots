import { Module, OnModuleInit } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassGlobalStateService } from "./PhoneCanvassGlobalState.service.js";
import { PhoneCanvassSchedulerFactory } from "./Scheduler/PhoneCanvassSchedulerFactory.js";
import { ServerMetaModule } from "../server-meta/ServerMeta.module.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import { mkdir } from "fs/promises";

export const LOG_DIR = "../logs";
export const VOICEMAIL_STORAGE_DIR = "../storage";

@Module({
  controllers: [PhoneCanvassController],
  providers: [
    PhoneCanvassService,
    TwilioService,
    PhoneCanvassGlobalStateService,
    PhoneCanvassSchedulerFactory,
  ],
  imports: [MikroOrmModule.forFeature([PhoneCanvassEntity]), ServerMetaModule],
})
export class PhoneCanvassModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await mkdir(LOG_DIR, { recursive: true });
  }
}
