import { Module } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";

@Module({
  providers: [OrganizationsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OrganizationsModule {}
