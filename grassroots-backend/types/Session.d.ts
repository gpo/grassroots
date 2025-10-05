import "express-session";
import "grassroots-shared/PhoneCanvass/ParticipantIdentity";

declare module "express-session" {
  interface SessionData {
    redirect_path?: string;
    activeOrganizationId?: number;
    phoneCanvassData?: {
      activePhoneCanvassId: string;
      participantIdentity: ParticipantIdentity;
    };
  }
}
