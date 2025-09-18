import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "grassroots-backend/organizations/Organizations.module";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvassRequestDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { TEMPORARY_FAKE_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";

describe("PhoneCanvass (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
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
            metadata: '{test: "foo"}',
          }),
        ],
      }),
    });
    expect(result.data?.id).toBe("");
  });
});
