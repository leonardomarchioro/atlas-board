import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

type PasswordConfirmationValidationObject = {
  password?: unknown;
};

export function PasswordsMatch(validationOptions?: ValidationOptions) {
  return function (
    object: PasswordConfirmationValidationObject,
    propertyName: string,
  ) {
    registerDecorator({
      name: "passwordsMatch",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const dto = args.object as PasswordConfirmationValidationObject;

          return typeof value === "string" && value === dto.password;
        },
      },
    });
  };
}
