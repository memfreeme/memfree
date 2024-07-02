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
