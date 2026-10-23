import type { Subject } from "./types";

const D = "2026-10-20";

export const subjects: Subject[] = [
  {
    slug: "polity",
    name: "Polity and Governance",
    marathi: "राज्यशास्त्र आणि प्रशासन",
    metaTitle: "MPSC Group C Polity: Topics, Study Plan and Practice",
    metaDescription:
      "How to prepare Indian polity and governance for MPSC Group C: key topics, question types, a step-by-step study method and mistakes to avoid. Marathi and English.",
    summary:
      "Polity rewards precise recall: which article, which body, which amendment. It is also one of the most predictable subjects, because the Constitution does not change much from year to year.",
    practisedInSaatatya: ["Fundamental Rights", "Parliament", "Judiciary", "Schedules", "Fundamental Duties", "Finance Commission"],
    covers: [
      "Preamble, Fundamental Rights, Directive Principles and Fundamental Duties",
      "Parliament, the President, the Governor and the State Legislature",
      "Judiciary: Supreme Court, High Courts and subordinate courts",
      "Schedules of the Constitution",
      "Constitutional bodies such as the Finance Commission",
      "Local self-government: Panchayati Raj and urban local bodies (73rd and 74th Amendments)",
      "Public administration and village administration in Maharashtra",
    ],
    questionTypes: [
      "Which article or part deals with a given subject",
      "Match the body with its function",
      "Statement-based questions: which of the following statements is correct",
      "Constitutional versus statutory bodies",
    ],
    howToStudy: [
      "Read the Constitution's structure once, end to end: Parts, Schedules, then the major articles. Aim for a map in your head before details.",
      "Make a one-page table for Fundamental Rights (article number, what it protects, any exceptions) and revise it weekly.",
      "Learn bodies in pairs: who appoints, who removes, what the term is. These three facts generate most questions.",
      "Practise statement-based questions daily. Read every option fully; one wrong word usually decides it.",
      "After each mock test, add every missed polity question to a short error list and revisit it in three days.",
    ],
    commonMistakes: [
      "Mixing up constitutional bodies (named in the Constitution) with statutory bodies (created by an Act of Parliament).",
      "Memorising article numbers without the idea behind them, so a reworded question looks new.",
      "Skipping Maharashtra-specific administration while over-studying Union topics.",
    ],
    example: {
      title: "A quick way to learn: three facts per body",
      body: "For any constitutional office, write who appoints it, how it can be removed and how long the term is. Three facts per body, repeated across a dozen bodies, covers a large share of 'match the following' and statement questions.",
    },
    related: ["history", "current-affairs", "maharashtra-gk"],
    published: D,
    updated: D,
  },
  {
    slug: "history",
    name: "History",
    marathi: "इतिहास",
    metaTitle: "MPSC Group C History: Maharashtra and Modern India Guide",
    metaDescription:
      "Prepare history for MPSC Group C: social reform, the national movement and Maharashtra's history. Topic map, study method and common mistakes, in Marathi and English.",
    summary:
      "History questions reward understanding sequence and cause. A student who knows why events followed one another can answer reworded questions that a memorised date list cannot.",
    practisedInSaatatya: ["Social Reform", "National Movement", "Press", "Labour Movement", "Freedom Movement", "Gandhian Movement"],
    covers: [
      "Modern Indian history: the 1857 revolt, the Indian National Congress and the national movement",
      "The Gandhian phase: Non-Cooperation, Civil Disobedience and Quit India",
      "Social and religious reform movements in Maharashtra and India",
      "Press and the freedom struggle; labour and peasant movements",
      "Maratha history and administration",
      "Important personalities from Maharashtra",
    ],
    questionTypes: [
      "Who said or did this, in which context",
      "Arrange events in chronological order",
      "Match reformers with their organisations or journals",
      "Statement-based questions on causes and consequences",
    ],
    howToStudy: [
      "Build one timeline per theme: reform movements, the national movement, the press. Three timelines are easier to hold than one giant chronology.",
      "For each reformer, record three things: what they founded, what they wrote or published and what change they pushed for.",
      "Study the Marathi and English names together, since questions appear in both languages and the transliteration can differ.",
      "Revise timelines aloud. If you can narrate the sequence without looking, the order questions become quick.",
    ],
    commonMistakes: [
      "Learning dates in isolation, with no sense of what led to what.",
      "Treating Maharashtra's social reform as a side topic. It is a recurring area in practice sets.",
      "Confusing organisations with similar names. Write the founder and year beside each one.",
    ],
    related: ["polity", "geography", "maharashtra-gk"],
    published: D,
    updated: D,
  },
  {
    slug: "geography",
    name: "Geography",
    marathi: "भूगोल",
    metaTitle: "MPSC Group C Geography: Maharashtra and India Study Guide",
    metaDescription:
      "Study geography for MPSC Group C: rivers, soils, climate and crops of Maharashtra and India. Topic map, map-based study method and mistakes to avoid.",
    summary:
      "Geography is half memory and half picture. If you can sketch Maharashtra's rivers, ghats and soil regions from memory, most questions become recognition rather than recall.",
    practisedInSaatatya: ["Rivers", "Soils", "Maharashtra Geography", "Drainage", "Wildlife", "Maharashtra Rivers"],
    covers: [
      "Physical geography of Maharashtra: the Western Ghats (Sahyadri), the Deccan plateau and the Konkan coast",
      "Rivers and drainage: the Godavari, Krishna and Bhima basins, and the west-flowing rivers",
      "Soils, rainfall, climate and major crops",
      "Indian geography: physiography, drainage, monsoon, soils and agriculture",
      "Forests, wildlife and protected areas",
    ],
    questionTypes: [
      "Which river flows through or originates at a place",
      "Match crops or soils with regions",
      "Identify the odd one out among districts, rivers or ranges",
      "Statements about climate, monsoon and agriculture",
    ],
    howToStudy: [
      "Keep an outline map of Maharashtra. Draw the main rivers, then the ghats, then add districts only after those are fixed.",
      "Learn rivers as a group: source, direction of flow, major tributaries and the cities on the banks.",
      "Link soil to crop to region in a single chain, for example black cotton soil with cotton in parts of the Deccan.",
      "Practise map-linked questions without the map, then check against it. This trains you for text-only exam papers.",
    ],
    commonMistakes: [
      "Memorising river lists without direction of flow, which is where trick options hide.",
      "Ignoring Maharashtra's renamed places. Always use the current official names in your notes.",
      "Studying Indian geography only at the national scale and skipping the state scale.",
    ],
    related: ["history", "economics", "maharashtra-gk"],
    published: D,
    updated: D,
  },
  {
    slug: "economics",
    name: "Indian Economy",
    marathi: "अर्थव्यवस्था",
    metaTitle: "MPSC Group C Economics: Topics, Concepts and Practice Plan",
    metaDescription:
      "Prepare the Indian economy for MPSC Group C: national income, banking, monetary policy, public finance and taxation. Concept-first study plan with common mistakes.",
    summary:
      "Economics questions look factual but are really conceptual. Once you understand how inflation, interest rates and the budget connect, definition questions stop feeling like trivia.",
    practisedInSaatatya: ["Public Finance", "Monetary Policy", "National Income", "Taxation", "Inflation", "Banking"],
    covers: [
      "National income concepts: GDP, GNP and related measures",
      "Inflation, its measures and effects",
      "Monetary policy and the role of the Reserve Bank of India",
      "Banking: structure, types of banks and key instruments",
      "Public finance: the budget, deficits, taxation and the Finance Commission",
      "Poverty, unemployment, population and planning",
      "Maharashtra's economy: agriculture, industry and state finances",
    ],
    questionTypes: [
      "Define or identify a concept",
      "Which institution does what",
      "Cause and effect: what happens to X if Y rises",
      "Current data points tied to recent budgets and policy changes",
    ],
    howToStudy: [
      "Learn the chain, not the list: money supply, interest rates, inflation, growth. Draw it as arrows on one page.",
      "Keep a glossary of 60 to 80 terms with a one-line plain-language meaning each.",
      "For public finance, learn the budget's parts: revenue and capital receipts, revenue and capital expenditure, and the deficits.",
      "Refresh numbers (rates, targets, scheme outlays) from a recent official source close to the exam, since these change.",
    ],
    commonMistakes: [
      "Mixing up the roles of the central bank and the government in monetary versus fiscal policy.",
      "Memorising rates and figures that have since changed.",
      "Reading definitions without a single worked example.",
    ],
    related: ["polity", "geography", "current-affairs"],
    published: D,
    updated: D,
  },
  {
    slug: "general-science",
    name: "General Science",
    marathi: "सामान्य विज्ञान",
    metaTitle: "MPSC Group C General Science: Physics, Chemistry, Biology Plan",
    metaDescription:
      "General science for MPSC Group C: physics, chemistry, human biology and nutrition. Which topics to cover, how to study them quickly and mistakes to avoid.",
    summary:
      "General science is broad and shallow. You do not need university depth, but you do need clean school-level fundamentals across physics, chemistry and biology.",
    practisedInSaatatya: ["Physics", "Chemistry", "Human Biology", "Biology", "Nutrition", "Microbiology"],
    covers: [
      "Physics: motion, force, energy, light, sound, electricity and magnetism at school level",
      "Chemistry: matter, acids, bases and salts, metals and non-metals, everyday chemistry",
      "Biology: cell, plant and animal life, human body systems",
      "Nutrition, vitamins, minerals and deficiency diseases",
      "Microbiology, common diseases and public health",
      "Everyday applications of science",
    ],
    questionTypes: [
      "Name the vitamin, gas, metal or organ linked to a statement",
      "Unit, instrument and discoverer matching",
      "Everyday-science reasoning: why does X happen",
      "Health and disease facts",
    ],
    howToStudy: [
      "Use school textbooks from Standard 6 to 10 as your base. They match the depth the exam tends to ask.",
      "Build compact tables: vitamin, source, deficiency disease; instrument, what it measures; unit, quantity.",
      "Revise human body systems with a labelled sketch rather than paragraphs.",
      "Do 15 science questions daily and note why each wrong option is wrong, not just the right one.",
    ],
    commonMistakes: [
      "Studying advanced topics while basic definitions remain shaky.",
      "Confusing similar units and quantities (for example work and power).",
      "Skipping nutrition and health, which are easy marks.",
    ],
    related: ["current-affairs", "reasoning-arithmetic", "geography"],
    published: D,
    updated: D,
  },
  {
    slug: "current-affairs",
    name: "Current Affairs",
    marathi: "चालू घडामोडी",
    metaTitle: "MPSC Group C Current Affairs: How to Prepare Efficiently",
    metaDescription:
      "A practical method for MPSC Group C current affairs: what to track, how to take notes and how to revise monthly, covering national, international and Maharashtra news.",
    summary:
      "Current affairs reward consistency over cramming. A fifteen-minute daily habit beats a weekend marathon, because the volume of news is what overwhelms people.",
    practisedInSaatatya: ["Sports", "Awards", "Space", "Important Days", "Maharashtra Schemes", "International Events"],
    covers: [
      "National and international events of recent months",
      "Maharashtra government schemes and decisions",
      "Awards, honours and appointments",
      "Sports events and records",
      "Science, technology and space missions",
      "Important days and themes",
    ],
    questionTypes: [
      "Who, where or which in a recent event",
      "Match the award or scheme with the person or department",
      "Statements about a recent policy or report",
    ],
    howToStudy: [
      "Pick one or two reliable sources, one in Marathi and one in English, and stay with them. Switching sources doubles your reading for no extra marks.",
      "Keep a monthly digest page per category: Maharashtra, national, international, sports, awards, science.",
      "Write each item as a one-line fact with the date. Revise the page at the end of the month.",
      "Link news to static topics. A new scheme is easier to remember when you attach it to the right ministry and the right part of the syllabus.",
      "Take a mock test weekly and tag the current-affairs misses. They show which categories you are skipping.",
    ],
    commonMistakes: [
      "Reading everything and recording nothing.",
      "Ignoring Maharashtra-specific news while following national headlines.",
      "Starting only a few weeks before the exam and trying to cover a year.",
    ],
    related: ["polity", "economics", "maharashtra-gk"],
    published: D,
    updated: D,
  },
  {
    slug: "maharashtra-gk",
    name: "Maharashtra General Knowledge",
    marathi: "महाराष्ट्र सामान्य ज्ञान",
    metaTitle: "MPSC Group C Maharashtra GK: Forts, Districts, Administration",
    metaDescription:
      "Maharashtra general knowledge for MPSC Group C: forts, districts, cities, administration, wildlife and handicrafts. What to study and how to retain it.",
    summary:
      "This is the state-specific layer that separates an MPSC paper from a national exam. It is detail-heavy, so a structured, region-wise approach works better than reading in random order.",
    practisedInSaatatya: ["Forts", "Districts", "Cities", "Administration", "Wildlife", "Handicrafts"],
    covers: [
      "Administrative structure: divisions, districts and local bodies",
      "Forts, historical places and cultural heritage",
      "Cities, regions and their specialities",
      "Wildlife sanctuaries and national parks",
      "Handicrafts, fairs, festivals and arts",
      "Government schemes specific to Maharashtra",
    ],
    questionTypes: [
      "Which place is known for a product, fort or festival",
      "Match districts with features",
      "Administrative facts and recent changes",
    ],
    howToStudy: [
      "Study region by region: Konkan, Western Maharashtra, Marathwada, Vidarbha, Khandesh. A region page holds districts, rivers, crops, forts and parks together.",
      "Use a district map and attach one memorable fact to each district.",
      "Re-check names and administrative lists against current official sources, since names and boundaries can change.",
      "Quiz yourself with place-to-feature and feature-to-place, in both directions.",
    ],
    commonMistakes: [
      "Using outdated names for cities or districts.",
      "Learning facts without the region, which makes recall slow.",
      "Treating this as a one-week topic instead of a steady daily few minutes.",
    ],
    related: ["geography", "history", "current-affairs"],
    published: D,
    updated: D,
  },
  {
    slug: "reasoning-arithmetic",
    name: "Reasoning and Arithmetic",
    marathi: "बुद्धिमत्ता चाचणी आणि अंकगणित",
    metaTitle: "MPSC Group C Reasoning and Arithmetic: Topics and Speed Plan",
    metaDescription:
      "Reasoning and arithmetic for MPSC Group C: number series, coding-decoding, percentages, time and work. A speed-first practice plan with a worked example.",
    summary:
      "These topics are about speed and method rather than memory. With 100 questions in 60 minutes you have about 36 seconds per question on average, so quick, reliable methods matter.",
    practisedInSaatatya: ["Number Series", "Percentage", "Coding-Decoding", "Direction Sense", "Pipes and Cisterns", "Average"],
    covers: [
      "Number series, analogies and classification",
      "Coding-decoding and direction sense",
      "Venn diagrams, ranking and arrangement",
      "Percentage, ratio and proportion, averages and ages",
      "Time and work, pipes and cisterns",
      "Speed, time and distance",
    ],
    questionTypes: [
      "Find the next number or the odd one out",
      "Decode a pattern and apply it to a new word",
      "Short calculation problems with one clean method",
      "Direction and distance puzzles",
    ],
    howToStudy: [
      "Memorise squares to 25, cubes to 10 and common fraction-to-percentage conversions. They save seconds on every question.",
      "Learn one standard method per topic and use it every time. Switching methods mid-exam costs more than it saves.",
      "Practise with a timer. Aim to solve straightforward items in under 30 seconds and learn to skip the slow ones.",
      "Review wrong answers by method: was it a concept gap, a calculation slip or a reading error?",
    ],
    commonMistakes: [
      "Practising untimed, then freezing on exam day.",
      "Solving every question to completion when skipping and returning would score more.",
      "Misreading direction questions. Always draw the path.",
    ],
    example: {
      title: "Worked example: time and work",
      body: "A can finish a job in 10 days and B in 15 days. Per day A does 1/10 and B does 1/15 of the job. Together they do 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6 per day, so the job takes 6 days. The method, adding daily rates, solves the whole family of problems.",
    },
    related: ["general-science", "current-affairs", "marathi-english"],
    published: D,
    updated: D,
  },
  {
    slug: "marathi-english",
    name: "Marathi and English Language",
    marathi: "मराठी आणि इंग्रजी भाषा",
    metaTitle: "MPSC Group C Marathi and English Language: Grammar and Vocabulary",
    metaDescription:
      "Language preparation for MPSC Group C: Marathi grammar, idioms and proverbs, and English grammar, vocabulary and comprehension. A realistic weekly routine.",
    summary:
      "Language is where steady habits pay off most. Grammar rules are finite, and a short daily routine builds accuracy that cramming cannot.",
    practisedInSaatatya: [],
    covers: [
      "Marathi grammar: संधी, समास, शब्दसिद्धी, अलंकार and वाक्यरचना",
      "Marathi vocabulary: समानार्थी, विरुद्धार्थी शब्द, वाक्प्रचार and म्हणी",
      "English grammar: tenses, articles, prepositions and error spotting",
      "English vocabulary: synonyms, antonyms, idioms and one-word substitutions",
      "Reading comprehension in both languages",
    ],
    questionTypes: [
      "Identify the correct form or spot the error",
      "Choose the synonym, antonym or idiom meaning",
      "Answer questions from a short passage",
    ],
    howToStudy: [
      "Study grammar from your school textbooks first, then test yourself with objective questions.",
      "Keep a small notebook of idioms and proverbs with their meanings and one sentence each.",
      "Read one short passage in each language daily and answer three questions about it.",
      "Note errors by rule (for example, subject-verb agreement) so you fix the rule, not the single question.",
    ],
    commonMistakes: [
      "Treating language as 'easy' and leaving it for the last week.",
      "Memorising idiom lists without using them in sentences.",
      "Ignoring Marathi grammar because it feels familiar. Familiar is not the same as exam-accurate.",
    ],
    example: {
      title: "A note on what Saatatya covers",
      body: "At the time of writing, Saatatya's daily tests focus on general-ability subjects. Language practice is not yet part of the daily question set, so use textbooks and a separate language routine alongside the daily tests.",
    },
    related: ["reasoning-arithmetic", "current-affairs", "polity"],
    published: D,
    updated: D,
  },
];

export const subjectBySlug = (slug: string): Subject | undefined => subjects.find((s) => s.slug === slug);
