import type { Metadata } from "next";
import { TestRunner } from "@/components/test/test-runner";

export const metadata: Metadata = { title: "Test in progress" };

type Props = {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ day?: string | string[] }>;
};

export default async function TestPage({ params, searchParams }: Props) {
  const { testId } = await params;
  const { day } = await searchParams;
  const dayId = Array.isArray(day) ? day[0] : day;
  const valid = dayId && /^\d{4}-\d{2}-\d{2}$/.test(dayId) ? dayId : null;
  return <TestRunner testId={testId} dayId={valid} />;
}
