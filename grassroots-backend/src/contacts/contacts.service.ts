import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { getRepo } from "../getRepo";

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
}
