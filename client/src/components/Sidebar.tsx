import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingBag,
  Calendar,
  StickyNote,
  Gift,
  Settings,
  LogOut,
  Home,
  Activity,
  Brain,
  Utensils,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-households";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: household } = useHousehold();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/shopping", icon: ShoppingBag, label: "Shopping" },
    { href: "/notes", icon: StickyNote, label: "Notes" },
    { href: "/meals", icon: Utensils, label: "Meals", pro: true },
    { href: "/rewards", icon: Gift, label: "Rewards" },
    { href: "/equity", icon: Activity, label: "Equity Matrix" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 bg-card border-r border-border flex-col fixed left-0 top-0 z-50 pb-[50px]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-tight">HomeHub</h1>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
              {household?.name || "Family Dashboard"}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer relative group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-secondary")} />
                  <span className="flex-1">{item.label}</span>
                  {item.pro && !user?.isSubscribed && (
                    <span className="bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Pro</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-6 mb-4">
        {!user?.isSubscribed && (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white text-xs py-5 rounded-2xl shadow-lg shadow-purple-100 group/pro"
            onClick={() => {
              fetch('/api/subscription', { method: 'POST' }).then(() => {
                window.location.reload();
              });
            }}
          >
            <Sparkles className="mr-2 h-4 w-4 group-hover/pro:animate-bounce" />
            Upgrade to Pro
          </Button>
        )}
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate uppercase tracking-wider font-bold">{user?.role || "Member"}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
