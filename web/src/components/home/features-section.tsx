import { Bolt, ClipboardCheck, Columns3, UsersRound } from "lucide-react";

import { FeatureCard } from "@/components/home/feature-card";

const features = [
  {
    title: "Kanban Dinâmico",
    description:
      "Visualize o fluxo de trabalho de ponta a ponta. Arraste, solte e priorize tarefas com simplicidade absoluta.",
    icon: Columns3,
  },
  {
    title: "Colaboração em Tempo Real",
    description:
      "Sua equipe sincronizada instantaneamente. Atualizações ao vivo que mantêm todos no mesmo compasso.",
    icon: Bolt,
  },
  {
    title: "Monitoramento de Tarefas",
    description:
      "Acompanhe cada detalhe. De prazos a dependências, tenha controle total sobre o progresso do seu projeto.",
    icon: ClipboardCheck,
  },
  {
    title: "Gestão de Equipe",
    description:
      "Atribua responsabilidades e gerencie a carga de trabalho de forma humana e eficiente.",
    icon: UsersRound,
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      className="grid w-full grid-cols-1 gap-6 text-left md:grid-cols-2"
      aria-label="Funcionalidades do Atlas"
    >
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </section>
  );
}
