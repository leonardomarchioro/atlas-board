import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

export class UpdateBoardColumnInputDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ minLength: 1, maxLength: 50 })
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(50)
  name!: string;
}

export class UpdateBoardDto {
  @ApiPropertyOptional({
    example: "Projeto Atlas",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: "Planejamento da plataforma.",
    nullable: true,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ type: () => [UpdateBoardColumnInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateBoardColumnInputDto)
  column?: UpdateBoardColumnInputDto[];
}
