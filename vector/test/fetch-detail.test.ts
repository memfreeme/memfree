import { describe, it } from "bun:test";
import { selectDetail } from "../db";

const testUser = process.env.TEST_USER || "localTest";

describe("selectDetail", () => {
  it("should selectDetail succesully", async () => {
    console.time("selectDetail");
    const result = await selectDetail(testUser);
    result.forEach((item) => {
      console.log(item + "\n");
    });
    console.timeEnd("selectDetail");
  }, 5000000);
});
