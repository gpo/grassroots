import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CreateContactInDto } from "../grassroots-shared/contact.entity.dto";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactInDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contactsService.findOne(+id);
  }
}
