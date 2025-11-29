import { describe, expect, it } from "vitest";
import { E2ETestFixture, useE2ETestFixture } from "./infra/E2eSetup.js";
import {
  CreatePhoneCanvassCallerDTO,
  CreatePhoneCanvassResponseDTO,
  PaginatedPhoneCanvassContactResponseDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassModule } from "grassroots-backend/phone-canvass/PhoneCanvass.module";
import { AuthModule } from "grassroots-backend/auth/Auth.module";
import { UsersModule } from "grassroots-backend/users/Users.module";
import { OrganizationEntity } from "grassroots-backend/organizations/Organization.entity";
import { TwilioService } from "grassroots-backend/phone-canvass/Twilio.service";
import { TwilioServiceMock } from "grassroots-backend/phone-canvass/Twilio.service.mock";
import {
  CallStatus,
  TwilioCallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { en, en_CA, Faker } from "@faker-js/faker";
import { GVoteCSVEntry } from "grassroots-backend/phone-canvass/PhoneCanvass.controller";
import Papa from "papaparse";
import { writeFile } from "fs/promises";
import { delay } from "grassroots-shared/util/Delay";

const CSV_HEADER = `id,civi_id,voter_id,seq_id,district_num,district,poll,first_name,middle_name,last_name,language_pref,unit_num,bldg_num,bldg_num_sfx,street_name,street_type,street_dir,address,town,postal_code,province,phone,do_not_phone,do_not_mail,do_not_email,support_level,party_support,volunteer_status,volunteer_tasks,volunteer_notes,description,membership_status,membership_join_date,membership_expiry_date,voted,election_voted_in,tags,email,merge_tag_token`;

function getFormDataForCSVCreation(): FormData {
  // Create a mock audio file
  const audioBuffer = Buffer.from("fake audio content");
  const audioFile = new File([audioBuffer], "test-voicemail-audio.mp3", {
    type: "audio/mpeg",
  });

  // Create FormData with CSV and audio
  const formData = new FormData();
  formData.append("name", "test");
  formData.append(
    "csv",
    `${CSV_HEADER}
sbcw8nlvwwwcqc95jsf35103,1,1,,1,Kitchener Centre,400,Alex,Aaron,Aardvark,en,,,,Astreet,St,,,Kitchener,N2G 8A7,ON,2267382384,,,,1,GPO,pending,"data_entry, driver, foot_canvassing, mainstreeting, phoning, scrutineering, signs",,,Lapsed (Non-Voting),2024-03-18,2025-09-01,,,;;import-2023-07-24; 2022-gpc-donor; true-multi-unit,a@a.com,
wvo53djjer4hfn7fpazvkjtu,2,2,,2,Kitchener Centre,400,Bob,Billy,Burnham,en,,,,Bstreet,St,,,Kitchener,N2G 8A8,ON,2267382385,,,,2,GPO,pending,"data_entry, driver",Nov '24 - GPO staff (tech),Nov '24 - GPO staff (tech),,,,,,,b@b.com,
e2abnzfhayfnlkc8galofnz5,3,3,,3,Kitchener Centre,400,Cassy,Casey,Clever,en,1,1,,Cstreet,Rd,,,Leamington,N8H 2Q8,ON,5147382927,,,,3,,,,Som great notes.,,,,,,,; ; vlu-43-02-ole-2022; fed-2021-sg; pre-2023-sg; plu-fed-2023; 2021-gpc-donor; donor-400+; import-2023-07-24; 2022-gpc-donor; true-multi-unit; import-2023-08-24; fed-2021-voted; 413-greenbelt; import-2023-10-24; active2-oct25; vlu-43c-01-ple-2023; ,c@c.com,
2daxkrhawl0vlez883m9s17m,4,4,,4,Kitchener Centre,400,Durham,Dally,Dietrich,en,2,1,,Dstreet,Rd,,,Leamington,N8H 2Q9,ON,5147382928,,,,5,,,phoning,,,,,,,,; ; vlu-43-02-ole-2022; fed-2021-sg; pre-2023-sg; plu-fed-2023; 2021-gpc-donor; donor-400+; import-2023-07-24; 2022-gpc-donor; true-multi-unit; import-2023-08-24; fed-2021-voted; 413-greenbelt; import-2023-10-24; active2-oct25; vlu-43c-01-ple-2023; volunteer-prospect; vote-pledge-2023; vlu-43c-03-pdl-2023; ac23-eday-vol-confirmed; ac23-wat-reg-vol; 2024-legalizeit-postcard; 2024-postelxn-textblast; pre-2024-sign-request; pre-2024-active3-vol; vlu-43-03-au-2024; ; ; 2023-advancepoll-voter; ac25voteadvance1; eday-vol-confirmed-2025; ; ; ; ; ; ; ;,d@d.com,`,
  );
  formData.append("voiceMailAudioFile", audioFile);
  return formData;
}

async function updateTwilioCallStatus(
  f: E2ETestFixture,
  sid: string,
  status: TwilioCallStatus,
): Promise<void> {
  const params = new URLSearchParams();
  params.append("CallSid", sid);
  params.append("CallStatus", status);
  params.append("CallDuration", "5");
  params.append("Timestamp", "5");

  const result = await f.grassrootsAPIRaw(
    "/phone-canvass/webhooks/twilio-callstatus",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  const text = await result.text();
  if (text !== "<Response></Response>") {
    throw new Error(`Failed to update status. Received ${text}`);
  }
}

describe("PhoneCanvass (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule, PhoneCanvassModule],
    mockProviders: [{ provide: TwilioService, useClass: TwilioServiceMock }],
    overrideAuthGuard: true,
  });

  function useTwilioMock(): {
    fixture: E2ETestFixture;
    mock: TwilioServiceMock;
  } {
    const fixture = getFixture();
    const mock = fixture.app.get<TwilioServiceMock>(TwilioService);

    return {
      fixture,
      mock,
    };
  }

  it("should support create via csv", async () => {
    const { fixture: f, mock } = useTwilioMock();
    await OrganizationEntity.ensureRootOrganization(f.app);

    const result = CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass", {
        // @ts-expect-error - FormData is supported but not in types
        body: getFormDataForCSVCreation(),
      }),
    );

    expect(result.id.length).toBe(36);
    expect(mock.setSyncData).toBeCalledWith(
      result.id,
      expect.objectContaining({
        totalContacts: 4,
        doneContacts: 0,
      }),
    );

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

    const tags = firstContact.getMetadataByKey("tags");
    expect(tags).toHaveLength(3);
  });

  it("should sync caller data", async () => {
    const { fixture: f, mock } = useTwilioMock();
    await OrganizationEntity.ensureRootOrganization(f.app);

    const canvass = CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass", {
        // @ts-expect-error - FormData is supported but not in types
        body: getFormDataForCSVCreation(),
      }),
    );

    CreatePhoneCanvassCallerDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass/register-caller", {
        body: {
          activePhoneCanvassId: canvass.id,
          displayName: "A",
          email: "A@A.com",
        },
      }),
    );

    CreatePhoneCanvassCallerDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass/register-caller", {
        body: {
          activePhoneCanvassId: canvass.id,
          displayName: "B",
          email: "B@B.com",
        },
      }),
    );

    expect(mock.setSyncData).toBeCalledTimes(3);
    expect(mock.setSyncData).toHaveBeenLastCalledWith(
      canvass.id,
      expect.objectContaining({
        callers: [
          { callerId: 1, displayName: "A", ready: "unready" },
          { callerId: 2, displayName: "B", ready: "unready" },
        ],
      }),
    );
  });

  // This is currently flaky.
  it("should schedule calls", async () => {
    const { fixture: f, mock } = useTwilioMock();
    await OrganizationEntity.ensureRootOrganization(f.app);

    console.log("CREATE IN FLAKY");
    const canvass = CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass", {
        // @ts-expect-error - FormData is supported but not in types
        body: getFormDataForCSVCreation(),
      }),
    );
    console.log("CREATE DONE FLAKY");

    const caller = PhoneCanvassCallerDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass/register-caller", {
        body: CreatePhoneCanvassCallerDTO.from({
          displayName: "Test",
          email: "Test@Test.com",
          activePhoneCanvassId: canvass.id,
        }),
      }),
    );

    expect(mock.makeCall).toBeCalledTimes(0);

    PhoneCanvassCallerDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/phone-canvass/update-caller", {
        body: PhoneCanvassCallerDTO.from({
          id: caller.id,
          displayName: "Test",
          email: "Test@Test.com",
          activePhoneCanvassId: canvass.id,
          ready: "ready",
          authToken: caller.authToken,
        }),
      }),
    );
    expect(mock.makeCall).toBeCalledTimes(1);
    let lastCall = await getLastMadeCall(mock, undefined);

    await updateTwilioCallStatus(f, lastCall.sid, "initiated");
    await updateTwilioCallStatus(f, lastCall.sid, "ringing");
    await updateTwilioCallStatus(f, lastCall.sid, "in-progress");

    expect(mock.makeCall).toBeCalledTimes(1);
    await updateTwilioCallStatus(f, lastCall.sid, "completed");
    expect(mock.makeCall).toBeCalledTimes(2);

    lastCall = await getLastMadeCall(mock, lastCall.sid);
    await updateTwilioCallStatus(f, lastCall.sid, "initiated");
    await updateTwilioCallStatus(f, lastCall.sid, "ringing");
    await updateTwilioCallStatus(f, lastCall.sid, "in-progress");
    await updateTwilioCallStatus(f, lastCall.sid, "completed");
    expect(mock.makeCall).toBeCalledTimes(3);

    lastCall = await getLastMadeCall(mock, lastCall.sid);

    await updateTwilioCallStatus(f, lastCall.sid, "initiated");
    await updateTwilioCallStatus(f, lastCall.sid, "ringing");
    await updateTwilioCallStatus(f, lastCall.sid, "in-progress");
    await updateTwilioCallStatus(f, lastCall.sid, "completed");
    expect(mock.makeCall).toBeCalledTimes(4);

    lastCall = await getLastMadeCall(mock, lastCall.sid);
    await updateTwilioCallStatus(f, lastCall.sid, "initiated");
    await updateTwilioCallStatus(f, lastCall.sid, "ringing");
    await updateTwilioCallStatus(f, lastCall.sid, "in-progress");
    await updateTwilioCallStatus(f, lastCall.sid, "completed");

    // We're out of calls, so no new call is made.
    // We still need to actually handle this.
    expect(mock.makeCall).toBeCalledTimes(4);
  });

  // TODO: figure out where this should live. Maybe we should have an e2e-test with
  // a randomly generated csv?
  it("DEV ONLY: can generate spit out a test csv", async () => {
    const ROWS = 100;
    const rows: GVoteCSVEntry[] = [];
    const faker = new Faker({ locale: [en_CA, en] });

    for (let i = 0; i < ROWS; ++i) {
      const firstName = faker.person.firstName();
      const middleName = faker.person.middleName();
      const lastName = faker.person.lastName();
      rows.push({
        id: faker.string.alphanumeric({
          length: 32,
        }),
        email: faker.internet.email({ firstName, lastName }),
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone: faker.phone.number(),
        tags: ";;import-2023-07-24; 2022-gpc-donor; true-multi-unit",
        address: faker.location.streetAddress({ useFullAddress: true }),
        town: faker.location.city(),
        postal_code: faker.location.zipCode(),
        province: faker.location.state(),
        support_level: faker.number.int({ min: 1, max: 5 }),
        party_support: faker.helpers.arrayElement(["GPO", "GPC", ""]),
        voted: faker.helpers.arrayElement([
          "confirmed",
          "not voted",
          "unconfirmed",
          "",
        ]),
      });
    }
    expect(rows).toHaveLength(100);
    const csvString = Papa.unparse(rows);
    await writeFile("/tmp/test.csv", csvString);
  });
});

async function getLastMadeCall(
  mock: TwilioServiceMock,
  priorSid: string | undefined,
): Promise<{
  sid: string;
  status: CallStatus;
  timestamp: number;
}> {
  while (true) {
    const maybeCall = mock.makeCall.mock.results.at(-1);
    if (maybeCall?.type !== "return") {
      throw new Error("Failure in makeCall");
    }
    // TODO: figure out how to avoid races here without polling.
    // This doesn't actually fix the current races, maybe it's completely unnecessary?
    if ((await maybeCall.value).sid === priorSid) {
      // We haven't gotten the next call yet.
      await delay(10);
    } else {
      return await maybeCall.value;
    }
  }
}
