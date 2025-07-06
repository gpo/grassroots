import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { GrassrootsRequest } from "../types/GrassrootsRequest";
import { UserEntity } from "../users/User.entity";

export const MOCK_AUTH_GUARD_USER: UserEntity = {
  id: "testid",
  emails: ["test@example.com"],
  displayName: "Test Example",
};

@Injectable()
export class MockSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: GrassrootsRequest = context.switchToHttp().getRequest();
    req.user = MOCK_AUTH_GUARD_USER;
    return true;
  }
}
