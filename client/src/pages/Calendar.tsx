import { useEvents, useDeleteEvent } from "@/hooks/use-events";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

export default function CalendarPage() {
  const { data: events, isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();

  // Simple list view for now - could be enhanced with a real calendar grid library like react-big-calendar later
  // For MVP, we'll list events grouped by date.

  const sortedEvents = events?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Family Calendar</h1>
          <p className="text-muted-foreground">Upcoming events and appointments.</p>
        </div>
        <CreateEventDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p>Loading events...</p>}
        {sortedEvents.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            No upcoming events. Plan something fun!
          </div>
        )}
        
        {sortedEvents.map(event => (
          <Card key={event.id} className="group hover:shadow-lg transition-all border-l-4 border-l-secondary">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-md text-sm font-bold text-center w-14">
                  <div className="text-xs uppercase">{format(event.startTime, 'MMM')}</div>
                  <div className="text-xl leading-none">{format(event.startTime, 'd')}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteEvent.mutate(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>
                {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
