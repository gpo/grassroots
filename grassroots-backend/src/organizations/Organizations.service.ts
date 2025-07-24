import { Injectable } from "@nestjs/common";
import { OrganizationEntity } from "./Organization.entity";
import {
  CreateOrganizationNoParentRequestDTO,
  OrganizationsDTO,
} from "../grassroots-shared/Organization.dto";
import { EntityManager, Loaded } from "@mikro-orm/core";
import { OrganizationRepository } from "./Organization.repo";

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

  async findAll(): Promise<Loaded<OrganizationEntity[]>> {
    return await this.repo.find({});
  }

  async findOneById(
    organization: Partial<OrganizationEntity>,
  ): Promise<Loaded<OrganizationEntity>> {
    return await this.repo.findOneOrFail(organization);
  }

  async getAncestors(organizationID: number): Promise<OrganizationsDTO> {
    const organizationEntities = await this.repo.getAncestors(organizationID);
    const organizationDTOs = organizationEntities.map((x) => x.toDTO());
    return OrganizationsDTO.from({ organizations: organizationDTOs });
  }
}
