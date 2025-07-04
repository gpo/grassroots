import { IsInt, IsNotEmpty, Min } from "class-validator";

export class OrganizationResponseDTO {
  id!: number;
  name!: string;
  parentId?: number;
}

export class CreateOrganizationRootDTO {
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
