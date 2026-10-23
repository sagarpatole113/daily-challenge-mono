import type { Metadata } from "next";
import { DaysList } from "@/components/dashboard/days-list";

export const metadata: Metadata = { title: "Practice days" };

export default function TestsPage() {
  return <DaysList />;
}
