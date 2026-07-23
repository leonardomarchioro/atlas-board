import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  description: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres."),
  columns: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z
          .string()
          .trim()
          .min(1, "Informe o nome da coluna.")
          .max(50, "O nome deve ter no máximo 50 caracteres."),
      }),
    )
    .min(1, "Crie pelo menos uma coluna."),
  memberEmails: z.array(z.email("Informe um e-mail válido.")),
});
