import { useState } from "react";
import { useCreateBounty } from "@/hooks/use-rewards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function CreateBountyDialog() {
    const [open, setOpen] = useState(false);
    const createBounty = useCreateBounty();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [points, setPoints] = useState("10");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createBounty.mutate({
            title,
            description,
            rewardPoints: parseInt(points) || 10,
        }, {
            onSuccess: () => {
                setOpen(false);
                setTitle("");
                setDescription("");
                setPoints("10");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>New Bounty</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Post a New Bounty</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Deep clean the oven"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Any specific instructions..."
                            className="resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="points">Points Reward</Label>
                        <Input
                            id="points"
                            type="number"
                            min="1"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={createBounty.isPending || !title}
                    >
                        {createBounty.isPending ? "Posting..." : "Post Bounty"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
