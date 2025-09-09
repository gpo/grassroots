import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationEntity } from "./Organization.entity.js";
import {
  CreateOrganizationNoParentRequestDTO,
  OrganizationDTO,
  OrganizationsDTO,
} from "../grassroots-shared/Organization.dto.js";
import { EntityManager } from "@mikro-orm/core";
import { OrganizationRepository } from "./Organization.repo.js";

@Injectable()
export class OrganizationsService {
  repo: OrganizationRepository;
  constructor(private readonly entityManager: EntityManager) {
    this.repo =
      entityManager.getRepository<OrganizationEntity>(OrganizationEntity);
  }

  async create(
    organization: CreateOrganizationNoParentRequestDTO,
    parentID: number | null,
  ): Promise<OrganizationEntity> {
    const newOrganization = this.repo.create(organization);

    if (parentID != null) {
      const parent = await this.repo.findOne({
        id: parentID,
      });
      if (parent === null) {
        throw new Error("Invalid parent organization");
      }
      newOrganization.parent = parent;
    }
    await this.entityManager.flush();
    return newOrganization;
  }

  async findAll(): Promise<OrganizationsDTO> {
    return OrganizationsDTO.from({
      organizations: (await this.repo.find({})).map((x) => x.toDTO()),
    });
  }

  async findOneById(id: number): Promise<OrganizationDTO> {
    const org = await this.repo.findOne({ id });
    if (org === null) {
      throw new NotFoundException("Organization not found");
    }

    return org.toDTO();
  }

  async getAncestors(organizationID: number): Promise<OrganizationsDTO> {
    const organizationEntities = await this.repo.getAncestors(organizationID);
    const organizationDTOs = organizationEntities.map((x) => x.toDTO());
    return OrganizationsDTO.from({ organizations: organizationDTOs });
  }
}
