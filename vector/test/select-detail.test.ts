import { describe, it } from "bun:test";
import { DatabaseFactory } from "../db";
import { testConfig } from "../config";
import { documentSchema, testSchema } from "../schema";

const testUser = process.env.TEST_USER || "localTest";

const db = DatabaseFactory.createDatabase(testConfig, documentSchema);

describe("selectDetail", () => {
  it("should selectDetail succesully", async () => {
    console.time("selectDetail");
    const result = await db.searchDetail(testUser, { limit: 20, offset: 20 });
    result.forEach((item) => {
      console.log(item + "\n");
    });
    console.timeEnd("selectDetail");
  }, 5000000);
});
