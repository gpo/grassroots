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

export const CallResults: CallResult[] = Object.values(CallResultEnum);

export function CallResultDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(CallResultEnum),
    ApiProperty({ enum: CallResultEnum }),
  );
}

enum TwilioCallStatusEnum {
  queued = "queued",
  initiated = "initiated",
  ringing = "ringing",
  "in-progress" = "in-progress",
  completed = "completed",
  busy = "busy",
  failed = "failed",
  "no-answer" = "no-answer",
  canceled = "canceled",
}
export type TwilioCallStatus = keyof typeof TwilioCallStatusEnum;

export function TwilioCallStatusDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(TwilioCallStatusEnum),
    ApiProperty({ enum: TwilioCallStatusEnum }),
  );
}

const TWILIO_CALL_STATUS_TO_CALL_STATUS_AND_RESULT = {
  queued: { status: "QUEUED" },
  initiated: { status: "INITIATED" },
  ringing: { status: "RINGING" },
  "in-progress": { status: "IN_PROGRESS" },
  completed: { status: "COMPLETED", result: "COMPLETED" },
  busy: { status: "COMPLETED", result: "BUSY" },
  failed: { status: "COMPLETED", result: "FAILED" },
  "no-answer": { status: "COMPLETED", result: "NO_ANSWER" },
  canceled: { status: "COMPLETED", result: "CANCELED" },
} as const satisfies Record<
  TwilioCallStatus,
  { status: CallStatus; result?: CallResult }
>;

export function twilioCallStatusToCallStatus(
  twilioCallStatus: TwilioCallStatus,
): { status: CallStatus; result?: CallResult } {
  return TWILIO_CALL_STATUS_TO_CALL_STATUS_AND_RESULT[twilioCallStatus];
}
