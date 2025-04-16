import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { PublicAccess, VerifySession } from "supertokens-nestjs";
import {
  ContactEntityOutDTO,
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
  PendingContactInDto,
} from "src/grassroots-shared/contact.dto.entity";

@Controller("contacts")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post("")
  @PublicAccess()
  //@VerifySession()
  async create(
    @Body() createContactDto: PendingContactInDto,
  ): Promise<ContactEntityOutDTO> {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @PublicAccess()
  //@VerifySession()
  findAll(): Promise<ContactEntityOutDTO[]> {
    return this.contactService.findAll();
  }

  @Post("search")
  @PublicAccess()
  //@VerifySession()
  search(
    @Body() contact: PaginatedContactSearchInDTO,
  ): Promise<PaginatedContactOutDTO> {
    return this.contactService.search(contact);
  }

  @Post("add-fakes/:count")
  @PublicAccess()
  //@VerifySession()
  addFakesToDatabase(@Param("count") count: number): Promise<void> {
    return this.contactService.addFakesToDatabase(count);
  }

  /*
  @Get(':id')
  async findOne(@Param('id') id: IID): Promise<ContactEntity | null> {
    return await this.contactService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto): IContact {
    return this.contactService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): IContact {
    return this.contactService.remove(+id);
  }*/
}
