import { IsArray, IsUUID } from "class-validator";
export class UpdateTaskSharedUsersDto {
  @IsArray() @IsUUID("4", { each: true }) sharedUserIds!: string[];
}
