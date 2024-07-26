import { type EmbeddingsInterface } from "@langchain/core/embeddings";
import { openaiEmbedding } from "./openai";
import { localEmbedding } from "./local";

export function getEmbedding(): EmbeddingsInterface {
  if (process.env.OPENAI_API_KEY) {
    return openaiEmbedding;
  } else {
    return localEmbedding;
  }
}
