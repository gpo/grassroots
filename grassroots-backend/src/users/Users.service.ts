import { Injectable } from "@nestjs/common";
import { UserEntity } from "./User.entity";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { PropsOf } from "../grassroots-shared/util/PropsOf";

@Injectable()
export class UsersService {
  repo: EntityRepository<UserEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<UserEntity>(UserEntity);
  }
  async findOrCreate(
    user: PropsOf<UserEntity>,
  ): Promise<UserEntity | undefined> {
    const existing = await this.repo.findOne({ id: user.id });
    if (existing !== null) {
      return existing;
    }
    return this.repo.create(user);
  }

  async findOne(user: PropsOf<UserEntity>): Promise<UserEntity | null> {
    return await this.repo.findOne(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.repo.find({});
  }
}
