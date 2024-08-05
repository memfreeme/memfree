import { describe, it } from "bun:test";
import { createEmptyTable } from "../db";

const testUser = "localTest";

describe("createEmptyTable", () => {
  it("should createEmptyTable succesully", async () => {
    console.time("createEmptyTable");
    await createEmptyTable(testUser);
    console.timeEnd("createEmptyTable");
  }, 5000000);
});
