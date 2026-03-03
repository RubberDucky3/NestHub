import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { handleChatMessage } from "./ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get household ID or throw 401/404
  const requireHousehold = async (req: any, res: any) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ message: "Unauthorized" });
      return null;
    }
    const householdId = await storage.getHouseholdIdForUser(req.user.id);
    if (!householdId) {
      res.status(404).json({ message: "User not in a household" });
      return null;
    }
    return householdId;
  };

  // === HOUSEHOLDS ===

  app.post(api.households.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { name } = api.households.create.input.parse(req.body);
      const household = await storage.createHousehold(req.user.id, name);
      res.status(201).json(household);

      // Seed data for new household
      await storage.createTask(household.id, { title: "Welcome to HomeHub!", description: "Try creating your first task.", points: 10 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.households.join.path, isAuthenticated, async (req: any, res) => {
    try {
      const { joinCode } = api.households.join.input.parse(req.body);
      const household = await storage.joinHousehold(req.user.id, joinCode);
      if (!household) {
        res.status(404).json({ message: "Household not found or invalid code" });
        return;
      }
      res.json(household);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.households.get.path, isAuthenticated, async (req: any, res) => {
    const household = await storage.getHouseholdByUserId(req.user.id);
    if (!household) {
      res.status(404).json({ message: "Not in a household" });
      return;
    }
    res.json(household);
  });

  // === TASKS ===

  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const tasks = await storage.getTasks(householdId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(householdId, input);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.tasks.update.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      res.json(task);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    await storage.deleteTask(Number(req.params.id));
    res.status(204).end();
  });

  // === SHOPPING ===

  app.get(api.shopping.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const items = await storage.getShoppingItems(householdId);
    res.json(items);
  });

  app.post(api.shopping.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.shopping.create.input.parse(req.body);
      const item = await storage.createShoppingItem(householdId, { ...input, addedById: req.user.id } as any);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.shopping.update.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.shopping.update.input.parse(req.body);
      const item = await storage.updateShoppingItem(Number(req.params.id), input);
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.shopping.delete.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    await storage.deleteShoppingItem(Number(req.params.id));
    res.status(204).end();
  });

  // === EVENTS ===

  app.get(api.events.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const events = await storage.getEvents(householdId);
    res.json(events);
  });

  app.post(api.events.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent(householdId, { ...input, createdById: req.user.id } as any);
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.events.delete.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).end();
  });

  // === NOTES ===

  app.get(api.notes.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const notes = await storage.getStickyNotes(householdId);
    res.json(notes);
  });

  app.post(api.notes.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createStickyNote(householdId, { ...input, authorId: req.user.id } as any);
      res.status(201).json(note);
    } catch (err) {
      console.error("Failed to create note:", err);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.notes.delete.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    await storage.deleteStickyNote(Number(req.params.id));
    res.status(204).end();
  });

  app.patch(api.notes.update.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.notes.update.input.parse(req.body);
      const note = await storage.updateStickyNote(Number(req.params.id), input);
      res.json(note);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === BOUNTIES ===
  app.get(api.bounties.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const items = await storage.getBounties(householdId);
    res.json(items);
  });

  app.post(api.bounties.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.bounties.create.input.parse(req.body);
      const bounty = await storage.createBounty(householdId, req.user.id, input);
      res.status(201).json(bounty);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.bounties.claim.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const bounty = await storage.claimBounty(householdId, Number(req.params.id), req.user.id);
      if (!bounty) {
        return res.status(404).json({ message: "Bounty not found or invalid" });
      }
      res.json(bounty);
    } catch (err) {
      res.status(400).json({ message: "Invalid claim" });
    }
  });

  // === REWARD STORE ===
  app.get(api.rewards.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const items = await storage.getRewardStoreItems(householdId);
    res.json(items);
  });

  app.post(api.rewards.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.rewards.create.input.parse(req.body);
      const reward = await storage.createRewardStoreItem(householdId, req.user.id, input);
      res.status(201).json(reward);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rewards.purchase.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const { rewardId } = api.rewards.purchase.input.parse(req.body);
      const result = await storage.purchaseReward(householdId, rewardId, req.user.id);
      if (!result) {
        return res.status(400).json({ message: "Not enough points or invalid request" });
      }
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: "Invalid purchase" });
    }
  });

  // === TASK COMMENTS ===
  app.get(api.taskComments.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const comments = await storage.getTaskComments(householdId, Number(req.params.id));
    res.json(comments);
  });

  app.post(api.taskComments.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.taskComments.create.input.parse(req.body);
      const comment = await storage.createTaskComment(householdId, Number(req.params.id), req.user.id, input);
      res.status(201).json(comment);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === MEALS ===
  app.get(api.meals.list.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    const meals = await storage.getMeals(householdId);
    res.json(meals);
  });

  app.post(api.meals.create.path, isAuthenticated, async (req: any, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const input = api.meals.create.input.parse(req.body);
      const meal = await storage.createMeal(householdId, req.user.id, input);
      res.status(201).json(meal);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.meals.delete.path, isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    await storage.deleteMeal(Number(req.params.id));
    res.status(204).end();
  });

  // === ANALYTICS ===
  app.get('/api/analytics/equity', isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;
    try {
      const analytics = await storage.getMentalLoadAnalytics(householdId);
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // === SUBSCRIPTIONS ===
  app.get(api.subscription.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const status = await storage.getSubscriptionStatus(req.user.id);
      res.json(status);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post(api.subscription.create.path, isAuthenticated, async (req: any, res) => {
    try {
      // In a real app, this is where you'd verify a Stripe payment token
      const status = await storage.createSubscription(req.user.id);
      res.json(status);
    } catch (err) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // === AI ASSISTANT ===
  app.post('/api/chat', isAuthenticated, async (req, res) => {
    const householdId = await requireHousehold(req, res);
    if (!householdId) return;

    // AI GATE: Check for active subscription
    const status = await storage.getSubscriptionStatus((req.user as any).id);
    if (!status.isSubscribed) {
      return res.status(403).json({ message: "Subscription required for AI features" });
    }

    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message" });
      }
      const reply = await handleChatMessage(householdId, (req.user as any).id, message);
      res.json({ reply });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  return httpServer;
}
