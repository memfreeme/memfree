import { getUserById, getUserIdByEmail, updateUser } from "./redis";

async function RemoveSubscription(email: string) {
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
  const newUser = {
    ...user,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
    stripeSubscriptionId: null,
    stripeCustomerId: null,
  };
  console.log("new user", newUser);
  await updateUser(userId, newUser);
}

const email = process.argv[2];

if (!email) {
  console.log("Please provide an email as a command line argument.");
  process.exit(1);
}

await RemoveSubscription(email);
