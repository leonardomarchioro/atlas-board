import { Transform } from "class-transformer";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
export class CreateTagDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(50)
  name!: string;
  @IsString() @Matches(/^#[0-9A-Fa-f]{6}$/) color!: string;
}
