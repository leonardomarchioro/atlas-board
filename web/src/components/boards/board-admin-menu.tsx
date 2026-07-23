"use client";

import { Columns3, MoreVertical, Pencil, Tags, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { ManageBoardColumnsDialog } from "@/components/boards/manage-board-columns-dialog";
import { EditBoardDialog } from "@/components/boards/edit-board-dialog";
import { DeleteBoardDialog } from "@/components/boards/delete-board-dialog";
import { ManageBoardMembersDialog } from "@/components/boards/manage-board-members-dialog";
import { ManageBoardTagsDialog } from "@/components/boards/manage-board-tags-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BoardDetails } from "@/features/boards/types/board.types";

type AdminMenuBoard = Pick<BoardDetails, "id" | "name" | "description" | "role">;

export function BoardAdminMenu({
  board,
  triggerVariant = "ghost",
}: {
  board: AdminMenuBoard;
  triggerVariant?: "ghost" | "outline";
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant={triggerVariant}
              size="icon"
              className="relative z-20"
              aria-label={`Ações administrativas de ${board.name}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          }
        >
          <MoreVertical aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Administrar board</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden />
            Editar board
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColumnsOpen(true)}>
            <Columns3 aria-hidden />
            Gerenciar colunas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMembersOpen(true)}>
            <Users aria-hidden />
            Gerenciar membros
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTagsOpen(true)}>
            <Tags aria-hidden />
            Gerenciar tags
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden />
            Excluir board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditBoardDialog board={board} open={editOpen} onOpenChange={setEditOpen} />
      <ManageBoardColumnsDialog board={board} open={columnsOpen} onOpenChange={setColumnsOpen} />
      <ManageBoardMembersDialog board={board} open={membersOpen} onOpenChange={setMembersOpen} />
      <ManageBoardTagsDialog board={board} open={tagsOpen} onOpenChange={setTagsOpen} />
      <DeleteBoardDialog board={board} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
