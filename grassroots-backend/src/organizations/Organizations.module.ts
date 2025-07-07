import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import { OrganizationsController } from "./Organizations.controller";

@Module({
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
