import { Injectable } from "@nestjs/common";
import { RoleEntity } from "./Role.entity";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { RoleDTO } from "../grassroots-shared/Role.dto";

@Injectable()
export class RolesService {
  repo: EntityRepository<RoleEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<RoleEntity>(RoleEntity);
  }

  async recreateRoles(): Promise<void> {
    await this.repo.nativeDelete({});
    this.entityManager.clear();

    this.repo.create({
      name: "No Permissions",
      canViewContacts: false,
      canManageContacts: false,
      canManageUsers: false,
    });

    this.repo.create({
      name: "View Only",
      canViewContacts: true,
      canManageContacts: false,
      canManageUsers: false,
    });

    this.repo.create({
      name: "Contact Manager",
      canViewContacts: true,
      canManageContacts: true,
      canManageUsers: false,
    });

    this.repo.create({
      name: "Admin",
      canViewContacts: true,
      canManageContacts: true,
      canManageUsers: true,
    });
  }

  async findAll(): Promise<RoleDTO[]> {
    return this.repo.findAll();
  }
}
