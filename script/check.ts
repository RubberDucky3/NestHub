import { db } from "../server/db";
import { users, households, householdMembers, tasks } from "../shared/schema";
import { eq } from "drizzle-orm";

async function check() {
    const allUsers = await db.query.users.findMany();
    console.log("USERS:", allUsers.map(u => ({ id: u.id, email: u.email })));

    const allHouseholds = await db.query.households.findMany({
        with: { members: true }
    });
    console.log("HOUSEHOLDS:", JSON.stringify(allHouseholds, null, 2));

    const allTasks = await db.query.tasks.findMany();
    console.log("TASKS COUNT:", allTasks.length);
    process.exit(0);
}

check();
