import { useStickyNotes, useCreateStickyNote, useDeleteStickyNote } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Notes() {
  const { data: notes, isLoading } = useStickyNotes();
  const createNote = useCreateStickyNote();
  const deleteNote = useDeleteStickyNote();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [open, setOpen] = useState(false);

  const colors = [
    { id: 'yellow', class: 'bg-yellow-100 border-yellow-200 text-yellow-900 hover:bg-yellow-200' },
    { id: 'blue', class: 'bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200' },
    { id: 'pink', class: 'bg-pink-100 border-pink-200 text-pink-900 hover:bg-pink-200' },
    { id: 'green', class: 'bg-green-100 border-green-200 text-green-900 hover:bg-green-200' },
  ];

  const handleCreate = () => {
    if (!newNoteContent.trim()) return;
    createNote.mutate({ content: newNoteContent, color: selectedColor }, {
      onSuccess: () => {
        setNewNoteContent("");
        setOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Sticky Notes</h1>
          <p className="text-muted-foreground">Reminders and messages for the fridge.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
               <Plus className="h-4 w-4" /> New Note
             </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Sticky Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea 
                placeholder="Type your message here..." 
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="min-h-[150px] text-lg resize-none"
              />
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c.id}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      c.class,
                      selectedColor === c.id ? "ring-2 ring-offset-2 ring-primary border-transparent" : "border-transparent"
                    )}
                    onClick={() => setSelectedColor(c.id)}
                  />
                ))}
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createNote.isPending}>Post Note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && <p>Loading notes...</p>}
        
        {notes?.map(note => (
          <div 
            key={note.id}
            className={cn(
              "note-" + (note.color || 'yellow'),
              "aspect-square p-6 rounded-none shadow-md hover:shadow-xl transition-all rotate-1 hover:rotate-0 hover:scale-105 flex flex-col relative group"
            )}
            style={{ 
              clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%)' // folded corner effect
            }}
          >
            <p className="flex-1 font-handwriting text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {note.content}
            </p>
            {note.author && (
              <p className="text-xs opacity-60 mt-4 text-right">- {note.author.firstName}</p>
            )}
            
            <button 
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteNote.mutate(note.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            {/* Corner fold visual */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-black/10" style={{
              clipPath: 'polygon(0 0, 0 100%, 100% 0)'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
