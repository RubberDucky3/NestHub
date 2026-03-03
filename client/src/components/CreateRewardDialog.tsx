import { useState } from "react";
import { useCreateReward } from "@/hooks/use-rewards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function CreateRewardDialog() {
    const [open, setOpen] = useState(false);
    const createReward = useCreateReward();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("50");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createReward.mutate({
            title,
            description,
            costInPoints: parseInt(cost) || 50,
        }, {
            onSuccess: () => {
                setOpen(false);
                setTitle("");
                setDescription("");
                setCost("50");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span>Add Reward</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Reward to Store</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Reward Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Choose Friday Movie"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Details about this reward..."
                            className="resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cost">Point Cost</Label>
                        <Input
                            id="cost"
                            type="number"
                            min="1"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={createReward.isPending || !title}
                    >
                        {createReward.isPending ? "Adding..." : "Add to Store"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
