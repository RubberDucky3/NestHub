import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    Brain,
    Menu,
    ShoppingBag,
    StickyNote,
    Gift,
    Settings,
    LogOut,
    Activity,
    Utensils,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
    const [location] = useLocation();
    const { user, logout } = useAuth();

    const mainNavItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
        { href: "/tasks", icon: CheckSquare, label: "Tasks" },
        { href: "/assistant", icon: Brain, label: "AI" },
        { href: "/calendar", icon: Calendar, label: "Events" },
    ];

    const moreNavItems = [
        { href: "/meals", icon: Utensils, label: "Meals", pro: true },
        { href: "/shopping", icon: ShoppingBag, label: "Shopping" },
        { href: "/notes", icon: StickyNote, label: "Notes" },
        { href: "/rewards", icon: Gift, label: "Rewards" },
        { href: "/equity", icon: Activity, label: "Equity Matrix" },
        { href: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <>
            <div className="md:hidden fixed bottom-[50px] left-0 w-full bg-card border-t border-border flex items-center justify-around px-2 py-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {mainNavItems.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors cursor-pointer",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}

                <Sheet>
                    <SheetTrigger asChild>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground transition-colors cursor-pointer">
                            <Menu className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Menu</span>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[75vh] p-0 z-[60] rounded-t-3xl overflow-hidden flex flex-col">
                        <SheetHeader className="p-6 border-b text-left bg-muted/30">
                            <SheetTitle className="text-2xl font-display">More Options</SheetTitle>
                        </SheetHeader>
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto pb-8">
                            {moreNavItems.map((item) => {
                                const isActive = location === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <SheetTrigger asChild>
                                            <div
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-all cursor-pointer font-medium",
                                                    isActive
                                                        ? "bg-primary/10 text-primary shadow-sm"
                                                        : "hover:bg-muted text-foreground"
                                                )}
                                            >
                                                <div className={cn("p-2 rounded-xl", isActive ? "bg-primary/20" : "bg-muted-foreground/10")}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <span className="text-lg flex-1">{item.label}</span>
                                                {item.pro && !user?.isSubscribed && (
                                                    <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
                                                )}
                                            </div>
                                        </SheetTrigger>
                                    </Link>
                                );
                            })}

                            <div className="my-4 border-t opacity-50" />

                            <div
                                onClick={() => logout()}
                                className="flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-colors cursor-pointer hover:bg-destructive/10 text-destructive font-medium"
                            >
                                <div className="p-2 rounded-xl bg-destructive/10">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                <span className="text-lg">Log Out</span>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
