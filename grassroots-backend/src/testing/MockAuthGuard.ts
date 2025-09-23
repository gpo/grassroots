import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { UserDTO } from "grassroots-shared/dtos/User.dto";

export const MOCK_AUTH_GUARD_USER = UserDTO.from({
  id: "testid",
  emails: ["test@example.com"],
  displayName: "Test Example",
});

@Injectable()
export class MockSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: GrassrootsRequest = context.switchToHttp().getRequest();
    req.user = MOCK_AUTH_GUARD_USER;
    return true;
  }
}
