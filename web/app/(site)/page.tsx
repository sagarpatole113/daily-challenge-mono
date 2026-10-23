import type { Metadata } from "next";
import { DailyFormat, FinalCta, Hero, HomeFaq, HowItWorks, SubjectLinks, WhyDaily } from "@/components/marketing/home-sections";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Saatatya (सातत्य): Daily MPSC Group C Mock Tests",
    description:
      "Practise three timed MPSC Group C mock tests every day, with bilingual explanations and a clear view of your progress. Plus free syllabus and exam-pattern guides.",
    path: "/",
  }),
  title: { absolute: "Saatatya (सातत्य): Daily MPSC Group C Mock Tests" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <DailyFormat />
      <HowItWorks />
      <WhyDaily />
      <SubjectLinks />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
