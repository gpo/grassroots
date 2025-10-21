import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";

// See https://help.twilio.com/articles/223132547-What-are-the-Possible-Call-Statuses-and-What-do-They-Mean- .
// As well as https://docs.google.com/spreadsheets/d/1O1TRFDEc1l9VTx0qLsYoOXN7eTPFK9RtdQ37okEEGFA/edit?gid=0#gid=0 .

// This enum is only used for generating OpenAPI docs.
// See CallStatusDecorator.
enum CallStatusEnum {
  // This status doesn't exist in the set of twilio statuses.
  NOT_STARTED = "NOT_STARTED",
  QUEUED = "QUEUED",
  INITIATED = "INITIATED",
  RINGING = "RINGING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export type CallStatus = keyof typeof CallStatusEnum;

export function CallStatusDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(CallStatusEnum),
    ApiProperty({ enum: CallStatusEnum }),
  );
}

enum CallResultEnum {
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  BUSY = "BUSY",
  NO_ANSWER = "NO_ANSWER",
  FAILED = "FAILED",
}

export type CallResult = keyof typeof CallResultEnum;

export function CallResultDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(CallResultEnum),
    ApiProperty({ enum: CallResultEnum }),
  );
export const TwilioCallStatuses = [
  "queued",
  "initiated",
  "ringing",
  "in-progress",
  "completed",
  "busy",
  "failed",
  "no-answer",
  "canceled",
];
export type TwilioCallStatus = (typeof TwilioCallStatuses)[number];

export function twilioCallstatusToCallStatus(
  twilioCallStatus: TwilioCallStatus,
): { callStatus: CallStatus; callResult: CallResult } {
  return;
}
