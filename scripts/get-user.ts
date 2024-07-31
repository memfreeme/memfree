import { getUserById, getUserIdByEmail } from "./redis";

async function getUser(email: string) {
  const userId: string | null = await getUserIdByEmail(email);
  if (!userId) {
    console.log(`No user found with email ${email}`);
    return;
  }
  console.log(userId);
  const user = await getUserById(userId);
  if (!user) {
    console.log(`No user found with ID ${userId}`);
    return;
  }
  console.log("user", user);
}
