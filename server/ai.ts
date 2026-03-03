import OpenAI from "openai";
import { storage } from "./storage";

// Initialize OpenAI to explicitly target the local Ollama daemon
const openai = new OpenAI({
    baseURL: 'http://127.0.0.1:11434/v1',
    apiKey: 'ollama', // required but unused
});

export async function handleChatMessage(householdId: number, userId: string, message: string): Promise<string> {

    try {
        // Gather full household context
        const members = await storage.getHouseholdMembers(householdId);

        // We only need active, pending tasks for the household
        const tasks = await storage.getTasks(householdId);
        const activeTasks = tasks.filter((t: any) => !t.completed);

        // We get bounties, events, and shopping items
        const bounties = await storage.getBounties(householdId);
        const openBounties = bounties.filter((b: any) => b.status === "open");

        const events = await storage.getEvents(householdId);

        const shoppingItems = await storage.getShoppingItems(householdId);
        const activeShopping = shoppingItems.filter((s: any) => !s.completed);

        const user = members.find((m: any) => m.id === userId);
        const userName = user?.firstName || user?.email || "User";

        // Format the context nicely
        const membersList = members.map((m: any) =>
            `- ${m.firstName || "Unknown"} (Role: ${m.role}, Points: ${m.totalPoints}, Mental Load: ${m.mentalLoadScore})`
        ).join("\n");

        const tasksList = activeTasks.map((t: any) => {
            const assignee = members.find((m: any) => m.id === t.assignedToId);
            const assignedName = assignee?.firstName || "Unassigned";
            return `- ${t.title} (${t.points} pts, Assigned to: ${assignedName})`;
        }).join("\n");

        const bountiesList = openBounties.map((b: any) =>
            `- ${b.title} (${b.rewardPoints} pts)`
        ).join("\n");

        const shoppingList = activeShopping.map((s: any) =>
            `- ${s.name}`
        ).join("\n");

        const eventsList = events.map((e: any) =>
            `- ${e.title} at ${new Date(e.startTime).toLocaleString()}`
        ).join("\n");

        // Construct the System Prompt
        const systemPrompt = `You are the core intelligence engine for the HomeHub household management application.
Your goal is to analyze the raw household data and generate a structured JSON briefing for the user. Do NOT write conversational text, markdown, or pleasantries. Output STRICTLY JSON matching this schema:

{
  "greeting": "A very short 1-sentence personalized greeting.",
  "summary": "A 1-sentence summary of the current household state.",
  "urgentTasks": [
    { "title": "Task name", "assignedTo": "Name or Unassigned", "points": 10 }
  ],
  "suggestedTasks": [
    { "title": "Invented chore/activity", "timeReason": "Why this fits in the schedule (e.g. 'Since nothing is scheduled Saturday morning')" }
  ],
  "bountyHighlight": "A 1-sentence highlight of the most valuable open bounty.",
  "shoppingNeeded": 3 // Total number of pending unpurchased items
}

You are generating this for: ${userName}.

VOCABULARY FOR HOMEHUB:
* "Tasks": Mandatory daily chores assigned to a specific person for points.
* "Bounties": Optional open chores that anyone can claim to earn extra points.
* "Events": Calendar appointments with a date and time.
* "Shopping": Items that need to be purchased from the store.

Here is the current LIVE pending data for the household (Completed items are hidden):

HOUSEHOLD MEMBERS:
${membersList}

TASKS:
${tasksList}

OPEN BOUNTIES (Extra chores for points):
${bountiesList}

SHOPPING LIST:
${shoppingList}

UPCOMING EVENTS:
${eventsList}
(CRITICAL: Look at these Events to find gaps in the schedule. Invent 2 'suggestedTasks' that could be done during those free times.)

CRITICAL: Return ONLY valid JSON. Your entire response must start with { and end with }.`;

        const response = await openai.chat.completions.create({
            model: "llama3.2:latest", // Cost-effective local model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate my daily briefing JSON." }
            ],
            temperature: 0.1, // Very low temperature for structured output stability
            response_format: { type: "json_object" },
            max_tokens: 800,
        });

        return response.choices[0].message?.content || JSON.stringify({ greeting: "AI Error", summary: "I'm sorry, I couldn't formulate a response." });
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return JSON.stringify({
            greeting: "AI Offline",
            summary: "I encountered an error connecting to my brain. Please try again later.",
            urgentTasks: [],
            bountyHighlight: "N/A",
            shoppingNeeded: 0
        });
    }
}
