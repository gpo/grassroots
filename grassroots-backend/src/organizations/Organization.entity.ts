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
import { MaybeLoaded } from "../grassroots-shared/MaybeLoaded";

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
    const maybeParent: MaybeLoaded<OrganizationResponseDTO> =
      this.parent?.isInitialized() === false
        ? "unloaded"
        : this.parent?.toDTO();

    const maybeChildren: MaybeLoaded<OrganizationResponseDTO[]> =
      this.children?.isInitialized() === false
        ? "unloaded"
        : this.children?.getItems().map((x) => x.toDTO());

    return {
      id: this.id,
      name: this.name,
      parent: maybeParent,
      children: maybeChildren,
    };
  }
}
