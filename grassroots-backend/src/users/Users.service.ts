import { Injectable } from "@nestjs/common";
import { UserEntity } from "./User.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { UserDTO } from "grassroots-shared/dtos/User.dto";
import { instanceToPlain } from "class-transformer";
import { OrganizationEntity } from "../organizations/Organization.entity.js";
import { OrganizationRepository } from "../organizations/Organization.repo.js";
import { UserRoleEntity } from "./UserRole.entity.js";
import { Permission } from "grassroots-shared/dtos/Permission.dto";

@Injectable()
export class UsersService {
  repo: EntityRepository<UserEntity>;
  organizationRepo: OrganizationRepository;
  userRoleRepo: EntityRepository<UserRoleEntity>;

  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<UserEntity>(UserEntity);
    this.organizationRepo =
      entityManager.getRepository<OrganizationEntity>(OrganizationEntity);
    this.userRoleRepo =
      this.entityManager.getRepository<UserRoleEntity>(UserRoleEntity);
  }
  async findOrCreate(user: UserDTO): Promise<UserDTO> {
    const existing = await this.repo.findOne(
      { id: user.id },
      { populate: ["userRoles"] },
    );
    if (existing !== null) {
      return existing.toDTO();
    }
    const newUser = this.repo.create({
      ...instanceToPlain(user),
      emails: user.emails,
      userRoles: [],
    });

    for (const userRoleDTO of user.userRoles ?? []) {
      const roleId = userRoleDTO.role.id;
      const organization = this.organizationRepo.getReference(
        userRoleDTO.organizationId,
      );
      this.userRoleRepo.create({
        user: newUser,
        _roleId: roleId,
        organization: organization,
        inherited: userRoleDTO.inherited,
      });
    }

    await this.entityManager.flush();
    return newUser.toDTO();
  }

  async findOneById(id: string): Promise<UserDTO | null> {
    return (
      (await this.repo.findOne({ id }, { populate: ["userRoles"] }))?.toDTO() ??
      null
    );
  }

  async findAll(): Promise<UserDTO[]> {
    return (await this.repo.find({})).map((x) => x.toDTO());
  }

  async getUserPermissionsForOrg(
    userId: string,
    organizationId: number,
  ): Promise<Permission[]> {
    const user = await this.repo.findOne(userId);
    if (user === null) {
      throw new Error("Invalid user id");
    }
    const rootOrganization = await this.organizationRepo.findOne({
      id: organizationId,
    });
    if (rootOrganization === null) {
      throw new Error("Invalid organization ID");
    }
    const ancestorOrganizationIds: Set<number> = new Set<number>(
      (await this.organizationRepo.getAncestors(organizationId)).map(
        (x) => x.id,
      ),
    );

    const userRoles = user.userRoles.filter(
      (role) =>
        role.organization.id === rootOrganization.id ||
        (role.inherited && ancestorOrganizationIds.has(role.organization.id)),
    );

    const permissions: Set<Permission> = userRoles.reduce(
      (permissions, userRole) => {
        userRole.role.permissions.forEach((permission: Permission) => {
          permissions.add(permission);
        });
        return permissions;
      },
      new Set<Permission>(),
    );

    return Array.from(permissions);
  }
}
