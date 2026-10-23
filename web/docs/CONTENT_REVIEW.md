# Content review: action required before launch

Public pages follow these rules: no dates, vacancy counts, eligibility, salary or cut-offs; exam-structure statements are hedged and link to mpsc.gov.in; no invented previous-year questions, statistics or testimonials.

**Limitation:** while writing, the Commission's website (`mpsc.gov.in`) could be reached only as a JavaScript shell, so its notification PDFs could **not** be opened. The exam-structure statements below come from several independent secondary summaries that agree with each other and with the app's own `EXAM_CONFIG`. They are therefore marked `verification: "reported"` in `content/guides.ts` and say so on the page.

The official advertisement listing (`mpsc.gov.in/adv_notification/8`) showed, in search results, an announcement on the "examination pattern of Maharashtra Group-C Services Examination 2026" and corrigenda revising the exam date. Several sources also described a revised scheme, and the date moved more than once (reported variously as 27 Sep, 25 Oct 2026 and 3 Jan 2027). **None of these dates appear on the site.**

## Claims to confirm against the current official notice

| Claim on site | Where | Status |
|---|---|---|
| Prelims: 100 objective MCQs, 100 marks, 60 minutes | exam-pattern | Reported by multiple sources; **confirm** |
| Negative marking of one-fourth per wrong answer | exam-pattern | Reported; matches Saatatya scoring; **confirm** |
| Prelims marks used for shortlisting to mains | exam-pattern, hub | Reported; **confirm** |
| Mains: two objective papers for most cadres, language + general ability; different for AMVI | syllabus, exam-pattern | Reported (total marks deliberately not stated); **confirm** |
| Skill/typing test for some posts; generally no interview | hub | Reported; **confirm** |
| Group B and Group C combined exams were once joint and are now separate | hub | Reported by news coverage of an MPSC decision; **confirm** |
| Prelims subject areas (history, geography, polity, economy, science, current affairs, arithmetic/reasoning) | syllabus | Consistent across sources; **confirm against official syllabus** |

Subject guides contain study advice and well-established school-level facts only. Skim them for accuracy anyway.

## Business statements the owner must be comfortable with

- "Saatatya's daily tests are free to use at the moment."
- About/Terms: questions are prepared with AI assistance and may contain errors (taken from the mobile app's own About screen).
- Privacy policy: no ads or analytics trackers (true of this build); deletion on email request (needs a manual process); data processed by Google Firebase and the host. **Have the privacy policy and terms reviewed by a qualified person; they are accurate descriptions of the software, not legal advice.**
- Contact details come from the mobile app's About screen.

## Refresh routine

Before each exam cycle: re-read the advertisement, update `updated` dates on touched guides, and keep `verification` honest. Never add dates or vacancy numbers unless you can link to the official PDF.
