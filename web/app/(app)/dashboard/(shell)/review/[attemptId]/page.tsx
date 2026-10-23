import type { Metadata } from "next";
import { ReviewView } from "@/components/result/review-view";

export const metadata: Metadata = { title: "Review answers" };

export default async function ReviewPage({ params }: { params: Promise<{ attemptId: string }> }) {
  return <ReviewView attemptId={(await params).attemptId} />;
}
