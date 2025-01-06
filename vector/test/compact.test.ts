import { describe, it } from "bun:test";
import { DatabaseFactory } from "../db";
import { testConfig } from "../config";
import { testSchema } from "../schema";

const testUser = process.env.TEST_USER || "localTest";

const db = DatabaseFactory.createDatabase(testConfig, testSchema);
describe("compact", () => {
  it("should compact succesully", async () => {
    console.time("compact");
    await db.compact(testUser);
    console.timeEnd("compact");
  }, 5000000);
});
