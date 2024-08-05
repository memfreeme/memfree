import { describe, it } from "bun:test";
import { compact } from "../db";

const testUser = "localTest";

describe("compact", () => {
  it("should compact succesully", async () => {
    console.time("compact");
    await compact(testUser);
    console.timeEnd("compact");
  }, 5000000);
});
