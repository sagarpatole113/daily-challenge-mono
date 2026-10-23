# Keyword to page map

Each page owns one primary intent. No near-duplicate pages exist for keyword variants; variants are covered as secondary terms in the owning page.

| Page | Primary intent | Secondary terms covered in-page |
|---|---|---|
| `/` | Brand / daily MPSC Group C practice | MPSC Group C online test, daily mock test |
| `/mpsc-group-c` | MPSC Group C preparation (hub) | Group C exam stages, Group B and Group C preparation, daily routine |
| `/mpsc-group-c/syllabus` | MPSC Group C syllabus | subject-wise syllabus, prelims subject areas |
| `/mpsc-group-c/exam-pattern` | MPSC Group C exam pattern / marking scheme | negative marking, time per question, guessing maths |
| `/mpsc-group-c/previous-year-questions` | How to use previous year questions | PYQ analysis, topic frequency |
| `/mpsc-group-c/mock-tests` | MPSC Group C mock test guidance | how to review a mock test |
| `/mpsc-group-c/daily-mock-test` | Saatatya daily test (product page) | 3 tests a day, 100 questions, bilingual |
| `/mpsc-group-c/subjects` | Subject-wise preparation hub | links to all subject guides |
| `/subjects/polity` | MPSC Group C polity / civics | Indian polity questions |
| `/subjects/history` | MPSC Group C history | Maharashtra history, modern India |
| `/subjects/geography` | MPSC Group C geography | Maharashtra rivers, soils |
| `/subjects/economics` | MPSC Group C economy | Indian economy |
| `/subjects/general-science` | MPSC Group C general science | physics, chemistry, biology |
| `/subjects/current-affairs` | MPSC Group C current affairs | monthly digest method |
| `/subjects/maharashtra-gk` | Maharashtra GK for MPSC | forts, districts, administration |
| `/subjects/reasoning-arithmetic` | MPSC Group C reasoning and arithmetic | intelligence test, number series |
| `/subjects/marathi-english` | MPSC Group C Marathi and English | grammar, vocabulary |
| `/mpsc-group-c/study-resources` | MPSC Group C study material | Marathi study material, resources |

## Deliberately not built

- **"MPSC Group C computer questions":** computer knowledge is not confirmed in the syllabus sources reviewed and is not in Saatatya's question bank. A page would be thin or inaccurate. Add one only after the official syllabus confirms it.
- **Per-keyword or per-year pages** (e.g. "mock test 2026"): they would duplicate the pages above.
- **Dates, vacancies, eligibility, cut-offs:** volatile (exam dates moved three times in 2026) and not verifiable from readable official files. Pages send readers to mpsc.gov.in instead.

## Priorities from supplied keyword research

The supplied keyword snapshot reports these volumes and difficulty scores. Use the existing page that best matches the search intent rather than creating near-duplicate pages.

| Keyword | Volume | Difficulty | Page/action |
|---|---:|---:|---|
| `mpsc group c` | 4.9K | 0 | Keep the preparation hub as the main Group C overview. |
| `mpsc syllabus` | 9.2K | 0 | Keep the syllabus guide as the dedicated syllabus result. |
| `mpsc previous year question paper` | 4.2K | 0 | Use the previous-year guide; make clear that Saatatya offers practice questions, not past papers. |
| `mpsc online` | 5.8K | 58 | Align with the online mock-test page only where the search means online practice. |
| `mpsc exam` | 3.4K | 37 | Cover through the Group C exam-pattern guide and link to current official notices. |
| `mpsc full form` | 13.2K | 0 | Answer directly in the Group C preparation guide FAQ. |

Do not target `mpsc login` with the private, noindex Saatatya sign-in page: that query is likely looking for an official MPSC account portal. Exam dates, application forms, advertisements, results and hall tickets are cycle-specific or have official-source intent; do not publish unsupported current details to capture those searches. `STI full form mpsc` is a different recruitment intent and should not be folded into Group C study pages without a verified, useful page of its own.

## Adding a page

Append a `Guide` to `content/guides.ts` (or a `Subject` to `content/subjects.ts`), add a route file using `GuideRoute`, and add it to `app/sitemap.ts` static list if it is not a guide. Run `npm test`: the content guards enforce unique titles/descriptions, length limits, valid related links, and no hard-coded time-sensitive facts.
