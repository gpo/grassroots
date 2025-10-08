import { Module } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";

@Module({
  controllers: [PhoneCanvassController],
  providers: [PhoneCanvassService, TwilioService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PhoneCanvassModule {}
