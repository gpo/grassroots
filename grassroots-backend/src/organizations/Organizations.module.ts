import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import { OrganizationsController } from "./Organizations.controller";
import { RolesService } from "./Roles.service";
import { RolesController } from "./Roles.controller";

@Module({
  providers: [OrganizationsService, RolesService],
  controllers: [OrganizationsController, RolesController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
