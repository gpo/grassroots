import "express-session";

declare module "express-session" {
  interface SessionData {
    redirect_path?: string;
    activeOrganizationId: number;
  }
}
