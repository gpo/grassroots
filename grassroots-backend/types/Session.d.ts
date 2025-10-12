import "express-session";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import "grassroots-shared/PhoneCanvass/ParticipantIdentity";

declare module "express-session" {
  interface SessionData {
    redirect_path?: string;
    activeOrganizationId?: number;
    phoneCanvassParticipantIdentity: PhoneCanvassParticipantIdentityDTO;
  }
}
