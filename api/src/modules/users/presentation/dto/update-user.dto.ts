import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== "")
  @IsUrl()
  avatarUrl?: string | null;
}
