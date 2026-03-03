import { useStickyNotes, useCreateStickyNote, useDeleteStickyNote, useUpdateStickyNote } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";

export default function Notes() {
  const { data: notes, isLoading } = useStickyNotes();
  const createNote = useCreateStickyNote();
  const deleteNote = useDeleteStickyNote();
  const updateNote = useUpdateStickyNote();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [open, setOpen] = useState(false);

  // Generate a random position cluster near the center for new notes
  const getRandomCenterPosition = () => {
    // Based roughly on standard center screen coords
    return {
      x: Math.floor(Math.random() * 100) + 50,
      y: Math.floor(Math.random() * 100) + 50
    };
  }

  const colors = [
    { id: 'yellow', class: 'bg-yellow-100 border-yellow-200 text-yellow-900 hover:bg-yellow-200' },
    { id: 'blue', class: 'bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200' },
    { id: 'pink', class: 'bg-pink-100 border-pink-200 text-pink-900 hover:bg-pink-200' },
    { id: 'green', class: 'bg-green-100 border-green-200 text-green-900 hover:bg-green-200' },
  ];

  const handleCreate = () => {
    if (!newNoteContent.trim() || createNote.isPending) return;
    const { x, y } = getRandomCenterPosition();
    createNote.mutate({ content: newNoteContent, color: selectedColor, x, y }, {
      onSuccess: () => {
        setNewNoteContent("");
        setOpen(false);
      },
      onError: (err) => {
        console.error("Failed to create note:", err);
      }
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold">Digital Fridge Door</h1>
          <p className="text-muted-foreground mt-1">Drag and drop notes for the family.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full h-12 px-6">
              <Plus className="h-5 w-5" /> Add Magnet
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
                      "h-10 w-10 rounded-full border-4 transition-all hover:scale-110",
                      c.class,
                      selectedColor === c.id ? "border-primary/50 shadow-md" : "border-background"
                    )}
                    onClick={() => setSelectedColor(c.id)}
                  />
                ))}
              </div>
              <Button onClick={handleCreate} className="w-full h-12 text-lg" disabled={createNote.isPending}>
                Slap on Fridge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex-1 w-full min-h-[65vh] rounded-[2rem] border-8 border-muted/50 bg-background overflow-hidden relative"
        style={{ backgroundImage: 'radial-gradient(circle, #0000000a 2px, transparent 2px)', backgroundSize: '32px 32px' }}>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-lg font-medium animate-pulse">
            Organizing magnets...
          </div>
        )}

        {notes?.map((note, idx) => (
          <Rnd
            key={note.id}
            default={{ x: note.x || 0, y: note.y || 0, width: 192, height: 'auto' }}
            enableResizing={false}
            bounds="parent"
            onDragStop={(_e, data) => {
              if (data.x === note.x && data.y === note.y) return;
              updateNote.mutate({ id: note.id, x: Math.round(data.x), y: Math.round(data.y) });
            }}
          >
            <div
              className={cn(
                "note-" + (note.color || 'yellow'),
                "w-full h-full p-6 absolute cursor-move shadow-md hover:shadow-2xl flex flex-col z-10 hover:z-50 group"
              )}
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%)',
                // Add a very slight random rotation to make them feel organic
                transform: `rotate(${(idx % 5) - 2}deg)`
              }}
            >
              <p className="flex-1 font-handwriting text-xl leading-relaxed whitespace-pre-wrap font-medium select-none pointer-events-none text-black/80">
                {note.content}
              </p>
              {note.author && (
                <p className="text-xs opacity-60 mt-4 text-right select-none pointer-events-none text-black/90 font-bold">- {note.author.firstName}</p>
              )}

              <button
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/10 opacity-0 group-[&:hover]:opacity-100 transition-opacity bg-black/5"
                onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking delete
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote.mutate(note.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-black/70" />
              </button>

              {/* Corner fold visual */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-black/15 shadow-inner" style={{
                clipPath: 'polygon(0 0, 0 100%, 100% 0)'
              }} />
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
}
