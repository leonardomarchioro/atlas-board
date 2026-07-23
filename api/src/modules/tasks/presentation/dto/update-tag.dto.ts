import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
export class UpdateTagDto {
  @ApiPropertyOptional({ example: "Backend", minLength: 1, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(50)
  name?: string;
  @ApiPropertyOptional({ example: "#1D4ED8", pattern: "^#[0-9A-Fa-f]{6}$" })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;
}
