"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateBoardFormValues } from "@/features/boards/types/create-board.types";

function createColumnId() {
  return globalThis.crypto?.randomUUID?.() ?? `column-${Date.now()}`;
}

function SortableColumn({
  id,
  index,
  register,
  error,
  canRemove,
  onRemove,
}: {
  id: string;
  index: number;
  register: UseFormRegister<CreateBoardFormValues>;
  error?: string;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      <div className="flex items-start gap-2 rounded-lg border bg-background p-3">
        <button
          type="button"
          className="mt-1 grid size-8 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:cursor-grabbing"
          aria-label={`Reordenar coluna ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <Input
            aria-label={`Nome da coluna ${index + 1}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `column-${index}-error` : undefined}
            maxLength={50}
            {...register(`columns.${index}.name`)}
          />
          {error ? (
            <p
              id={`column-${index}-error`}
              className="mt-1 text-body-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`Remover coluna ${index + 1}`}
          title={canRemove ? "Remover coluna" : "O board precisa ter pelo menos uma coluna"}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function BoardColumnsStep({
  control,
  register,
  errors,
}: {
  control: Control<CreateBoardFormValues>;
  register: UseFormRegister<CreateBoardFormValues>;
  errors: FieldErrors<CreateBoardFormValues>;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "columns",
    keyName: "fieldKey",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = fields.findIndex((field) => field.id === event.active.id);
    const to = fields.findIndex((field) => field.id === event.over?.id);
    if (from >= 0 && to >= 0) move(from, to);
  }

  function removeColumn(index: number) {
    if (fields.length === 1) {
      toast.error("O board precisa ter pelo menos uma coluna.");
      return;
    }
    remove(index);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 id="create-board-step-title" tabIndex={-1} className="text-headline-md font-bold">
          Configurar Colunas
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Defina o fluxo de trabalho. Adicione, remova ou reordene as colunas.
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-label text-label-md">
          {fields.length} {fields.length === 1 ? "coluna" : "colunas"}
        </p>
        <Button
          type="button"
          variant="link"
          onClick={() => append({ id: createColumnId(), name: "" }, { shouldFocus: true })}
        >
          <Plus aria-hidden />
          Adicionar nova coluna
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field, index) => (
              <SortableColumn
                key={field.fieldKey}
                id={field.id}
                index={index}
                register={register}
                error={errors.columns?.[index]?.name?.message}
                canRemove={fields.length > 1}
                onRemove={() => removeColumn(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {errors.columns?.root?.message ? (
        <p className="text-body-sm text-destructive" role="alert">
          {errors.columns.root.message}
        </p>
      ) : null}
      <p className="text-body-sm text-muted-foreground">
        Use o botão de arrastar com o mouse ou com as teclas Espaço e setas. A ordem exibida será
        usada no board.
      </p>
    </div>
  );
}
