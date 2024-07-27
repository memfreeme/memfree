import { type EmbeddingsInterface } from "@langchain/core/embeddings";
import { localEmbedding } from "./local";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DIMENSIONS, EMBEDDING_MODEL } from "../config";

export function getEmbedding(): EmbeddingsInterface {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: EMBEDDING_MODEL,
      dimensions: DIMENSIONS,
    });
  } else {
    return localEmbedding;
  }
}
