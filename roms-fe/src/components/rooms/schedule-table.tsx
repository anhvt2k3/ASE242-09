import { format, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";

import { RoomWithSchedule, RoomFilters } from "@/types/rooms";
import { useAuth } from "@/hooks/use-auth";
import { getSlotNumber, getSlotLabel, TIME_SLOT_MAPPINGS } from "@/lib/date-slot-utils";

interface ScheduleTableProps {
  rooms?: RoomWithSchedule[];
  isLoading: boolean;
  filters: RoomFilters;
  weekDates: Date[];
  weekStart: Date;
  weekEnd: Date;
  onBookRoom: (roomId: string, date: string) => void;
}

export function ScheduleTable({
  rooms,
  isLoading,
  filters,
  weekDates,
  weekStart,
  weekEnd,
  onBookRoom
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
            <h3 className="text-lg text-muted-foreground font-medium">No schedule found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filters.period === "day" ? (
              <DailyScheduleTable rooms={rooms} filters={filters} onBookRoom={onBookRoom}/>
            ) : (
              <WeeklyScheduleTable rooms={rooms} weekDates={weekDates} onBookRoom={onBookRoom} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailyScheduleTable({ 
  rooms, 
  filters,
  onBookRoom
}: { 
  rooms: RoomWithSchedule[], 
  filters: RoomFilters,
  onBookRoom: (roomId: string, date: string) => void
}) {
  const { user } = useAuth();

  // Generate slot numbers based on session filter
  const slotNumbers = filters.session === "morning" 
    ? TIME_SLOT_MAPPINGS.morning
    : filters.session === "afternoon" 
      ? TIME_SLOT_MAPPINGS.afternoon
      : [...TIME_SLOT_MAPPINGS.morning, ...TIME_SLOT_MAPPINGS.afternoon];

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-3 text-left font-medium">Room</th>
          <th className="p-3 text-left font-medium">Building</th>
          <th className="p-3 text-left font-medium">Type</th>
          
          {slotNumbers.map((slotNumber) => (
            <th key={`slot-${slotNumber}`} className="p-3 text-center font-medium min-w-[120px]">
              <div>Tiết {slotNumber}</div>
              <div className="text-xs text-muted-foreground">{getSlotLabel(slotNumber)}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id} className="border-t hover:bg-muted/20">
            <td className="p-3 font-medium">{room.roomNumber}</td>
            <td className="p-3">{room.building}</td>
            <td className="p-3">{room.type}</td>
            {slotNumbers.map((slotNumber) => {
              // Check if this slot has a schedule
              const hasSchedule = room.schedules.some(schedule => {
                const startSlot = getSlotNumber(schedule.startTime);
                const endTimeHour = parseInt(schedule.endTime.split(':')[0]);
                const endTimeMinute = parseInt(schedule.endTime.split(':')[1]);
                const endSlot = getSlotNumber(`${endTimeHour}:${endTimeMinute}`);
                
                return (
                  schedule.day === filters.date && 
                  slotNumber >= startSlot && 
                  slotNumber <= endSlot
                );
              });
              
              // Find the schedule for this slot if exists
              const schedule = hasSchedule 
                ? room.schedules.find(schedule => {
                    const startSlot = getSlotNumber(schedule.startTime);
                    const endTimeHour = parseInt(schedule.endTime.split(':')[0]);
                    const endTimeMinute = parseInt(schedule.endTime.split(':')[1]);
                    const endSlot = getSlotNumber(`${endTimeHour}:${endTimeMinute}`);
                    
                    return (
                      schedule.day === filters.date && 
                      slotNumber >= startSlot && 
                      slotNumber <= endSlot
                    );
                  })
                : null;
              
              return (
                <td 
                  key={`${room.id}-slot-${slotNumber}`} 
                  className={cn(
                    "p-3 text-center", 
                    schedule ? "bg-primary/10" : "bg-green-50/30"
                  )}
                >
                  {schedule ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">[{schedule.courseCode}] {schedule.subject}</span>
                      <span className="text-xs text-muted-foreground">{schedule.lecturer.name}</span>
                    </div>
                  ) : (
                    user ? (
                      parseISO(filters.date) > startOfDay(new Date()) ? (
                      <button
                        onClick={() => onBookRoom(room.id, filters.date)}
                        className="w-full h-full py-2 hover:bg-green-100 rounded-md transition-colors group"
                      >
                        <span className="text-green-600 text-xs font-medium group-hover:text-green-700">Available</span>
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <PlusCircle className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 text-xs">Book</span>
                        </div>
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-xs">Available</span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">Available</span>
                  )
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeeklyScheduleTable({ 
  rooms, 
  weekDates, 
  onBookRoom 
}: { 
  rooms: RoomWithSchedule[], 
  weekDates: Date[],
  onBookRoom: (roomId: string, date: string) => void
}) {
  const { user } = useAuth();

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
                        {daySchedules.map((schedule) => {
                          const startSlot = getSlotNumber(schedule.startTime);
                          const endTimeHour = parseInt(schedule.endTime.split(':')[0]);
                          const endTimeMinute = parseInt(schedule.endTime.split(':')[1]);
                          const endSlot = getSlotNumber(`${endTimeHour}:${endTimeMinute}`);
                          
                          return (
                            <div 
                              key={schedule.id} 
                              className="bg-primary/10 p-2 rounded text-xs"
                            >
                              <div className="font-medium">
                                Tiết {startSlot} - {endSlot}
                              </div>
                              <div>[{schedule.courseCode}] {schedule.subject}</div>
                              <div className="text-muted-foreground">{schedule.lecturer.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      user ? (
                        date > startOfDay(new Date()) ? (
                        <button
                          onClick={() => onBookRoom(room.id, dayStr)}
                          className="flex flex-col items-center justify-center w-full h-full min-h-[100px] rounded-md hover:bg-green-100 transition-colors group"
                        >
                          <span className="text-green-600 text-xs font-medium group-hover:text-green-700">Available</span>
                          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-xs">
                            <PlusCircle className="h-3 w-3" />
                            <span>Book</span>
                          </div>
                        </button>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground pt-4">
                          Available
                        </div>
                      )
                    ) : (
                      <div className="text-center text-xs text-muted-foreground pt-4">
                        Available
                      </div>
                    )
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