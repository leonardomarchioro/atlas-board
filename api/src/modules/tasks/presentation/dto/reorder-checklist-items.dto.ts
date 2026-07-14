import { IsArray, IsUUID } from "class-validator";
export class ReorderChecklistItemsDto {
  @IsArray() @IsUUID("4", { each: true }) checklistItemIds!: string[];
}
