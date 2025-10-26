import "express-session";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

declare module "express-session" {
  interface SessionData {
    redirect_path?: string;
    activeOrganizationId?: number;
    phoneCanvassCaller: PhoneCanvassCallerDTO;
  }
}
