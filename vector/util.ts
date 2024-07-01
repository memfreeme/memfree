export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options = {},
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error; // If last retry fails, propagate the error
      console.error(
        `Attempt ${i + 1} failed: ${error}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
  return new Response(null);
}

export function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

function removeImageLinksAndUrls(mdText: string): string {
  let result = mdText.replace(/!\[.*?\]\(.*?\)/g, "");

  result = result.replace(/\[([^\]]*?)\]\((.*?)\)/g, "$1");

  return result;
}

const jinaToken = process.env.JINA_KEY || "";

export async function getMd(url: string) {
  const new_url = "https://r.jina.ai/" + url;

  try {
    const res = await fetchWithRetry(
      new_url,
      {
        headers: {
          Authorization: `Bearer ${jinaToken}`,
        },
      },
      3,
      1000
    );
    const text = await res.text();
    const md = removeImageLinksAndUrls(text);
    return md;
  } catch (error) {
    console.error("Failed to fetch markdown:", error);
    throw error; // Re-throw so that caller knows this failed
  }
}

export async function getImage(url: string) {
  const new_url = "https://r.jina.ai/" + url;
  try {
    const res = await fetchWithRetry(
      new_url,
      {
        headers: {
          "x-respond-with": "screenshot",
          Authorization: `Bearer ${jinaToken}`,
        },
      },
      3,
      1000
    );
    return res.url;
  } catch (error) {
    console.error("Failed to fetch image link:", error);
    throw error; // Re-throw so that caller knows this failed
  }
}

export function cosineSimilarity(vecA: Float32Array, vecB: Float32Array) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < 384; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] ** 2;
    magnitudeB += vecB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // shouldn't be zero, but just in case
  return dotProduct / (magnitudeA * magnitudeB);
}

// const url = "https://www.memfree.me/blog/memfree-build-1-why";

// console.time("getMd");
// const markdown = await getMd(url);
// console.timeEnd("getMd");

// console.log(markdown);
