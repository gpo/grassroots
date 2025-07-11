import { plainToInstance, Type } from "class-transformer";
import {
  Allow,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import "reflect-metadata";
import { PropsOf } from "./util/PropsOf";

const BRAND = Symbol("brand");

export class OrganizationDTO {
  // Branded to prevent implicit casting.
  @Allow()
  private __brand = BRAND;

  @IsNumber()
  @Min(0)
  id!: number;

  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parentId?: number;

  static createWithoutValidation(
    props: PropsOf<OrganizationDTO>,
  ): OrganizationDTO {
    return plainToInstance(OrganizationDTO, {
      ...props,
      __brand: BRAND,
    });
  }
}

export class OrganizationListDTO {
  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  organizations!: OrganizationDTO[];
}

export class CreateOrganizationRootRequestDTO {
  @IsNotEmpty()
  name!: string;
}

export class CreateOrganizationRequestDTO {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  parentID!: number;
}
