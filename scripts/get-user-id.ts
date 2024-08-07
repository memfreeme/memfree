import { getUserById } from "./redis";

async function getUser(id: string) {
  const user = await getUserById(id);
  if (!user) {
    console.log(`No user found with ID ${id}`);
    return;
  }
  console.log("user", user);
}

const id = process.argv[2];

if (!id) {
  console.log("Please provide an email as a command line argument.");
  process.exit(1);
}

await getUser(id);
