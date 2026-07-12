import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from "class-validator";

import { PasswordsMatch } from "./passwords-match.validator";

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @Length(2, 100)
  name!: string;

  @IsEmail()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @PasswordsMatch({ message: "A confirmação de senha deve ser igual à senha." })
  passwordConfirmation!: string;
}
