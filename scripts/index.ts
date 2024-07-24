import { getTotalIndexCount, getTotalSearchCount, getUserCount } from "./redis";

await getUserCount();

await getTotalIndexCount();

await getTotalSearchCount();
