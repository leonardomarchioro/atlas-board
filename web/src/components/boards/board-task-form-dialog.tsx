"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, Check, ChevronRight, ListChecks, LoaderCircle, Plus, Trash2, Type } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BoardColumn, BoardMember } from "@/features/boards/types/board.types";
import { useCreateTask } from "@/features/tasks/hooks/task-hooks";
import {
  createTaskSchema,
  type CreateTaskFormData,
} from "@/features/tasks/schemas/task.schema";
import type { TaskTag } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";

const EMPTY = "__none__";
const priorityLabels = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", URGENT: "Urgente" };

export function BoardTaskFormDialog({
  boardId,
  boardName,
  columns,
  members,
  tags,
  open,
  initialColumnId,
  onOpenChange,
}: {
  boardId: string;
  boardName: string;
  columns: BoardColumn[];
  members: BoardMember[];
  tags: TaskTag[];
  open: boolean;
  initialColumnId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreateTask();
  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    mode: "onChange",
    defaultValues: {
      columnId: initialColumnId,
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "",
      dueDate: "",
      tagIds: [],
      checklist: [],
    },
  });
  const checklist = useFieldArray({ control: form.control, name: "checklist" });

  useEffect(() => {
    if (!open) return;
    form.reset({
      columnId: initialColumnId || columns[0]?.id || "",
      title: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: "",
      dueDate: "",
      tagIds: [],
      checklist: [],
    });
  }, [columns, form, initialColumnId, open]);

  async function submit(data: CreateTaskFormData) {
    try {
      await mutation.mutateAsync({
        boardId,
        columnId: data.columnId,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        priority: data.priority,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate ? `${data.dueDate}T12:00:00` : undefined,
        tagIds: data.tagIds,
        checklist: data.checklist.map(({ title }) => ({ title: title.trim() })),
      });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível criar a tarefa. Seus dados foram preservados.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !mutation.isPending && onOpenChange(value)}>
      <DialogContent className="h-[100dvh] max-h-none max-w-none gap-0 overflow-hidden rounded-none bg-background p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-[1120px] sm:gap-16 sm:rounded-xl">
        <DialogHeader className="border-b px-5 py-4 pr-14 sm:px-6 sm:py-5">
          <nav className="mb-2 flex items-center gap-2 font-label text-label-sm text-muted-foreground" aria-label="Navegação estrutural">
            <span>Boards</span>
            <ChevronRight className="size-4" aria-hidden />
            <span className="text-foreground">{boardName}</span>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Criar Nova Tarefa</DialogTitle>
              <DialogDescription className="mt-1 text-body-sm">Atualize os detalhes da tarefa e acompanhe o progresso.</DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button>
              <Button type="submit" form="create-task-form" disabled={mutation.isPending || !form.formState.isValid}>
                {mutation.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
                {mutation.isPending ? "Criando tarefa..." : "Criar tarefa"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <form
          id="create-task-form"
          onSubmit={form.handleSubmit(submit)}
          className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 pb-16 sm:max-h-[calc(90vh-130px)] sm:px-7 sm:pt-0 sm:pb-16 lg:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]"
          noValidate
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="mb-2 flex items-center gap-2">
                <Type className="size-5 text-primary" aria-hidden />
                <Label htmlFor="task-title" className="text-lg font-semibold">Título da Tarefa</Label>
              </div>
              <div className="rounded-xl border bg-surface-low px-4 py-3 transition-colors focus-within:border-primary/40 has-[input[aria-invalid=true]]:border-destructive">
                <input
                  id="task-title"
                  autoFocus
                  placeholder="Insira o título da tarefa..."
                  className="w-full border-0 bg-transparent p-0 text-lg font-semibold outline-none placeholder:text-muted-foreground"
                  {...form.register("title")}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              </div>
              {form.formState.errors.title ? (
                <p className="text-body-sm text-destructive" role="alert">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <div className="mb-2 flex items-center gap-2">
                <AlignLeft className="size-5 text-primary" aria-hidden />
                <Label htmlFor="task-description" className="text-lg font-semibold">Descrição</Label>
              </div>
              <div className="rounded-xl border bg-surface-low p-4 transition-colors focus-within:border-primary/40">
                <textarea
                  id="task-description"
                  rows={5}
                  placeholder="Adicione uma descrição detalhada..."
                  className="block w-full resize-none border-0 bg-transparent p-0 text-body-sm outline-none placeholder:text-muted-foreground"
                  {...form.register("description")}
                />
              </div>
            </div>
            <section className="space-y-3" aria-labelledby="new-checklist-title">
              <div className="flex items-center justify-between">
                <h3 id="new-checklist-title" className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="size-5 text-primary" aria-hidden />Checklist</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => checklist.append({ id: crypto.randomUUID(), title: "" })}
                >
                  <Plus aria-hidden /> Adicionar item
                </Button>
              </div>
              {checklist.fields.length ? (
                <div className="space-y-2">
                  {checklist.fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Input
                        aria-label={`Item ${index + 1} do checklist`}
                        placeholder="Descreva o item"
                        {...form.register(`checklist.${index}.title`)}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remover item ${index + 1}`}
                        onClick={() => checklist.remove(index)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <button type="button" onClick={() => checklist.append({ id: crypto.randomUUID(), title: "" })} className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 text-left text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"><Plus className="size-5 text-primary" aria-hidden />Adicionar item...</button>
              )}
            </section>
          </div>
          <aside className="h-fit space-y-4 rounded-xl border bg-surface-low p-5">
            <SelectField label="Coluna">
              <Controller
                control={form.control}
                name="columnId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {columns.find((column) => column.id === field.value)?.name ?? "Selecione uma coluna"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[...columns].sort((a, b) => a.position - b.position).map((column) => (
                        <SelectItem key={column.id} value={column.id}>{column.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </SelectField>
            <SelectField label="Prioridade">
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue>{priorityLabels[field.value]}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </SelectField>
            <SelectField label="Prazo">
              <Input type="date" {...form.register("dueDate")} />
            </SelectField>
            <SelectField label="Responsável">
              <Controller
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <Select value={field.value || EMPTY} onValueChange={(v) => field.onChange(v === EMPTY ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {field.value
                          ? members.find((member) => member.user.id === field.value)?.user.name ?? "Responsável"
                          : "Sem responsável"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY}>Sem responsável</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.user.id} value={member.user.id}>{member.user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </SelectField>
            <fieldset className="space-y-2">
              <legend className="text-label-sm tracking-wider text-muted-foreground">Etiquetas</legend>
              {tags.length ? (
                <Controller
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const selected = field.value.includes(tag.id);
                        return (
                          <button
                            type="button"
                            key={tag.id}
                            onClick={() => field.onChange(selected ? field.value.filter((id) => id !== tag.id) : [...field.value, tag.id])}
                            className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-label-sm", selected && "border-primary bg-primary/10")}
                            aria-pressed={selected}
                          >
                            <span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden />
                            {tag.name}{selected ? <Check className="size-3" aria-hidden /> : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              ) : <p className="text-body-sm text-muted-foreground">Nenhuma tag disponível.</p>}
            </fieldset>
          </aside>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-label-sm tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
