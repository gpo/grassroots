import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import { ContactEntity } from "./entities/Contact.entity";
import {
  CreateBulkContactRequestDto,
  CreateBulkContactResponseDTO,
  CreateContactRequestDto,
  GetContactByIDResponseDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "../grassroots-shared/Contact.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @Body() createContactDto: CreateContactRequestDto,
  ): Promise<ContactEntity> {
    return this.contactsService.create(createContactDto);
  }

  @Post("bulk-create")
  bulkCreate(
    @Body() createContactDtos: CreateBulkContactRequestDto,
  ): Promise<CreateBulkContactResponseDTO> {
    return this.contactsService.bulkCreate(createContactDtos.contacts);
  }

  @Get()
  findAll(): Promise<ContactEntity[]> {
    return this.contactsService.findAll();
  }

  @Post("search")
  search(
    @Body() contact: PaginatedContactSearchRequestDTO,
  ): Promise<PaginatedContactResponseDTO> {
    return this.contactsService.search(contact);
  }

  @Get(":id")
  async findOne(@Param("id") id: number): Promise<GetContactByIDResponseDTO> {
    return {
      contact: await this.contactsService.findOne(id),
    };
  }
}
