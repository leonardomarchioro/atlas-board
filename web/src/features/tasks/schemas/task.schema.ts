import { z } from "zod";

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Informe o título da tarefa.").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  columnId: z.string().uuid("Selecione uma coluna válida."),
  priority: taskPrioritySchema,
  dueDate: z.string().optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()),
  checklist: z
    .array(z.object({ id: z.string(), title: z.string().trim().min(1).max(200) }))
    ,
});

export const taskCommentSchema = z.object({
  content: z.string().trim().min(1, "Escreva um comentário.").max(5000),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
