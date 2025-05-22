import { RoomWithSchedule } from "@/types/rooms";

// Helper to check if a room is booked at a specific time slot and day
export const getRoomScheduleForTimeAndDay = (
  room: RoomWithSchedule,
  timeSlot: string,
  day: string
) => {
  const [timeSlotStart, timeSlotEnd] = timeSlot.split("-");

  return room.schedules.find(
    (schedule) =>
      schedule.day === day &&
      timeSlotStart < schedule.endTime &&
      timeSlotEnd > schedule.startTime
  );
};
