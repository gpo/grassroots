import { Module } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassGlobalStateService } from "./PhoneCanvassGlobalState.service.js";
import { PhoneCanvassSchedulerFactory } from "./Scheduler/PhoneCanvassSchedulerFactory.js";
import { ServerMetaModule } from "../server-meta/ServerMeta.module.js";

@Module({
  controllers: [PhoneCanvassController],
  providers: [
    PhoneCanvassService,
    TwilioService,
    PhoneCanvassGlobalStateService,
    PhoneCanvassSchedulerFactory,
  ],
  imports: [ServerMetaModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PhoneCanvassModule {}
