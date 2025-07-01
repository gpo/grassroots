import { Body, Controller, Get, Post } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import {
  CreateOrganizationDTO,
  CreateOrganizationRootDTO,
  OrganizationDTO,
} from "../grassroots-shared/Organization.dto";
import { OrganizationEntity } from "./Organization.entity";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @Body() createOrganizationDTO: CreateOrganizationDTO,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.create(
      createOrganizationDTO,
      createOrganizationDTO.parentID,
    );
  }

  @Post("create-root")
  createRoot(
    @Body() createOrganizationDTO: CreateOrganizationRootDTO,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.create(createOrganizationDTO, null);
  }

  @Get()
  async findAll(): Promise<OrganizationDTO[]> {
    const organizationEntities = await this.organizationsService.findAll();
    return organizationEntities.map((x) => x.toDTO());
  }
}
