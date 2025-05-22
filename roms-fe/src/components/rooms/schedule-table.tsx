import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";

import { RoomWithSchedule, RoomFilters } from "@/types/rooms";
import { TIME_SLOTS } from "@/lib/constants";
import { getRoomScheduleForTimeAndDay } from "@/lib/room-utils";
import { useAuth } from "@/hooks/use-auth";

interface ScheduleTableProps {
  rooms?: RoomWithSchedule[];
  isLoading: boolean;
  filters: RoomFilters;
  weekDates: Date[];
  weekStart: Date;
  weekEnd: Date;
  onBookRoom: (roomId: string, date: string, building: string) => void;
}

export function ScheduleTable({
  rooms,
  isLoading,
  filters,
  weekDates,
  weekStart,
  weekEnd,
  onBookRoom,
}: ScheduleTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Room Schedules
          {filters.period === "day" &&
            ` for ${format(parseISO(filters.date), "MMMM d, yyyy")}`}
          {filters.period === "week" &&
            ` for Week of ${format(weekStart, "MMMM d")} - ${format(
              weekEnd,
              "d, yyyy"
            )}`}
          {filters.session &&
            filters.session !== "all" &&
            ` (${
              filters.session === "morning" ? "Morning" : "Afternoon"
            } Sessions)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) :
         !rooms?.length ? (
          <div className="text-center p-12">
            <h3 className="text-lg text-muted-foreground font-medium">
              No schedule found
            </h3>
          </div>
        ) :
         (
          <div className="overflow-x-auto">
            {filters.period === "day" ? (
              <DailyScheduleTable
                rooms={rooms}
                filters={filters}
                onBookRoom={onBookRoom}
              />
            ) : (
              <WeeklyScheduleTable
                rooms={rooms}
                weekDates={weekDates}
                onBookRoom={onBookRoom}
              />
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
  onBookRoom,
}: {
  rooms: RoomWithSchedule[];
  filters: RoomFilters;
  onBookRoom: (roomId: string, date: string, building: string) => void;
}) {
  const { user } = useAuth();
  console.log("rooms", rooms);

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-3 text-left font-medium">Room</th>
          <th className="p-3 text-left font-medium">Building</th>
          <th className="p-3 text-left font-medium">Type</th>
          {TIME_SLOTS.filter((slot) => {
            // Filter slots based on session if specified
            if (filters.session === "morning") {
              return [
                "slot1",
                "slot2",
                "slot3",
                "slot4",
                "slot5",
                "slot6",
              ].includes(slot.id);
            } else if (filters.session === "afternoon") {
              return ["slot7", "slot8", "slot9", "slot10", "slot11", "slot12", "slot13", "slot14", "slot15", "slot16"].includes(
                slot.id
              );
            }
            return true;
          }).map((slot) => (
            <th
              key={slot.id}
              className="p-3 text-center font-medium min-w-[120px]"
            >
              {slot.label}
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
            {(() => {
              const timeSlots = TIME_SLOTS.filter((slot) => {
                if (filters.session === "morning") {
                  return [
                    "slot1",
                    "slot2",
                    "slot3",
                    "slot4",
                    "slot5",
                    "slot6",
                  ].includes(slot.id);
                } else if (filters.session === "afternoon") {
                  return [
                    "slot7",
                    "slot8",
                    "slot9",
                    "slot10",
                    "slot11",
                    "slot12",
                    "slot13",
                    "slot14",
                    "slot15",
                    "slot16",
                  ].includes(slot.id);
                }
                return true;
              });
              let cells = [];
              let i = 0;
              while (i < timeSlots.length) {
                const slot = timeSlots[i];
                const schedule = getRoomScheduleForTimeAndDay(
                  room,
                  slot.value,
                  filters.date
                );

                console.log(schedule);
                let colspan = 1;
                let j = i + 1;

                while (j < timeSlots.length) {
                  const nextSlot = timeSlots[j];
                  const nextSchedule = getRoomScheduleForTimeAndDay(
                    room,
                    nextSlot.value,
                    filters.date
                  );
                  if (nextSchedule === schedule) {
                    colspan++;
                    j++;
                  } else {
                    break;
                  }
                }
                cells.push(
                  <td
                    key={`${room.id}-${slot.id}`}
                    colSpan={colspan}
                    className={`p-3 text-center border border-md ${
                      schedule ? "bg-primary/10" : "bg-green-50/30"
                    }`}
                  >
                    {schedule ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {schedule.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {schedule.lecturer.name}
                        </span>
                      </div>
                    ) : user?.role == "lecturer" ? (
                      <button
                        onClick={() => onBookRoom(room.roomNumber, filters.date, room.building)}
                        className="w-full h-full py-2 hover:bg-green-100 rounded-md transition-colors group"
                      >
                        <span className="text-green-600 text-xs font-medium group-hover:text-green-700">
                          Available
                        </span>
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <PlusCircle className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 text-xs">Book</span>
                        </div>
                      </button>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground pt-4">
                        No Session
                      </div>
                    )}
                  </td>
                );
                i = j;
              }
              return cells;
            })()}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeeklyScheduleTable({
  rooms,
  weekDates,
  onBookRoom,
}: {
  rooms: RoomWithSchedule[];
  weekDates: Date[];
  onBookRoom: (roomId: string, date: string, building: string) => void;
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
              const daySchedules = room.schedules
                .filter((schedule) => schedule.day === dayStr)
                .sort((a, b) => {
                  // Convert time strings to minutes for easy comparison
                  const getMinutes = (timeStr) => {
                    const [hours, minutes] = timeStr.split(":").map(Number);
                    return hours * 60 + minutes;
                  };

                  return getMinutes(a.startTime) - getMinutes(b.startTime);
                });

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
                            <div className="text-muted-foreground">
                              {schedule.lecturer.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : user?.role == "lecturer" ? (
                      <button
                        onClick={() => onBookRoom(room.roomNumber, dayStr, room.building)}
                        className="flex flex-col items-center justify-center w-full h-full min-h-[100px] rounded-md hover:bg-green-100 transition-colors group"
                      >
                        <span className="text-green-600 text-xs font-medium group-hover:text-green-700">
                          Available
                        </span>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-xs">
                          <PlusCircle className="h-3 w-3" />
                          <span>Book</span>
                        </div>
                      </button>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground pt-4">
                        No Session
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
