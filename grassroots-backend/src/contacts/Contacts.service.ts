import { Injectable } from "@nestjs/common";
import { ContactEntity } from "./entities/Contact.entity.js";
import { EntityManager, EntityRepository, FilterQuery } from "@mikro-orm/core";
import { LikeOrUndefined } from "../util/LikeOrUndefined.js";
import {
  ContactDTO,
  CreateContactRequestDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { OrganizationEntity } from "../organizations/Organization.entity.js";
import { PropsOf } from "grassroots-shared/util/TypeUtils";

@Injectable()
export class ContactsService {
  repo: EntityRepository<ContactEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo = entityManager.getRepository<ContactEntity>(ContactEntity);
  }

  async create(contact: CreateContactRequestDTO): Promise<ContactDTO> {
    const organization = this.entityManager.getReference(
      OrganizationEntity,
      contact.organizationId,
    );

    const plainContact: PropsOf<CreateContactRequestDTO> = contact;
    const result = this.repo.create(
      ContactEntity.fromCreateContactRequestDTO(
        CreateContactRequestDTO.from({
          ...plainContact,
          organizationId: organization.id,
        }),
      ),
    );
    await this.entityManager.flush();
    return result.toDTO();
  }

  async bulkCreate(contacts: CreateContactRequestDTO[]): Promise<ContactDTO[]> {
    const result = contacts.map((x) =>
      this.repo.create(ContactEntity.fromCreateContactRequestDTO(x)),
    );
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
        contact.organizationId,
      ].every((x) => x === undefined || x === "")
    ) {
      return PaginatedContactResponseDTO.empty();
    }
    const query: FilterQuery<ContactEntity> = {
      ...LikeOrUndefined<ContactEntity>("firstName", contact.firstName),
      ...LikeOrUndefined<ContactEntity>("lastName", contact.lastName),
      ...LikeOrUndefined<ContactEntity>("email", contact.email),
      ...LikeOrUndefined<ContactEntity>("phoneNumber", contact.phoneNumber),
      ...(contact.organizationId == undefined
        ? {}
        : { organization: contact.organizationId }),
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
