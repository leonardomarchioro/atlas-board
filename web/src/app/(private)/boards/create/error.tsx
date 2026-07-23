"use client";

import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CreateBoardError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Criar Board" />
      <main className="atlas-container grid min-h-screen place-items-center py-24">
        <section className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-overlay">
          <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert aria-hidden />
          </span>
          <h1 className="text-headline-md">Não foi possível abrir a criação do board</h1>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Tente carregar a página novamente. Se o problema continuar, volte para a Dashboard.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset}>
              <RotateCcw aria-hidden />
              Tentar novamente
            </Button>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft aria-hidden />
              Voltar à Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
