import { 
  users, households, householdMembers, tasks, shoppingItems, events, stickyNotes,
  type User, type Household, type HouseholdMember, type Task, type ShoppingItem, type Event, type StickyNote,
  type InsertHousehold, type InsertTask, type InsertShoppingItem, type InsertEvent, type InsertStickyNote
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

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
  createShoppingItem(householdId: number, item: InsertShoppingItem): Promise<ShoppingItem>;
  updateShoppingItem(id: number, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem>;
  deleteShoppingItem(id: number): Promise<void>;

  // Events
  getEvents(householdId: number): Promise<(Event & { createdBy: User | null })[]>;
  createEvent(householdId: number, event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Sticky Notes
  getStickyNotes(householdId: number): Promise<(StickyNote & { author: User | null })[]>;
  createStickyNote(householdId: number, note: InsertStickyNote): Promise<StickyNote>;
  deleteStickyNote(id: number): Promise<void>;
  
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
    const householdId = await this.getHouseholdIdForUser(userId);
    if (!householdId) return undefined;

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
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
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

  async createStickyNote(householdId: number, note: InsertStickyNote): Promise<StickyNote> {
    const [newNote] = await db
      .insert(stickyNotes)
      .values({ ...note, householdId })
      .returning();
    return newNote;
  }

  async deleteStickyNote(id: number): Promise<void> {
    await db.delete(stickyNotes).where(eq(stickyNotes.id, id));
  }
}

export const storage = new DatabaseStorage();
