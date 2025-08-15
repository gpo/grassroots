import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./Contacts.service";
import {
  ContactDTO,
  ContactsDTO,
  CreateBulkContactRequestDTO,
  CreateBulkContactResponseDTO,
  CreateContactRequestDTO,
  GetContactByIDResponseDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/Contact.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(
    @Body() createContactDto: CreateContactRequestDTO,
  ): Promise<ContactDTO> {
    return this.contactsService.create(createContactDto);
  }

  @Post("bulk-create")
  async bulkCreate(
    @Body() createContactDtos: CreateBulkContactRequestDTO,
  ): Promise<CreateBulkContactResponseDTO> {
    const contacts = await this.contactsService.bulkCreate(
      createContactDtos.contacts,
    );
    return CreateBulkContactResponseDTO.from({
      ids: contacts.map((x) => x.id),
    });
  }

  @Get()
  async findAll(): Promise<ContactsDTO> {
    return ContactsDTO.from({ contacts: await this.contactsService.findAll() });
  }

  @Post("search")
  search(
    @Body() contact: PaginatedContactSearchRequestDTO,
  ): Promise<PaginatedContactResponseDTO> {
    return this.contactsService.search(contact);
  }

  @Get(":id")
  async findOne(@Param("id") id: number): Promise<GetContactByIDResponseDTO> {
    return GetContactByIDResponseDTO.from({
      contact: await this.contactsService.findOne(id),
    });
  }
}
