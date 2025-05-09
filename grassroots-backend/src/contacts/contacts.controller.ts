import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import {
  ContactEntityOutDTO,
  GetContactByIDResponse,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { QueryRunner } from "typeorm";

@Controller("contacts")
export class ContactsController {
  queryRunnerForTest?: QueryRunner;
  constructor(private readonly contactsService: ContactsService) {}

  setQueryRunnerForTest(queryRunnerForTest: QueryRunner): void {
    this.queryRunnerForTest = queryRunnerForTest;
  }

  @Post()
  create(
    @Body() createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return this.contactsService.create(
      createContactDto,
      this.queryRunnerForTest,
    );
  }

  @Get()
  findAll(): Promise<ContactEntityOutDTO[]> {
    return this.contactsService.findAll(this.queryRunnerForTest);
  }

  @Post("search")
  search(
    @Body() contact: PaginatedContactSearchInDTO,
  ): Promise<PaginatedContactOutDTO> {
    return this.contactsService.search(contact, this.queryRunnerForTest);
  }

  @Get(":id")
  async findOne(@Param("id") id: number): Promise<GetContactByIDResponse> {
    return {
      contact: await this.contactsService.findOne(id, this.queryRunnerForTest),
    };
  }
}
