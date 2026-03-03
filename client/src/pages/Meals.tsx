import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMeals, useCreateMeal, useDeleteMeal } from "@/hooks/use-meals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Utensils, Calendar as CalendarIcon, Clock, Trash2,
    Sparkles, ChefHat, Loader2, Plus
} from "lucide-react";
import { format } from "date-fns";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function Meals() {
    const { user } = useAuth();
    const { data: meals, isLoading } = useMeals();
    const createMeal = useCreateMeal();
    const deleteMeal = useDeleteMeal();

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prepTime, setPrepTime] = useState("30");

    const generateAIMeal = async () => {
        if (!user?.isSubscribed) return;
        setIsAiLoading(true);
        try {
            // 1. Call the AI backend router to hallucinate a meal
            const res = await apiRequest("POST", "/api/chat", {
                message: "Suggest a healthy, easy-to-cook family dinner recipe. Return ONLY valid JSON: { \"title\": \"Recipe Name\", \"description\": \"Brief description and core ingredients\", \"prepTimeMins\": 30 }"
            });
            const data = await res.json();

            let rawJson = data.reply.trim();
            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.replace(/^```json\n?/, "").replace(/```$/, "").trim();
            } else if (rawJson.startsWith("```")) {
                rawJson = rawJson.replace(/^```\n?/, "").replace(/```$/, "").trim();
            }

            const suggestedMeal = JSON.parse(rawJson);

            // 2. Immediately inject the AI hallucination into the Postgres database
            createMeal.mutate({
                title: suggestedMeal.title || "AI Mystery Meal",
                description: suggestedMeal.description || "The AI thought of something abstract",
                prepTimeMins: suggestedMeal.prepTimeMins || 45,
                plannedDate: new Date(),
            });

        } catch (err) {
            console.error("AI Generation failed:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleManualCreate = () => {
        if (!title.trim()) return;
        createMeal.mutate({
            title,
            description,
            prepTimeMins: parseInt(prepTime) || 30,
            plannedDate: new Date()
        }, {
            onSuccess: () => {
                setOpen(false);
                setTitle("");
                setDescription("");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <Utensils className="h-8 w-8 text-primary" />
                        AI Meal Planner
                    </h1>
                    <p className="text-muted-foreground mt-2">Generate recipes and coordinate family cooking.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={generateAIMeal}
                        disabled={isAiLoading || !user?.isSubscribed}
                        className={cn(
                            "flex-1 md:flex-none gap-2 text-white shadow-lg shadow-purple-500/10 transition-all",
                            user?.isSubscribed
                                ? "bg-purple-600 hover:bg-purple-700 active:scale-95"
                                : "bg-slate-400 grayscale cursor-not-allowed"
                        )}
                    >
                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {user?.isSubscribed ? "Auto-Generate Recipe" : "Unlock AI Recipes (Pro)"}
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Manual
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Custom Meal</DialogTitle>
                                <DialogDescription>Plan a dinner for the family calendar.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Recipe Name</label>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spaghetti Bolognese" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Main ingredients and notes..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prep Time (mins)</label>
                                    <Input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleManualCreate} disabled={createMeal.isPending}>Save Meal</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && (
                    <div className="col-span-full py-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && meals?.length === 0 && (
                    <div className="col-span-full border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-3 bg-muted/10">
                        <ChefHat className="h-12 w-12 opacity-50" />
                        <p className="font-medium text-lg text-foreground">No meals planned yet</p>
                        <p className="max-w-sm mx-auto">Click "Auto-Generate Recipe" to let the local AI hallucinate a family dinner for tonight.</p>
                    </div>
                )}

                {meals?.map((meal) => (
                    <Card key={meal.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-2 border-transparent hover:border-border">
                        {meal.aiGenerated && (
                            <div className="absolute top-0 right-0 p-3 pt-4 -mt-2 -mr-2 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-3xl">
                                <Sparkles className="h-5 w-5 text-purple-600 drop-shadow-sm" />
                            </div>
                        )}

                        <CardHeader className="pb-3">
                            <CardTitle className="pr-8 leading-tight group-hover:text-primary transition-colors">
                                {meal.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                                {meal.description || "No description provided."}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2 py-1 rounded-md">
                                        <Clock className="h-3.5 w-3.5" />
                                        {meal.prepTimeMins || 0}m
                                    </div>
                                    {meal.plannedDate && (
                                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            {format(new Date(meal.plannedDate), "MMM d")}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteMeal.mutate(meal.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
