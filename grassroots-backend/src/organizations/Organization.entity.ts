import {
  BaseEntity,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { OrganizationResponseDTO } from "../grassroots-shared/Organization.dto";
import * as MaybeLoaded from "../grassroots-shared/MaybeLoaded";
import { toMaybeLoaded } from "../database/MaybeLoadedEntity";

@Entity()
export class OrganizationEntity extends BaseEntity {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @ManyToOne(() => OrganizationEntity, {
    nullable: true,
  })
  parent?: OrganizationEntity;

  @OneToMany(() => OrganizationEntity, (organization) => organization.parent)
  children?: Collection<OrganizationEntity>;

  toDTO(): OrganizationResponseDTO {
    const maybeParentEntity = toMaybeLoaded(this.parent);
    const maybeParent = MaybeLoaded.map(maybeParentEntity, (x) => x.toDTO());

    return {
      id: this.id,
      name: this.name,
      parent: maybeParent,
    };
  }
}
