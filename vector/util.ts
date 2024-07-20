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
    const headers = jinaToken ? { Authorization: `Bearer ${jinaToken}` } : {};
    const res = await fetchWithRetry(new_url, { headers }, 3, 1000);
    const text = await res.text();
    const md = removeImageLinksAndUrls(text);
    return md;
  } catch (error) {
    console.error("Failed to fetch markdown:", error);
    throw error; // Re-throw so that caller knows this failed
  }
}
