import { ConflictException, Injectable } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { BehaviorSubject, Observable } from "rxjs";

type GetAuthToken = (id: string) => Promise<string>;

@Injectable()
export class PhoneCanvassCallersService {
  #nextId = 0;
  #callers: PhoneCanvassCallerDTO[] = [];
  #callers$: BehaviorSubject<PhoneCanvassCallerDTO[]>;

  constructor() {
    this.#callers$ = new BehaviorSubject<PhoneCanvassCallerDTO[]>([]);
  }

  get callers$(): Observable<PhoneCanvassCallerDTO[]> {
    return this.#callers$;
  }

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    if (
      this.#callers.some(
        (existingCaller) =>
          caller.displayName === existingCaller.displayName &&
          caller.activePhoneCanvassId === existingCaller.activePhoneCanvassId,
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

    this.#callers.push(withId);
    this.#callers$.next(this.#callers);
    return withId;
  }

  // This is as secure as the authToken is. If a user could guess someone else's
  // authToken, they could use that to update their data, but we'd already have bigger problems.
  #findCaller(params: {
    activePhoneCanvassId: string;
    id: number;
    authToken: string;
  }): PhoneCanvassCallerDTO | undefined {
    const { activePhoneCanvassId, id, authToken } = params;
    const existingCaller = this.#callers.find(
      // TODO: we need a more resilient secure identifier, as when the auth token rotates, this breaks.
      (x) => {
        return (
          x.id === id && x.activePhoneCanvassId === activePhoneCanvassId
        ); /*&& x.authToken == authToken,*/
      },
    );
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
      this.#callers$.next(this.#callers);
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
      this.#callers$.next(this.#callers);
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
