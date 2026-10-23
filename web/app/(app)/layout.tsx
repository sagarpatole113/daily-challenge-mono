import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { noIndex } from "@/lib/seo";

// Sign-in and the student application are private: never indexed.
export const metadata: Metadata = { ...noIndex, title: { default: "Saatatya", template: "%s | Saatatya" } };

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
