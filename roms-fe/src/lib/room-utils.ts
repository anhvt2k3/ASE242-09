import { RoomWithSchedule } from "@/types/rooms";

// Helper to check if a room is booked at a specific time slot and day
export const getRoomScheduleForTimeAndDay = (room: RoomWithSchedule, timeSlot: string, day: string) => {
  const [startTime] = timeSlot.split("-");
  return room.schedules.find(
    schedule => 
      schedule.startTime === startTime && 
      schedule.day === day
  );
};