import { EntityRepository, Loaded } from "@mikro-orm/postgresql";
import { OrganizationEntity } from "./Organization.entity";
import { NotFoundException } from "@nestjs/common";

export class OrganizationRepository extends EntityRepository<OrganizationEntity> {
  async getAncestors(organizationID: number): Promise<OrganizationEntity[]> {
    const ancestors: OrganizationEntity[] = [];
    let current: Loaded<OrganizationEntity> | undefined | null =
      await this.findOne({ id: organizationID });
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
