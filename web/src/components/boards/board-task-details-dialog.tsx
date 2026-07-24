"use client";

import axios from "axios";
import {
  CalendarClock,
  Check,
  CheckSquare,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ApiErrorResponse } from "@/features/auth/types/auth.types";
import type { BoardDetails } from "@/features/boards/types/board.types";
import {
  useCreateChecklistItem,
  useCreateTaskComment,
  useDeleteChecklistItem,
  useDeleteTask,
  useDeleteTaskComment,
  useTaskComments,
  useTaskDetails,
  useUpdateChecklistItem,
  useMoveTask,
  useUpdateTask,
  useUpdateTaskComment,
} from "@/features/tasks/hooks/task-hooks";
import type {
  BoardTask,
  TaskComment,
  TaskDetails,
  TaskPriority,
  TaskTag,
} from "@/features/tasks/types/task.types";
import { useAuth } from "@/providers/auth-provider";

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};
const EMPTY = "__none__";
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function BoardTaskDetailsDialog({
  taskId,
  board,
  boardTasks,
  tags,
  onClose,
}: {
  taskId: string | null;
  board: BoardDetails;
  boardTasks: BoardTask[];
  tags: TaskTag[];
  onClose: () => void;
}) {
  const query = useTaskDetails(taskId);
  const comments = useTaskComments(taskId);
  return (
    <Dialog open={Boolean(taskId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[100dvh] max-h-none max-w-none gap-0 overflow-hidden rounded-none bg-background p-0 sm:h-[92vh] sm:max-w-[1200px] sm:rounded-xl">
        {query.isPending ? (
          <TaskSkeleton />
        ) : query.isError ? (
          <TaskError error={query.error} onClose={onClose} onRetry={() => void query.refetch()} />
        ) : query.data ? (
          <TaskWorkspace
            task={query.data}
            board={board}
            boardTasks={boardTasks}
            tags={tags}
            comments={comments.data ?? []}
            commentsLoading={comments.isPending}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TaskWorkspace({
  task,
  board,
  boardTasks,
  tags,
  comments,
  commentsLoading,
  onClose,
}: {
  task: TaskDetails;
  board: BoardDetails;
  boardTasks: BoardTask[];
  tags: TaskTag[];
  comments: TaskComment[];
  commentsLoading: boolean;
  onClose: () => void;
}) {
  const update = useUpdateTask();
  const move = useMoveTask();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState<"title" | "description" | null>(null);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = async (input: Parameters<typeof update.mutateAsync>[0]) => {
    await update.mutateAsync(input);
    setEditing(null);
  };
  async function removeTask() {
    try {
      await remove.mutateAsync({ taskId: task.id, boardId: task.boardId });
      onClose();
    } catch {
      toast.error("Não foi possível excluir a tarefa.");
    }
  }
  return (
    <>
      <DialogHeader className="shrink-0 border-b px-5 py-5 pr-14 sm:px-8 sm:py-6">
        <nav
          className="mb-4 flex items-center gap-2 font-label text-label-sm text-muted-foreground"
          aria-label="Navegação estrutural"
        >
          <span>Boards</span>
          <span aria-hidden>/</span>
          <span>{board.name}</span>
          <span aria-hidden>/</span>
          <span className="text-foreground">{task.id.slice(0, 8).toUpperCase()}</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <InlineText
              mode="title"
              editing={editing === "title"}
              value={title}
              display={task.title}
              onEdit={() => {
                setTitle(task.title);
                setEditing("title");
              }}
              onChange={setTitle}
              onCancel={() => setEditing(null)}
              onSave={() =>
                void save({ taskId: task.id, boardId: task.boardId, title: title.trim() })
              }
              pending={update.isPending}
            />
            <p className="mt-2 text-body-md text-muted-foreground">
              Atualize os detalhes da tarefa e acompanhe o progresso.
            </p>
          </div>
          <Button
            variant="ghost"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 aria-hidden /> Excluir
          </Button>
        </div>
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Visualize e edite os detalhes da tarefa.
        </DialogDescription>
      </DialogHeader>
      {confirmDelete ? (
        <div className="border-b bg-destructive/5 p-4 sm:px-7" role="alert">
          <p className="font-semibold">Excluir tarefa?</p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Esta ação excluirá também os comentários e os itens de checklist relacionados. Esta ação
            não poderá ser desfeita.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={remove.isPending}
              onClick={() => void removeTask()}
            >
              {remove.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}{" "}
              Excluir tarefa
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <main className="space-y-8 p-5 sm:p-8">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Pencil className="size-5 text-primary" aria-hidden />
              Descrição
            </h2>
            <InlineText
              mode="description"
              editing={editing === "description"}
              value={description}
              display={task.description ?? ""}
              onEdit={() => {
                setDescription(task.description ?? "");
                setEditing("description");
              }}
              onChange={setDescription}
              onCancel={() => setEditing(null)}
              onSave={() =>
                void save({
                  taskId: task.id,
                  boardId: task.boardId,
                  description: description.trim() || null,
                })
              }
              pending={update.isPending}
            />
          </section>
          <TaskChecklist task={task} />
          <TaskComments task={task} comments={comments} loading={commentsLoading} />
        </main>
        <TaskSidebar
          task={task}
          board={board}
          boardTasks={boardTasks}
          tags={tags}
          update={update}
          move={move}
        />
      </div>
    </>
  );
}

function InlineText(props: {
  mode: "title" | "description";
  editing: boolean;
  value: string;
  display: string;
  pending: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!props.editing) {
    return (
      <button
        type="button"
        onClick={props.onEdit}
        className="group block w-full rounded-lg p-2 text-left transition-colors hover:bg-surface-high"
      >
        {props.mode === "title" ? (
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{props.display}</h1>
        ) : (
          <div className="min-h-28 rounded-xl border bg-surface-low p-6">
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {props.display || "Adicionar descrição"}
            </p>
          </div>
        )}
      </button>
    );
  }
  const control =
    props.mode === "title" ? (
      <Input
        autoFocus
        value={props.value}
        maxLength={200}
        className="h-12 text-lg font-semibold"
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") props.onCancel();
          if (e.key === "Enter" && props.value.trim()) props.onSave();
        }}
      />
    ) : (
      <Textarea
        autoFocus
        rows={7}
        value={props.value}
        maxLength={5000}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && props.onCancel()}
      />
    );
  return (
    <div className="space-y-2">
      {control}
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={props.pending || (props.mode === "title" && !props.value.trim())}
          onClick={props.onSave}
        >
          Salvar
        </Button>
        <Button size="sm" variant="ghost" disabled={props.pending} onClick={props.onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function TaskSidebar({
  task,
  board,
  boardTasks,
  tags,
  update,
  move,
}: {
  task: TaskDetails;
  board: BoardDetails;
  boardTasks: BoardTask[];
  tags: TaskTag[];
  update: ReturnType<typeof useUpdateTask>;
  move: ReturnType<typeof useMoveTask>;
}) {
  const patch = (input: Omit<Parameters<typeof update.mutate>[0], "taskId" | "boardId">) =>
    update.mutate({ taskId: task.id, boardId: task.boardId, ...input });
  return (
    <aside className="space-y-6 border-t p-5 sm:p-8 lg:border-t-0">
      <section className="space-y-5 rounded-xl border bg-surface-low p-6">
        <h2 className="font-label text-label-sm font-semibold uppercase tracking-widest">
          Detalhes
        </h2>
        <Meta label="Coluna">
          <Select
            value={task.columnId}
            onValueChange={(columnId) =>
              columnId &&
              move.mutate({
                boardId: task.boardId,
                taskId: task.id,
                columnId,
                position: boardTasks.filter(
                  (item) => item.columnId === columnId && item.id !== task.id,
                ).length,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {board.columns.find((column) => column.id === task.columnId)?.name ??
                  "Selecione uma coluna"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[...board.columns]
                .sort((a, b) => a.position - b.position)
                .map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Meta>
        <Meta label="Prioridade">
          <Select
            value={task.priority}
            onValueChange={(priority) => patch({ priority: priority as TaskPriority })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{priorityLabels[task.priority]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Meta>
        <Meta label="Responsável">
          <Select
            value={task.assignee?.id ?? EMPTY}
            onValueChange={(id) => patch({ assigneeId: id === EMPTY ? null : id })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{task.assignee?.name ?? "Sem responsável"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY}>Sem responsável</SelectItem>
              {board.members.map((member) => (
                <SelectItem key={member.user.id} value={member.user.id}>
                  {member.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Meta>
        <Meta label="Prazo">
          <div className="flex gap-2">
            <Input
              type="date"
              value={task.dueDate?.slice(0, 10) ?? ""}
              onChange={(e) =>
                patch({ dueDate: e.target.value ? `${e.target.value}T12:00:00` : null })
              }
            />
            {task.dueDate ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remover prazo"
                onClick={() => patch({ dueDate: null })}
              >
                <Trash2 aria-hidden />
              </Button>
            ) : null}
          </div>
          {/* Atraso depende intencionalmente do relógio no momento da renderização. */}
          {/* eslint-disable-next-line react-hooks/purity */}
          {task.dueDate && new Date(task.dueDate).getTime() < Date.now() ? (
            <p className="text-label-sm text-destructive">Prazo atrasado</p>
          ) : null}
        </Meta>
        <Meta label="Etiquetas">
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = task.tags.some((item) => item.id === tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    aria-pressed={selected}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-label-sm ${selected ? "border-primary bg-primary/10" : ""}`}
                    onClick={() =>
                      patch({
                        tagIds: selected
                          ? task.tags.filter((item) => item.id !== tag.id).map((item) => item.id)
                          : [...task.tags.map((item) => item.id), tag.id],
                      })
                    }
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                      aria-hidden
                    />
                    {tag.name}
                    {selected ? <Check className="size-3" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-body-sm text-muted-foreground">Nenhuma tag disponível.</p>
          )}
        </Meta>
      </section>
      <section className="space-y-4 rounded-xl border bg-surface-low p-6">
        <h2 className="font-label text-label-sm font-semibold uppercase tracking-widest">
          Metadados
        </h2>
        <div className="space-y-3 text-body-sm">
          <PersonRow icon={<UserRound />} label="Criado por" name={task.createdBy.name} />
          <PersonRow icon={<CalendarClock />} label="Criada em" name={formatDate(task.createdAt)} />
          <PersonRow
            icon={<CalendarClock />}
            label="Atualizada em"
            name={formatDate(task.updatedAt)}
          />
        </div>
      </section>
    </aside>
  );
}

function TaskChecklist({ task }: { task: TaskDetails }) {
  const create = useCreateChecklistItem();
  const update = useUpdateChecklistItem();
  const remove = useDeleteChecklistItem();
  const [title, setTitle] = useState("");
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <CheckSquare className="size-5 text-primary" aria-hidden />
          Checklist
        </h2>
        <span className="text-label-sm text-muted-foreground">
          {task.checklistProgress.completed} de {task.checklistProgress.total} concluídos
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${task.checklistProgress.percentage}%` }}
        />
      </div>
      {task.checklist.length ? (
        <ul className="space-y-2">
          {task.checklist.map((item) => (
            <ChecklistItem key={item.id} item={item} task={task} update={update} remove={remove} />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-body-sm text-muted-foreground">
          Nenhum item no checklist.
        </p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          create.mutate(
            { taskId: task.id, boardId: task.boardId, title: title.trim() },
            { onSuccess: () => setTitle("") },
          );
        }}
      >
        <Input
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Adicionar item..."
          aria-label="Novo item do checklist"
        />
        <Button type="submit" disabled={!title.trim() || create.isPending}>
          <Plus aria-hidden />
          Adicionar
        </Button>
      </form>
    </section>
  );
}

function ChecklistItem({
  item,
  task,
  update,
  remove,
}: {
  item: TaskDetails["checklist"][number];
  task: TaskDetails;
  update: ReturnType<typeof useUpdateChecklistItem>;
  remove: ReturnType<typeof useDeleteChecklistItem>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.title);
  const save = () => {
    if (!value.trim()) return;
    update.mutate(
      { taskId: task.id, boardId: task.boardId, itemId: item.id, title: value.trim() },
      { onSuccess: () => setEditing(false) },
    );
  };
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-surface-low p-4 transition-colors hover:bg-surface-high">
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={(checked) =>
          update.mutate({
            taskId: task.id,
            boardId: task.boardId,
            itemId: item.id,
            isCompleted: checked === true,
          })
        }
        aria-label={`Marcar ${item.title}`}
      />
      {editing ? (
        <Input
          autoFocus
          value={value}
          maxLength={200}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
            if (event.key === "Enter") save();
          }}
          aria-label="Editar item do checklist"
        />
      ) : (
        <span className={`flex-1 ${item.isCompleted ? "text-muted-foreground line-through" : ""}`}>
          {item.title}
        </span>
      )}
      {editing ? (
        <Button variant="ghost" size="icon-sm" aria-label="Salvar item" onClick={save}>
          <Check aria-hidden />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar ${item.title}`}
          onClick={() => {
            setValue(item.title);
            setEditing(true);
          }}
        >
          <Pencil aria-hidden />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${item.title}`}
        onClick={() => remove.mutate({ taskId: task.id, boardId: task.boardId, itemId: item.id })}
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  );
}

function TaskComments({
  task,
  comments,
  loading,
}: {
  task: TaskDetails;
  comments: TaskComment[];
  loading: boolean;
}) {
  const { user } = useAuth();
  const create = useCreateTaskComment();
  const edit = useUpdateTaskComment();
  const remove = useDeleteTaskComment();
  const [content, setContent] = useState("");
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <MessageCircle className="size-5 text-primary" aria-hidden />
        Comentários <Badge variant="secondary">{comments.length}</Badge>
      </h2>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : comments.length ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              own={comment.author.id === user?.id}
              onEdit={(value) =>
                edit.mutate({ taskId: task.id, commentId: comment.id, content: value })
              }
              onDelete={() =>
                remove.mutate({ taskId: task.id, boardId: task.boardId, commentId: comment.id })
              }
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-body-sm text-muted-foreground">
          Nenhum comentário ainda. Seja a primeira pessoa a comentar.
        </p>
      )}
      <form
        className="space-y-2 rounded-lg border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!content.trim()) return;
          create.mutate(
            { taskId: task.id, boardId: task.boardId, content: content.trim() },
            { onSuccess: () => setContent("") },
          );
        }}
      >
        <Textarea
          value={content}
          maxLength={5000}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Adicione um comentário..."
          aria-label="Novo comentário"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!content.trim() || create.isPending}>
            {create.isPending ? "Comentando..." : "Comentar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function CommentItem({
  comment,
  own,
  onEdit,
  onDelete,
}: {
  comment: TaskComment;
  own: boolean;
  onEdit: (value: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment.content);
  return (
    <article className="flex gap-4 rounded-xl border bg-surface-low p-4">
      <Avatar className="size-10">
        <AvatarImage src={comment.author.avatarUrl ?? undefined} alt="" />
        <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong>{comment.author.name}</strong>
          <span className="text-label-sm text-muted-foreground">
            {formatDate(comment.createdAt)}
            {comment.isEdited ? " · editado" : ""}
          </span>
        </div>
        {editing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={value}
              maxLength={5000}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!value.trim()}
                onClick={() => {
                  onEdit(value.trim());
                  setEditing(false);
                }}
              >
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {comment.content}
          </p>
        )}
        {own && !editing ? (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setValue(comment.content);
                setEditing(true);
              }}
            >
              Editar
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              Excluir
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="font-label text-label-sm uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
function PersonRow({ icon, label, name }: { icon: React.ReactNode; label: string; name: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="[&>svg]:size-4" aria-hidden>
        {icon}
      </span>
      <span>{label}:</span>
      <span className="ml-auto text-right text-foreground">{name}</span>
    </div>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
function TaskSkeleton() {
  return (
    <div className="space-y-6 p-7" role="status" aria-label="Carregando tarefa">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
function TaskError({
  error,
  onClose,
  onRetry,
}: {
  error: unknown;
  onClose: () => void;
  onRetry: () => void;
}) {
  const status = axios.isAxiosError<ApiErrorResponse>(error) ? error.response?.status : undefined;
  const denied = status === 403;
  const missing = status === 404;
  return (
    <div className="grid h-full place-items-center p-6 text-center" role="alert">
      <div>
        <DialogTitle>
          {denied
            ? "Você não possui acesso a esta tarefa."
            : missing
              ? "Tarefa não encontrada."
              : "Não foi possível carregar a tarefa."}
        </DialogTitle>
        <DialogDescription className="mt-2">
          {denied
            ? "Volte ao board ou solicite acesso a um administrador."
            : "Feche esta visualização e continue no board."}
        </DialogDescription>
        <div className="mt-4 flex justify-center gap-2">
          {!denied && !missing ? <Button onClick={onRetry}>Tentar novamente</Button> : null}
          <Button variant="outline" onClick={onClose}>
            Voltar ao board
          </Button>
        </div>
      </div>
    </div>
  );
}
