import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { OrganizationsService } from "./Organizations.service";
import {
  CreateOrganizationRequestDTO,
  CreateOrganizationNoParentRequestDTO,
  OrganizationDTO,
  OrganizationsDTO,
} from "grassroots-shared/Organization.dto";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDTO: CreateOrganizationRequestDTO,
  ): Promise<OrganizationDTO> {
    const organization = await this.organizationsService.create(
      CreateOrganizationNoParentRequestDTO.from(createOrganizationDTO),
      createOrganizationDTO.parentID,
    );
    return organization.toDTO();
  }

  @Post("create-root")
  async createRoot(
    @Body() createOrganizationDTO: CreateOrganizationNoParentRequestDTO,
  ): Promise<OrganizationDTO> {
    const organization = await this.organizationsService.create(
      createOrganizationDTO,
      null,
    );
    return organization.toDTO();
  }

  @Get()
  async findAll(): Promise<OrganizationsDTO> {
    return await this.organizationsService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: number): Promise<OrganizationDTO> {
    return await this.organizationsService.findOneById(id);
  }

  @Get("ancestors-of/:id")
  async getAncestors(@Param("id") id: number): Promise<OrganizationsDTO> {
    return await this.organizationsService.getAncestors(id);
  }
}
