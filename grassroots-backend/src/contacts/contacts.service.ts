import { Injectable } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { DataSource, Equal } from "typeorm";
import { getRepo } from "../getRepo";
import { LikeOrUndefined } from "../util/likeOrUndefined";

@Injectable()
export class ContactsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    const repo = getRepo(ContactEntityOutDTO, this.dataSource);
    return await repo.save(createContactDto);
  }

  async findAll(): Promise<ContactEntityOutDTO[]> {
    const repo = getRepo(ContactEntityOutDTO, this.dataSource);
    return await repo.find({});
  }

  async search({
    contact,
    paginated,
  }: PaginatedContactSearchInDTO): Promise<PaginatedContactOutDTO> {
    const repo = getRepo(ContactEntityOutDTO, this.dataSource);

    const [result, rowsTotal] = await repo.findAndCount({
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
    const repo = getRepo(ContactEntityOutDTO, this.dataSource);
    return await repo.findOneBy({ id });
  }
}
