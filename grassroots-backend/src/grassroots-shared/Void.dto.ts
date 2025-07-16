// We need to return an object from every endpoint, or tanstack query complains.
// We use this instead of returning void.

import { createDTOBase } from "./util/CreateDTOBase";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class VoidDTO extends createDTOBase<"VoidDTO">() {}
