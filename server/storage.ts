import {
  users,
  households,
  householdMembers,
  tasks,
  shoppingItems,
  events,
  stickyNotes,
  bounties,
  rewardStore,
  taskComments,
  type User,
  type Household,
  type HouseholdMember,
  type Task,
  type ShoppingItem,
  type Event,
  type StickyNote,
  type Bounty,
  type RewardStoreItem,
  type TaskComment,
  type InsertHousehold,
  type InsertTask,
  type InsertShoppingItem,
  type InsertEvent,
  type InsertStickyNote,
  type UpdateStickyNote,
  type InsertBounty,
  type InsertRewardStore,
  type InsertTaskComment,
  meals,
  type Meal,
  type InsertMeal
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte } from "drizzle-orm";
import { randomBytes } from "crypto";
export type MentalLoadMemberScore = {
  userId: string;
  name: string;
  role: string | null;
  completedTasks: number;
  weightedLoad: number;
  equityShare: number;
  mentalLoadScore: number;
};

export type MentalLoadAnalytics = {
  householdAverage: number;
  memberScores: MentalLoadMemberScore[];
  trend: Array<{ date: string; totalCompleted: number }>;
};

export interface IStorage {
  // Household Management
  createHousehold(userId: string, name: string): Promise<Household>;
  joinHousehold(userId: string, joinCode: string): Promise<Household | undefined>;
  getHouseholdByUserId(userId: string): Promise<(Household & { members: User[] }) | undefined>;
  getHouseholdMembers(householdId: number): Promise<User[]>;

  // Tasks
  getTasks(householdId: number): Promise<(Task & { assignedTo: User | null })[]>;
  createTask(householdId: number, task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Shopping List
  getShoppingItems(householdId: number): Promise<(ShoppingItem & { addedBy: User | null })[]>;
  createShoppingItem(
    householdId: number,
    item: InsertShoppingItem & { addedById?: string | null },
  ): Promise<ShoppingItem>;
  updateShoppingItem(id: number, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem>;
  deleteShoppingItem(id: number): Promise<void>;

  // Events
  getEvents(householdId: number): Promise<(Event & { createdBy: User | null })[]>;
  createEvent(
    householdId: number,
    event: InsertEvent & { createdById?: string | null },
  ): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Sticky Notes
  getStickyNotes(householdId: number): Promise<(StickyNote & { author: User | null })[]>;
  createStickyNote(
    householdId: number,
    note: InsertStickyNote & { authorId?: string | null },
  ): Promise<StickyNote>;
  updateStickyNote(id: number, updates: UpdateStickyNote): Promise<StickyNote>;
  deleteStickyNote(id: number): Promise<void>;

  // Bounties / Rewards Economy
  getBounties(householdId: number): Promise<(Bounty & { claimedBy: User | null })[]>;
  createBounty(
    householdId: number,
    createdById: string,
    bounty: InsertBounty,
  ): Promise<Bounty>;
  claimBounty(
    householdId: number,
    bountyId: number,
    userId: string,
  ): Promise<Bounty | undefined>;
  getRewardStoreItems(householdId: number): Promise<RewardStoreItem[]>;
  createRewardStoreItem(
    householdId: number,
    createdById: string,
    reward: InsertRewardStore,
  ): Promise<RewardStoreItem>;
  purchaseReward(
    householdId: number,
    rewardId: number,
    userId: string,
  ): Promise<{ success: boolean; remainingPoints: number; reward: RewardStoreItem } | undefined>;

  // Async Task Comments
  getTaskComments(
    householdId: number,
    taskId: number,
  ): Promise<(TaskComment & { user: User | null })[]>;
  createTaskComment(
    householdId: number,
    taskId: number,
    userId: string,
    comment: InsertTaskComment,
  ): Promise<TaskComment>;

  // AI Meal Planner
  getMeals(householdId: number): Promise<(Meal & { createdBy: User | null })[]>;
  createMeal(householdId: number, userId: string, meal: InsertMeal): Promise<Meal>;
  deleteMeal(id: number): Promise<void>;

  // Analytics
  getMentalLoadAnalytics(householdId: number): Promise<MentalLoadAnalytics>;

  // Subscriptions
  getSubscriptionStatus(userId: string): Promise<{ isSubscribed: boolean; subscriptionExpiresAt: Date | null }>;
  createSubscription(userId: string): Promise<{ isSubscribed: boolean; subscriptionExpiresAt: Date }>;

  // Helper
  getHouseholdIdForUser(userId: string): Promise<number | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getHouseholdIdForUser(userId: string): Promise<number | undefined> {
    const [member] = await db
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.userId, userId))
      .limit(1);
    return member?.householdId;
  }

