import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import { OrganizationsController } from "./Organizations.controller";
import { RolesService } from "./Roles.service";

@Module({
  providers: [OrganizationsService, RolesService],
  controllers: [OrganizationsController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
