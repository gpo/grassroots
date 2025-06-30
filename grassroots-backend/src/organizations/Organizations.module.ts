import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import { RolesService } from "./Roles.service";

@Module({
  providers: [OrganizationsService, RolesService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
