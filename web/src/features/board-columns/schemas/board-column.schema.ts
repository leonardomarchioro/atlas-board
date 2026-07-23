import { z } from "zod";

export const boardColumnSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da coluna.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
});

export type BoardColumnFormValues = z.infer<typeof boardColumnSchema>;
