import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { RoomWithSchedule, RoomFilters } from "@/types/rooms";
import { TIME_SLOTS } from "@/lib/constants";
import { getRoomScheduleForTimeAndDay } from "@/lib/room-utils";

interface ScheduleTableProps {
  rooms?: RoomWithSchedule[];
  isLoading: boolean;
  filters: RoomFilters;
  weekDates: Date[];
  weekStart: Date;
  weekEnd: Date;
}

export function ScheduleTable({
  rooms,
  isLoading,
  filters,
  weekDates,
  weekStart,
  weekEnd
}: ScheduleTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Room Schedules
          {filters.period === "day" && ` for ${format(parseISO(filters.date), "MMMM d, yyyy")}`}
          {filters.period === "week" && ` for Week of ${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`}
          {filters.session && filters.session !== "all" && ` (${filters.session === "morning" ? "Morning" : "Afternoon"} Sessions)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !rooms?.length ? (
          <div className="text-center p-12">
            <h3 className="text-lg font-medium">No rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filters.period === "day" ? (
              <DailyScheduleTable rooms={rooms} filters={filters} />
            ) : (
              <WeeklyScheduleTable rooms={rooms} weekDates={weekDates} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailyScheduleTable({ rooms, filters }: { rooms: RoomWithSchedule[], filters: RoomFilters }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-3 text-left font-medium">Room</th>
          <th className="p-3 text-left font-medium">Building</th>
          <th className="p-3 text-left font-medium">Type</th>
          {TIME_SLOTS
            .filter(slot => {
              // Filter slots based on session if specified
              if (filters.session === "morning") {
                return ["slot1", "slot2", "slot3"].includes(slot.id);
              } else if (filters.session === "afternoon") {
                return ["slot4", "slot5", "slot6"].includes(slot.id);
              }
              return true;
            })
            .map((slot) => (
              <th key={slot.id} className="p-3 text-center font-medium min-w-[120px]">
                {slot.label}
              </th>
            ))
          }
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id} className="border-t hover:bg-muted/20">
            <td className="p-3 font-medium">{room.roomNumber}</td>
            <td className="p-3">{room.building}</td>
            <td className="p-3">{room.type}</td>
            {TIME_SLOTS
              .filter(slot => {
                // Filter slots based on session if specified
                if (filters.session === "morning") {
                  return ["slot1", "slot2", "slot3"].includes(slot.id);
                } else if (filters.session === "afternoon") {
                  return ["slot4", "slot5", "slot6"].includes(slot.id);
                }
                return true;
              })
              .map((slot) => {
                const schedule = getRoomScheduleForTimeAndDay(
                  room, 
                  slot.value, 
                  filters.date
                );
                
                return (
                  <td 
                    key={`${room.id}-${slot.id}`} 
                    className={cn(
                      "p-3 text-center", 
                      schedule ? "bg-primary/10" : "bg-green-50/30"
                    )}
                  >
                    {schedule ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">{schedule.subject}</span>
                        <span className="text-xs text-muted-foreground">{schedule.lecturer.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Available</span>
                    )}
                  </td>
                );
              })
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeeklyScheduleTable({ rooms, weekDates }: { rooms: RoomWithSchedule[], weekDates: Date[] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-3 text-left font-medium">Room</th>
          <th className="p-3 text-left font-medium">Building</th>
          {weekDates.map((date) => (
            <th 
              key={format(date, "yyyy-MM-dd")}
              className={cn(
                "p-3 text-center font-medium min-w-[150px]",
                isSameDay(date, new Date()) && "bg-primary/5"
              )}
            >
              <div>{format(date, "EEE")}</div>
              <div className="text-xs">{format(date, "MMM d")}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id} className="border-t hover:bg-muted/20">
            <td className="p-3 font-medium">{room.roomNumber}</td>
            <td className="p-3">{room.building}</td>
            {weekDates.map((date) => {
              const dayStr = format(date, "yyyy-MM-dd");
              const daySchedules = room.schedules.filter(
                schedule => schedule.day === dayStr
              );
              
              return (
                <td 
                  key={`${room.id}-${dayStr}`}
                  className={cn(
                    "p-2 align-top",
                    isSameDay(date, new Date()) && "bg-primary/5"
                  )}
                >
                  <div className="min-h-[100px]">
                    {daySchedules.length > 0 ? (
                      <div className="space-y-1">
                        {daySchedules.map((schedule) => (
                          <div 
                            key={schedule.id} 
                            className="bg-primary/10 p-2 rounded text-xs"
                          >
                            <div className="font-medium">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div>{schedule.subject}</div>
                            <div className="text-muted-foreground">{schedule.lecturer.name}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground pt-4">
                        Available
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}