import type { Metadata } from "next";

import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";

export const metadata: Metadata = {
  title: "Organize projetos e equipes",
  description:
    "Organize projetos, colabore em tempo real e mantenha sua equipe focada com o Atlas.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="flex-1 px-4 pb-20 pt-32 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <HeroSection />
          <FeaturesSection />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
