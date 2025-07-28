import { Injectable } from "@nestjs/common";
import { ContactEntity } from "./entities/Contact.entity.js";
import { EntityManager, EntityRepository, FilterQuery } from "@mikro-orm/core";
import { LikeOrUndefined } from "../util/LikeOrUndefined";
import {
  ContactDTO,
  CreateContactRequestDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "@grassroots/shared";

@Injectable()
export class ContactsService {
  repo: EntityRepository<ContactEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<ContactEntity>(ContactEntity);
  }

  async create(contact: CreateContactRequestDTO): Promise<ContactDTO> {
    const result = this.repo.create(contact);
    await this.entityManager.flush();
    return ContactDTO.from(result);
  }

  async bulkCreate(contacts: CreateContactRequestDTO[]): Promise<ContactDTO[]> {
    const result = contacts.map((x) => this.repo.create(x));
    await this.entityManager.flush();
    return result.map((x) => x.toDTO());
  }

  async findAll(): Promise<ContactDTO[]> {
    return (await this.repo.find({})).map((x) => x.toDTO());
  }

  async search({
    contact,
    paginated,
  }: PaginatedContactSearchRequestDTO): Promise<PaginatedContactResponseDTO> {
    // If all fields are blank, instead of returning all results, we'll return no results.
    if (
      [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phoneNumber,
        contact.id,
      ].every((x) => x === undefined || x === "")
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
    return PaginatedContactResponseDTO.from({
      contacts: result.map((x) => x.toDTO()),
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    });
  }

  async findOne(id: number): Promise<ContactDTO | null> {
    const result = await this.repo.findOne({ id });
    return result ? ContactDTO.from(result) : null;
  }
}
