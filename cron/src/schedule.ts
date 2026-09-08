import path from "path";
import dotenv from "dotenv";
import cron from "node-cron";
import { importDay } from "./importer";
import { todayDayId } from "./utils/dates";

dotenv.config();

const schedule = process.env.CRON_SCHEDULE || "5 0 * * *"; // default 12:05 AM daily
const dataDir = path.resolve(process.env.TEST_DATA_DIRECTORY || "./data");

if (!cron.validate(schedule)) {
  throw new Error(`Invalid CRON_SCHEDULE expression: "${schedule}"`);
}

console.log(`MPSC Cron scheduler started. Schedule: "${schedule}"`);

cron.schedule(schedule, async () => {
  const dayId = todayDayId();
  console.log(`[${new Date().toISOString()}] Running scheduled import for ${dayId}`);
  try {
    const summary = await importDay(dayId, dataDir);
    console.log("Scheduled import summary:", summary);
  } catch (err) {
    console.error(
      "Scheduled import failed:",
      err instanceof Error ? err.message : err
    );
  }
});
