import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { getRepo } from "../getRepo";
import { faker } from "@faker-js/faker/.";

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

  async findOne(
    id: number,
    queryRunner?: QueryRunner,
  ): Promise<ContactEntityOutDTO | null> {
    const repo = getRepo(ContactEntityOutDTO, queryRunner, this.dataSource);
    return await repo.findOneBy({ id });
  }

  async addFakesToDatabase(
    count: number,
    queryRunnerForTest?: QueryRunner,
  ): Promise<void> {
    function getRandomContact(): CreateContactInDto {
      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
      };
    }
    const queryRunner =
      queryRunnerForTest ?? this.dataSource.createQueryRunner();
    const repo = getRepo(ContactEntityOutDTO, queryRunner, this.dataSource);

    await queryRunner.startTransaction();
    for (let i = 0; i < count; ++i) {
      await repo.save(getRandomContact());
    }
    await queryRunner.commitTransaction();
  }
}
