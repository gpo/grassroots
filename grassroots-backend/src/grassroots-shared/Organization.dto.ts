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

export class OrganizationDTO extends createDTOBase("Organization") {
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

export class OrganizationsDTO extends createDTOBase("Organizations") {
  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  organizations!: OrganizationDTO[];
}

export class CreateOrganizationNoParentRequestDTO extends createDTOBase(
  "CreateOrganizationNoParentRequest",
) {
  @IsNotEmpty()
  name!: string;
}

export class CreateOrganizationRequestDTO extends createDTOBase(
  "CreateOrganizationRequest",
) {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  parentID!: number;
}
