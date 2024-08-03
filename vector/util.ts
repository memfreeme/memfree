import { log } from "./log";

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
          `Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds`
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
      if (i === retries - 1) throw error;
      console.error(
        `Attempt ${url} ${i + 1} failed: ${error}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
      delay *= 2;
    }
  }
  return url;
}

export function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch (_) {
    return false;
  }
}

const jinaToken = process.env.JINA_KEY || "";

function getMdReaderUrl(url: string, useFallback: boolean = false) {
  if (!useFallback && process.env.MD_READER_URL) {
    return `${process.env.MD_READER_URL}${url}`;
  } else {
    return `https://r.jina.ai/${url}`;
  }
}

export async function getMd(url: string, userId: string) {
  const primaryUrl = getMdReaderUrl(url);
  const fallbackUrl = getMdReaderUrl(url, true);

  let headers: HeadersInit = { "X-Timeout": "10" };
  if (jinaToken) {
    headers = { ...headers, Authorization: `Bearer ${jinaToken}` };
  }

  try {
    return await fetchWithRetry(primaryUrl, { headers }, 1, 1000);
  } catch (primaryError) {
    console.error("Primary URL failed:", primaryError);
    try {
      return await fetchWithRetry(fallbackUrl, { headers }, 1, 1000);
    } catch (fallbackError) {
      console.error("Fallback URL failed:", fallbackError);
      log({
        service: "vector",
        action: `error-md`,
        error: fallbackError,
        url: url,
        userId: userId,
      });
      return url;
    }
  }
}
