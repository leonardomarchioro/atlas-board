import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-lg border-border/70 shadow-sm">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl text-primary">Atlas</CardTitle>
            <CardDescription>
              Plataforma colaborativa para organizar boards e tarefas.
            </CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            O frontend foi configurado e está pronto para as próximas etapas de
            desenvolvimento.
          </p>
        </CardContent>
        <CardFooter>
          <Button>Setup concluído</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
