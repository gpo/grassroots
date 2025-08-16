import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
export function cast(cls, plain) {
    var instance = plainToInstance(cls, plain);
    var validationErrors = validateSync(instance);
    if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
    }
    return instance;
}
