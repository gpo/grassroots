import "express-session";

module "express-session" {
  interface SessionData {
    redirect_path?: string;
  }
}
