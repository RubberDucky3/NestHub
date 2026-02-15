import { Button } from "@/components/ui/button";
import { Check, Sparkles, Heart } from "lucide-react";
import heroImg from "@assets/hero.jpg"; // Placeholder, real usage below

export default function AuthPage() {
  const features = [
    { title: "Shared Tasks", desc: "Gamified chores for the whole family" },
    { title: "Smart Grocery List", desc: "Never forget milk again" },
    { title: "Family Calendar", desc: "Coordinate schedules in one place" },
  ];

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl">HomeHub</span>
          </div>
          <Button onClick={handleLogin}>Log In</Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Your digital family command center
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-foreground">
              Organize your family life <span className="text-primary">in one place</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Coordinate chores, meals, and schedules with a beautiful dashboard designed for modern families.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 h-14" onClick={handleLogin}>
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                View Demo
              </Button>
            </div>
            
            <div className="space-y-4 pt-8 border-t border-border">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{f.title}:</span>
                  <span className="text-muted-foreground">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full" />
             {/* landscape family scenic - Unsplash */}
             <img 
               src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&h=1200&fit=crop"
               alt="Happy family using tablet"
               className="relative rounded-3xl shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-all duration-500"
             />
          </div>
        </div>
      </main>
    </div>
  );
}
