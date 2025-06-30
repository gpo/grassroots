import { Injectable } from "@nestjs/common";
import { OrganizationEntity } from "./Organization.entity";
import {
  CreateOrganizationDTO,
  CreateRootOrganizationDTO,
  ShallowOrganizationDTO,
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
    createOrganizationDto: CreateOrganizationDTO,
  ): Promise<OrganizationEntity> {
    const organization = this.repo.create(createOrganizationDto);
    const parentOrganization = await this.repo.findOne({
      id: createOrganizationDto.parentID,
    });
    if (parentOrganization === null) {
      throw new Error("Invalid parent organization");
    }
    organization.parent = parentOrganization;
    return organization;
  }

  async createRootOrganization(
    createOrganizationDto: CreateRootOrganizationDTO,
  ): Promise<OrganizationEntity> {
    return await this.repo.upsert(createOrganizationDto);
  }

  async findAll(): Promise<Loaded<OrganizationEntity[]>> {
    return await this.repo.find({});
  }

  async findOneByName(name: string): Promise<Loaded<OrganizationEntity>> {
    return await this.repo.findOneOrFail({ name });
  }

  getAncestors(organization: OrganizationEntity): ShallowOrganizationDTO[] {
    const ancestors: ShallowOrganizationDTO[] = [];
    let current: OrganizationEntity | undefined | null = organization.parent;
    while (current !== undefined && current !== null) {
      ancestors.push(current);
      current = current.parent;
    }
    return ancestors;
  }
}
