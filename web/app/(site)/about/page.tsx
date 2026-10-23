import Link from "next/link";
import { SimplePage } from "@/components/marketing/simple-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Saatatya: Daily MPSC Practice, Built for Consistency",
  description:
    "Saatatya (सातत्य) means consistency. Learn why it exists, how the daily tests work, what it is not, and how to report a wrong question.",
  path: "/about",
});

export default function About() {
  return (
    <SimplePage
      title="About Saatatya"
      path="/about"
      lead="सातत्य means consistency, and that is the whole idea: a small, timed practice habit that you keep every day."
    >
      <h2>Why it exists</h2>
      <p>
        Most MPSC aspirants know what to study. What they struggle with is steady, timed practice with honest feedback.
        Saatatya gives you three exam-format tests every day and a clear review after each one, so improving becomes a routine
        and not a decision you have to make daily.
      </p>
      <h2>How it works</h2>
      <p>
        Each day has three tests of 100 questions and 60 minutes, scored +1, −0.25 and 0. They unlock in order. The timer and
        scoring run on the server so results are fair and identical on every device. Read the full format on the{" "}
        <Link href="/mpsc-group-c/daily-mock-test">daily mock test page</Link>.
      </p>
      <h2>What Saatatya is not</h2>
      <ul>
        <li>It is not an official MPSC product and is not affiliated with the Commission.</li>
        <li>It does not promise selection. It helps you practise and see your progress.</li>
        <li>Its questions are practice questions, not previous year papers.</li>
      </ul>
      <h2>Questions can have mistakes</h2>
      <p>
        Practice questions are prepared with the help of AI tools and may contain errors. If an answer or explanation looks
        wrong, please tell us on the <Link href="/contact">contact page</Link>. Corrections make the tests better for
        everyone. Always verify official information on mpsc.gov.in.
      </p>
    </SimplePage>
  );
}
