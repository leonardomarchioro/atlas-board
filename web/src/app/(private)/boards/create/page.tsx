import type { Metadata } from "next";
import { CreateBoardWizard } from "@/components/boards/create/create-board-wizard";

export const metadata: Metadata = { title: "Criar Board" };

export default function CreateBoardPage() {
  return <CreateBoardWizard />;
}
