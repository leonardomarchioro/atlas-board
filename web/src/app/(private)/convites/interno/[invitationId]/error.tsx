"use client";

import { Button } from "@/components/ui/button";

export default function InternalInvitationError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <div className="max-w-md space-y-4 text-center" role="alert">
        <h1 className="text-headline-md">Algo deu errado</h1>
        <p className="text-muted-foreground">Não foi possível exibir este convite.</p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </main>
  );
}
