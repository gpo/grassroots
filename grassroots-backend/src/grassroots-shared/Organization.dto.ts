import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, Min } from "class-validator";
import { ApiPropertyMaybeLoaded, MaybeLoaded } from "./MaybeLoaded";

export class OrganizationResponseDTO {
  id!: number;
  name!: string;

  @Type(() => MaybeLoaded<OrganizationResponseDTO>)
  @ApiPropertyMaybeLoaded(OrganizationResponseDTO)
  parent!: MaybeLoaded<OrganizationResponseDTO>;

  @Type(() => OrganizationResponseDTO)
  children!: OrganizationResponseDTO[];
}

//export class MaybeParent extends MaybeLoaded<OrganizationDTO> {}

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
