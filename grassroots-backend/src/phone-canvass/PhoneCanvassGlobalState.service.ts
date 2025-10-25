import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Injectable()
export class PhoneCanvassGlobalStateService {
  // Map from phoneCanvassId to participant identities.
  #phoneCanvassIdToParticipantDisplayName = new Map<
    string,
    PhoneCanvassCallerDTO[]
  >();

  addParticipant(identity: PhoneCanvassCallerDTO): void {
    const participants =
      this.#phoneCanvassIdToParticipantDisplayName.get(
        identity.activePhoneCanvassId,
      ) ?? [];

    if (
      participants.some(
        (participant) => participant.displayName === identity.displayName,
      )
    ) {
      throw new ConflictException("Display name already taken.");
    }
    participants.push(identity);
    this.#phoneCanvassIdToParticipantDisplayName.set(
      identity.activePhoneCanvassId,
      participants,
    );
  }

  updateParticipant(identity: PhoneCanvassCallerDTO): void {
    const participants =
      this.#phoneCanvassIdToParticipantDisplayName.get(
        identity.activePhoneCanvassId,
      ) ?? [];
    const participant = participants.find(
      (participant) => participant.displayName === identity.displayName,
    );
    if (participant === undefined) {
      throw new NotFoundException("Invalid participant");
    }
    Object.assign(participant, identity);
  }

  listCallers(phoneCanvassId: string): PhoneCanvassCallerDTO[] {
    return (
      this.#phoneCanvassIdToParticipantDisplayName.get(phoneCanvassId) ?? []
    );
  }
}
