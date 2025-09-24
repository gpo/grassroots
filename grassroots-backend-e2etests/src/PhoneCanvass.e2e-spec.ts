import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { ROOT_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";
import { PhoneCanvassModule } from "grassroots-backend/phone-canvass/PhoneCanvass.module";
import { AuthModule } from "grassroots-backend/auth/Auth.module";
import { UsersModule } from "grassroots-backend/users/Users.module";

describe("PhoneCanvass (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule, PhoneCanvassModule],
    overrideAuthGuard: true,
  });

  it("should generate a uuid on creation", async () => {
    const f = getFixture();

    const result = CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass", {
        body: CreatePhoneCanvassRequestDTO.from({
          contacts: [
            CreatePhoneCanvasContactRequestDTO.from({
              contact: CreateContactRequestDTO.from({
                email: "foo@foo.com",
                firstName: "First Name",
                lastName: "Last Name",
                phoneNumber: "226-999-9999",
                organizationId: ROOT_ORGANIZATION_ID,
              }),
              metadata: '{"test": "foo"}',
            }),
            CreatePhoneCanvasContactRequestDTO.from({
              contact: CreateContactRequestDTO.from({
                email: "foo2@foo.com",
                firstName: "First Name",
                lastName: "Last Name",
                phoneNumber: "226-999-9998",
                organizationId: ROOT_ORGANIZATION_ID,
              }),
              metadata: '{"test": "bar"}',
            }),
          ],
        }),
      }),
    );
    expect(result.id.length).toBe(36);

    const progress = PhoneCanvassProgressInfoResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/phone-canvass/progress/" + result.id),
    );

    expect(progress.count).toBe(1);
  });
});
