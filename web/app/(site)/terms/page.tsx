import { SimplePage } from "@/components/marketing/simple-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms and Conditions for Using Saatatya",
  description: "The terms for using Saatatya: practice-only content, no affiliation with MPSC, account responsibilities, fair use and limits of liability.",
  path: "/terms",
});

export default function Terms() {
  return (
    <SimplePage title="Terms and conditions" path="/terms" updated="20 October 2026" lead="By creating an account or using Saatatya, you agree to these terms.">
      <h2>Independent practice service</h2>
      <p>Saatatya is an independent practice platform. It is not affiliated with, endorsed by or connected to the Maharashtra Public Service Commission. Official notifications, dates, syllabus and rules are published only by MPSC at mpsc.gov.in.</p>
      <h2>Practice content</h2>
      <p>Questions and explanations are provided for practice. They are prepared with the help of AI tools and may contain errors or become outdated. We do not guarantee their accuracy, and you should verify important facts from official sources.</p>
      <h2>No guarantee of results</h2>
      <p>Using Saatatya does not guarantee success in any examination.</p>
      <h2>Your account</h2>
      <ul>
        <li>Choose a username you are comfortable with and keep your password private.</li>
        <li>You are responsible for activity under your account.</li>
        <li>Do not attempt to access other users&apos; data, bypass the timer or unlock order, or interfere with the service.</li>
      </ul>
      <h2>Fair use</h2>
      <p>Do not copy, scrape or redistribute the questions or explanations in bulk, or use automated tools against the service.</p>
      <h2>Availability</h2>
      <p>We try to keep the service running, but it is provided as is, and tests or features may change or be unavailable at times.</p>
      <h2>Limitation of liability</h2>
      <p>To the extent allowed by law, Saatatya is not liable for losses arising from use of, or inability to use, the service.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use after an update means you accept the new terms.</p>
    </SimplePage>
  );
}
