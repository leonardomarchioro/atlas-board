import { Transform } from "class-transformer";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateTagDto {
  @ApiProperty({ example: "Backend", minLength: 1, maxLength: 50 })
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(50)
  name!: string;
  @ApiProperty({ example: "#2563EB", pattern: "^#[0-9A-Fa-f]{6}$" })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color!: string;
}
