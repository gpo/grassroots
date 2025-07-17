// We need to return an object from every endpoint, or tanstack query complains.
// We use this instead of returning void.

import { cast } from "./util/Cast";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class VoidDTO {
  static get(): VoidDTO {
    return cast(VoidDTO, {});
  }
}
