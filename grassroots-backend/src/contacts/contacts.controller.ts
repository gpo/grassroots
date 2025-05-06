import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

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

  @ApiOkResponse({
    description: "Returns a contact or null if not found",
    schema: {
      oneOf: [{ $ref: getSchemaPath(ContactEntityOutDTO) }, { type: "null" }],
    },
  })
  @Get(":id")
  findOne(@Param("id") id: number): Promise<ContactEntityOutDTO | null> {
    return this.contactsService.findOne(+id);
  }
}
