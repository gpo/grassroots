import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvassRequestDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { TEMPORARY_FAKE_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";
import { PhoneCanvassModule } from "grassroots-backend/phone-canvass/PhoneCanvass.module";

describe("PhoneCanvass (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [PhoneCanvassModule],
  });

  it("should generate a uuid on creation", async () => {
    const f = getFixture();
    console.log("Starting");

    const result = await f.grassrootsAPI.POST("/phone-canvass", {
      body: CreatePhoneCanvassRequestDTO.from({
        contacts: [
          CreatePhoneCanvasContactRequestDTO.from({
            contact: CreateContactRequestDTO.from({
              email: "foo@foo.com",
              firstName: "First Name",
              lastName: "Last Name",
              phoneNumber: "226-999-9999",
              organizationId: TEMPORARY_FAKE_ORGANIZATION_ID,
            }),
            metadata: '{"test": "foo"}',
          }),
        ],
      }),
    });
    expect(result.data?.id.length).toBe(36);
  });
});
