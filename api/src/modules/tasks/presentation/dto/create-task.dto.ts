import { TaskPriority } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
export class CreateTaskChecklistItemDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(200)
  title!: string;
  @IsOptional() @IsBoolean() isCompleted?: boolean;
}
export class CreateTaskDto {
  @IsUUID() columnId!: string;
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  @MaxLength(200)
  title!: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MaxLength(5000)
  description?: string;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @IsOptional() @IsUUID() assigneeId?: string | null;
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  sharedUserIds?: string[];
  @IsOptional() @IsDateString() dueDate?: string | null;
  @IsOptional() @IsArray() @IsUUID("4", { each: true }) tagIds?: string[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskChecklistItemDto)
  checklist?: CreateTaskChecklistItemDto[];
}
