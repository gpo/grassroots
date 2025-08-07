type DecoratorResult = (...args: unknown[]) => void;

const noop: DecoratorResult = (...args: unknown[]) => {
  void args;
};

export function ApiProperty(...args: unknown[]): DecoratorResult {
  void args;
  return noop;
}

export function applyDecorators(...args: unknown[]): DecoratorResult {
  void args;
  return noop;
}

export class HttpException extends Error {
  constructor(
    response: string | Record<string, unknown>,
    status: number,
    options?: unknown,
  ) {
    super(JSON.stringify(response));
    void status;
    void options;
  }
}
