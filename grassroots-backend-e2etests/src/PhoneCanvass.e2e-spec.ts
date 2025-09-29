import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassModule } from "grassroots-backend/phone-canvass/PhoneCanvass.module";
import { AuthModule } from "grassroots-backend/auth/Auth.module";
import { UsersModule } from "grassroots-backend/users/Users.module";
import { OrganizationEntity } from "grassroots-backend/organizations/Organization.entity";

describe("PhoneCanvass (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule, PhoneCanvassModule],
    overrideAuthGuard: true,
  });

  it("should support create via csv", async () => {
    const f = getFixture();
    await f.entityManager.nativeDelete(OrganizationEntity, {});
    await OrganizationEntity.ensureRootOrganization(f.app);

    const result = CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass", {
        body: CreatePhoneCanvasCSVRequestDTO.from({
          name: "test",
          // https://www.ietf.org/rfc/rfc4180.txt: "If double-quotes are used to enclose fields,
          // then a double-quote appearing inside a field must be escaped by preceding it with
          // another double quote."
          csv: `email, firstName, lastName, phoneNumber, metadata
          "foo@foo.com", "First Name", "Last Name", "226-999-9999", "{""test"": ""foo""}"
          "foo2@foo.com", "First Name", "Last Name", "226-999-9998", "{""test"": ""bar""}"
          "foo3@foo.com", "First Name", "Last Name", "226-999-9998", "{""test"": ""bar""}"`,
        }),
      }),
    );
    expect(result.id.length).toBe(36);

    const progress = PhoneCanvassProgressInfoResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/phone-canvass/progress/{id}", {
        params: {
          path: {
            id: result.id,
          },
        },
      }),
    );
    expect(progress.count).toBe(3);
  });
});
