import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/app/providers";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Atlas", template: "%s | Atlas" },
  description: "Plataforma colaborativa para gerenciamento de boards e tarefas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geist.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
