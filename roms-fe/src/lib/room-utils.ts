import { RoomWithSchedule } from "@/types/rooms";

// Helper to check if a room is booked at a specific time slot and day
export const getRoomScheduleForTimeAndDay = (
  room: RoomWithSchedule,
  timeSlot: string,
  day: string
) => {
  const [timeSlotStart, timeSlotEnd] = timeSlot.split("-");

  const timeSlotStartHour = parseFloat(timeSlotStart.split(":")[0]);
  const timeSlotEndHour = parseFloat(timeSlotEnd.split(":")[0]) + 1;

  return room.schedules.find((schedule) => {
    const scheduleStartHour = parseFloat(schedule.startTime.split(":")[0]);
    const scheduleEndHour = parseFloat(schedule.endTime.split(":")[0]) - 0.1;

    return (
      schedule.day === day &&
      timeSlotStartHour < scheduleEndHour &&
      timeSlotEndHour > scheduleStartHour
    );
  });
};
