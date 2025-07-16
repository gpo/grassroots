import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import "reflect-metadata";
import { createDTOBase } from "./util/CreateDTOBase";

export class OrganizationDTO extends createDTOBase<"OrganizationDTO">() {
  @IsNumber()
  @Min(0)
  id!: number;

  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parentId?: number;
}

export class OrganizationListDTO extends createDTOBase<"OrganizationListDTO">() {
  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  organizations!: OrganizationDTO[];
}

export class CreateOrganizationRootRequestDTO extends createDTOBase<"CreateOrganizationRootRequestDTO">() {
  @IsNotEmpty()
  name!: string;
}

export class CreateOrganizationRequestDTO extends createDTOBase<"CreateOrganizationRequestDTO">() {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  parentID!: number;
}
