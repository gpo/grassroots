import { Module } from "@nestjs/common";
import { PhoneCanvassController } from "./PhoneCanvass.controller.js";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import { TwilioService } from "./Twilio.service.js";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [PhoneCanvassController],
  providers: [PhoneCanvassService, TwilioService],
  imports: [ConfigModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PhoneCanvassModule {}
