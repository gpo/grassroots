import { ConflictException } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { Observable, Subject, tap } from "rxjs";

type GetAuthToken = (id: string) => Promise<string>;

export class PhoneCanvassCallersModel {
  #nextId = 0;
  #callersById = new Map<number, PhoneCanvassCallerDTO>();
  #callers$: Subject<PhoneCanvassCallerDTO>;

  constructor() {
    this.#callers$ = new Subject<PhoneCanvassCallerDTO>();

    this.#callers$.pipe(
      tap((caller) => {
        this.#callersById.set(caller.id, caller);
      }),
    );
  }

  get callers$(): Observable<PhoneCanvassCallerDTO> {
    return this.#callers$;
  }

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    if (
      [...this.#callersById.values()].some(
        (existingCaller) => caller.displayName === existingCaller.displayName,
      )
    ) {
      throw new ConflictException("Display name already taken.");
    }

    const id = ++this.#nextId;

    const withId = PhoneCanvassCallerDTO.from({
      ...propsOf(caller),
      ready: "unready",
      id,
      authToken: await getAuthToken(String(id)),
    });
    this.#callers$.next(withId);
    return withId;
  }

  // This is as secure as the authToken is. If a user could guess someone else's
  // authToken, they could use that to update their data, but we'd already have bigger problems.
  #findCaller(params: {
    id: number;
    authToken: string;
  }): PhoneCanvassCallerDTO | undefined {
    const { id, authToken } = params;
    const existingCaller = this.#callersById.get(id);
    // TODO: we need a more resilient secure identifier, as when the auth token rotates, this breaks.
    void authToken;
    return existingCaller;
  }

  async refreshOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const existingCaller = this.#findCaller(caller);
    if (existingCaller !== undefined) {
      existingCaller.authToken = await getAuthToken(String(caller.id));
      this.#callers$.next(existingCaller);
      return existingCaller;
    }

    return this.registerCaller(
      CreatePhoneCanvassCallerDTO.from(propsOf(caller)),
      getAuthToken,
    );
  }

  async updateOrCreateCaller(
    updatedCaller: PhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const existingCaller = this.#findCaller(updatedCaller);
    if (existingCaller !== undefined) {
      Object.assign(existingCaller, updatedCaller);
      this.#callers$.next(existingCaller);
      return existingCaller;
    }

    return await this.registerCaller(
      CreatePhoneCanvassCallerDTO.from(propsOf(updatedCaller)),
      getAuthToken,
    );
  }

  /*onCallCompleteForCaller(
    phoneCanvassId: string,
    callerId: number,
  ): { becameUnready: boolean } {
    const callers = this.#phoneCanvassIdToCaller.get(phoneCanvassId) ?? [];
    const existingCaller = callers.find((x) => x.id === callerId);
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
}*/

  /*listCallers(phoneCanvassId: string): PhoneCanvassCallerDTO[] {
    return this.#phoneCanvassIdToCaller.get(phoneCanvassId) ?? [];
  }*/
}
