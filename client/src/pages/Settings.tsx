import { useHousehold } from "@/hooks/use-households";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Users, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: household } = useHousehold();
  const { toast } = useToast();

  const copyCode = () => {
    if (household?.joinCode) {
      navigator.clipboard.writeText(household.joinCode);
      toast({ title: "Copied!", description: "Invite code copied to clipboard." });
    }
  };

  if (!household) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Household Settings</h1>
        <p className="text-muted-foreground">Manage your family group.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>Share this code with family members to let them join.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
            <code className="text-3xl font-mono font-bold tracking-widest flex-1 text-center">
              {household.joinCode}
            </code>
            <Button variant="outline" size="icon" onClick={copyCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            This code is unique to the <strong>{household.name}</strong> household.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {household.members?.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profileImageUrl} />
                    <AvatarFallback>{member.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-bold uppercase">
                  Member
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="pt-8 border-t">
        <Button variant="destructive" className="w-full sm:w-auto">
          <LogOut className="h-4 w-4 mr-2" />
          Leave Household
        </Button>
      </div>
    </div>
  );
}
