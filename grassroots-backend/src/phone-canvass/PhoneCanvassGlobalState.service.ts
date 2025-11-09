import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";

@Injectable()
export class PhoneCanvassGlobalStateService {
  #phoneCanvassIdToCaller = new Map<string, PhoneCanvassCallerDTO[]>();
  #nextId = 0;

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
    getAuthToken: (id: string) => Promise<string>,
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

  updateCaller(updatedCaller: PhoneCanvassCallerDTO): void {
    const callers =
      this.#phoneCanvassIdToCaller.get(updatedCaller.activePhoneCanvassId) ??
      [];
    const caller = callers.find((callers) => callers.id === updatedCaller.id);
    if (caller === undefined) {
      throw new NotFoundException("Invalid caller");
    }
    Object.assign(caller, updatedCaller);
  }

  listCallers(phoneCanvassId: string): PhoneCanvassCallerDTO[] {
    return this.#phoneCanvassIdToCaller.get(phoneCanvassId) ?? [];
  }
}
