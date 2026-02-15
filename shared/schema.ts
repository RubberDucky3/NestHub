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
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  tasks: many(tasks),
  shoppingItems: many(shoppingItems),
  events: many(events),
  stickyNotes: many(stickyNotes),
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

export const tasksRelations = relations(tasks, ({ one }) => ({
  household: one(households, {
    fields: [tasks.householdId],
    references: [households.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
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

// === SCHEMAS & TYPES ===

export const insertHouseholdSchema = createInsertSchema(households).omit({ id: true, createdAt: true, joinCode: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, householdId: true });
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, createdAt: true, householdId: true, addedById: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, householdId: true, createdById: true });
export const insertStickyNoteSchema = createInsertSchema(stickyNotes).omit({ id: true, createdAt: true, householdId: true, authorId: true });

export type Household = typeof households.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type Event = typeof events.$inferSelect;
export type StickyNote = typeof stickyNotes.$inferSelect;

export type InsertHousehold = z.infer<typeof insertHouseholdSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertStickyNote = z.infer<typeof insertStickyNoteSchema>;
