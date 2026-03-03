import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { BrainCircuit, Activity, Users, Zap, ShieldAlert, Sparkles } from "lucide-react";

export default function EquityDashboard() {
    const { user } = useAuth();
    const { data: analytics, isLoading } = useQuery<any>({
        queryKey: ["/api/analytics/equity"],
        enabled: !!user?.isSubscribed
    });

    if (!user?.isSubscribed) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="max-w-2xl mx-auto space-y-6 pt-12 text-center">
                    <div className="inline-flex p-4 bg-purple-100 rounded-3xl mb-4">
                        <Activity className="h-12 w-12 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold">The Equity Matrix</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Visualizing the "Invisible Load" requires Pro analytics. See high-resolution distribution of household labor, activity trends, and mental load scores.
                    </p>

                    <Card className="border-purple-200 bg-purple-50/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Pro Feature</span>
                        </div>
                        <CardContent className="pt-8 space-y-4">
                            <p className="font-medium text-lg leading-snug">
                                Upgrade to HomeHub Pro for $4/month to unlock advanced household analytics.
                            </p>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-200 h-12 px-8 text-lg rounded-full"
                                onClick={() => {
                                    fetch('/api/subscription', { method: 'POST' }).then(() => {
                                        window.location.reload();
                                    });
                                }}
                            >
                                Start Your Subscription
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-muted-foreground animate-pulse">Computing household equity matrix...</div>
            </div>
        );
    }

    if (!analytics) return null;

    const COLORS = ['#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899', '#3b82f6'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-500">
                    Mental Load & Equity
                </h1>
                <p className="text-muted-foreground mt-1">
                    Visualizing the invisible work. See how your household shares the load.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {analytics.memberScores.map((member: any) => (
                    <Card key={member.userId} className={`border-t-4 ${member.equityShare > 10 ? 'border-t-teal-500' : 'border-t-muted'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                <span>{member.name}</span>
                                <span className="text-muted-foreground text-sm font-normal">{member.role}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{member.equityShare}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                of household contribution
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <BrainCircuit className="h-4 w-4 text-purple-500" />
                                <span>Score: {member.mentalLoadScore}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contribution Donut */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Household Equity Distribution
                        </CardTitle>
                        <CardDescription>Percentage of chore points completed by member.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.memberScores}
                                        dataKey="equityShare"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                    >
                                        {analytics.memberScores.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value) => `${value}%`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {analytics.memberScores.map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Trend Line */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-teal-600" />
                            Activity Trend (7 Days)
                        </CardTitle>
                        <CardDescription>Total tasks completed per day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => val.substring(5)} // Show MM-DD
                                        fontSize={12}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="totalCompleted"
                                        fill="#14b8a6"
                                        radius={[4, 4, 0, 0]}
                                        name="Tasks Completed"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Mental Load Summary - Full Width */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            Mental Load Snapshot
                        </CardTitle>
                        <CardDescription>A deeper look into the household dynamic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {analytics.memberScores.map((member: any) => (
                                <div key={member.userId} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm font-semibold text-muted-foreground">{member.completedTasks} Tasks / {member.weightedLoad} Pts</div>
                                    </div>
                                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000"
                                            style={{ width: `${Math.min(Math.max(member.equityShare, 5), 100)}%` }} // Minimum 5% to always show something
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
