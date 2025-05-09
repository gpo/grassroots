import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import {
  ContactEntityOutDTO,
  GetContactByIDResponse,
  CreateContactInDto,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @Body() createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return this.contactsService.create(createContactDto);
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
