import { db } from "../server/db";
import { users, households, householdMembers, tasks, bounties, rewardStore, taskComments, stickyNotes, shoppingItems } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Starting database seed...");

    let devUserEmail = "dev@homehub.local";
    let devUser = await db.query.users.findFirst({
        where: eq(users.email, devUserEmail)
    });

    if (!devUser) {
        [devUser] = await db.insert(users).values({
            id: "dev-homehub-user",
            email: devUserEmail,
            firstName: "Dev",
            lastName: "User",
            role: "parent",
            totalPoints: 150,
            currentStreak: 3,
            mentalLoadScore: 60,
        }).returning();
    }

    // 1. Get or Create a Household
    console.log("Getting or creating household...");

    // Explicitly find the FIRST household the dev user belongs to, as the app dashboard defaults to this
    const devUserHouseholdLink = await db.query.householdMembers.findFirst({
        where: eq(householdMembers.userId, devUser.id)
    });

    let household;
    if (devUserHouseholdLink) {
        household = await db.query.households.findFirst({
            where: eq(households.id, devUserHouseholdLink.householdId)
        });
        console.log("Found existing household for Dev User:", household?.name);
    }

    if (!household) {
        console.log("Creating new fallback household...");
        const [newHousehold] = await db.insert(households).values({
            name: "The Dream Team",
            joinCode: "SEED99",
        }).returning();
        household = newHousehold;
    }

    // 2. Create Users
    console.log("Creating users...");
    const ensureUser = async (userObj: any) => {
        let u = await db.query.users.findFirst({ where: eq(users.id, userObj.id) });
        if (!u) {
            [u] = await db.insert(users).values(userObj).returning();
        }
        return u;
    };

    const user1 = await ensureUser({
        id: "user-alice-123",
        email: "alice@homehub.local",
        firstName: "Alice",
        lastName: "Smith",
        role: "parent",
        totalPoints: 250,
        currentStreak: 5,
        mentalLoadScore: 85,
    });

    const user2 = await ensureUser({
        id: "user-bob-456",
        email: "bob@homehub.local",
        firstName: "Bob",
        lastName: "Smith",
        role: "parent",
        totalPoints: 120,
        currentStreak: 2,
        mentalLoadScore: 45,
    });

    const user3 = await ensureUser({
        id: "user-charlie-789",
        email: "charlie@homehub.local",
        firstName: "Charlie",
        lastName: "Smith",
        role: "child",
        totalPoints: 400,
        currentStreak: 12,
        mentalLoadScore: 20,
    });

    const allUsers = [user1, user2, user3, devUser];

    // 3. Link Users to Household
    console.log("Linking users to household...");
    for (const user of allUsers) {
        // Check if member already
        const existing = await db.query.householdMembers.findFirst({
            where: (members: any) => eq(members.userId, user.id)
        });

        if (!existing) {
            await db.insert(householdMembers).values({
                userId: user.id,
                householdId: household.id,
                role: user.role === 'parent' ? 'admin' : 'member',
            });
        }
    }

    // 4. Create Tasks
    console.log("Creating tasks...");
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const mockTasks = [
        { title: "Do the laundry", description: "Wash, dry, and fold.", assignedToId: user1.id, points: 50, completed: true, createdAt: twoDaysAgo },
        { title: "Clean the kitchen", description: "Wipe counters and mop floor.", assignedToId: user2.id, points: 60, completed: true, createdAt: yesterday },
        { title: "Take out the trash", description: "Don't forget recycling.", assignedToId: user3.id, points: 20, completed: true, createdAt: yesterday },
        { title: "Vacuum living room", description: "Under the couch too.", assignedToId: devUser.id, points: 40, completed: true, createdAt: yesterday },
        { title: "Walk the dog", description: "Morning and evening.", assignedToId: user1.id, points: 30, completed: true, createdAt: now },
        { title: "Pay utility bills", description: "Electric and water.", assignedToId: user1.id, points: 100, completed: true, createdAt: now },
        { title: "Unload dishwasher", description: "Put everything away.", assignedToId: user3.id, points: 20, completed: true, createdAt: twoDaysAgo },

        // Some pending tasks
        { title: "Mow the lawn", description: "Front and back yard.", assignedToId: user2.id, points: 80, completed: false },
        { title: "Buy groceries", description: "Check the shopping list.", assignedToId: devUser.id, points: 70, completed: false },
        { title: "Fix leaky faucet", description: "In the guest bathroom.", assignedToId: null, points: 120, completed: false },
    ];

    const createdTasks = [];
    for (const task of mockTasks) {
        const [t] = await db.insert(tasks).values({
            householdId: household.id,
            title: task.title,
            description: task.description,
            assignedToId: task.assignedToId,
            points: task.points,
            completed: task.completed,
            createdAt: task.createdAt || now,
        }).returning();
        createdTasks.push(t);
    }

    // 5. Create Task Comments
    console.log("Creating task comments...");
    await db.insert(taskComments).values([
        { householdId: household.id, taskId: createdTasks[7].id, userId: user1.id, content: "Can you do this by Saturday?" },
        { householdId: household.id, taskId: createdTasks[7].id, userId: user2.id, content: "Sure, I'll do it Saturday morning." },
        { householdId: household.id, taskId: createdTasks[8].id, userId: user3.id, content: "Don't forget the milk!" },
    ]);

    // 6. Create Bounties
    console.log("Creating bounties...");
    await db.insert(bounties).values([
        { householdId: household.id, title: "Deep clean the oven", description: "Use the heavy duty cleaner.", rewardPoints: 200, status: "open", createdById: user1.id },
        { householdId: household.id, title: "Organize the garage", description: "Sweep and sort tools.", rewardPoints: 300, status: "open", createdById: user2.id },
        { householdId: household.id, title: "Wash both cars", description: "Inside and out.", rewardPoints: 150, status: "claimed", createdById: user1.id, claimedById: user3.id },
    ]);

    // 7. Create Reward Store Items
    console.log("Creating reward store items...");
    await db.insert(rewardStore).values([
        { householdId: household.id, title: "Pick Friday Movie", description: "You get 100% control over movie night.", costInPoints: 100, createdById: user1.id },
        { householdId: household.id, title: "Skip a chore", description: "Get a free pass on one daily chore.", costInPoints: 250, createdById: user1.id },
        { householdId: household.id, title: "Ice Cream Trip", description: "Dad buys ice cream for you.", costInPoints: 150, createdById: devUser.id },
        { householdId: household.id, title: "1 Hour Video Games", description: "Extra screen time.", costInPoints: 50, createdById: user1.id },
    ]);

    // 8. Create Notes & Shopping Items
    console.log("Creating notes and shopping items...");
    await db.insert(stickyNotes).values([
        { householdId: household.id, content: "Welcome to our new HomeHub!", color: "yellow", authorId: user1.id },
        { householdId: household.id, content: "Parent teacher conference on Thursday.", color: "pink", authorId: user1.id },
    ]);

    await db.insert(shoppingItems).values([
        { householdId: household.id, name: "Apples", completed: false, addedById: user3.id },
        { householdId: household.id, name: "Bread", completed: true, addedById: user2.id },
        { householdId: household.id, name: "Paper Towels", completed: false, addedById: devUser.id },
    ]);

    console.log("Seed completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
