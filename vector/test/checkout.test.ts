import { describe, it } from "bun:test";
import { checkout, version } from "../db";

const testUser = "localTest";

describe("checkout", () => {
  it("should checkout succesully", async () => {
    const tableVersion = await version(testUser);
    console.log("Table version", tableVersion);
    console.time("checkout");
    await checkout(testUser, 214);
    console.timeEnd("checkout");

    const newVersion = await version(testUser);
    console.log("Table version", newVersion);
  }, 5000000);
});
