import { getTweet } from "react-tweet/api";
import { logError } from "./log";

export async function processTweet(url: string) {
  const tweetId = extractTweetID(url);
  if (!tweetId) return { image: "", markdown: "", title: "" };

  const tweetData = await fetchTweetContent(tweetId);
  if (!tweetData) return { image: "", markdown: "", title: "" };

  const { image, tweetContent } = tweetData;
  return { image, markdown: tweetContent, title: tweetContent };
}

export function extractTweetID(url: string): string | null {
  const isTwitterURL =
    url.startsWith("https://x.com") || url.startsWith("https://twitter.com");
  if (!isTwitterURL) {
    return null;
  }
  const parts = url.split("/");
  const possibleTweetID = parts.pop() || parts.pop();
  if (possibleTweetID && /^\d+$/.test(possibleTweetID)) {
    return possibleTweetID;
  }
  return null;
}

export async function fetchTweetContent(tweetId: string) {
  try {
    console.time("getTweet");
    const tweet = await getTweet(tweetId);
    console.timeEnd("getTweet");

    if (!tweet || typeof tweet !== "object" || tweet.text === undefined) {
      logError(`Invalid tweet for ${tweetId}`, "tweet");
      return null;
    }

    let image =
      tweet?.photos?.[0]?.url ??
      tweet?.video?.poster ??
      (tweet as any)?.card?.binding_values?.player_image_large?.image_value
        ?.url;
    console.log("image", image);

    const tweetContent = `Tweet from @${
      tweet.user?.name ?? tweet.user?.screen_name ?? "Unknown"
    }  ${tweet.text}`;

    console.log("tweetContent", tweetContent);
    return { image, tweetContent };
  } catch (error) {
    logError(`Error fetching tweet ${tweetId} ${error}`, "tweet");
    return null;
  }
}