  async createHousehold(userId: string, name: string): Promise<Household> {
    // Generate unique 6-char code
    const joinCode = randomBytes(3).toString('hex').toUpperCase();

    const [household] = await db
      .insert(households)
      .values({ name, joinCode })
      .returning();

    await db.insert(householdMembers).values({
      userId,
      householdId: household.id,
      role: 'admin'
    });

    return household;
  }

  async joinHousehold(userId: string, joinCode: string): Promise<Household | undefined> {
    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.joinCode, joinCode));

    if (!household) return undefined;

    // Check if already member
    const [existing] = await db
      .select()
      .from(householdMembers)
      .where(and(
        eq(householdMembers.userId, userId),
        eq(householdMembers.householdId, household.id)
      ));

    if (!existing) {
      await db.insert(householdMembers).values({
        userId,
        householdId: household.id,
        role: 'member'
      });
    }

    return household;
  }

  async getHouseholdByUserId(userId: string): Promise<(Household & { members: User[] }) | undefined> {
    const mems = await db
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.userId, userId));

    if (!mems || mems.length === 0) return undefined;
    const householdId = mems[0].householdId;

    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, householdId));

    if (!household) return undefined;

    const members = await this.getHouseholdMembers(household.id);
    return { ...household, members };
  }

  async getHouseholdMembers(householdId: number): Promise<User[]> {
    const members = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        passwordHash: users.passwordHash,
        salt: users.salt,
        role: users.role,
        totalPoints: users.totalPoints,
        currentStreak: users.currentStreak,
        mentalLoadScore: users.mentalLoadScore,
        isSubscribed: users.isSubscribed,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(householdMembers)
      .innerJoin(users, eq(householdMembers.userId, users.id))
      .where(eq(householdMembers.householdId, householdId));

    return members;
  }

  // Tasks
  async getTasks(householdId: number): Promise<(Task & { assignedTo: User | null })[]> {
    return await db.query.tasks.findMany({
      where: eq(tasks.householdId, householdId),
      with: { assignedTo: true },
      orderBy: [desc(tasks.createdAt)]
    });
  }

  async createTask(householdId: number, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, householdId })
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    // Fetch the existing task to compare state and know its point value
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!existing) throw new Error("Task not found");

    // Perform the task update
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    // GAMIFICATION ENGINE: If the completion status changed and it is assigned to someone
    if (updates.completed !== undefined && updates.completed !== existing.completed && updated.assignedToId) {
      const taskPoints = updated.points || 0;
      const pointDelta = updates.completed ? taskPoints : -taskPoints; // Give points if done, take away if undone

      const [user] = await db.select().from(users).where(eq(users.id, updated.assignedToId));
      if (user) {
        await db.update(users)
          .set({
            totalPoints: (user.totalPoints || 0) + pointDelta,
            mentalLoadScore: (user.mentalLoadScore || 0) + (updates.completed ? Math.floor(taskPoints / 2) : -Math.floor(taskPoints / 2))
          })
          .where(eq(users.id, updated.assignedToId));
      }
    }

    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Shopping
  async getShoppingItems(householdId: number): Promise<(ShoppingItem & { addedBy: User | null })[]> {
    return await db.query.shoppingItems.findMany({
      where: eq(shoppingItems.householdId, householdId),
      with: { addedBy: true },
      orderBy: [asc(shoppingItems.completed), desc(shoppingItems.createdAt)]
    });
  }

  async createShoppingItem(householdId: number, item: InsertShoppingItem): Promise<ShoppingItem> {
    const [newItem] = await db
      .insert(shoppingItems)
      .values({ ...item, householdId })
      .returning();
    return newItem;
  }

  async updateShoppingItem(id: number, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem> {
    const [updated] = await db
      .update(shoppingItems)
      .set(updates)
      .where(eq(shoppingItems.id, id))
      .returning();
    return updated;
  }

  async deleteShoppingItem(id: number): Promise<void> {
    await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
  }

  // Events
  async getEvents(householdId: number): Promise<(Event & { createdBy: User | null })[]> {
    return await db.query.events.findMany({
      where: eq(events.householdId, householdId),
      with: { createdBy: true },
      orderBy: [asc(events.startTime)]
    });
  }

  async createEvent(householdId: number, event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, householdId })
      .returning();
    return newEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Notes
  async getStickyNotes(householdId: number): Promise<(StickyNote & { author: User | null })[]> {
    return await db.query.stickyNotes.findMany({
      where: eq(stickyNotes.householdId, householdId),
      with: { author: true },
      orderBy: [desc(stickyNotes.createdAt)]
    });
  }

  async createStickyNote(householdId: number, note: InsertStickyNote & { authorId?: string | null }): Promise<StickyNote> {
    const [created] = await db
      .insert(stickyNotes)
      .values({ ...note, householdId })
      .returning();
    return created;
  }

  async updateStickyNote(id: number, updates: UpdateStickyNote): Promise<StickyNote> {
    const [updated] = await db
      .update(stickyNotes)
      .set(updates)
      .where(eq(stickyNotes.id, id))
      .returning();
    if (!updated) throw new Error("Note not found");
    return updated;
  }

  async deleteStickyNote(id: number): Promise<void> {
    await db.delete(stickyNotes).where(eq(stickyNotes.id, id));
  }
  // Bounties / Rewards Economy
  async getBounties(householdId: number): Promise<(Bounty & { claimedBy: User | null })[]> {
    return await db.query.bounties.findMany({
      where: eq(bounties.householdId, householdId),
      with: { claimedBy: true },
      orderBy: [desc(bounties.createdAt)]
    });
  }

  async createBounty(householdId: number, createdById: string, bounty: InsertBounty): Promise<Bounty> {
    const [newBounty] = await db
      .insert(bounties)
      .values({ ...bounty, householdId, createdById })
      .returning();
    return newBounty;
  }

  async claimBounty(householdId: number, bountyId: number, userId: string): Promise<Bounty | undefined> {
    // 1. Fetch the bounty to ensure it exists and get its point value
    const [bounty] = await db.select().from(bounties).where(and(eq(bounties.id, bountyId), eq(bounties.householdId, householdId)));
    if (!bounty) return undefined;
    if (bounty.status !== "open") throw new Error("This bounty has already been claimed or is unavailable.");

    // 2. Update the bounty status to claimed
    const [updated] = await db
      .update(bounties)
      .set({ claimedById: userId, status: "claimed" })
      .where(and(eq(bounties.id, bountyId), eq(bounties.householdId, householdId)))
      .returning();

    // 3. GAMIFICATION ENGINE: Reward the user with the bounty points
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user && updated) {
      await db.update(users)
        .set({
          totalPoints: (user.totalPoints || 0) + (updated.rewardPoints || 0),
          mentalLoadScore: (user.mentalLoadScore || 0) + Math.floor((updated.rewardPoints || 0) / 2)
        })
        .where(eq(users.id, userId));
    }

    return updated;
  }

  async getRewardStoreItems(householdId: number): Promise<RewardStoreItem[]> {
    return await db.query.rewardStore.findMany({
      where: eq(rewardStore.householdId, householdId),
      orderBy: [asc(rewardStore.costInPoints)]
    });
  }

  async createRewardStoreItem(householdId: number, createdById: string, reward: InsertRewardStore): Promise<RewardStoreItem> {
    const [newItem] = await db
      .insert(rewardStore)
      .values({ ...reward, householdId, createdById })
      .returning();
    return newItem;
  }

  async purchaseReward(householdId: number, rewardId: number, userId: string): Promise<{ success: boolean; remainingPoints: number; reward: RewardStoreItem } | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [reward] = await db.select().from(rewardStore).where(and(eq(rewardStore.id, rewardId), eq(rewardStore.householdId, householdId)));

    if (!user || !reward || user.totalPoints < reward.costInPoints) {
      return undefined; // Not enough points or invalid request
    }

    // Deduct points
    const remainingPoints = user.totalPoints - reward.costInPoints;
    await db.update(users).set({ totalPoints: remainingPoints }).where(eq(users.id, userId));

    return { success: true, remainingPoints, reward };
  }

  // Async Task Comments
  async getTaskComments(householdId: number, taskId: number): Promise<(TaskComment & { user: User | null })[]> {
    return await db.query.taskComments.findMany({
      where: and(eq(taskComments.householdId, householdId), eq(taskComments.taskId, taskId)),
      with: { user: true },
      orderBy: [asc(taskComments.timestamp)]
    });
  }

  async createTaskComment(householdId: number, taskId: number, userId: string, comment: InsertTaskComment): Promise<TaskComment> {
    const [newComment] = await db
      .insert(taskComments)
      .values({ ...comment, householdId, taskId, userId })
      .returning();
    return newComment;
  }

  // AI Meal Planner
  async getMeals(householdId: number): Promise<(Meal & { createdBy: User | null })[]> {
    return await db.query.meals.findMany({
      where: eq(meals.householdId, householdId),
      with: { createdBy: true },
      orderBy: [desc(meals.createdAt)]
    });
  }

  async createMeal(householdId: number, userId: string, meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db
      .insert(meals)
      .values({ ...meal, householdId, createdById: userId })
      .returning();
    return newMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  // Analytics
  async getMentalLoadAnalytics(householdId: number): Promise<MentalLoadAnalytics> {
    const members = await this.getHouseholdMembers(householdId);

    // Fetch all completed tasks for the household
    const completedTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.householdId, householdId),
        eq(tasks.completed, true)
      )
    });

    let totalHouseholdPoints = 0;
    const memberStats: Record<string, { completedTasks: number, points: number }> = {};

    // Initialize stats
    members.forEach(m => {
      memberStats[m.id] = { completedTasks: 0, points: 0 };
    });

    // Aggregate stats
    completedTasks.forEach(task => {
      totalHouseholdPoints += (task.points || 0);
      if (task.assignedToId && memberStats[task.assignedToId]) {
        memberStats[task.assignedToId].completedTasks += 1;
        memberStats[task.assignedToId].points += (task.points || 0);
      }
    });

    const memberScores = members.map(m => {
      const stats = memberStats[m.id];
      const equityShare = totalHouseholdPoints > 0
        ? Math.round((stats.points / totalHouseholdPoints) * 100)
        : Math.round(100 / members.length);

      return {
        userId: m.id,
        name: m.firstName || m.lastName ? `${m.firstName || ''} ${m.lastName || ''}`.trim() : m.email || "Unknown",
        role: m.role || "Member",
        completedTasks: stats.completedTasks,
        weightedLoad: stats.points,
        equityShare: equityShare,
        mentalLoadScore: m.mentalLoadScore || 0
      };
    });

    // Calculate Trend (Last 7 Days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const completedOnDate = completedTasks.filter(t => {
        if (!t.createdAt) return false;
        return t.createdAt.toISOString().split('T')[0] === dateStr;
      }).length;

      trend.push({ date: dateStr, totalCompleted: completedOnDate });
    }

    const householdAverage = Math.round(
      memberScores.reduce((acc, curr) => acc + curr.equityShare, 0) / (memberScores.length || 1)
    );

    return {
      householdAverage,
      memberScores,
      trend
    };
  }

  // Subscriptions
  async getSubscriptionStatus(userId: string): Promise<{ isSubscribed: boolean; subscriptionExpiresAt: Date | null }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    // Check if subscription has expired
    if (user.isSubscribed && user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
      await db.update(users).set({ isSubscribed: false }).where(eq(users.id, userId));
      return { isSubscribed: false, subscriptionExpiresAt: user.subscriptionExpiresAt };
    }

    return {
      isSubscribed: !!user.isSubscribed,
      subscriptionExpiresAt: user.subscriptionExpiresAt || null
    };
  }

  async createSubscription(userId: string): Promise<{ isSubscribed: boolean; subscriptionExpiresAt: Date }> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    await db.update(users)
      .set({ isSubscribed: true, subscriptionExpiresAt: expiresAt })
      .where(eq(users.id, userId));

    return { isSubscribed: true, subscriptionExpiresAt: expiresAt };
  }
}

export const storage = new DatabaseStorage();
