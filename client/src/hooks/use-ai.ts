import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type AIBriefing = {
    greeting: string;
    summary: string;
    urgentTasks: Array<{ title: string; assignedTo: string; points: number }>;
    suggestedTasks?: Array<{ title: string; timeReason: string }>;
    bountyHighlight: string;
    shoppingNeeded: number;
};

export function useAIBriefing() {
    return useQuery<AIBriefing>({
        queryKey: ["/api/ai-briefing"],
        queryFn: async () => {
            const res = await apiRequest("POST", "/api/chat", { message: "Generate briefing" });
            const data = await res.json();

            // Attempt to parse the structured JSON from Ollama
            // Some local models accidentally wrap the response in markdown blocks matching ```json\n
            let rawJson = data.reply.trim();
            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.replace(/^```json\n?/, "").replace(/```$/, "").trim();
            } else if (rawJson.startsWith("```")) {
                rawJson = rawJson.replace(/^```\n?/, "").replace(/```$/, "").trim();
            }

            return JSON.parse(rawJson);
        },
        staleTime: 1000 * 60 * 5, // Cache the AI output for 5 minutes unless manually invalidated by data mutations
        refetchOnWindowFocus: false // Prevent aggressive refetches against the local AI
    });
}
