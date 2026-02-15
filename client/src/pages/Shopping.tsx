import { useShoppingList, useCreateShoppingItem, useUpdateShoppingItem, useDeleteShoppingItem } from "@/hooks/use-shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Shopping() {
  const { data: items, isLoading } = useShoppingList();
  const createItem = useCreateShoppingItem();
  const updateItem = useUpdateShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  
  const [newItemName, setNewItemName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    createItem.mutate({ name: newItemName }, {
      onSuccess: () => setNewItemName("")
    });
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateItem.mutate({ id, completed: !completed });
  };

  if (isLoading) return <div className="p-8">Loading list...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold flex items-center justify-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Shopping List
        </h1>
        <p className="text-muted-foreground">Collaborative list for groceries and supplies.</p>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <Input 
          placeholder="Add an item (e.g. Milk, Eggs, Lightbulbs)..." 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="h-12 text-lg shadow-sm"
        />
        <Button type="submit" size="lg" className="h-12 px-6" disabled={createItem.isPending}>
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {items?.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <p>Your list is empty. Time to stock up!</p>
          </div>
        )}
        
        <div className="divide-y divide-border">
          {items?.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "group flex items-center justify-between p-4 transition-colors hover:bg-muted/30",
                item.completed && "bg-muted/10"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <Checkbox 
                  checked={!!item.completed} 
                  onCheckedChange={() => handleToggle(item.id, !!item.completed)}
                  className="h-5 w-5 rounded-full"
                />
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-lg transition-all",
                    item.completed && "text-muted-foreground line-through decoration-muted-foreground/50"
                  )}>
                    {item.name}
                  </span>
                  {item.addedBy && (
                    <span className="text-xs text-muted-foreground">
                      Added by {item.addedBy.firstName}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                onClick={() => deleteItem.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
