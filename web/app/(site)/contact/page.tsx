import { Mail, Send } from "lucide-react";
import { SimplePage } from "@/components/marketing/simple-page";
import { CONTACT } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Saatatya: Report a Question or Ask for Help",
  description: "Contact the Saatatya team by email or Telegram to report a wrong question, a bug or to ask for help with your account.",
  path: "/contact",
});

export default function Contact() {
  return (
    <SimplePage title="Contact" path="/contact" lead="The quickest way to reach us is email or the Telegram group.">
      <ul className="mt-6 grid max-w-xl gap-3 !list-none !pl-0">
        <li className="!mt-0 !pl-0">
          <a href={`mailto:${CONTACT.email}`} className="!no-underline flex items-center gap-3 rounded-2xl border border-line bg-card p-4 font-semibold !text-ink hover:border-brand-200">
            <Mail className="size-5 text-brand-600" aria-hidden />
            {CONTACT.email}
          </a>
        </li>
        <li className="!mt-0 !pl-0">
          <a href={CONTACT.telegram} rel="noopener noreferrer" target="_blank" className="!no-underline flex items-center gap-3 rounded-2xl border border-line bg-card p-4 font-semibold !text-ink hover:border-brand-200">
            <Send className="size-5 text-brand-600" aria-hidden />
            Join the Telegram group
          </a>
        </li>
      </ul>
      <h2>When you write about a question</h2>
      <p>Please include the date, the test number and the question number, and what you think the correct answer is. That lets us check it quickly.</p>
      <h2>Account help</h2>
      <p>Saatatya accounts use a username and password, with no email address attached, so a password cannot be reset by email. If you are locked out, write to us with your username.</p>
    </SimplePage>
  );
}
