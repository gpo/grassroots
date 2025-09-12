import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import "reflect-metadata";
import { createDTOBase } from "../util/CreateDTOBase.js";
import { Type } from "class-transformer";

// Until we fully support organizations in the frontend, we just use -1 to mean "make
// sure there's an organization for this contact."
export const TEMPORARY_FAKE_ORGANIZATION_ID = -1;

export class OrganizationDTO extends createDTOBase("Organization") {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  id!: number;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  abbreviatedName!: string;

  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId?: number;
}

export class OrganizationsDTO extends createDTOBase("Organizations") {
  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  organizations!: OrganizationDTO[];
}

export class OrganizationReferenceDTO extends createDTOBase(
  "OrganizationReference",
) {
  @IsOptional()
  @IsNumber()
  @Min(1)
  id!: number;
}

export class CreateOrganizationNoParentRequestDTO extends createDTOBase(
  "CreateOrganizationNoParentRequest",
) {
  @IsNotEmpty()
  name!: string;
  @IsNotEmpty()
  abbreviatedName!: string;
  @IsNotEmpty()
  description!: string;
}

export class CreateOrganizationRequestDTO extends createDTOBase(
  "CreateOrganizationRequest",
) {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  abbreviatedName!: string;

  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  parentID!: number;
}
