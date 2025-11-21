import { ConflictException, Injectable } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";

type GetAuthToken = (id: string) => Promise<string>;

@Injectable()
export class PhoneCanvassGlobalStateService {
  #phoneCanvassIdToCaller = new Map<string, PhoneCanvassCallerDTO[]>();
  #nextId = 0;

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const callers =
      this.#phoneCanvassIdToCaller.get(caller.activePhoneCanvassId) ?? [];

    if (
      callers.some(
        (existingCaller) => caller.displayName === existingCaller.displayName,
      )
    ) {
      throw new ConflictException("Display name already taken.");
    }

    const id = ++this.#nextId;

    const withId = PhoneCanvassCallerDTO.from({
      ...propsOf(caller),
      ready: false,
      id,
      authToken: await getAuthToken(String(id)),
    });

    callers.push(withId);
    this.#phoneCanvassIdToCaller.set(caller.activePhoneCanvassId, callers);
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
    const callers =
      this.#phoneCanvassIdToCaller.get(activePhoneCanvassId) ?? [];

    console.log("LOOKING FOR MATCHING CALLER", callers, id, authToken);

    const existingCaller = callers.find(
      // TODO: we need a more resilient secure identifier, as when the auth token rotates, this breaks.
      (x) => x.id === id /*&& x.authToken == authToken,*/,
    );
    return existingCaller;
  }

  async refreshOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
    getAuthToken: GetAuthToken,
  ): Promise<PhoneCanvassCallerDTO> {
    const existingCaller = this.#findCaller(caller);
    if (existingCaller !== undefined) {
      existingCaller.authToken = await getAuthToken(String(caller.id));
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
      return existingCaller;
    }

    return await this.registerCaller(
      CreatePhoneCanvassCallerDTO.from(propsOf(updatedCaller)),
      getAuthToken,
    );
  }

  listCallers(phoneCanvassId: string): PhoneCanvassCallerDTO[] {
    return this.#phoneCanvassIdToCaller.get(phoneCanvassId) ?? [];
  }
}
