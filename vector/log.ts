import { Axiom } from "@axiomhq/js";

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN || "",
});

export const log = async (message: any) => {
  try {
    console.log(message);
    axiom.ingest("memfree", [message]);
  } catch (error) {
    console.error("Error logging to Axiom:", error);
  }
};

export const logError = (error: Error | string, action: string) => {
  console.error(`error-${action}`, error);
  log({
    service: "vector",
    action: `error-${action}`,
    error: `${error}`,
  });
};
