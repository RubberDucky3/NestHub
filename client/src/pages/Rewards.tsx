import { useAuth } from "@/hooks/use-auth";
import { useBounties, useClaimBounty, useRewardStore, usePurchaseReward } from "@/hooks/use-rewards";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateBountyDialog } from "@/components/CreateBountyDialog";
import { CreateRewardDialog } from "@/components/CreateRewardDialog";
import { Award, Gift, CheckCircle, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Rewards() {
    const { user } = useAuth();
    const { data: bounties, isLoading: isLoadingBounties } = useBounties();
    const { data: rewards, isLoading: isLoadingRewards } = useRewardStore();

    const claimBounty = useClaimBounty();
    const purchaseReward = usePurchaseReward();

    const availableBounties = bounties?.filter(b => b.status === "open") || [];
    const claimedBounties = bounties?.filter(b => b.status === "claimed") || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">Rewards & Bounties</h1>
                    <p className="text-muted-foreground">Complete bounties to earn points, then spend them on rewards!</p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-lg">
                    <Coins className="h-5 w-5" />
                    {user?.totalPoints || 0} pts
                </div>
            </div>

            <Tabs defaultValue="bounties" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="bounties" className="gap-2">
                        <Award className="h-4 w-4" /> Bounties
                    </TabsTrigger>
                    <TabsTrigger value="store" className="gap-2">
                        <Gift className="h-4 w-4" /> Reward Store
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bounties" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Available Bounties</h2>
                        <CreateBountyDialog />
                    </div>

                    {isLoadingBounties ? (
                        <div className="text-muted-foreground">Loading bounties...</div>
                    ) : availableBounties.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                            No active bounties right now.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {availableBounties.map((bounty) => (
                                <Card key={bounty.id} className="flex flex-col border-l-4 border-l-yellow-400 border-yellow-400/20 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg leading-tight">{bounty.title}</CardTitle>
                                            <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                                                +{bounty.rewardPoints} pts
                                            </span>
                                        </div>
                                        {bounty.description && <CardDescription>{bounty.description}</CardDescription>}
                                    </CardHeader>
                                    <CardFooter className="mt-auto">
                                        <Button
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                            onClick={() => claimBounty.mutate(bounty.id)}
                                            disabled={claimBounty.isPending}
                                        >
                                            {claimBounty.isPending ? "Claiming..." : "Claim Bounty"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {claimedBounties.length > 0 && (
                        <div className="pt-8">
                            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Recently Claimed</h3>
                            <div className="grid gap-2">
                                {claimedBounties.map(bounty => (
                                    <div key={bounty.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border text-muted-foreground text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="font-medium line-through">{bounty.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">Claimed by {bounty.claimedBy?.firstName}</span>
                                            <span className="font-bold text-green-600">+{bounty.rewardPoints} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="store" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Reward Store</h2>
                        <CreateRewardDialog />
                    </div>

                    {isLoadingRewards ? (
                        <div className="text-muted-foreground">Loading store...</div>
                    ) : rewards?.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                            The reward store is empty. Add some prizes!
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {rewards?.map((reward) => (
                                <Card key={reward.id} className="flex flex-col border-l-4 border-l-purple-500 border-purple-500/20 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg leading-tight flex items-center gap-2">
                                                <Gift className="h-5 w-5 text-purple-500" />
                                                {reward.title}
                                            </CardTitle>
                                            <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                                                -{reward.costInPoints} pts
                                            </span>
                                        </div>
                                        {reward.description && <CardDescription>{reward.description}</CardDescription>}
                                    </CardHeader>
                                    <CardFooter className="mt-auto">
                                        <Button
                                            variant="secondary"
                                            className="w-full text-purple-700 bg-purple-100 hover:bg-purple-200"
                                            onClick={() => purchaseReward.mutate(reward.id)}
                                            disabled={purchaseReward.isPending || (user?.totalPoints || 0) < reward.costInPoints}
                                        >
                                            {purchaseReward.isPending ? "Purchasing..." : "Purchase Reward"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
