import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { DataSource, Equal, QueryRunner, Repository } from "typeorm";
import { getRepo } from "../getRepo";
import { LikeOrUndefined } from "../util/likeOrUndefined";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntityOutDTO)
    private readonly contactsRepository: Repository<ContactEntityOutDTO>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createContactDto: CreateContactInDto,
    queryRunner?: QueryRunner,
  ): Promise<ContactEntityOutDTO> {
    const repo = getRepo(ContactEntityOutDTO, queryRunner, this.dataSource);
    return await repo.save(createContactDto);
  }

  async findAll(queryRunner?: QueryRunner): Promise<ContactEntityOutDTO[]> {
    const repo = getRepo(ContactEntityOutDTO, queryRunner, this.dataSource);
    return await repo.find({});
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

  async findOne(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<ContactEntityOutDTO | null> {
    const repo = getRepo(ContactEntityOutDTO, queryRunner, this.dataSource);
    return await repo.findOneBy({ id });
  }
}
