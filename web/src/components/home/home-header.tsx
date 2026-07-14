import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="atlas-container flex h-18 items-center justify-between">
        <Link
          href="/"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Atlas — página inicial"
        >
          <BrandMark />
        </Link>

        <nav
          className="flex items-center gap-1.5 sm:gap-3"
          aria-label="Navegação principal"
        >
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "px-2 sm:px-3")}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className={cn(buttonVariants({ size: "lg" }), "px-3 sm:px-6")}
          >
            Cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
