import path from "path";
import dotenv from "dotenv";
import { importDay } from "./importer";
import { todayDayId, yesterdayDayId } from "./utils/dates";

dotenv.config();

/**
 * Manual import:
 *   npm run import -- --date=2026-09-02
 *   npm run import -- --date=today,yesterday
 */
async function main() {
  const arg = process.argv.find((a) => a.startsWith("--date="));
  const requestedDates = arg?.split("=")[1]?.split(",").map((value) => value.trim()).filter(Boolean);

  if (!requestedDates?.length) {
    console.error("Usage: npm run import -- --date=YYYY-MM-DD[,YYYY-MM-DD|today|yesterday]");
    process.exit(1);
  }

  const dataDir = path.resolve(process.env.TEST_DATA_DIRECTORY || "./data");
  const today = todayDayId();
  const dayIds = requestedDates.map((date) =>
    date === "today" ? today : date === "yesterday" ? yesterdayDayId() : date
  );

  // The mobile app's Home screen always asks for tests for *today's actual
  // device date* (see mobile/src/utils/dates.ts -> todayDayId()). If you
  // import a sample/demo date (e.g. the bundled cron/data/2026-09-02/
  // folder) instead of today's real date, the app will build fine, the
  // import will succeed, but the Home screen's "Today" card will show no
  // tests — GET /days/:dayId/tests 404s for whatever today's real dayId
  // is, since no batch was ever published for it. This isn't a bug in the
  // import itself, just a heads up so it isn't confusing.
  for (const dayId of dayIds) {
    if (dayId !== today) {
      console.warn(
        `Note: importing for ${dayId}, but today is ${today}. ` +
          `The mobile app's "Today" screen looks up tests by today's actual date.`
      );
    }
  }

  try {
    for (const dayId of dayIds) {
      console.log(`Importing tests for ${dayId} from ${dataDir} ...`);
      const summary = await importDay(dayId, dataDir);
      console.log("Import summary:", summary);
    }
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();