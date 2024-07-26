import { OpenAIEmbeddings } from "@langchain/openai";
import { DIMENSIONS_v2, EMBEDDING_MODEL } from "../config";
export const openaiEmbedding = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: EMBEDDING_MODEL,
  dimensions: DIMENSIONS_v2,
});
