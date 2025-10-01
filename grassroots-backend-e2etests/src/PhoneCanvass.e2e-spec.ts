import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PaginatedPhoneCanvassContactResponseDTO,
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
          csv: `id,civi_id,voter_id,seq_id,district_num,district,poll,first_name,middle_name,last_name,language_pref,unit_num,bldg_num,bldg_num_sfx,street_name,street_type,street_dir,address,town,postal_code,province,phone,do_not_phone,do_not_mail,do_not_email,support_level,party_support,volunteer_status,volunteer_tasks,volunteer_notes,description,membership_status,membership_join_date,membership_expiry_date,voted,election_voted_in,tags,email,merge_tag_token
sbcw8nlvwwwcqc95jsf35103,1,1,,1,Kitchener Centre,400,Alex,Aaron,Aardvark,en,,,,Astreet,St,,,Kitchener,N2G 8A7,ON,2267382384,,,,1,GPO,pending,"data_entry, driver, foot_canvassing, mainstreeting, phoning, scrutineering, signs",,,Lapsed (Non-Voting),2024-03-18,2025-09-01,,,;;import-2023-07-24; 2022-gpc-donor; true-multi-unit,a@a.com,
wvo53djjer4hfn7fpazvkjtu,2,2,,2,Kitchener Centre,400,Bob,Billy,Burnham,en,,,,Bstreet,St,,,Kitchener,N2G 8A8,ON,2267382385,,,,2,GPO,pending,"data_entry, driver",Nov '24 - GPO staff (tech),Nov '24 - GPO staff (tech),,,,,,,b@b.com,
e2abnzfhayfnlkc8galofnz5,3,3,,3,Kitchener Centre,400,Cassy,Casey,Clever,en,1,1,,Cstreet,Rd,,,Leamington,N8H 2Q8,ON,5147382927,,,,3,,,,Som great notes.,,,,,,,; ; vlu-43-02-ole-2022; fed-2021-sg; pre-2023-sg; plu-fed-2023; 2021-gpc-donor; donor-400+; import-2023-07-24; 2022-gpc-donor; true-multi-unit; import-2023-08-24; fed-2021-voted; 413-greenbelt; import-2023-10-24; active2-oct25; vlu-43c-01-ple-2023; ,c@c.com,
2daxkrhawl0vlez883m9s17m,4,4,,4,Kitchener Centre,400,Durham,Dally,Dietrich,en,2,1,,Dstreet,Rd,,,Leamington,N8H 2Q9,ON,5147382928,,,,5,,,phoning,,,,,,,,; ; vlu-43-02-ole-2022; fed-2021-sg; pre-2023-sg; plu-fed-2023; 2021-gpc-donor; donor-400+; import-2023-07-24; 2022-gpc-donor; true-multi-unit; import-2023-08-24; fed-2021-voted; 413-greenbelt; import-2023-10-24; active2-oct25; vlu-43c-01-ple-2023; volunteer-prospect; vote-pledge-2023; vlu-43c-03-pdl-2023; ac23-eday-vol-confirmed; ac23-wat-reg-vol; 2024-legalizeit-postcard; 2024-postelxn-textblast; pre-2024-sign-request; pre-2024-active3-vol; vlu-43-03-au-2024; ; ; 2023-advancepoll-voter; ac25voteadvance1; eday-vol-confirmed-2025; ; ; ; ; ; ; ;,d@d.com,`,
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

    expect(progress.count).toBe(4);

    const allContacts =
      PaginatedPhoneCanvassContactResponseDTO.fromFetchOrThrow(
        await f.grassrootsAPI.POST("/phone-canvass/list", {
          body: {
            paginated: {
              rowsToSkip: 0,
              rowsToTake: 10,
            },
            phoneCanvassId: result.id,
          },
        }),
      );

    const firstContact = allContacts.contacts[0];
    if (firstContact === undefined) {
      throw new Error("Missing first contact");
    }
    expect(firstContact.contact.email).toBe("a@a.com");
    expect(firstContact.callStatus).toBe("NOT_STARTED");

    expect(firstContact.getMetadataByKey("town")).toBe("Kitchener");
    const tags = firstContact.getMetadataByKey("tags");
    expect(tags).toHaveLength(3);
  });

  it("should provide valid twiml from the webhook", async () => {
    const f = getFixture();

    const params = new URLSearchParams();
    params.append("conference", "test");

    const result = await f.grassrootsAPIRaw("/phone-canvass/twilio-voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const text = await result.text();
    expect(text).toContain("<Conference>test</Conference>");
  });
});
