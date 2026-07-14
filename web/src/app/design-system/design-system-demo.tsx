"use client";

import { Bell, Check, ChevronDown, Info, MoreHorizontal, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const swatches = [
  ["Primária", "bg-primary", "text-primary-foreground"],
  ["Secundária", "bg-secondary", "text-secondary-foreground"],
  ["Sucesso", "bg-success-soft", "text-success-foreground"],
  ["Atenção", "bg-warning-soft", "text-warning-foreground"],
  ["Informação", "bg-info-soft", "text-info-foreground"],
  ["Erro", "bg-destructive/15", "text-destructive"],
] as const;

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-headline-md">{title}</h2>
        <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Feedback({ tone, icon: Icon, title, children }: { tone: "success" | "warning" | "info" | "destructive"; icon: typeof Check; title: string; children: React.ReactNode }) {
  const styles = {
    success: "border-success/30 bg-success-soft text-success-foreground",
    warning: "border-warning/30 bg-warning-soft text-warning-foreground",
    info: "border-info/30 bg-info-soft text-info-foreground",
    destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  return (
    <div className={`flex gap-3 rounded-md border p-4 ${styles[tone]}`} role="status">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div><p className="font-label text-label-md">{title}</p><p className="mt-1 text-body-sm opacity-90">{children}</p></div>
    </div>
  );
}

export function DesignSystemDemo() {
  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="atlas-container space-y-12">
        <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline">Catálogo interno</Badge>
            <h1 className="mt-4 text-headline-xl">Design System Atlas</h1>
            <p className="mt-3 text-body-lg text-muted-foreground">Tokens e componentes para uma interface SaaS precisa, acessível e consistente.</p>
          </div>
          <ThemeToggle />
        </header>

        <Section title="Cores semânticas" description="As cores preservam o mesmo significado nos temas claro e escuro.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map(([label, background, foreground]) => (
              <div key={label} className={`${background} ${foreground} flex min-h-24 items-end rounded-lg border p-4`}>
                <span className="font-label text-label-md">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografia" description="Inter prioriza leitura; Geist traz precisão a labels e dados técnicos.">
          <Card><CardContent className="space-y-5">
            <div><p className="text-headline-xl">Headline XL</p><p className="font-label text-label-sm text-muted-foreground">36 / 44 · Inter 700</p></div>
            <div><p className="text-headline-lg">Headline LG responsiva</p><p className="font-label text-label-sm text-muted-foreground">30 / 38 · Inter 600</p></div>
            <div><p className="text-headline-md">Headline MD</p><p className="font-label text-label-sm text-muted-foreground">24 / 32 · Inter 600</p></div>
            <p className="text-body-lg">Texto de apoio em body large para introduções e mensagens importantes.</p>
            <p className="text-body-md">Texto padrão de interface em body medium.</p>
            <p className="font-label text-label-md uppercase">Label técnico em Geist</p>
          </CardContent></Card>
        </Section>

        <Section title="Ações e estados" description="Hover, foco, active, disabled e feedback permanecem distinguíveis.">
          <Card><CardContent className="flex flex-wrap items-center gap-3">
            <Button>Ação principal</Button><Button variant="outline">Ação secundária</Button><Button variant="ghost">Ação discreta</Button><Button variant="destructive">Excluir</Button><Button disabled>Desabilitado</Button>
            <Button disabled><span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />Carregando</Button>
            <Tooltip><TooltipTrigger render={<Button size="icon" variant="outline" aria-label="Notificações" />}><Bell aria-hidden="true" /></TooltipTrigger><TooltipContent>Notificações</TooltipContent></Tooltip>
          </CardContent></Card>
        </Section>

        <Section title="Formulários" description="Campos com labels associados, erro explícito e foco acessível.">
          <Card><CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Campo obrigatório</Label><Input id="name" placeholder="Digite um título" /></div>
            <div className="space-y-2"><Label htmlFor="disabled">Campo desabilitado</Label><Input id="disabled" value="Conteúdo bloqueado" disabled readOnly /></div>
            <div className="space-y-2"><Label htmlFor="error">Campo com erro</Label><Input id="error" defaultValue="Valor inválido" aria-invalid="true" aria-describedby="error-message" /><p id="error-message" className="text-body-sm text-destructive">Revise o valor informado.</p></div>
            <div className="space-y-2"><Label>Prioridade</Label><Select defaultValue="medium"><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" placeholder="Adicione detalhes relevantes" /></div>
            <div className="flex items-center gap-2"><Checkbox id="updates" defaultChecked /><Label htmlFor="updates">Receber atualizações</Label></div>
            <div className="flex items-center gap-2"><Switch id="automation" defaultChecked /><Label htmlFor="automation">Automação ativa</Label></div>
          </CardContent></Card>
        </Section>

        <Section title="Badges e feedback" description="Cor e texto trabalham juntos; o indicador ativo pode pulsar.">
          <div className="flex flex-wrap gap-2"><Badge>Principal</Badge><Badge variant="secondary">Neutro</Badge><Badge variant="success">Sucesso</Badge><Badge variant="warning">Atenção</Badge><Badge variant="info">Informação</Badge><Badge variant="destructive">Erro</Badge><StatusBadge tone="success" live>Ativo</StatusBadge></div>
          <div className="grid gap-3 lg:grid-cols-2"><Feedback tone="success" icon={Check} title="Sucesso">A operação foi concluída.</Feedback><Feedback tone="warning" icon={TriangleAlert} title="Atenção">Esta ação requer confirmação.</Feedback><Feedback tone="info" icon={Info} title="Informação">Há uma atualização disponível.</Feedback><Feedback tone="destructive" icon={X} title="Erro">Não foi possível concluir a ação.</Feedback></div>
        </Section>

        <Section title="Superfícies e overlays" description="Profundidade por camadas tonais, com sombra reservada ao modal.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="hover:bg-surface-low"><CardHeader><CardTitle>Card de conteúdo</CardTitle><CardDescription>Contorno discreto, sem sombra padrão.</CardDescription></CardHeader><CardContent className="flex items-center gap-3"><Avatar size="lg"><AvatarFallback>AT</AvatarFallback><AvatarBadge /></Avatar><div><p className="font-label text-label-md">Equipe Atlas</p><p className="text-body-sm text-muted-foreground">12 participantes</p></div></CardContent><CardFooter className="justify-end"><Button variant="ghost">Ver detalhes</Button></CardFooter></Card>
            <Card><CardHeader><CardTitle>Carregamento estrutural</CardTitle><CardDescription>Skeleton acompanha a geometria final.</CardDescription></CardHeader><CardContent className="space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}><MoreHorizontal aria-hidden="true" />Menu<ChevronDown aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>Ações</DropdownMenuLabel><DropdownMenuItem>Editar item</DropdownMenuItem><DropdownMenuItem>Duplicar item</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">Remover item</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            <Dialog><DialogTrigger render={<Button variant="outline" />}>Abrir modal</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Confirmar alteração</DialogTitle><DialogDescription>Este modal demonstra a superfície elevada e o foco gerenciado.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><DialogClose render={<Button />}>Confirmar</DialogClose></DialogFooter></DialogContent></Dialog>
            <Button variant="outline" onClick={() => toast.success("Design system validado", { description: "Os tokens foram aplicados corretamente." })}>Exibir toast</Button>
          </div>
        </Section>

        <Separator />
        <footer className="pb-4 font-label text-label-sm text-muted-foreground">Atlas · Sistema visual interno</footer>
      </div>
    </main>
  );
}
