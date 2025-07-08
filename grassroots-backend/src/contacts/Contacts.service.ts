import { Injectable } from "@nestjs/common";
import { ContactEntity } from "./entities/Contact.entity.js";
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  RequiredEntityData,
} from "@mikro-orm/core";
import { LikeOrUndefined } from "../util/LikeOrUndefined";
import {
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "../grassroots-shared/Contact.dto.js";

@Injectable()
export class ContactsService {
  repo: EntityRepository<ContactEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<ContactEntity>(ContactEntity);
  }

  async create(
    contact: RequiredEntityData<ContactEntity>,
  ): Promise<ContactEntity> {
    const result = this.repo.create(contact);
    await this.entityManager.flush();
    return result;
  }

  async bulkCreate(
    contacts: RequiredEntityData<ContactEntity>[],
  ): Promise<ContactEntity[]> {
    const result = contacts.map((x) => this.repo.create(x));
    await this.entityManager.flush();
    return result;
  }

  async findAll(): Promise<ContactEntity[]> {
    return await this.repo.find({});
  }

  async search({
    contact,
    paginated,
  }: PaginatedContactSearchRequestDTO): Promise<PaginatedContactResponseDTO> {
    // If all fields are blank, instead of returning all results, we'll return no results.
    if (
      Object.values(contact).every(
        (el: unknown) => el === undefined || el === "",
      )
    ) {
      return PaginatedContactResponseDTO.empty();
    }
    const query: FilterQuery<ContactEntity> = {
      ...LikeOrUndefined<ContactEntity>("firstName", contact.firstName),
      ...LikeOrUndefined<ContactEntity>("lastName", contact.lastName),
      ...LikeOrUndefined<ContactEntity>("email", contact.email),
      ...LikeOrUndefined<ContactEntity>("phoneNumber", contact.phoneNumber),
      ...(contact.id == undefined ? {} : { id: contact.id }),
    };
    const [result, rowsTotal] = await this.repo.findAndCount(query, {
      limit: paginated.rowsToTake,
      offset: paginated.rowsToSkip,
    });
    return {
      contacts: result,
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    };
  }

  async findOne(id: number): Promise<ContactEntity | null> {
    return await this.repo.findOne({ id });
  }
}
