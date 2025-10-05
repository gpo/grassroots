import { ConflictException, Injectable } from "@nestjs/common";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Injectable()
export class PhoneCanvassGlobalStateService {
  // Map from phoneCanvassId to participant identities.
  #phoneCanvassIdToParticipantDisplayName = new Map<
    string,
    PhoneCanvassParticipantIdentityDTO[]
  >();

  addParticipant(identity: PhoneCanvassParticipantIdentityDTO): void {
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

  listParticipants(
    phoneCanvassId: string,
  ): PhoneCanvassParticipantIdentityDTO[] {
    return (
      this.#phoneCanvassIdToParticipantDisplayName.get(phoneCanvassId) ?? []
    );
  }
}
