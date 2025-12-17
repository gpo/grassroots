import { ConflictException } from "@nestjs/common";
import {
  CreateOrUpdatePhoneCanvassCallerDTO,
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
  #callers$: Subject<Readonly<PhoneCanvassCallerDTO>>;

  constructor(params: { callers: Subject<Readonly<PhoneCanvassCallerDTO>> }) {
    this.#callers$ = params.callers;

    this.#callers$.subscribe({
      next: (caller) => {
        this.#callersById.set(caller.id, caller);
      },
      error: (error: unknown) => {
        throw error;
      },
    });
  }

  get callers$(): Observable<PhoneCanvassCallerDTO> {
    return this.#callers$;
  }

  async registerCaller(params: {
    caller: CreateOrUpdatePhoneCanvassCallerDTO;
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
    this.#callers$.next(withId);
    return withId;
  }

  // TODO - this doesn't currently validate at all! This means that anyone in the
  // phone canvass can impersonate anyone else. You need to know the phone canvass id
  // though, so this isn't too scary. It should still be fixed though!
  // Using the authToken isn't reliable, as there are cases where the server will send
  // an updated authToken but the user will leave the page before the browser stores it.
  // We should use some other kind of secret.
  // The below description is how this was intended to work...
  // This is as secure as the authToken is. If a user could guess someone else's
  // authToken, they could use that to update their data, but we'd already have bigger problems.
  #authenticateCaller(params: {
    id?: string;
    authToken?: string;
  }): Readonly<PhoneCanvassCallerDTO> | undefined {
    const { id, authToken } = params;
    if (id === undefined || authToken === undefined) {
      return undefined;
    }
    const caller = this.#callersById.get(id);
    if (caller?.authToken === undefined) {
      // TODO: we could persist the authtoken somewhere, but
      // security in the face of a restarting server is probably pretty
      // low priority.
      // If we don't have a recorded authToken for this user, we'll just make a new one.
      return caller;
    }
    //if (caller.authToken !== params.authToken) {
    //return undefined;
    //}
    return caller;
  }

  #findCaller(params: {
    id: string;
  }): Readonly<PhoneCanvassCallerDTO> | undefined {
    return this.#callersById.get(params.id);
  }

  // TODO: this is scary, because if you call this without getting the result to the client,
  // the auth token can get out of sync.
  // We should split this out from updating the auth token.
  async updateOrCreateCaller(
    updatedCaller: Readonly<CreateOrUpdatePhoneCanvassCallerDTO>,
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
      this.#callers$.next(newCaller);
      return newCaller;
    }
    return this.registerCaller({
      caller: CreateOrUpdatePhoneCanvassCallerDTO.from(propsOf(updatedCaller)),
      getAuthToken,
      idForReuse: updatedCaller.id,
    });
  }

  updateCallerInternal(
    updatedCaller: Readonly<CreateOrUpdatePhoneCanvassCallerDTO>,
  ): void {
    // TODO: we don't really need to auth here.
    const existingCaller = this.#authenticateCaller(updatedCaller);
    if (existingCaller === undefined) {
      throw new Error(`"Can't find caller with id ${String(updatedCaller.id)}`);
    }
    const newCaller: Readonly<PhoneCanvassCallerDTO> =
      PhoneCanvassCallerDTO.from({
        ...propsOf(existingCaller),
        ...propsOf(updatedCaller),
      });
    this.#callers$.next(newCaller);
  }

  getCaller(callerId: string): Readonly<PhoneCanvassCallerDTO> {
    const existingCaller = this.#findCaller({ id: callerId });
    if (existingCaller === undefined) {
      throw new Error(
        "Trying to mark call completed for caller that doesn't exist",
      );
    }
    return existingCaller;
  }
}
