// We need to return an object from every endpoint, or tanstack query complains.
// We use this instead of returning void.

import { cast } from "./util/Cast";
import { createDTOBase } from "./util/CreateDTOBase";

export class VoidDTO extends createDTOBase("Void") {
  static get(): VoidDTO {
    return cast(VoidDTO, {});
  }
}
