import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import {
  CreateOrganizationDTO,
  CreateOrganizationRootDTO,
  OrganizationResponseDTO,
} from "../grassroots-shared/Organization.dto";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDTO: CreateOrganizationDTO,
  ): Promise<OrganizationResponseDTO> {
    const organization = await this.organizationsService.create(
      createOrganizationDTO,
      createOrganizationDTO.parentID,
    );
    return organization.toDTO();
  }

  @Post("create-root")
  async createRoot(
    @Body() createOrganizationDTO: CreateOrganizationRootDTO,
  ): Promise<OrganizationResponseDTO> {
    const organization = await this.organizationsService.create(
      createOrganizationDTO,
      null,
    );
    return organization.toDTO();
  }

  @Get()
  async findAll(): Promise<OrganizationResponseDTO[]> {
    const organizationEntities = await this.organizationsService.findAll();
    return organizationEntities.map((x) => x.toDTO());
  }

  @Get(":id")
  async findById(@Param("id") id: number): Promise<OrganizationResponseDTO> {
    const organizationEntity = await this.organizationsService.findOne({
      id: id,
    });
    return organizationEntity.toDTO();
  }

  @Get("ancestors-of/:id")
  async getAncestors(
    @Param("id") id: number,
  ): Promise<OrganizationResponseDTO[]> {
    const organizationEntities =
      await this.organizationsService.getAncestors(id);
    return organizationEntities.map((x) => x.toDTO());
  }
}
