import { db } from "../server/db";
import { rewardStore, users } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function run() {
    const userId = "dev-homehub-user";
    const householdId = 3;

    const [userBefore] = await db.select().from(users).where(eq(users.id, userId));
    console.log("User Before:", userBefore);

    const [newReward] = await db.insert(rewardStore).values({
        title: "Test Reward",
        householdId,
        costInPoints: 10,
        createdById: userId,
    }).returning();

    const [reward] = await db.select().from(rewardStore).where(and(eq(rewardStore.id, newReward.id), eq(rewardStore.householdId, householdId)));
    console.log("Reward:", reward);

    if (!userBefore || !reward || (userBefore.totalPoints || 0) < reward.costInPoints) {
        console.log("Cannot afford", userBefore?.totalPoints, reward.costInPoints);
        return;
    }

    const remainingPoints = (userBefore.totalPoints || 0) - reward.costInPoints;
    const [userAfter] = await db.update(users).set({ totalPoints: remainingPoints }).where(eq(users.id, userId)).returning();

    console.log("User After DB update:", userAfter);
}

run().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
