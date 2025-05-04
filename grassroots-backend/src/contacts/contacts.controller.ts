import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { ApiResponseWithValidation } from "../decorators/apiValidationErrorResponse";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @ApiResponseWithValidation(ContactEntityOutDTO)
  @Post()
  create(
    @Body() createContactDto: CreateContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return this.contactsService.create(createContactDto);
  }

  @ApiResponseWithValidation(ContactEntityOutDTO)
  @Get()
  findAll(): Promise<ContactEntityOutDTO[]> {
    return this.contactsService.findAll();
  }

  @ApiResponseWithValidation(ContactEntityOutDTO)
  @Get(":id")
  findOne(@Param("id") id: string): Promise<ContactEntityOutDTO | null> {
    return this.contactsService.findOne(+id);
  }
}
