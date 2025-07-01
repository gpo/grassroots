import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationEntity } from "./Organization.entity";
import { CreateOrganizationRootDTO } from "../grassroots-shared/Organization.dto";
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
    await this.entityManager.flush();
    return newOrganization;
  }

  async findAll(): Promise<Loaded<OrganizationEntity[]>> {
    return await this.repo.find({});
  }

  async findOneByName(name: string): Promise<Loaded<OrganizationEntity>> {
    return await this.repo.findOneOrFail({ name });
  }

  async getAncestors(organizationID: number): Promise<OrganizationEntity[]> {
    const ancestors: OrganizationEntity[] = [];
    let current: Loaded<OrganizationEntity> | undefined | null =
      await this.repo.findOne({ id: organizationID });
    if (current === null) {
      throw new NotFoundException(
        `No organization with id ${String(organizationID)} found.`,
      );
    }
    current = current.parent;
    while (current !== undefined) {
      ancestors.push(current);
      current = current.parent;
    }
    return ancestors;
  }
}
