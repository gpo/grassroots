import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntityOutDTO)
    private readonly contactsRepository: Repository<ContactEntityOutDTO>,
    private dataSource: DataSource,
  ) {}

  async create(
    createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return await this.contactsRepository.save(createContactDto);
  }

  async findAll(): Promise<ContactEntityOutDTO[]> {
    return await this.contactsRepository.find({});
  }

  async findOne(id: number): Promise<ContactEntityOutDTO | null> {
    return this.contactsRepository.findOneBy({ id });
  }
}
