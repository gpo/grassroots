import { getTestApp } from "../testing/GetTestApp.js";
import { beforeAll, describe, expect, it } from "vitest";
import { PhoneCanvassModule } from "./PhoneCanvass.module.js";
import { TwilioService } from "./Twilio.service.js";
import { ConfigModule } from "@nestjs/config";

describe("TwilioService", () => {
  let service: TwilioService;

  beforeAll(async () => {
    const { app } = await getTestApp({
      imports: [ConfigModule, PhoneCanvassModule],
    });
    service = app.get<TwilioService>(TwilioService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
