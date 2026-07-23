"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BoardColumn, BoardMember } from "@/features/boards/types/board.types";
import { useCreateTask } from "@/features/tasks/hooks/task-hooks";
import type { TaskPriority, TaskTag } from "@/features/tasks/types/task.types";

const schema = z.object({
  columnId: z.string().min(1),
  title: z.string().trim().min(1, "Informe o título.").max(200),
  description: z.string().trim().max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.string(),
  dueDate: z.string(),
  tagId: z.string(),
});
type FormData = z.infer<typeof schema>;
const EMPTY_VALUE = "__none__";

export function BoardTaskFormDialog({
  boardId,
  columns,
  members,
  tags,
  open,
  initialColumnId,
  onOpenChange,
}: {
  boardId: string;
  columns: BoardColumn[];
  members: BoardMember[];
  tags: TaskTag[];
  open: boolean;
  initialColumnId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreateTask();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      columnId: initialColumnId,
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "",
      dueDate: "",
      tagId: "",
    },
  });
  useEffect(() => {
    if (open)
      form.reset({
        columnId: initialColumnId || columns[0]?.id || "",
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
        tagId: "",
      });
  }, [columns, form, initialColumnId, open]);
  async function submit(data: FormData) {
    try {
      await mutation.mutateAsync({
        boardId,
        columnId: data.columnId,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority as TaskPriority,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        tagIds: data.tagId ? [data.tagId] : undefined,
      });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível criar a tarefa.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
          <DialogDescription>Crie uma tarefa diretamente na coluna selecionada.</DialogDescription>
        </DialogHeader>
        <form
          id="create-task-form"
          onSubmit={form.handleSubmit(submit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              autoFocus
              {...form.register("title")}
              aria-invalid={Boolean(form.formState.errors.title)}
            />
            {form.formState.errors.title ? (
              <p className="text-body-sm text-destructive" role="alert">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea id="task-description" rows={3} {...form.register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label id="task-column-label">Coluna</Label>
              <Controller
                control={form.control}
                name="columnId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-labelledby="task-column-label">
                      <SelectValue>
                        {columns.find((column) => column.id === field.value)?.name ?? "Coluna"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label id="task-priority-label">Prioridade</Label>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-labelledby="task-priority-label">
                      <SelectValue>
                        {
                          {
                            LOW: "Baixa",
                            MEDIUM: "Média",
                            HIGH: "Alta",
                          }[field.value]
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label id="task-assignee-label">Responsável</Label>
              <Controller
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <Select
                    value={field.value || EMPTY_VALUE}
                    onValueChange={(value) => field.onChange(value === EMPTY_VALUE ? "" : value)}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="task-assignee-label">
                      <SelectValue>
                        {field.value
                          ? (members.find((member) => member.user.id === field.value)?.user.name ??
                            "Responsável")
                          : "Sem responsável"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_VALUE}>Sem responsável</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.user.id} value={member.user.id}>
                          {member.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <label className="space-y-2">
              <span className="font-label text-label-md">Prazo</span>
              <Input type="datetime-local" {...form.register("dueDate")} />
            </label>
            <div className="space-y-2 sm:col-span-2">
              <Label id="task-tag-label">Tag</Label>
              <Controller
                control={form.control}
                name="tagId"
                render={({ field }) => (
                  <Select
                    value={field.value || EMPTY_VALUE}
                    onValueChange={(value) => field.onChange(value === EMPTY_VALUE ? "" : value)}
                  >
                    <SelectTrigger className="w-full" aria-labelledby="task-tag-label">
                      <SelectValue>
                        {field.value
                          ? (tags.find((tag) => tag.id === field.value)?.name ?? "Tag")
                          : "Sem tag"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_VALUE}>Sem tag</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="create-task-form" disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
            {mutation.isPending ? "Criando..." : "Criar tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
