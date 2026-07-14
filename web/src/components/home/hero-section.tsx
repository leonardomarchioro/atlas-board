import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="mb-20" aria-labelledby="hero-title">
      <h1
        id="hero-title"
        className="mb-6 text-headline-xl tracking-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight"
      >
        Projetos em movimento,
        <br />
        <span className="text-primary">resultados em foco.</span>
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-body-lg leading-relaxed text-muted-foreground">
        A estrutura essencial para equipes que valorizam a clareza e a
        execução. Organize, colabore e entregue sem ruído.
      </p>
      <div className="flex justify-center">
        <Link
          href="/cadastro"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-14 w-full rounded-lg px-10 text-body-lg font-bold sm:w-auto",
          )}
        >
          Cadastrar agora
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
