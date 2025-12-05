import { ConflictException } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { Observable, Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { Call } from "./Scheduler/PhoneCanvassCall.js";

type GetAuthToken = (id: string) => Promise<string>;

// We keep caller ids stable across server restarts, as it
// simplifies book-keeping. A client provides their uuid and most recent auth token,
// and if we already have them registered, we consider them authenticated.
// If we don't have that UUID yet (because the server restarted), we
// just register them as though they were a new user.
export class PhoneCanvassCallersModel {
  #callersById = new Map<string, PhoneCanvassCallerDTO>();
  #callers$: Subject<Readonly<PhoneCanvassCallerDTO>>;

  constructor(params: { callers: Subject<Readonly<PhoneCanvassCallerDTO>> }) {
    this.#callers$ = params.callers;

    this.#callers$.subscribe((caller) => {
      this.#callersById.set(caller.id, caller);
    });
  }

  get callers$(): Observable<PhoneCanvassCallerDTO> {
    return this.#callers$;
  }

  async registerCaller(params: {
    caller: CreatePhoneCanvassCallerDTO;
    getAuthToken: GetAuthToken;
    idForReuse?: string;
  }): Promise<PhoneCanvassCallerDTO> {
    const { caller, getAuthToken, idForReuse } = params;
    if (
      [...this.#callersById.values()].some(
        (existingCaller) => caller.displayName === existingCaller.displayName,
      )
    ) {
      throw new ConflictException("Display name already taken.");
    }

    const id = idForReuse ?? uuidv4();

    const withId: Readonly<PhoneCanvassCallerDTO> = PhoneCanvassCallerDTO.from({
      ...propsOf(caller),
      ready: "unready",
      id,
      // In some cases we'll refresh the auth token more than is necessary,
      // but it appears to be ~synchronous and fast, so this is fine.
      authToken: await getAuthToken(String(id)),
    });
    console.log(
      "Registering new caller with authToken",
      withId.authToken.slice(-10, -1),
    );
    this.#callers$.next(withId);
    return withId;
  }

  // This is as secure as the authToken is. If a user could guess someone else's
  // authToken, they could use that to update their data, but we'd already have bigger problems.
  #authenticateCaller(params: {
    id: string;
    authToken: string;
  }): Readonly<PhoneCanvassCallerDTO> | undefined {
    const caller = this.#callersById.get(params.id);
    if (caller?.authToken === undefined) {
      // TODO: we could persist the authtoken somewhere, but
      // security in the face of a restarting server is probably pretty
      // low priority.
      // If we don't have a recorded authToken for this user, we'll just make a new one.
      return caller;
    }
    if (caller.authToken !== params.authToken) {
      console.log("EXISTING", caller.authToken.slice(-10, -1));
      console.log("LOOKING FOR", params.authToken.slice(-10, -1));
      return undefined;
    }
    return caller;
  }

  #findCaller(params: {
    id: string;
  }): Readonly<PhoneCanvassCallerDTO> | undefined {
    return this.#callersById.get(params.id);
  }

  async updateOrCreateCaller(
    updatedCaller: Readonly<PhoneCanvassCallerDTO>,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const existingCaller = this.#authenticateCaller(updatedCaller);
    if (existingCaller !== undefined) {
      const newCaller: Readonly<PhoneCanvassCallerDTO> =
        PhoneCanvassCallerDTO.from({
          ...propsOf(existingCaller),
          ...propsOf(updatedCaller),
          authToken: await getAuthToken(String(existingCaller.id)),
        });

      console.log("CALLER READY in update is", newCaller.ready);

      this.#callers$.next(newCaller);
      return newCaller;
    }

    return this.registerCaller({
      caller: CreatePhoneCanvassCallerDTO.from(propsOf(updatedCaller)),
      getAuthToken,
      idForReuse: updatedCaller.id,
    });
  }

  getCaller(callerId: string): Readonly<PhoneCanvassCallerDTO> {
    console.log("onCallCompleteForCaller");
    const existingCaller = this.#findCaller({ id: callerId });
    if (existingCaller === undefined) {
      throw new Error(
        "Trying to mark call completed for caller that doesn't exist",
      );
    }
    return existingCaller;
  }

  async markOneLastCallCallerAsUnready(
    calls: Call[],
    updateOrCreateCaller: (
      caller: PhoneCanvassCallerDTO,
    ) => Promise<PhoneCanvassCallerDTO>,
  ): Promise<void> {
    console.log("Trying a markOneLastCallCallerAsUnready");

    for (const caller of this.#callersById.values()) {
      if (caller.ready !== "last call") {
        continue;
      }
      const call = calls.find((call) => call.callerId === caller.id);
      if (call !== undefined) {
        // This caller will be marked unready when the current call finishes.
        continue;
      }
      console.log("markOneLastCallCallerAsUnready");

      await updateOrCreateCaller(
        PhoneCanvassCallerDTO.from({ ...propsOf(caller), ready: "unready" }),
      );
      return;
    }
  }
}
