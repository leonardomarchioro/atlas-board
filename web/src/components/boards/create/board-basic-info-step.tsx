import type { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateBoardFormValues } from "@/features/boards/types/create-board.types";

export function BoardBasicInfoStep({
  register,
  watch,
  errors,
}: {
  register: UseFormRegister<CreateBoardFormValues>;
  watch: UseFormWatch<CreateBoardFormValues>;
  errors: FieldErrors<CreateBoardFormValues>;
}) {
  const name = watch("name");
  const description = watch("description");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 id="create-board-step-title" tabIndex={-1} className="text-headline-md font-bold">
          Informações do Board
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Dê um nome ao board e descreva seu objetivo.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="board-name">
            Nome do board <span className="text-destructive">*</span>
          </Label>
          <span className="text-label-sm text-muted-foreground">{name.length}/100</span>
        </div>
        <Input
          id="board-name"
          placeholder="Ex: Roadmap de Produto 2024"
          maxLength={100}
          autoFocus
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "board-name-error" : "board-name-help"}
          {...register("name")}
        />
        {errors.name ? (
          <p id="board-name-error" className="text-body-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        ) : (
          <p id="board-name-help" className="text-body-sm text-muted-foreground">
            Use um nome curto e fácil de reconhecer.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="board-description">Descrição</Label>
          <span className="text-label-sm text-muted-foreground">{description.length}/500</span>
        </div>
        <Textarea
          id="board-description"
          rows={4}
          maxLength={500}
          placeholder="Descreva o propósito deste board..."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "board-description-error" : undefined}
          {...register("description")}
        />
        {errors.description ? (
          <p id="board-description-error" className="text-body-sm text-destructive" role="alert">
            {errors.description.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
