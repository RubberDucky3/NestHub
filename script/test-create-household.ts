import { storage } from "../server/storage";
import { users } from "../shared/schema";
import { db } from "../server/db";

async function main() {
  try {
    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      console.log("No user found");
      return;
    }
    const hh = await storage.createHousehold(user.id, "Test Household");
    console.log("Success:", hh);
  } catch (err) {
    console.error("Failed:", err);
  }
  process.exit();
}
main();
