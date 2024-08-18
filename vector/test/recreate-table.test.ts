import { describe, it } from "bun:test";
import { reCreateEmptyTable } from "../db";

const testUser = process.env.TEST_USER || "localTest";

describe("reCreateEmptyTable", () => {
  it("should reCreateEmptyTable succesully", async () => {
    console.time("reCreateEmptyTable");
    await reCreateEmptyTable(testUser);
    console.timeEnd("reCreateEmptyTable");
  }, 5000000);
});
