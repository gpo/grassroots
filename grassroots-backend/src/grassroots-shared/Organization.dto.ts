import { IsInt, IsNotEmpty, Min } from "class-validator";
import * as MaybeLoaded from "./MaybeLoaded";
import * as MaybeLoadedEntity from "../database/MaybeLoadedEntity";

export class OrganizationResponseDTO {
  id!: number;
  name!: string;

  @MaybeLoadedEntity.PropertyDecorator(OrganizationResponseDTO)
  parent!: MaybeLoaded.MaybeLoaded<OrganizationResponseDTO>;
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
