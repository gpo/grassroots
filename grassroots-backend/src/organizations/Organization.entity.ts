import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

@Entity()
export class OrganizationEntity {
  @PrimaryKey()
  id!: number;
  @Property()
  name!: string;

  @ManyToOne(() => OrganizationEntity, { nullable: true, lazy: false })
  parent?: OrganizationEntity | null;

  @OneToMany(() => OrganizationEntity, (organization) => organization.parent)
  children?: Collection<OrganizationEntity> | null;
}
