import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export function Trim(): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    Transform(
      ({ value }: { value: unknown }) => {
        if (typeof value === "string") return value.trim();
        return value;
      },
      { toClassOnly: true },
    )(target, propertyKey);

    IsString({ message: `${String(propertyKey)} must be a string` })(
      target,
      propertyKey,
    );
  };
}
