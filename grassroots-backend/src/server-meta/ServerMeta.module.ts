import { Module } from "@nestjs/common";
import { ServerMetaService } from "./ServerMeta.service.js";

@Module({
  controllers: [],
  providers: [ServerMetaService],
  exports: [ServerMetaService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ServerMetaModule {}
