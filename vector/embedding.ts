const host = process.env.EMBEDDING_HOST || "";

export async function embed(documents: string[]) {
  const url = `${host}/embed`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.API_TOKEN || "",
    },
    body: JSON.stringify({
      documents: documents,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.embeddings;
}

export async function rerank(query: string, documents: string[]) {
  const url = `${host}/rerank`;
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
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.top_docs;
}
