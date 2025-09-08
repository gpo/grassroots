import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service.js";
import { OrganizationsController } from "./Organizations.controller.js";
import { RolesService } from "./Roles.service.js";
import { RolesController } from "./Roles.controller.js";

@Module({
  providers: [OrganizationsService, RolesService],
  controllers: [OrganizationsController, RolesController],
  exports: [OrganizationsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
