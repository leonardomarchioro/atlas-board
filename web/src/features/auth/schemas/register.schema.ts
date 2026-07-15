import { z } from "zod";
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome deve possuir pelo menos 2 caracteres.")
      .max(100, "O nome deve possuir no máximo 100 caracteres."),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha deve possuir pelo menos 8 caracteres."),
    passwordConfirmation: z.string().min(1, "Confirme sua senha."),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  })
  .refine((data) => data.acceptTerms, {
    message: "Você precisa aceitar os termos.",
    path: ["acceptTerms"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;
