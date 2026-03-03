import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Calendar, User as UserIcon, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { type Task } from "@shared/schema";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [selectedTask, setSelectedTask] = useState<(Task & { assignedTo: any }) | null>(null);

  if (isLoading) return <div className="p-8">Loading tasks...</div>;

  const incompleteTasks = tasks?.filter(t => !t.completed) || [];
  const completedTasks = tasks?.filter(t => t.completed) || [];

  const handleToggle = (id: number, currentStatus: boolean | null, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate({ id, completed: !currentStatus });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tasks & Chores</h1>
          <p className="text-muted-foreground">Keep the house running smoothly.</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="grid gap-4">
        {/* Active Tasks */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            To Do <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{incompleteTasks.length}</span>
          </h2>
          {incompleteTasks.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
              No pending tasks. Relax! 🎉
            </div>
          )}
          {incompleteTasks.map((task) => (
            <Card
              key={task.id}
              className="group hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer hover:border-primary/70"
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox
                  checked={!!task.completed}
                  onCheckedChange={(checked) => handleToggle(task.id, task.completed, { stopPropagation: () => { } } as React.MouseEvent)}
                  onClick={(e) => handleToggle(task.id, task.completed, e)}
                  className="h-6 w-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-none mb-1">{task.title}</h3>
                  {task.description && <p className="text-sm text-muted-foreground truncate">{task.description}</p>}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {task.assignedTo && (
                      <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        <UserIcon className="h-3 w-3" />
                        <span className="font-medium">{task.assignedTo.firstName}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <MessageSquare className="h-3 w-3" />
                      <span>Comments</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold bg-accent/10 text-accent px-3 py-1 rounded-full whitespace-nowrap">
                    {task.points} pts
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(task.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3 mt-8">
            <h2 className="text-lg font-semibold text-muted-foreground">Completed</h2>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <Checkbox
                  checked={!!task.completed}
                  onCheckedChange={(checked) => handleToggle(task.id, task.completed, { stopPropagation: () => { } } as React.MouseEvent)}
                  onClick={(e) => handleToggle(task.id, task.completed, e)}
                />
                <span className="line-through flex-1">{task.title}</span>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 opacity-50" />
                  <span className="text-xs font-medium">{task.points} pts</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(task.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
