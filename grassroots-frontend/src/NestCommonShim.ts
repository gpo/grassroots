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
