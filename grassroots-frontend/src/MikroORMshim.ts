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

export function Property(): DecoratorResult {
  return noop;
}

export function Unique(): DecoratorResult {
  return noop;
}
