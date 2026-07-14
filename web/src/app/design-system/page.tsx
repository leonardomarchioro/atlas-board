import type { Metadata } from "next";

import { DesignSystemDemo } from "@/app/design-system/design-system-demo";

export const metadata: Metadata = {
  title: "Design System",
  description: "Catálogo visual interno do design system Atlas.",
};

export default function DesignSystemPage() {
  return <DesignSystemDemo />;
}
