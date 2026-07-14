import { Mail, Users, Columns3 } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";

const features = [
  [Users, "Boards colaborativos"],
  [Mail, "Convites por e-mail"],
  [Columns3, "Kanban"],
] as const;

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r bg-surface-low p-8 md:flex">
        <div className="absolute -right-32 -top-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <Link
          href="/"
          className="relative rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Atlas — página inicial"
        >
          <BrandMark />
        </Link>
        <div className="relative mx-auto w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <h1 className="text-headline-xl">
              Gerencie seu fluxo com maestria
            </h1>
            <p className="text-body-lg text-muted-foreground">
              O Atlas transforma a complexidade em clareza. Organize projetos,
              colabore em tempo real e alcance a produtividade máxima com uma
              interface pensada para o alto desempenho.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map(([Icon, text]) => (
              <span
                key={text}
                className="flex items-center gap-2 rounded-full border bg-surface-high px-3 py-1.5 font-label text-label-sm uppercase tracking-wider"
              >
                <Icon className="size-4 text-primary" aria-hidden />
                {text}
              </span>
            ))}
          </div>
          <div
            className="grid h-52 grid-cols-3 gap-4 border-t pt-8"
            aria-hidden
          >
            {[2, 3, 2].map((count, column) => (
              <div key={column} className="space-y-4">
                <div className="h-2 w-16 rounded-full bg-muted-foreground/20" />
                {Array.from({ length: count }).map((_, item) => (
                  <div
                    key={item}
                    className="space-y-2 rounded-lg border border-l-4 border-l-primary bg-card/70 p-4 backdrop-blur"
                  >
                    <div className="h-1.5 rounded-full bg-muted-foreground/20" />
                    <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/20" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="relative font-label text-label-sm text-muted-foreground">
          © 2026 Atlas SaaS
        </p>
      </section>
      <section className="relative flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-6 [&>*]:w-full">
          <div className="flex justify-center md:hidden">
            <BrandMark />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
