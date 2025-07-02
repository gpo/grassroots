import { IsInt, IsNotEmpty, Min } from "class-validator";
import { ApiPropertyMaybeLoaded, MaybeLoaded } from "./MaybeLoaded";

export class OrganizationResponseDTO {
  id!: number;
  name!: string;

  @ApiPropertyMaybeLoaded(OrganizationResponseDTO)
  parent!: MaybeLoaded<OrganizationResponseDTO>;
  children!: OrganizationResponseDTO[];
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
