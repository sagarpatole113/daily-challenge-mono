import { SimplePage } from "@/components/marketing/simple-page";
import { CONTACT } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy: What Saatatya Stores and Why",
  description: "What personal data Saatatya collects (name, username, test results), how it is used, which services process it, and how to ask for your data to be removed.",
  path: "/privacy-policy",
});

export default function Privacy() {
  return (
    <SimplePage title="Privacy policy" path="/privacy-policy" updated="20 October 2026" lead="This page explains what Saatatya stores, why, and who processes it.">
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your name and the username you choose. We do not ask for your email address or phone number.</li>
        <li><strong>Practice data:</strong> the tests you start, the answers you save, your scores, timings and summary statistics.</li>
        <li><strong>Activity:</strong> the last time you were active, used to show your progress.</li>
      </ul>
      <h2>How we use it</h2>
      <p>We use this data only to run the service: signing you in, keeping your timer and answers, scoring tests and showing your results and progress.</p>
      <h2>Passwords and sign-in</h2>
      <p>Sign-in is handled by Google Firebase Authentication. Your password is processed by Firebase and is never visible to us. Internally, your username is mapped to a technical address so that Firebase can identify the account. Nothing is ever sent to that address.</p>
      <h2>Where data is stored</h2>
      <p>Account and practice data is stored in a database on Google Firebase and accessed through our API. Our hosting provider may keep standard server logs, such as IP addresses and request times, for security and reliability.</p>
      <h2>Browser storage</h2>
      <ul>
        <li>Firebase keeps your sign-in session in your browser so you stay logged in.</li>
        <li>While a test is open, unsaved answers may be held temporarily in your browser&apos;s session storage so they are not lost if the page reloads.</li>
        <li>We store your language display choice for tests in your browser.</li>
      </ul>
      <h2>Advertising and tracking</h2>
      <p>This website does not show ads and does not use advertising or analytics trackers.</p>
      <h2>Sharing</h2>
      <p>We do not sell your data. It is processed only by the service providers needed to run Saatatya, such as Google Firebase and our hosting provider.</p>
      <h2>Your choices</h2>
      <p>To ask for your account and practice data to be deleted, email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> and include your username.</p>
      <h2>Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>
    </SimplePage>
  );
}
