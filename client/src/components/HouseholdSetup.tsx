import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateHousehold, useJoinHousehold } from "@/hooks/use-households";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";

const createSchema = z.object({ name: z.string().min(3, "Name is too short") });
const joinSchema = z.object({ joinCode: z.string().length(6, "Code must be 6 characters") });

export function HouseholdSetup() {
  const { toast } = useToast();
  const createMutation = useCreateHousehold();
  const joinMutation = useJoinHousehold();

  const createForm = useForm<{ name: string }>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" }
  });

  const joinForm = useForm<{ joinCode: string }>({
    resolver: zodResolver(joinSchema),
    defaultValues: { joinCode: "" }
  });

  const onCreate = (data: { name: string }) => {
    createMutation.mutate(data, {
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const onJoin = (data: { joinCode: string }) => {
    joinMutation.mutate(data.joinCode, {
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
            <Home className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display">Welcome to HomeHub!</h1>
          <p className="text-muted-foreground">To get started, create a new household or join an existing one.</p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="join">Join Existing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Household</CardTitle>
                <CardDescription>Start a new digital home for your family.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Household Name</FormLabel>
                          <FormControl>
                            <Input placeholder="The Smith Family" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Household"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join Household</CardTitle>
                <CardDescription>Enter the 6-character code shared by your family.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...joinForm}>
                  <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-4">
                    <FormField
                      control={joinForm.control}
                      name="joinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invite Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC123" {...field} className="uppercase tracking-widest text-center text-lg" maxLength={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={joinMutation.isPending}>
                      {joinMutation.isPending ? "Joining..." : "Join Household"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
