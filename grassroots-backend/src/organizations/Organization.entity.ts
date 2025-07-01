import {
  BaseEntity,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import {
  MaybeParent,
  OrganizationDTO,
} from "../grassroots-shared/Organization.dto";
import { plainToInstance } from "class-transformer";

@Entity()
export class OrganizationEntity extends BaseEntity {
  @PrimaryKey()
  id!: number;
  @Property()
  name!: string;

  @ManyToOne(() => OrganizationEntity, { nullable: true })
  parent?: OrganizationEntity;

  @OneToMany(() => OrganizationEntity, (organization) => organization.parent)
  children?: Collection<OrganizationEntity>;

  toDTO(): OrganizationDTO {
    const maybeParent: MaybeParent = plainToInstance(MaybeParent, {
      _value:
        this.parent?.isInitialized() === false
          ? "unloaded"
          : this.parent?.toDTO(),
    });

    return {
      id: this.id,
      name: this.name,
      parent: maybeParent,
      children: [], // TODO
    };
  }
}
