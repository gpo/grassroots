const noop: DecoratorResult = (...args: unknown[]) => {
  void args;
};

type DecoratorResult = (...args: unknown[]) => void;

export function Entity(): DecoratorResult {
  return noop;
}

export function PrimaryKey(): DecoratorResult {
  return noop;
}

interface PropertyOptions {
  nullable?: boolean;
  type: string;
}

export function Property(options?: PropertyOptions): DecoratorResult {
  void options;
  return noop;
}

export function Unique(): DecoratorResult {
  return noop;
}
