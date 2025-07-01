import { Body, Controller, Get, Post } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import {
  CreateOrganizationDTO,
  CreateOrganizationRootDTO,
  OrganizationDTO,
} from "../grassroots-shared/Organization.dto";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDTO: CreateOrganizationDTO,
  ): Promise<OrganizationDTO> {
    const organization = await this.organizationsService.create(
      createOrganizationDTO,
      createOrganizationDTO.parentID,
    );
    return organization.toDTO();
  }

  @Post("create-root")
  async createRoot(
    @Body() createOrganizationDTO: CreateOrganizationRootDTO,
  ): Promise<OrganizationDTO> {
    const organization = await this.organizationsService.create(
      createOrganizationDTO,
      null,
    );
    return organization.toDTO();
  }

  @Get()
  async findAll(): Promise<OrganizationDTO[]> {
    const organizationEntities = await this.organizationsService.findAll();
    return organizationEntities.map((x) => x.toDTO());
  }
}
