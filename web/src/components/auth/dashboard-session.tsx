"use client";
import { LoaderCircle, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/auth-hooks";
import { useAuth } from "@/providers/auth-provider";

export function DashboardSession() {
  const { user } = useAuth();
  const logout = useLogout();
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-center">
        <h1 className="text-headline-lg text-primary">Atlas</h1>
        <p className="text-body-lg">Autenticação concluída com sucesso.</p>
        <p className="text-muted-foreground">
          Olá, <strong className="text-foreground">{user?.name}</strong>.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <LogOut aria-hidden />
          )}
          {logout.isPending ? "Saindo..." : "Sair"}
        </Button>
      </section>
    </main>
  );
}
