import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function HomeFooter() {
  return (
    <footer className="border-t bg-surface-low">
      <div className="atlas-container flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <Link
            href="/"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Atlas — página inicial"
          >
            <BrandMark size="sm" />
          </Link>
          <p className="text-body-sm text-muted-foreground">
            © 2026 Atlas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
