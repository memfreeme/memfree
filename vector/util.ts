export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayFactor: number = 1000
) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * delayFactor; // Exponential backoff: 1s, 2s, 4s, ...
        console.log(
          `Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`
        );
        await sleep(delay);
      } else {
        console.error(`Failed after ${retries} attempts:`, error);
        throw error;
      }
    }
  }
}

export async function fetchWithRetry(
  url: string,
  options = {},
  retries = 3,
  delay = 1000
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Error during fetch md ",
          url,
          response.status,
          errorText
        );
        throw new Error(
          `Error during fetch md, ${url},  ${response.status}, ${errorText}`
        );
      }
      return response.text();
    } catch (error) {
      if (i === retries - 1) throw error; // If last retry fails, propagate the error
      console.error(
        `Attempt ${url} ${i + 1} failed: ${error}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
  return "";
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

function getMdReaderUrl(url: string, useFallback: boolean = false) {
  if (!useFallback && process.env.MD_READER_URL) {
    return `${process.env.MD_READER_URL}${url}`;
  } else {
    return `https://r.jina.ai/${url}`;
  }
}

export async function getMd(url: string) {
  const primaryUrl = getMdReaderUrl(url);
  const fallbackUrl = getMdReaderUrl(url, true);

  const headers = jinaToken ? { Authorization: `Bearer ${jinaToken}` } : {};
  try {
    return await fetchWithRetry(primaryUrl, { headers }, 2, 1000);
  } catch (primaryError) {
    console.error("Primary URL failed:", primaryError);
    try {
      return await fetchWithRetry(fallbackUrl, { headers }, 2, 1000);
    } catch (fallbackError) {
      console.error("Fallback URL failed:", fallbackError);
      // Which should be a invalid url
      return url;
    }
  }
}
