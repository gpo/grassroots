import { Injectable } from "@nestjs/common";
import { OrganizationEntity } from "./Organization.entity";
import {
  CreateOrganizationRootDTO,
  OrganizationDTO,
} from "../grassroots-shared/Organization.dto";
import { EntityManager, EntityRepository, Loaded } from "@mikro-orm/core";

@Injectable()
export class OrganizationsService {
  repo: EntityRepository<OrganizationEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo =
      entityManager.getRepository<OrganizationEntity>(OrganizationEntity);
  }

  async create(
    organization: CreateOrganizationRootDTO,
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
    return newOrganization;
  }

  async findAll(): Promise<Loaded<OrganizationEntity[]>> {
    return await this.repo.find({});
  }

  async findOneByName(name: string): Promise<Loaded<OrganizationEntity>> {
    return await this.repo.findOneOrFail({ name });
  }

  getAncestors(organization: OrganizationEntity): OrganizationDTO[] {
    const ancestors: OrganizationDTO[] = [];
    let current: Loaded<OrganizationEntity> | undefined | null =
      organization.parent;
    while (current !== undefined && current !== null) {
      ancestors.push(current.toDTO());
      current = current.parent;
    }
    return ancestors;
  }
}
