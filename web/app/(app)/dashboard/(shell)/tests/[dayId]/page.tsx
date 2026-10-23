import type { Metadata } from "next";
import { DayDetail } from "@/components/dashboard/day-detail";

export const metadata: Metadata = { title: "Practice day" };

export default async function DayPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  return <DayDetail dayId={dayId} />;
}
