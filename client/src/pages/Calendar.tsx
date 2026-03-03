import { useState } from "react";
import { useEvents, useDeleteEvent } from "@/hooks/use-events";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, MapPin, Clock, Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: events, isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();

  // Filter events down to just the selected date
  const selectedEvents = events?.filter((event) =>
    isSameDay(new Date(event.startTime), date)
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

  // Identify all dates that have at least one event so we can highlight them on the calendar
  const eventDates = events?.map(e => new Date(e.startTime)) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Family Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage appointments, synced across your household.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/5">
            <LinkIcon className="h-4 w-4 mr-2" />
            Sync Google Calendar
          </Button>
          <CreateEventDialog />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left / Top Screen: Dynamic Month Grid */}
        <div className="w-full lg:w-auto flex flex-col gap-4 sticky top-[calc(2rem+env(safe-area-inset-top))]">
          <Card className="border-border/50 shadow-sm overflow-hidden border-t-4 border-t-primary">
            <CardContent className="p-2 sm:p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: "text-primary font-bold after:content-[''] after:block after:w-1 after:h-1 after:bg-primary after:mx-auto after:rounded-full after:-mb-2" }}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full sm:hidden border-primary/20 text-primary hover:bg-primary/5">
            <LinkIcon className="h-4 w-4 mr-2" />
            Sync Google Calendar
          </Button>
        </div>

        {/* Right / Bottom Screen: Daily Agenda View */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold font-display">{format(date, 'EEEE')}</h2>
              <p className="text-muted-foreground">{format(date, 'MMMM d, yyyy')}</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm bg-secondary/10 text-secondary">
              {selectedEvents.length} {selectedEvents.length === 1 ? 'Event' : 'Events'}
            </Badge>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground animate-pulse">
                Syncing calendar streams...
              </div>
            )}

            {!isLoading && selectedEvents.length === 0 && (
              <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Free Schedule</h3>
                <p className="text-sm text-muted-foreground mt-1 text-balance max-w-sm">
                  You have no appointments or shared events scheduled for this day. Plan something fun!
                </p>
              </div>
            )}

            {/* Render the Daily Agenda */}
            {selectedEvents.map((event, i) => (
              <Card key={event.id} className="group hover:shadow-md transition-all border-l-4 border-l-secondary overflow-hidden animate-in slide-in-from-right-4" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  {/* Time Ribbon */}
                  <div className="bg-secondary/5 px-6 py-4 flex flex-col justify-center min-w-[140px] border-b sm:border-b-0 sm:border-r border-border/50">
                    <span className="font-bold text-lg text-secondary">{format(new Date(event.startTime), 'h:mm a')}</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{format(new Date(event.endTime), 'h:mm a')}</span>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 flex-1 flex flex-col justify-center relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteEvent.mutate(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <h3 className="font-bold text-xl leading-tight mb-2 pr-8">{event.title}</h3>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed pr-8">{event.description}</p>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md w-fit mt-auto border border-border/50">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
