import type { Metadata } from "next";
import { DashboardSession } from "@/components/auth/dashboard-session";

export const metadata: Metadata = { title: "Dashboard" };
export default function DashboardPage() { return <DashboardSession />; }
