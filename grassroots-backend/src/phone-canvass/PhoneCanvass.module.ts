import { Module } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassGlobalStateService } from "./PhoneCanvassGlobalState.service.js";
import {
  PhoneCanvassScheduler,
  PhoneCanvassSchedulerImpl,
} from "./Scheduler/PhoneCanvassScheduler.js";
import { NoOvercallingStrategy } from "./Scheduler/Strategies/NoOvercallingStrategy.js";
import { PhoneCanvassSchedulerStrategy } from "./Scheduler/Strategies/PhoneCanvassSchedulerStrategy.js";

@Module({
  controllers: [PhoneCanvassController],
  providers: [
    PhoneCanvassService,
    TwilioService,
    PhoneCanvassGlobalStateService,
    PhoneCanvassSchedulerImpl,
    //{ provide: PhoneCanvassScheduler, useClass: PhoneCanvassSchedulerImpl },
    { provide: PhoneCanvassSchedulerStrategy, useClass: NoOvercallingStrategy },
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PhoneCanvassModule {}
