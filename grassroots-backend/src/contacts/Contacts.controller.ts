import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import {
  ContactEntityOutDTO,
  GetContactByIDResponse,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
  CreateContactInDtoArray,
} from "../grassroots-shared/Contact.entity.dto";
import { BulkCreateOut } from "./entities/BulkCreateOut.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @Body() createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return this.contactsService.create(createContactDto);
  }

  @Post("bulk-create")
  bulkCreate(
    @Body() createContactDtos: CreateContactInDtoArray,
  ): Promise<BulkCreateOut> {
    return this.contactsService.bulkCreate(createContactDtos.contacts);
  }

  @Get()
  findAll(): Promise<ContactEntityOutDTO[]> {
    return this.contactsService.findAll();
  }

  @Post("search")
  search(
    @Body() contact: PaginatedContactSearchInDTO,
  ): Promise<PaginatedContactOutDTO> {
    return this.contactsService.search(contact);
  }

  @Get(":id")
  async findOne(@Param("id") id: number): Promise<GetContactByIDResponse> {
    return {
      contact: await this.contactsService.findOne(id),
    };
  }
}
