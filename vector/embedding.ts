const memfreeHost = process.env.MEMFREE_HOST;
const embeddingHost = process.env.EMBEDDING_HOST;

let host = "";
// Let open source users could one click deploy
if (embeddingHost) {
  host = embeddingHost;
} else if (memfreeHost) {
  host = `${memfreeHost}/embedding`;
} else {
  throw new Error("Neither MEMFREE_HOST nor EMBEDDING_HOST is defined");
}

export async function embed(documents: string[]) {
  const url = `${host}/embed`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN || "",
      },
      body: JSON.stringify({ documents }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return data.embeddings;
  } catch (error) {
    console.error("Error during embedding fetch:", error);
    throw error;
  }
}

export async function rerank(query: string, documents: string[]) {
  const url = `${host}/rerank`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_TOKEN || "",
      },
      body: JSON.stringify({
        query,
        documents,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return data.top_docs;
  } catch (error) {
    console.error("Error during embedding fetch:", error);
    throw error;
  }
}
