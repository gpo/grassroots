import { Controller, Post, Body } from "@nestjs/common";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";

@Controller("phone-canvass")
export class PhoneCanvassController {
  constructor(private readonly phoneCanvassService: PhoneCanvassService) {}

  @Post()
  async create(
    @Body() canvas: CreatePhoneCanvassRequestDTO,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    console.log("create controller");
    return await this.phoneCanvassService.create(canvas);
  }
}
