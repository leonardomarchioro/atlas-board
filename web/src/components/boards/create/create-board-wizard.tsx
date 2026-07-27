"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BoardBasicInfoStep } from "@/components/boards/create/board-basic-info-step";
import { BoardColumnsStep } from "@/components/boards/create/board-columns-step";
import { BoardMembersStep } from "@/components/boards/create/board-members-step";
import { BoardReviewStep } from "@/components/boards/create/board-review-step";
import { CreateBoardProgress } from "@/components/boards/create/create-board-progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBoardSchema } from "@/features/boards/schemas/create-board.schema";
import { useCreateBoard } from "@/features/boards/hooks/use-create-board";
import type { CreateBoardFormValues } from "@/features/boards/types/create-board.types";
import { useAuth } from "@/providers/auth-provider";

const initialColumns = ["Backlog", "A Fazer", "Em Progresso", "Revisão", "Concluído"];
const emailSchema = z.email("Informe um e-mail válido.");
const stepFields: Array<Array<keyof CreateBoardFormValues>> = [
  ["name", "description"],
  ["columns"],
  ["memberEmails"],
  [],
];

function createColumnId(index: number) {
  return `initial-column-${index + 1}`;
}

function creationErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "Não foi possível criar o board. Tente novamente.";
  switch (error.response?.status) {
    case 400:
    case 422:
      return "Revise os dados informados e tente novamente.";
    case 409:
      return "Não foi possível criar o board devido a um conflito de dados.";
    case 401:
      return "Sua sessão expirou. Entre novamente para continuar.";
    default:
      return "Não foi possível criar o board. Tente novamente.";
  }
}

export function CreateBoardWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateBoard();
  const [step, setStep] = useState(0);
  const [memberDraft, setMemberDraft] = useState("");
  const [memberDraftError, setMemberDraftError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      columns: initialColumns.map((name, index) => ({ id: createColumnId(index), name })),
      memberEmails: [],
    },
  });
  const memberEmails = useWatch({ control: form.control, name: "memberEmails" });
  const isBusy = mutation.isPending || redirecting;

  useEffect(() => {
    if (step === 0) return;
    requestAnimationFrame(() => {
      document.getElementById("create-board-step-title")?.focus();
    });
  }, [step]);

  if (!user) return null;
  const owner = user;

  function updateMemberDraft(value: string) {
    setMemberDraft(value);
    if (memberDraftError) setMemberDraftError(null);
  }

  function addMemberEmail(): boolean {
    const normalizedEmail = memberDraft.trim().toLowerCase();
    if (!normalizedEmail) return true;
    const parsed = emailSchema.safeParse(normalizedEmail);
    if (!parsed.success) {
      setMemberDraftError("Informe um e-mail válido.");
      return false;
    }
    if (normalizedEmail === owner.email.trim().toLowerCase()) {
      setMemberDraftError("Você já será adicionado como administrador do board.");
      return false;
    }
    if (form.getValues("memberEmails").includes(normalizedEmail)) {
      setMemberDraftError("Este e-mail já foi adicionado.");
      return false;
    }
    form.setValue("memberEmails", [...form.getValues("memberEmails"), normalizedEmail], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setMemberDraft("");
    setMemberDraftError(null);
    return true;
  }

  function removeMemberEmail(email: string) {
    form.setValue(
      "memberEmails",
      form.getValues("memberEmails").filter((item) => item !== email),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  async function goNext() {
    if (isBusy) return;
    if (step === 2 && memberDraft.trim() && !addMemberEmail()) return;
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (!valid) return;
    setStep((current) => Math.min(current + 1, 3));
  }

  function goBack() {
    if (!isBusy) setStep((current) => Math.max(current - 1, 0));
  }

  function cancel() {
    if (isBusy) return;
    if (form.formState.isDirty || memberDraft.trim()) {
      setDiscardOpen(true);
      return;
    }
    router.push("/dashboard");
  }

  async function submit(data: CreateBoardFormValues) {
    if (step !== 3 || isBusy) return;
    try {
      const board = await mutation.mutateAsync({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        columns: data.columns.map((column) => ({ name: column.name.trim() })),
        memberEmails: data.memberEmails.map((email) => email.trim().toLowerCase()),
      });
      setRedirecting(true);
      form.reset(data);
      router.replace(`/boards/${board.id}`);
    } catch (error) {
      toast.error(creationErrorMessage(error));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="atlas-container flex min-h-screen items-start justify-center py-8 sm:items-center">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-overlay">
          <div className="border-b px-4 py-5 sm:px-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-headline-md font-bold">Criar Novo Board</h1>
                <p className="text-body-sm text-muted-foreground">Etapa {step + 1} de 4</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={cancel}
                disabled={isBusy}
                aria-label="Cancelar criação do board"
              >
                <X aria-hidden />
              </Button>
            </div>
            <CreateBoardProgress currentStep={step} />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            noValidate
          >
            <div className="max-h-[min(60vh,38rem)] overflow-y-auto p-4 sm:p-6">
              {step === 0 ? (
                <BoardBasicInfoStep
                  register={form.register}
                  watch={form.watch}
                  errors={form.formState.errors}
                />
              ) : null}
              {step === 1 ? (
                <BoardColumnsStep
                  control={form.control}
                  register={form.register}
                  errors={form.formState.errors}
                />
              ) : null}
              {step === 2 ? (
                <BoardMembersStep
                  owner={owner}
                  emails={memberEmails}
                  draft={memberDraft}
                  draftError={memberDraftError}
                  disabled={isBusy}
                  onDraftChange={updateMemberDraft}
                  onAdd={addMemberEmail}
                  onRemove={removeMemberEmail}
                />
              ) : null}
              {step === 3 ? <BoardReviewStep values={form.getValues()} owner={owner} /> : null}
              {mutation.isError ? (
                <p className="mt-6 text-body-sm text-destructive" role="alert">
                  A criação não foi concluída. Seus dados foram preservados para uma nova tentativa.
                </p>
              ) : null}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <Button type="button" variant="outline" onClick={cancel} disabled={isBusy}>
                Cancelar
              </Button>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={step === 0 || isBusy}
                >
                  <ArrowLeft aria-hidden />
                  Voltar
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={() => void goNext()} disabled={isBusy}>
                    Próximo
                    <ArrowRight aria-hidden />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isBusy}
                    aria-describedby="create-status"
                    onClick={() => void form.handleSubmit(submit)()}
                  >
                    {isBusy ? (
                      <LoaderCircle className="animate-spin" aria-hidden />
                    ) : (
                      <CheckCircle2 aria-hidden />
                    )}
                    {isBusy ? "Criando board..." : "Criar Board"}
                  </Button>
                )}
              </div>
              <span id="create-status" className="sr-only" aria-live="polite">
                {isBusy ? "Criando board, aguarde." : ""}
              </span>
            </div>
          </form>
        </div>
      </main>
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar criação do board?</DialogTitle>
            <DialogDescription>As informações preenchidas serão perdidas.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiscardOpen(false)}>
              Continuar editando
            </Button>
            <Button type="button" variant="destructive" onClick={() => router.push("/dashboard")}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
