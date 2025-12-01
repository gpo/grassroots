import { ConflictException } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { Observable, Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";

type GetAuthToken = (id: string) => Promise<string>;

// We keep caller ids stable across server restarts, as it
// simplifies book-keeping. A client provides their uuid and most recent auth token,
// and if we already have them registered, we consider them authenticated.
// If we don't have that UUID yet (because the server restarted), we
// just register them as though they were a new user.
export class PhoneCanvassCallersModel {
  #callersById = new Map<string, PhoneCanvassCallerDTO>();
  #callers$: Subject<PhoneCanvassCallerDTO>;

  constructor() {
    this.#callers$ = new Subject<PhoneCanvassCallerDTO>();

    this.#callers$.subscribe((caller) => {
      console.log(
        "GIVING CALLER WITH ID",
        caller.id,
        "authtoken",
        caller.authToken.slice(-10, -1),
      );
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

    const withId = PhoneCanvassCallerDTO.from({
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
  // TODO: this currently doesn't use the auth token.
  // We need a more resilient secure identifier, as when the auth token rotates, comparing
  // to it here breaks.
  #authenticateCaller(params: {
    id: string;
    authToken: string;
  }): PhoneCanvassCallerDTO | undefined {
    const caller = this.#callersById.get(params.id);
    if (caller?.authToken === undefined) {
      // TODO: we could persist the authtoken somewhere, but
      // security in the face of a restarting server is probably pretty
      // low priority.
      // If we don't have a recorded authToken for this user
      return caller;
    }
    if (caller.authToken !== params.authToken) {
      console.log("AUTHTOKEN NOT MATCHING.");
      console.log("EXISTING", caller.authToken.slice(-10, -1));
      console.log("LOOKING FOR", params.authToken.slice(-10, -1));

      return undefined;
    }
    return caller;
  }

  #findCaller(params: { id: string }): PhoneCanvassCallerDTO | undefined {
    return this.#callersById.get(params.id);
  }

  async updateOrCreateCaller(
    updatedCaller: PhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const existingCaller = this.#authenticateCaller(updatedCaller);
    if (existingCaller !== undefined) {
      const newCaller = PhoneCanvassCallerDTO.from({
        ...propsOf(existingCaller),
        ...propsOf(updatedCaller),
        authToken: await getAuthToken(String(existingCaller.id)),
      });

      console.log(
        "Have existing caller, giving authToken",
        newCaller.authToken.slice(-10, -1),
      );

      this.#callers$.next(newCaller);
      return newCaller;
    }

    return this.registerCaller({
      caller: CreatePhoneCanvassCallerDTO.from(propsOf(updatedCaller)),
      getAuthToken,
      idForReuse: updatedCaller.id,
    });
  }

  onCallCompleteForCaller(callerId: string): { becameUnready: boolean } {
    const existingCaller = this.#findCaller({ id: callerId });
    if (existingCaller === undefined) {
      throw new Error(
        "Trying to mark call completed for caller that doesn't exist",
      );
    }
    if (existingCaller.ready !== "last call") {
      return { becameUnready: false };
    }
    existingCaller.ready = "unready";
    return { becameUnready: true };
  }
}
