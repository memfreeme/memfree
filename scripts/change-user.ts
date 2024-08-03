import { getUserById, getUserIdByEmail, updateUser } from "./redis";

async function updateUserPeriodEnd(email: string) {
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
  console.log("old user", user);
  const oneYearAgo = new Date();
  // oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() + 1);
  user.stripeCurrentPeriodEnd = oneYearAgo;
  console.log("new user", user);
  await updateUser(userId, user);
}
