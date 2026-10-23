import type { Guide } from "./types";

const D = "2026-10-20";
const HUB = { name: "MPSC Group C", path: "/mpsc-group-c" };
const HOME = { name: "Home", path: "/" };

export const guides: Guide[] = [
  {
    path: "/mpsc-group-c",
    metaTitle: "MPSC Group C Preparation: Stages, Subjects, Daily Plan",
    metaDescription:
      "A practical MPSC Group C preparation guide: exam stages, what to study, a daily mock-test routine and where to verify official details. In Marathi and English.",
    h1: "MPSC Group C preparation guide",
    lead: "Everything you need to plan your preparation in one place: how the exam is structured, which subjects to cover, how to practise every day and where to confirm official details.",
    published: D,
    updated: D,
    verification: "reported",
    crumbs: [HOME, HUB],
    sections: [
      {
        id: "what-it-is",
        heading: "What the Group C combined exam is",
        blocks: [
          { t: "p", text: "The Maharashtra Public Service Commission (MPSC) is the constitutional body that recruits for Maharashtra government posts. Group C posts such as Clerk-Typist, Tax Assistant and Industry Inspector are filled through a combined examination, so one common first stage serves several posts." },
          { t: "p", text: "The exam is objective. Most candidates face a combined preliminary test followed by a post-specific main examination, and a skill or typing test applies to some posts. There is generally no interview stage." },
          { t: "callout", tone: "official", title: "Check the current advertisement", text: "MPSC revises its scheme, modes and dates between cycles, and has done so recently. Use this guide to plan your study, and confirm every date and rule in the current advertisement on [mpsc.gov.in](https://mpsc.gov.in/adv_notification/8)." },
        ],
      },
      {
        id: "stages",
        heading: "Exam stages at a glance",
        blocks: [
          { t: "table", caption: "Stages as described in recent MPSC notices (confirm in the current advertisement)", head: ["Stage", "Nature", "Purpose"], rows: [
            ["Combined preliminary exam", "Objective, bilingual, 100 questions", "Screening for the main exam"],
            ["Main exam", "Objective papers, post-specific arrangement", "Merit for most posts"],
            ["Skill or typing test", "Only for applicable posts", "Qualifying or selection component"],
          ] },
          { t: "p", text: "Details of each stage are on the [exam pattern](/mpsc-group-c/exam-pattern) page, and the topics are on the [syllabus](/mpsc-group-c/syllabus) page." },
        ],
      },
      {
        id: "what-to-study",
        heading: "What to study",
        blocks: [
          { t: "p", text: "Preparation centres on general-ability subjects. Start with the highest-yield areas and keep a little time every day for the rest." },
          { t: "ul", items: [
            "[Polity and governance](/mpsc-group-c/subjects/polity), [history](/mpsc-group-c/subjects/history) and [geography](/mpsc-group-c/subjects/geography)",
            "[Economy](/mpsc-group-c/subjects/economics) and [general science](/mpsc-group-c/subjects/general-science)",
            "[Reasoning and arithmetic](/mpsc-group-c/subjects/reasoning-arithmetic), where speed is the skill",
            "[Current affairs](/mpsc-group-c/subjects/current-affairs) and [Maharashtra GK](/mpsc-group-c/subjects/maharashtra-gk)",
            "[Marathi and English language](/mpsc-group-c/subjects/marathi-english)",
          ] },
        ],
      },
      {
        id: "daily-plan",
        heading: "A daily routine that holds up",
        blocks: [
          { t: "p", text: "Consistency matters more than intensity. A routine you can repeat for months beats a heroic week followed by a gap." },
          { t: "ol", items: [
            "Take one timed mock test. Use real conditions: no phone, no breaks, the clock running.",
            "Review the same day. Read every explanation, including those for questions you got right by guessing.",
            "Log each mistake as a concept gap, a calculation slip or a misread question.",
            "Spend a short block on the weakest subject the log points to.",
            "Read current affairs for 15 minutes and write one line per item.",
          ] },
          { t: "p", text: "[Saatatya's daily mock tests](/mpsc-group-c/daily-mock-test) are built around exactly this loop: three timed tests a day, then bilingual explanations to review." },
        ],
      },
      {
        id: "group-b",
        heading: "Preparing for Group B and Group C together",
        blocks: [
          { t: "p", text: "Group B (non-gazetted) and Group C combined exams were held jointly once and have since been conducted separately, but the general-ability subjects overlap heavily. If you are aiming at both, one strong foundation in the subjects above serves both, and you then tune the final weeks to each advertisement's pattern." },
        ],
      },
    ],
    faqs: [
      { q: "Is there an interview for Group C posts?", a: "Group C combined recruitment is generally described as having no interview, though a skill or typing test applies to some posts. Check the advertisement for the post you want." },
      { q: "What is the MPSC Group C exam date?", a: "MPSC exam dates vary by recruitment cycle. Check the current Group C advertisement and any corrigenda on the Commission's official website, mpsc.gov.in." },
      { q: "What is the full form of MPSC?", a: "MPSC stands for Maharashtra Public Service Commission, the state commission responsible for conducting recruitment examinations for Maharashtra government posts." },
      { q: "How many hours should I study each day?", a: "There is no single right number. A steady routine of one timed test, a same-day review and a short topic block is more useful than a long unplanned session." },
    ],
    related: ["/mpsc-group-c/syllabus", "/mpsc-group-c/exam-pattern", "/mpsc-group-c/daily-mock-test", "/mpsc-group-c/subjects"],
  },
  {
    path: "/mpsc-group-c/syllabus",
    metaTitle: "MPSC Group C Syllabus: Subject-wise Topics Explained",
    metaDescription:
      "MPSC Group C syllabus explained subject by subject: history, geography, polity, economy, science, current affairs and reasoning, plus how to read the official document.",
    h1: "MPSC Group C syllabus, explained subject by subject",
    lead: "The official syllabus is a list. This page turns it into a study map: what each area usually contains, how deep to go and where to practise.",
    published: D,
    updated: D,
    verification: "reported",
    crumbs: [HOME, HUB, { name: "Syllabus", path: "/mpsc-group-c/syllabus" }],
    sections: [
      {
        id: "official",
        heading: "Start from the official document",
        blocks: [
          { t: "callout", tone: "official", title: "Official source", text: "The syllabus and scheme are published by MPSC and revised from time to time. Download the current version from [mpsc.gov.in](https://mpsc.gov.in) and treat it as the final word. This page is a study aid, not a replacement." },
          { t: "p", text: "Read the official syllabus once with a pen. Underline every topic you cannot explain in two sentences. That underlined list is your real syllabus." },
        ],
      },
      {
        id: "prelims-areas",
        heading: "Preliminary exam: subject areas",
        blocks: [
          { t: "p", text: "The preliminary test is described as a general-ability paper. Across recent notices, the common subject areas are:" },
          { t: "table", caption: "Common subject areas and where to study them", head: ["Area", "Typical content", "Guide"], rows: [
            ["History", "Maharashtra and modern India, social reform, national movement", "[History](/mpsc-group-c/subjects/history)"],
            ["Geography", "Maharashtra and India: rivers, soils, climate, crops", "[Geography](/mpsc-group-c/subjects/geography)"],
            ["Polity and governance", "Constitution, institutions, local government", "[Polity](/mpsc-group-c/subjects/polity)"],
            ["Economy", "National income, banking, budget, planning", "[Economy](/mpsc-group-c/subjects/economics)"],
            ["General science", "Physics, chemistry, biology, health", "[General science](/mpsc-group-c/subjects/general-science)"],
            ["Current affairs", "National, international and Maharashtra events", "[Current affairs](/mpsc-group-c/subjects/current-affairs)"],
            ["Arithmetic and reasoning", "Number series, percentages, time and work, coding", "[Reasoning and arithmetic](/mpsc-group-c/subjects/reasoning-arithmetic)"],
          ] },
        ],
      },
      {
        id: "mains",
        heading: "Main exam: language and post-specific content",
        blocks: [
          { t: "p", text: "Recent coverage describes the main exam for most cadres as two objective papers: one on Marathi and English language and one on general ability with content related to the post. The arrangement differs for technical cadres such as Assistant Motor Vehicle Inspector. See [Marathi and English](/mpsc-group-c/subjects/marathi-english) for a language routine." },
        ],
      },
      {
        id: "practised",
        heading: "What Saatatya's daily tests practise",
        blocks: [
          { t: "p", text: "The daily tests currently draw on polity, history, geography, general science, economics, reasoning, current affairs and Maharashtra GK. Each subject guide lists the exact topics practised so you can see how your study maps to your practice." },
          { t: "p", text: "Computer knowledge and language practice are not part of the current daily question set." },
        ],
      },
    ],
    faqs: [
      { q: "Is the syllabus the same for every Group C post?", a: "The preliminary stage is combined across posts. The main exam can differ by post, so read the advertisement for your target post." },
      { q: "Can I rely on a syllabus PDF from another website?", a: "Use it for convenience, but verify against the version on mpsc.gov.in, because the scheme has been revised recently." },
    ],
    related: ["/mpsc-group-c/exam-pattern", "/mpsc-group-c/subjects", "/mpsc-group-c/study-resources"],
  },
  {
    path: "/mpsc-group-c/exam-pattern",
    metaTitle: "MPSC Group C Exam Pattern and Marking Scheme Explained",
    metaDescription:
      "MPSC Group C exam pattern explained: 100 questions, 60 minutes, negative marking, scoring examples and a time-per-question plan. Confirm details in the current notice.",
    h1: "MPSC Group C exam pattern and marking scheme",
    lead: "How the papers are structured, how marks are counted and how to turn the numbers into a strategy: time per question, when to guess and when to skip.",
    published: D,
    updated: D,
    verification: "reported",
    crumbs: [HOME, HUB, { name: "Exam pattern", path: "/mpsc-group-c/exam-pattern" }],
    sections: [
      {
        id: "prelims",
        heading: "Preliminary exam pattern",
        blocks: [
          { t: "callout", tone: "official", title: "Confirm before you rely on it", text: "The figures below match several recent summaries of MPSC's scheme. MPSC has revised its scheme and the exam mode between cycles, so check the current advertisement at [mpsc.gov.in](https://mpsc.gov.in/adv_notification/8)." },
          { t: "table", caption: "Preliminary exam as commonly described", head: ["Item", "Detail"], rows: [
            ["Questions", "100, objective multiple choice"],
            ["Total marks", "100"],
            ["Duration", "60 minutes"],
            ["Negative marking", "One-fourth of a mark for each wrong answer"],
            ["Language", "Marathi and English"],
            ["Use of marks", "Shortlisting for the main exam"],
          ] },
        ],
      },
      {
        id: "scoring",
        heading: "How scoring works, with an example",
        blocks: [
          { t: "p", text: "A correct answer earns 1 mark, a wrong answer loses 0.25 and an unanswered question scores 0. This is also the scheme Saatatya's mock tests use." },
          { t: "p", text: "Example: 70 correct, 20 wrong and 10 unanswered gives 70 minus 5 = 65 marks. The 20 wrong answers cost 20 × 0.25 = 5 marks." },
        ],
      },
      {
        id: "time",
        heading: "Time per question",
        blocks: [
          { t: "p", text: "60 minutes for 100 questions is 36 seconds each on average. That is not enough to solve every question fully, so the real skill is deciding quickly which questions to attempt now, which to guess and which to leave." },
          { t: "ul", items: [
            "Facts you know: answer in under 15 seconds and move on.",
            "Calculation questions: set a 45-second ceiling, then skip.",
            "Statement questions: read all options before choosing.",
          ] },
        ],
      },
      {
        id: "guessing",
        heading: "Is guessing worth it?",
        blocks: [
          { t: "p", text: "With four options and a 0.25 penalty, a blind guess has a 25% chance of +1 and a 75% chance of −0.25. The expected value is 0.25 − 0.1875 = +0.0625 marks, slightly positive but tiny." },
          { t: "p", text: "If you can remove one option, your chance becomes one in three and the expected value rises to about +0.17. Remove two options and it is +0.375. So guess when you can eliminate, and skip when you truly have no idea." },
          { t: "callout", tone: "tip", title: "Practise the rule", text: "Use timed mock tests to calibrate. After each test, count how many of your guesses were right. If your guesses beat chance, you are eliminating well." },
        ],
      },
      {
        id: "mains",
        heading: "Main exam",
        blocks: [
          { t: "p", text: "For most cadres the main exam is reported as two objective papers, with a language paper and a general-ability paper that includes post-related content. Arrangements differ for some technical posts, and a skill or typing test applies to certain posts. The advertisement for your post is the only reliable source." },
        ],
      },
    ],
    faqs: [
      { q: "Is there negative marking?", a: "Recent summaries describe one-fourth of a mark deducted for each wrong answer. Confirm in the current advertisement." },
      { q: "Are the exam date and mode fixed?", a: "No. Dates and mode (computer-based or OMR) have been revised in notices. Always check the latest corrigendum." },
    ],
    related: ["/mpsc-group-c/syllabus", "/mpsc-group-c/mock-tests", "/mpsc-group-c/daily-mock-test"],
  },
  {
    path: "/mpsc-group-c/previous-year-questions",
    metaTitle: "MPSC Group C Previous Year Question Papers: How to Use",
    metaDescription:
      "Find official MPSC Group C previous year question papers, then use a topic-frequency method and mistake log to guide practice. Saatatya tests are not past papers.",
    h1: "MPSC Group C previous year question papers: how to use them",
    lead: "Past papers show you the real style, difficulty and topic mix. This guide explains how to find them and how to extract the most from each paper.",
    published: D,
    updated: D,
    verification: "editorial",
    crumbs: [HOME, HUB, { name: "Previous year questions", path: "/mpsc-group-c/previous-year-questions" }],
    sections: [
      {
        id: "where",
        heading: "Where to find genuine papers",
        blocks: [
          { t: "p", text: "Use papers and answer keys published by MPSC on [mpsc.gov.in](https://mpsc.gov.in). Papers copied by third parties can contain typing errors or wrong answer keys. If two sources disagree on an answer, trust the Commission's key." },
          { t: "callout", tone: "note", title: "Saatatya's questions are practice questions", text: "Questions in Saatatya's daily tests are practice material. They are not previous year papers, and we do not publish past MPSC papers on this site." },
        ],
      },
      {
        id: "method",
        heading: "A topic-frequency method",
        blocks: [
          { t: "ol", items: [
            "Solve one past paper under exam conditions. Do not look anything up.",
            "Check answers against the official key and mark every miss.",
            "Tag each question with subject and topic, for example Polity, Fundamental Rights.",
            "Repeat for four to six papers and count questions per topic.",
            "Rank topics by count. The top of that list is where an extra hour pays most.",
          ] },
          { t: "table", caption: "A simple tally sheet you can copy", head: ["Subject", "Topic", "Qs in paper 1", "Qs in paper 2", "Total"], rows: [["Polity", "Fundamental Rights", "", "", ""], ["Geography", "Rivers", "", "", ""]] },
        ],
      },
      {
        id: "mistake-log",
        heading: "Keep a mistake log",
        blocks: [
          { t: "p", text: "For every miss, write the cause: did not know, knew but confused, calculation slip or misread. Over a few papers, a pattern shows what to fix. Knowledge gaps need study; slips need timed practice." },
        ],
      },
      {
        id: "limits",
        heading: "Limits of past papers",
        blocks: [
          { t: "p", text: "Questions rarely repeat word for word, and the scheme changes. Use past papers for pattern and difficulty, then practise fresh questions daily so you are not just recognising answers you have already seen." },
        ],
      },
    ],
    faqs: [
      { q: "Do questions repeat from year to year?", a: "Topics repeat far more than exact questions. Treat past papers as a guide to topics and style." },
    ],
    related: ["/mpsc-group-c/mock-tests", "/mpsc-group-c/daily-mock-test", "/mpsc-group-c/study-resources"],
  },
  {
    path: "/mpsc-group-c/mock-tests",
    metaTitle: "MPSC Group C Mock Tests: How to Take and Review Them",
    metaDescription:
      "How to get real value from MPSC Group C mock tests: simulate exam conditions, review mistakes the same day and plan a weekly cycle. Free daily tests on Saatatya.",
    h1: "MPSC Group C mock tests: how to take and review them",
    lead: "A mock test is only useful if you take it like the real exam and learn from it afterwards. Here is a simple way to do both.",
    published: D,
    updated: D,
    verification: "editorial",
    crumbs: [HOME, HUB, { name: "Mock tests", path: "/mpsc-group-c/mock-tests" }],
    sections: [
      {
        id: "why",
        heading: "What mock tests do for you",
        blocks: [
          { t: "ul", items: [
            "Build speed: you learn what 36 seconds per question feels like.",
            "Expose gaps: a wrong answer points to the topic to revise.",
            "Train decisions: attempt, guess or skip becomes a habit.",
            "Reduce exam-day nerves: the format feels familiar.",
          ] },
        ],
      },
      {
        id: "how",
        heading: "How to take a mock test",
        blocks: [
          { t: "ol", items: [
            "Pick a quiet slot and silence your phone.",
            "Start the timer and do not pause it.",
            "Answer in two passes: sure answers first, then the doubtful ones.",
            "Submit when time ends or when you are done.",
          ] },
        ],
      },
      {
        id: "review",
        heading: "How to review a mock test",
        blocks: [
          { t: "p", text: "Review within the same day, while the questions are fresh. Read the explanation for every wrong answer and for every guess that happened to be right." },
          { t: "table", caption: "Review categories", head: ["Cause", "Fix"], rows: [
            ["Did not know", "Study the topic, then re-attempt similar questions"],
            ["Knew but confused", "Make a comparison table"],
            ["Calculation slip", "Slow down on steps; practise timed arithmetic"],
            ["Misread the question", "Underline the key word before answering"],
          ] },
        ],
      },
      {
        id: "cycle",
        heading: "A weekly cycle",
        blocks: [
          { t: "p", text: "Take tests on most days, spend one day on a long review of the week's mistake log and keep one lighter day. Increase the number of tests as the exam gets closer." },
          { t: "p", text: "Ready to start? [Saatatya's daily mock tests](/mpsc-group-c/daily-mock-test) give you three timed tests a day with bilingual explanations." },
        ],
      },
    ],
    faqs: [
      { q: "How many mock tests should I take a week?", a: "As many as you can review properly. One test reviewed well teaches more than three skimmed." },
    ],
    related: ["/mpsc-group-c/daily-mock-test", "/mpsc-group-c/exam-pattern", "/mpsc-group-c/previous-year-questions"],
  },
  {
    path: "/mpsc-group-c/daily-mock-test",
    metaTitle: "Online MPSC Group C Mock Tests: 3 Timed Tests Daily",
    metaDescription:
      "Take MPSC Group C mock tests online: three daily timed tests with 100 bilingual questions, explanations and progress tracking. Free to start on Saatatya.",
    h1: "Daily MPSC Group C mock tests on Saatatya",
    lead: "Three exam-style tests every day, one after another. Finish one to unlock the next, then review every answer with an explanation in English and Marathi.",
    published: D,
    updated: D,
    verification: "editorial",
    crumbs: [HOME, HUB, { name: "Daily mock test", path: "/mpsc-group-c/daily-mock-test" }],
    sections: [
      {
        id: "format",
        heading: "The daily format",
        blocks: [
          { t: "table", caption: "Each daily test", head: ["Item", "Detail"], rows: [
            ["Tests per day", "3"],
            ["Questions per test", "100"],
            ["Time per test", "60 minutes"],
            ["Correct answer", "+1"],
            ["Wrong answer", "−0.25"],
            ["Unanswered", "0"],
            ["Language", "Every question and explanation in English and Marathi"],
          ] },
        ],
      },
      {
        id: "unlock",
        heading: "How tests unlock",
        blocks: [
          { t: "p", text: "Test 1 is open at the start of the day. Test 2 opens once Test 1 is finished, and Test 3 opens once Test 2 is finished. A test counts as finished when you submit it or when its 60 minutes run out." },
          { t: "p", text: "The timer and the unlock order are controlled by the server, so refreshing the page or switching devices does not give extra time, and you can return to a test in progress." },
        ],
      },
      {
        id: "results",
        heading: "Results and review",
        blocks: [
          { t: "p", text: "Correct answers and explanations stay hidden while you are taking a test. After you finish, you see your score, correct, wrong and unanswered counts, accuracy and time taken, and you can review every question." },
        ],
      },
      {
        id: "day",
        heading: "A sample day",
        blocks: [
          { t: "ol", items: [
            "Morning: Test 1, then a 20-minute review of mistakes.",
            "Afternoon: Test 2 and a short review.",
            "Evening: Test 3, then update your mistake log and read current affairs.",
          ] },
          { t: "p", text: "Prefer one test a day at first? That works too. The goal is a routine you keep." },
        ],
      },
    ],
    faqs: [
      { q: "Is it free?", a: "Saatatya's daily tests are free to use at the moment." },
      { q: "Can I retake a finished test?", a: "Each daily test is attempted once. Use the review to learn from it." },
      { q: "What happens if time runs out?", a: "The server finishes the test for you and scores the answers you saved, then the next test unlocks." },
      { q: "Do I need to install an app?", a: "No. Saatatya works in your browser on phone, tablet or computer." },
    ],
    related: ["/mpsc-group-c/mock-tests", "/mpsc-group-c/exam-pattern", "/mpsc-group-c/subjects"],
  },
  {
    path: "/mpsc-group-c/study-resources",
    metaTitle: "MPSC Group C Study Resources: What to Use and How",
    metaDescription:
      "A practical guide to MPSC Group C study resources: the official MPSC site, school textbooks, government publications, current-affairs sources and practice tests.",
    h1: "MPSC Group C study resources",
    lead: "You do not need many resources. You need a few reliable ones that you finish. Here is what to use, and what each is good for.",
    published: D,
    updated: D,
    verification: "editorial",
    crumbs: [HOME, HUB, { name: "Study resources", path: "/mpsc-group-c/study-resources" }],
    sections: [
      {
        id: "official",
        heading: "Official sources",
        blocks: [
          { t: "ul", items: [
            "[MPSC website](https://mpsc.gov.in): advertisements, corrigenda, syllabus, scheme and past papers. The final authority on dates and rules.",
          ] },
        ],
      },
      {
        id: "core",
        heading: "Core study material",
        blocks: [
          { t: "ul", items: [
            "State board school textbooks in history, geography and civics: a clear, exam-appropriate base, especially for Maharashtra topics.",
            "NCERT textbooks for science, geography and polity fundamentals.",
            "The Constitution of India (text) alongside a standard polity book for institutions and articles.",
            "The Economic Survey of Maharashtra and the state budget documents for state-level economy facts.",
            "An atlas, used actively with an outline map.",
          ] },
          { t: "callout", tone: "tip", title: "Finish before you add", text: "One book finished twice beats three books half read. Add a new resource only when you have finished the previous one for that subject." },
        ],
      },
      {
        id: "current",
        heading: "Current affairs",
        blocks: [
          { t: "p", text: "Choose one Marathi and one English source and stay with them. Keep a monthly digest of one-line facts. See the [current affairs guide](/mpsc-group-c/subjects/current-affairs)." },
        ],
      },
      {
        id: "practice",
        heading: "Practice",
        blocks: [
          { t: "p", text: "Timed practice is what turns knowledge into marks. Use official past papers for pattern and [Saatatya's daily tests](/mpsc-group-c/daily-mock-test) for steady, timed volume." },
        ],
      },
    ],
    related: ["/mpsc-group-c/syllabus", "/mpsc-group-c/subjects", "/mpsc-group-c/previous-year-questions"],
  },
];

export const guideByPath = (path: string): Guide | undefined => guides.find((g) => g.path === path);
