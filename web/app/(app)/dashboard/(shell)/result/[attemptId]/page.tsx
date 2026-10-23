import type { Metadata } from "next";
import { ResultView } from "@/components/result/result-view";

export const metadata: Metadata = { title: "Result" };

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  return <ResultView attemptId={(await params).attemptId} />;
}
