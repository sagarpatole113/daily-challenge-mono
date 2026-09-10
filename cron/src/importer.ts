import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { db, FieldValue } from "./config/firebase";
import { testFileSchema, TestFileInput } from "./schema";
import { EXAM_CONFIG } from "@shared/index";

dotenv.config();

const IMPORT_MODE = (process.env.IMPORT_MODE || "skip") as "skip" | "update";

export interface ImportSummary {
  dayId: string;
  status: "IMPORTED" | "SKIPPED_EXISTING" | "UPDATED";
  testsImported: number;
  questionsImported: number;
}

/**
 * Imports every test-N.json file found for a given date into Firestore,
 * publishing an ACTIVE dailyTestBatches/{dayId}.
 *
 * Idempotent: if an ACTIVE batch already exists for this dayId, the import
 * is skipped (IMPORT_MODE=skip, default) unless IMPORT_MODE=update, in
 * which case only DRAFT batches are overwritten — an already-ACTIVE batch
 * is never silently replaced, to protect students mid-test.
 */
export async function importDay(dayId: string, dataDir: string): Promise<ImportSummary> {
  validateDayId(dayId);

  const dayFolder = path.join(dataDir, dayId);
  if (!fs.existsSync(dayFolder)) {
    throw new Error(`No data folder found for ${dayId} at ${dayFolder}`);
  }

  const batchRef = db.collection("dailyTestBatches").doc(dayId);
  const existing = await batchRef.get();

  if (existing.exists) {
    const status = existing.data()!.status;
    if (status === "ACTIVE") {
      return { dayId, status: "SKIPPED_EXISTING", testsImported: 0, questionsImported: 0 };
    }
    if (status === "DRAFT" && IMPORT_MODE !== "update") {
      return { dayId, status: "SKIPPED_EXISTING", testsImported: 0, questionsImported: 0 };
    }
    // DRAFT + update mode: clear existing tests/questions before re-importing.
    await clearDraftBatch(dayId);
  }

  // ---- 1. Load + validate all available files BEFORE writing anything ----
  const testFiles = fs
    .readdirSync(dayFolder)
    .map((fileName) => {
      const match = /^test-(\d+)\.json$/.exec(fileName);
      return match ? { fileName, number: Number(match[1]) } : null;
    })
    .filter((file): file is { fileName: string; number: number } => file !== null)
    .sort((a, b) => a.number - b.number);

  if (testFiles.length === 0) {
    throw new Error(`No test-N.json files found for day ${dayId}`);
  }

  const expectedNumbers = testFiles.map((file, index) => index + 1);
  if (testFiles.some((file, index) => file.number !== expectedNumbers[index])) {
    throw new Error(`Test files for ${dayId} must be numbered consecutively from test-1.json`);
  }

  const parsedTests: TestFileInput[] = [];
  for (const testFile of testFiles) {
    const filePath = path.join(dayFolder, testFile.fileName);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const result = testFileSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Validation failed for ${testFile.fileName} (day ${dayId}):\n${issues}`);
    }
    parsedTests.push(result.data);
  }

  // ---- 2. Create DRAFT batch first (safe partial-write recovery point) ----
  await batchRef.set({
    id: dayId,
    date: dayId,
    totalTests: parsedTests.length,
    status: "DRAFT",
    createdAt: existing.exists ? existing.data()!.createdAt : FieldValue.serverTimestamp(),
    publishedAt: null,
  });

  let questionsImported = 0;

  // ---- 3. Write each test + its questions + mapping ----
  for (let n = 1; n <= parsedTests.length; n++) {
    const testInput = parsedTests[n - 1];
    const testRef = batchRef.collection("tests").doc(`test-${n}`);

    await testRef.set({
      id: `test-${n}`,
      testNumber: n,
      title: testInput.title,
      totalQuestions: testInput.questions.length,
      totalMarks: testInput.questions.length * EXAM_CONFIG.MARKS_PER_CORRECT,
      durationMinutes: EXAM_CONFIG.DURATION_MINUTES,
      negativeMarking: EXAM_CONFIG.NEGATIVE_MARKING,
      status: "DRAFT",
      createdAt: FieldValue.serverTimestamp(),
    });

    // Batch writes in chunks of ~400 (Firestore batch limit is 500 ops).
    let batch = db.batch();
    let opsInBatch = 0;

    for (let qIdx = 0; qIdx < testInput.questions.length; qIdx++) {
      const q = testInput.questions[qIdx];
      const questionNumber = qIdx + 1;
      const questionRef = db.collection("questions").doc();

      batch.set(questionRef, {
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        questionEnglish: q.questionEnglish,
        questionMarathi: q.questionMarathi,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanationEnglish: q.explanationEnglish,
        explanationMarathi: q.explanationMarathi,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: "cron-importer",
      });
      opsInBatch++;

      const mappingRef = testRef.collection("questions").doc(questionRef.id);
      batch.set(mappingRef, {
        questionId: questionRef.id,
        questionNumber,
      });
      opsInBatch++;

      questionsImported++;

      if (opsInBatch >= 400) {
        await batch.commit();
        batch = db.batch();
        opsInBatch = 0;
      }
    }

    if (opsInBatch > 0) {
      await batch.commit();
    }

    // Publish the individual test once its questions are fully written.
    await testRef.update({ status: "ACTIVE" });
  }

  // ---- 4. Publish the batch (this is what makes it visible to the app) ----
  await batchRef.update({
    status: "ACTIVE",
    publishedAt: FieldValue.serverTimestamp(),
  });

  return {
    dayId,
    status: existing.exists ? "UPDATED" : "IMPORTED",
    testsImported: parsedTests.length,
    questionsImported,
  };
}

async function clearDraftBatch(dayId: string) {
  const batchRef = db.collection("dailyTestBatches").doc(dayId);
  const testsSnap = await batchRef.collection("tests").get();
  for (const testDoc of testsSnap.docs) {
    const mappingSnap = await testDoc.ref.collection("questions").get();
    const batch = db.batch();
    mappingSnap.docs.forEach((m) => batch.delete(m.ref));
    batch.delete(testDoc.ref);
    await batch.commit();
  }
}

function validateDayId(dayId: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayId)) {
    throw new Error(`Invalid dayId "${dayId}" — expected format YYYY-MM-DD`);
  }
}
