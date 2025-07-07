import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";

export class OrganizationDTO {
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
