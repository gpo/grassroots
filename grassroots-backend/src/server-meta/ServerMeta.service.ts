import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ServerMetaService {
  // A uuid unique to this execution of the server.
  instanceUUID: string;

  constructor() {
    this.instanceUUID = uuidv4();
  }
}
