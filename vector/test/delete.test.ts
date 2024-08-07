import { describe, it } from "bun:test";
import { compact, deleteUrls } from "../db";

const testUser = "localTest";

describe("delete", () => {
  it("should delete succesully", async () => {
    console.time("delete");
    const urls = ["https://www.memfree.me/docs", "https://www.memfree.me/"];
    await deleteUrls(testUser, urls);
    console.timeEnd("delete");
  }, 5000000);

  it("should delete succesully", async () => {
    console.time("delete");
    const urls = ["https://www.memfree.me/docs"];
    await deleteUrls(testUser, urls);
    console.timeEnd("delete");
  }, 5000000);
});
