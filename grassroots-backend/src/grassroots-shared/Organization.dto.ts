import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";

class MaybeLoaded<T> {
  _value?: T | "unloaded";

  loaded(): boolean {
    return this._value !== "unloaded";
  }

  get(): T | undefined {
    if (this._value === "unloaded") {
      throw new Error("Trying to get value which wasn't loaded from the db.");
    }
    return this._value;
  }
}

export function MaybeLoadedOf<T>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
): new (...args: unknown[]) => MaybeLoaded<T> {
  class DecoratedMaybeLoaded extends MaybeLoaded<T> {
    // eslint-disable-next-line @darraghor/nestjs-typed/api-property-matches-property-optionality
    @ValidateNested()
    @IsOptional()
    @ApiProperty({
      oneOf: [
        { $ref: getSchemaPath(type) },
        { type: "string", enum: ["unloaded"] },
        { type: "undefined" },
      ],
    })
    declare _value: T | "unloaded" | undefined;
  }
  return DecoratedMaybeLoaded;
}
export class OrganizationDTO {
  @IsInt()
  @Min(1)
  id!: number;

  @IsNotEmpty()
  name!: string;

  @ValidateNested()
  @Type(() => MaybeLoadedOf(OrganizationDTO))
  @IsOptional()
  parent?: MaybeLoaded<OrganizationDTO>;

  @ValidateNested({ each: true })
  @Type(() => OrganizationDTO)
  children!: OrganizationDTO[];
}

export class MaybeParent extends MaybeLoadedOf<OrganizationDTO>(
  OrganizationDTO,
) {}
//export type MaybeParent = MaybeLoaded<OrganizationDTO>;

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
