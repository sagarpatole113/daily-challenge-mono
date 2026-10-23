/**
 * Exam format shown on public pages and used for labels in the app.
 *
 * Mirror of EXAM_CONFIG in shared/src/index.ts. The server remains the only
 * authority for scoring and timing; these values are for display copy only.
 * lib/constants.test.ts fails if this file drifts from the shared source.
 */
export const EXAM_FORMAT = {
  testsPerDay: 3,
  questionsPerTest: 100,
  totalMarks: 100,
  durationMinutes: 60,
  marksPerCorrect: 1,
  negativeMarking: 0.25,
  optionsPerQuestion: 4,
} as const;

export const BRAND = {
  name: "Saatatya",
  marathi: "सातत्य",
  tagline: "Your daily practice. Your MPSC success.",
  taglineMarathi: "दररोज सराव करा. स्वतःची प्रगती तपासा. MPSC च्या तयारीत सातत्य ठेवा.",
} as const;

export const CONTACT = {
  email: "sagarpatole113@gmail.com",
  telegram: "https://t.me/+k9PS6QEejuIxZDBl",
} as const;

export const OFFICIAL = {
  mpscSite: "https://mpsc.gov.in",
  mpscAdvertisements: "https://mpsc.gov.in/adv_notification/8",
} as const;
