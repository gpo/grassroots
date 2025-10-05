import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class PhoneCanvassGlobalStateService {
  // Map from phoneCanvassId to participant display names.
  #phoneCanvassIdToParticipantDisplayName = new Map<string, string[]>();

  addParticipant(phoneCanvassId: string, displayName: string): void {
    displayName = displayName.trim();
    const participants =
      this.#phoneCanvassIdToParticipantDisplayName.get(phoneCanvassId) ?? [];

    if (participants.includes(displayName)) {
      throw new ConflictException("Display name already taken.");
    }
    participants.push(displayName);
    this.#phoneCanvassIdToParticipantDisplayName.set(
      phoneCanvassId,
      participants,
    );
  }

  listParticipants(phoneCanvassId: string): string[] {
    return (
      this.#phoneCanvassIdToParticipantDisplayName.get(phoneCanvassId) ?? []
    );
  }
}
