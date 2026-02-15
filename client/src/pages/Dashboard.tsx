import { useHousehold } from "@/hooks/use-households";
import { useTasks } from "@/hooks/use-tasks";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: household } = useHousehold();
  const { data: tasks } = useTasks();
  const { data: events } = useEvents();

  // Stats calculation
  const pendingTasks = tasks?.filter(t => !t.completed && t.assignedToId === user?.id) || [];
  const todayEvents = events?.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.startTime);
    return eventDate.getDate() === today.getDate() && 
           eventDate.getMonth() === today.getMonth() && 
           eventDate.getFullYear() === today.getFullYear();
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-display font-bold">Good Morning, {user?.firstName}! ☀️</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening in the {household?.name} household today.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
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

        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 text-accent rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Household Points</p>
                <h3 className="text-2xl font-bold font-display">1,240</h3>
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
