import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";

export class OrganizationDTO {
  @IsInt()
  @Min(1)
  id!: number;

  @IsNotEmpty()
  name!: string;

  @ValidateNested()
  @Type(() => OrganizationDTO)
  @IsOptional()
  parent?: OrganizationDTO;

  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  children!: OrganizationDTO[];
}

export class ShallowOrganizationDTO {
  @IsInt()
  @Min(1)
  id!: number;

  @IsNotEmpty()
  name!: string;
}

export class CreateRootOrganizationDTO {
  @IsNotEmpty()
  name!: string;
}

export class CreateOrganizationDTO {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  parentID!: number;
}
