import { z } from "zod";

export const inviteBoardMemberSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
});

export type InviteBoardMemberFormValues = z.infer<typeof inviteBoardMemberSchema>;
