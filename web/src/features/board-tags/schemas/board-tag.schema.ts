import { z } from "zod";

export const boardTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da tag.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor válida."),
});

export type BoardTagFormValues = z.infer<typeof boardTagSchema>;
