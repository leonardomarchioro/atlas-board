import { IsArray, IsUUID } from "class-validator";
export class ReorderColumnTasksDto {
  @IsArray() @IsUUID("4", { each: true }) taskIds!: string[];
}
