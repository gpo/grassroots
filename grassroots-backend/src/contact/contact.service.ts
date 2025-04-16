import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { LikeOrUndefined } from "src/util";
import {
  ContactEntityOutDTO,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
  PendingContactInDto,
} from "src/grassroots-shared/contact.dto.entity";

import { faker } from "@faker-js/faker";

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactEntityOutDTO)
    private readonly contactsRepository: Repository<ContactEntityOutDTO>,
    private dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(ContactService.name);

  async create(
    createContactDto: PendingContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return await this.contactsRepository.save(createContactDto);
  }

  async findAll(): Promise<ContactEntityOutDTO[]> {
    return await this.contactsRepository.find({});
  }

  async findOne(id: number): Promise<ContactEntityOutDTO | null> {
    return this.contactsRepository.findOneBy({ id });
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
        id: contact.id,
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

  async addFakesToDatabase(count: number): Promise<void> {
    function getRandomContact(): PendingContactInDto {
      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
      };
    }
    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(ContactEntityOutDTO);
      for (let i = 0; i < count; ++i) {
        await repository.save(getRandomContact());
      }
    });
  }

  /*update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }*/
}
