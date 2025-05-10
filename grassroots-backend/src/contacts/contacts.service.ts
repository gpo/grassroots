import { Injectable } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { Equal, Repository } from "typeorm";
import { LikeOrUndefined } from "../util/likeOrUndefined";

@Injectable()
export class ContactsService {
  constructor(
    private readonly contactsRepository: Repository<ContactEntityOutDTO>,
  ) {}

  async create(
    createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return await this.contactsRepository.save(createContactDto);
  }

  async findAll(): Promise<ContactEntityOutDTO[]> {
    return await this.contactsRepository.find({});
  }

  async search({
    contact,
    paginated,
  }: PaginatedContactSearchInDTO): Promise<PaginatedContactOutDTO> {
    const [result, rowsTotal] = await this.contactsRepository.findAndCount({
      take: paginated.rowsToTake,
      skip: paginated.rowsToSkip,
      where: {
        firstName: LikeOrUndefined(contact.firstName),
        lastName: LikeOrUndefined(contact.lastName),
        email: LikeOrUndefined(contact.email),
        phoneNumber: LikeOrUndefined(contact.phoneNumber),
        id: contact.id ? Equal(contact.id) : undefined,
      },
    });
    return {
      contacts: result,
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    };
  }

  async findOne(id: number): Promise<ContactEntityOutDTO | null> {
    return await this.contactsRepository.findOneBy({ id });
  }
}
