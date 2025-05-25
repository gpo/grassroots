import { Injectable } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateBulkContactResponseDTO,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/Contact.entity.dto";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository, FilterQuery } from "@mikro-orm/core";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntityOutDTO)
    private readonly contactsRepository: EntityRepository<ContactEntityOutDTO>,
    // Will be needed for explicit flushing.
    // private readonly em: EntityManager,
  ) {}

  async create(
    createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    const result = this.contactsRepository.upsert(createContactDto, {
      onConflictFields: ["email"],
    });
    return result;
  }

  async bulkCreate(
    createContactsDto: CreateContactInDto[],
  ): Promise<CreateBulkContactResponseDTO> {
    const contacts = await this.contactsRepository.upsertMany(
      createContactsDto,
      {
        onConflictFields: ["email"],
      },
    );
    return { ids: contacts.map((x) => x.id) };
  }

  async findAll(): Promise<ContactEntityOutDTO[]> {
    return await this.contactsRepository.find({});
  }

  async search({
    contact,
    paginated,
  }: PaginatedContactSearchInDTO): Promise<PaginatedContactOutDTO> {
    console.log("ID IS " + String(contact.id) + " " + typeof contact.id);
    // If all fields are blank, instead of returning all results, we'll return no results.
    if (
      Object.values(contact).every(
        (el: unknown) => el === undefined || el === "",
      )
    ) {
      return PaginatedContactOutDTO.empty();
    }
    const query: FilterQuery<ContactEntityOutDTO> = {
      firstName: { $like: contact.firstName ?? "" },
      lastName: { $like: contact.lastName ?? "" },
      email: { $like: contact.email ?? "" },
      phoneNumber: { $like: contact.phoneNumber ?? "" },
      ...(contact.id == undefined ? {} : { id: { $ne: contact.id } }),
    };
    console.log(query);
    const [result, rowsTotal] = await this.contactsRepository.findAndCount(
      query,
      {
        limit: paginated.rowsToTake,
        offset: paginated.rowsToSkip,
      },
    );
    return {
      contacts: result,
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    };
  }

  async findOne(id: number): Promise<ContactEntityOutDTO | null> {
    return await this.contactsRepository.findOne({ id });
  }
}
