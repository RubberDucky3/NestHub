import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  joinCode: varchar("join_code", { length: 6 }).notNull().unique(), // simple 6-char code
  createdAt: timestamp("created_at").defaultNow(),
});

export const householdMembers = pgTable("household_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  householdId: integer("household_id").notNull().references(() => households.id),
  role: text("role").notNull().default("member"), // 'admin', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedToId: varchar("assigned_to_id").references(() => users.id), // Nullable = unassigned
  points: integer("points").default(0),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  name: text("name").notNull(),
  completed: boolean("completed").default(false),
  addedById: varchar("added_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  createdById: varchar("created_by_id").references(() => users.id),
});

export const stickyNotes = pgTable("sticky_notes", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  content: text("content").notNull(),
  color: text("color").default("yellow"), // yellow, pink, blue, green
  x: integer("x").notNull().default(100),
  y: integer("y").notNull().default(100),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === GAMIFICATION & ECONOMY ===
export const bounties = pgTable("bounties", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  description: text("description"),
  rewardPoints: integer("reward_points").notNull().default(0),
  status: text("status").notNull().default("open"), // open, claimed, completed
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  claimedById: varchar("claimed_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardStore = pgTable("reward_store", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  description: text("description"),
  costInPoints: integer("cost_in_points").notNull().default(0),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ASYNC COMMUNICATION ===
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// AI Generated Meals Table
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id),
  title: text("title").notNull(),
  description: text("description"),
  prepTimeMins: integer("prep_time_mins"),
  aiGenerated: boolean("ai_generated").default(true),
  plannedDate: timestamp("planned_date"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  tasks: many(tasks),
  shoppingItems: many(shoppingItems),
  events: many(events),
  stickyNotes: many(stickyNotes),
  bounties: many(bounties),
  rewardStore: many(rewardStore),
  taskComments: many(taskComments),
}));

export const householdMembersRelations = relations(householdMembers, ({ one }) => ({
  household: one(households, {
    fields: [householdMembers.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [householdMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  household: one(households, {
    fields: [tasks.householdId],
    references: [households.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  comments: many(taskComments),
}));

export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
  household: one(households, {
    fields: [shoppingItems.householdId],
    references: [households.id],
  }),
  addedBy: one(users, {
    fields: [shoppingItems.addedById],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  household: one(households, {
    fields: [events.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
}));

export const stickyNotesRelations = relations(stickyNotes, ({ one }) => ({
  household: one(households, {
    fields: [stickyNotes.householdId],
    references: [households.id],
  }),
  author: one(users, {
    fields: [stickyNotes.authorId],
    references: [users.id],
  }),
}));

export const bountiesRelations = relations(bounties, ({ one }) => ({
  household: one(households, {
    fields: [bounties.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [bounties.createdById],
    references: [users.id]
  }),
  claimedBy: one(users, {
    fields: [bounties.claimedById],
    references: [users.id]
  }),
}));

export const rewardStoreRelations = relations(rewardStore, ({ one }) => ({
  household: one(households, {
    fields: [rewardStore.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [rewardStore.createdById],
    references: [users.id]
  }),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  household: one(households, {
    fields: [taskComments.householdId],
    references: [households.id],
  }),
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id]
  }),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  household: one(households, {
    fields: [meals.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [meals.createdById],
    references: [users.id]
  }),
}));

// === SCHEMAS & TYPES ===

export const insertHouseholdSchema = createInsertSchema(households).omit({ id: true, createdAt: true, joinCode: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, householdId: true });
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, createdAt: true, householdId: true, addedById: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, householdId: true, createdById: true });
export const insertStickyNoteSchema = createInsertSchema(stickyNotes).omit({ id: true, createdAt: true, householdId: true, authorId: true });
export const updateStickyNoteSchema = createInsertSchema(stickyNotes).pick({ content: true, color: true, x: true, y: true }).partial();
export const insertBountySchema = createInsertSchema(bounties).omit({ id: true, createdAt: true, householdId: true, createdById: true, claimedById: true });
export const insertRewardStoreSchema = createInsertSchema(rewardStore).omit({ id: true, createdAt: true, householdId: true, createdById: true });
export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({ id: true, timestamp: true, householdId: true, taskId: true, userId: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true, householdId: true, createdById: true });

export type Household = typeof households.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type Event = typeof events.$inferSelect;
export type StickyNote = typeof stickyNotes.$inferSelect;
export type Bounty = typeof bounties.$inferSelect;
export type RewardStoreItem = typeof rewardStore.$inferSelect;
export type TaskComment = typeof taskComments.$inferSelect;
export type Meal = typeof meals.$inferSelect;

export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertStickyNote = z.infer<typeof insertStickyNoteSchema>;
export type UpdateStickyNote = z.infer<typeof updateStickyNoteSchema>;
export type InsertBounty = z.infer<typeof insertBountySchema>;
export type InsertRewardStore = z.infer<typeof insertRewardStoreSchema>;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
