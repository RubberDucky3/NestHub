import { useState } from "react";
import { type Task } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTaskComments, useCreateTaskComment } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export function TaskDetailsDialog({
    task,
    open,
    onOpenChange
}: {
    task: any | null,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const { data: comments, isLoading } = useTaskComments(task?.id || 0);
    const createComment = useCreateTaskComment();

    if (!task) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        createComment.mutate({
            taskId: task.id,
            content: comment.trim()
        }, {
            onSuccess: () => setComment("")
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{task.title}</DialogTitle>
                    {task.description && (
                        <DialogDescription className="text-base mt-2">
                            {task.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div>
                        <span className="font-semibold block">Points</span>
                        <span className="text-primary font-bold">{task.points} pts</span>
                    </div>
                    <div>
                        <span className="font-semibold block">Assigned To</span>
                        <span>{task.assignedTo ? task.assignedTo.firstName : "Unassigned"}</span>
                    </div>
                    {task.dueDate && (
                        <div>
                            <span className="font-semibold block">Due Date</span>
                            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col mt-4 min-h-[300px]">
                    <h3 className="font-semibold text-sm mb-3">Comments & Activity</h3>

                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        {isLoading ? (
                            <div className="text-center text-sm text-muted-foreground py-4">Loading comments...</div>
                        ) : comments?.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg bg-muted/20">
                                No comments yet. Be the first!
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {comments?.map((c: any) => (
                                    <div key={c.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8 mt-0.5">
                                            <AvatarImage src={c.user?.profileImageUrl || undefined} />
                                            <AvatarFallback>{c.user?.firstName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-muted/40 p-3 rounded-xl rounded-tl-none">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-sm font-semibold">{c.user?.firstName} {c.user?.lastName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(c.createdAt || Date.now()), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t flex gap-2">
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[60px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={!comment.trim() || createComment.isPending}
                        className="h-auto"
                    >
                        Post
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
