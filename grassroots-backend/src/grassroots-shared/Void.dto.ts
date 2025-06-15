// We need to return an object from every endpoint, or tanstack query complains.
// We use this instead of returning void.

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class VoidDTO {}
