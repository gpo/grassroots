import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";

// This enum is only used for generating OpenAPI docs.
// See CallStatusDecorator.
enum CallStatusEnum {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  ENDED = "ENDED",
  LEFT_VOICEMAIL = "LEFT_VOICEMAIL",
  UNABLE_TO_CONTACT = "UNABLE_TO_CONTACT",
}

export type CallStatus = keyof typeof CallStatusEnum;

export function CallStatusDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(CallStatusEnum, { each: true }),
    ApiProperty({ enum: CallStatusEnum, isArray: true }),
  );
}
