import { DynamicModule } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

export function PassportModuleImport(): DynamicModule {
  return PassportModule.register({ session: true });
}
