import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ContactEntityOutDTO } from "../grassroots-shared/Contact.entity.dto";
import { EntityManagerProvider } from "./EntityManager.provider";

// Services depend on this module to ensure they use the right EntityManager.
// In tests, we need a forked EntityManager for transaction rollback to work correctly.
@Module({
  providers: [EntityManagerProvider],
  exports: [EntityManagerProvider],
  imports: [MikroOrmModule.forFeature([ContactEntityOutDTO])],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EntityManagerModule {}
