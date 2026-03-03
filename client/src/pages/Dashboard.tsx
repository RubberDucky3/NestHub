import { useHousehold } from "@/hooks/use-households";
import { useTasks } from "@/hooks/use-tasks";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckCircle2, Trophy, ShoppingCart, Loader2, Sparkles, CheckSquare, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useAIBriefing } from "@/hooks/use-ai";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: household } = useHousehold();
  const { data: tasks } = useTasks();
  const { data: events } = useEvents();
  const { data: briefing, isLoading: isAiLoading, error: aiError } = useAIBriefing();

  const isSubscribed = user?.isSubscribed;

  // Stats calculation
  const pendingTasks = tasks?.filter(t => !t.completed && t.assignedToId === user?.id) || [];
  const todayEvents = events?.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.startTime);
    return eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear();
  }) || [];

  const householdPoints = household?.members?.reduce((sum, member) => sum + (member.totalPoints || 0), 0) || 0;
  const myPoints = user?.totalPoints || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold">Good Morning, {user?.firstName}! ☀️</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening in the {household?.name} household today.</p>
      </header>

      {/* AI Executive Summary Injection */}
      <Card className="border-purple-500/20 shadow-xl shadow-purple-500/5 bg-gradient-to-br from-card to-purple-50/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="p-4 bg-purple-500/10 rounded-2xl shrink-0">
              {isAiLoading ? (
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              ) : (
                <Sparkles className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              {!isSubscribed ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800 font-display">
                      Unlock AI Household Intelligence
                    </h3>
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Get personalized daily briefings, smart scheduling suggestions, and a fully automated meal planner for just $4/month.
                  </p>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 border-none group/btn"
                    size="sm"
                    onClick={() => {
                      fetch('/api/subscription', { method: 'POST' }).then(() => {
                        window.location.reload();
                      });
                    }}
                  >
                    Upgrade to HomeHub Pro <Sparkles className="ml-2 h-3.5 w-3.5 group-hover/btn:animate-pulse" />
                  </Button>
                </div>
              ) : isAiLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-6 bg-purple-500/20 rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-purple-700 mb-2 font-display">
                    {briefing?.greeting || "AI Intelligence Online"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {briefing?.summary || "Your household data is fully synchronized and ready for analysis."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Detailed AI Intelligence Sections injected into Dashboard */}
          {!isAiLoading && briefing && isSubscribed && (
            <div className="mt-8 pt-8 border-t border-purple-500/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
              {/* Urgent Tasks Array */}
              <Card className="border-border/50 shadow-md bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckSquare className="h-5 w-5 text-teal-500" /> Urgent Priorities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {briefing.urgentTasks && briefing.urgentTasks.length > 0 ? (
                    <div className="space-y-3">
                      {briefing.urgentTasks.map((t: any, i: number) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center border border-border/50">
                          <div>
                            <p className="font-medium text-sm">{t.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Assigned to: <span className="font-bold text-foreground">{t.assignedTo}</span></p>
                          </div>
                          <div className="bg-yellow-500/10 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                            {t.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground bg-muted/20 border border-dashed rounded-lg">
                      No urgent tasks detected. Great job!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Suggested Tasks based on Schedule Gaps */}
              <Card className="border-purple-500/30 shadow-md bg-purple-500/5 backdrop-blur-sm md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
                    <Lightbulb className="h-5 w-5" /> Smart Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {briefing.suggestedTasks && briefing.suggestedTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {briefing.suggestedTasks.map((t: any, i: number) => (
                        <div key={i} className="p-4 bg-background/80 rounded-xl border border-purple-500/20 shadow-sm">
                          <p className="font-bold text-foreground mb-1">{t.title}</p>
                          <p className="text-sm text-purple-700/80 leading-snug">{t.timeReason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground bg-muted/20 border border-dashed rounded-lg">
                      Your schedule looks packed! No extra tasks suggested.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gamification & Economics */}
              <div className="space-y-6">
                <Card className="border-border/50 shadow-md bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
                      <Trophy className="h-5 w-5" /> Bounty Spotlight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">"{briefing.bountyHighlight}"</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-md bg-background/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
                      <ShoppingCart className="h-5 w-5" /> Supply Chain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <p className="text-muted-foreground">Pending Shopping Items</p>
                    <div className="text-3xl font-bold text-blue-600 font-display">
                      {briefing.shoppingNeeded}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">My Pending Tasks</p>
                <h3 className="text-2xl font-bold font-display">{pendingTasks.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Events Today</p>
                <h3 className="text-2xl font-bold font-display">{todayEvents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">My Points</p>
                <h3 className="text-2xl font-bold font-display text-yellow-600">{myPoints}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 text-accent rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Household Points</p>
                <h3 className="text-2xl font-bold font-display">{householdPoints}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Activity / Today's Schedule */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events scheduled for today.
              </div>
            ) : (
              <div className="space-y-4">
                {todayEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold text-primary">{format(new Date(event.startTime), 'h:mm a')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/calendar" className="text-sm text-primary hover:underline font-medium">View Full Calendar</Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tasks */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                <p>All caught up! Great job.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                      {task.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/tasks" className="text-sm text-primary hover:underline font-medium">Manage Tasks</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
