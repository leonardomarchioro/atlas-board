import { Module } from "@nestjs/common";
import { BoardsModule } from "@modules/boards/boards.module";
import { AddChecklistItemUseCase } from "./application/add-checklist-item.use-case";
import { CreateTagUseCase } from "./application/create-tag.use-case";
import { CreateTaskUseCase } from "./application/create-task.use-case";
import { DeleteChecklistItemUseCase } from "./application/delete-checklist-item.use-case";
import { DeleteTagUseCase } from "./application/delete-tag.use-case";
import { DeleteTaskUseCase } from "./application/delete-task.use-case";
import { GetTaskByIdUseCase } from "./application/get-task-by-id.use-case";
import { ListBoardTagsUseCase } from "./application/list-board-tags.use-case";
import { ListBoardTasksUseCase } from "./application/list-board-tasks.use-case";
import { MoveTaskUseCase } from "./application/move-task.use-case";
import { ReorderChecklistItemsUseCase } from "./application/reorder-checklist-items.use-case";
import { ReorderColumnTasksUseCase } from "./application/reorder-column-tasks.use-case";
import { UpdateChecklistItemUseCase } from "./application/update-checklist-item.use-case";
import { UpdateTagUseCase } from "./application/update-tag.use-case";
import { UpdateTaskSharedUsersUseCase } from "./application/update-task-shared-users.use-case";
import { UpdateTaskUseCase } from "./application/update-task.use-case";
import { TasksController } from "./presentation/tasks.controller";
import { TaskAccessService } from "./services/task-access.service";

@Module({
  imports: [BoardsModule],
  controllers: [TasksController],
  providers: [
    TaskAccessService,
    CreateTaskUseCase,
    GetTaskByIdUseCase,
    ListBoardTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    MoveTaskUseCase,
    ReorderColumnTasksUseCase,
    UpdateTaskSharedUsersUseCase,
    CreateTagUseCase,
    ListBoardTagsUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    AddChecklistItemUseCase,
    UpdateChecklistItemUseCase,
    DeleteChecklistItemUseCase,
    ReorderChecklistItemsUseCase,
  ],
})
export class TasksModule {}
