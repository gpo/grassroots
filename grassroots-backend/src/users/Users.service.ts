import { Injectable } from "@nestjs/common";
import { UserEntity } from "./User.entity";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { UserDTO } from "@grassroots/shared";

@Injectable()
export class UsersService {
  repo: EntityRepository<UserEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<UserEntity>(UserEntity);
  }
  async findOrCreate(user: UserDTO): Promise<UserDTO | undefined> {
    const existing = await this.repo.findOne({ id: user.id });
    if (existing !== null) {
      return existing.toDTO();
    }
    const result = this.repo.create(user);
    await this.entityManager.flush();
    return result.toDTO();
  }

  async findOneById(id: string): Promise<UserDTO | null> {
    return (await this.repo.findOne({ id }))?.toDTO() ?? null;
  }

  async findAll(): Promise<UserDTO[]> {
    return (await this.repo.find({})).map((x: UserEntity) => x.toDTO());
  }
}
