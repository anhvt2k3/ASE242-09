import { format, addDays } from "date-fns";
import { RoomWithSchedule, RoomFilters } from "@/types/rooms";

// Mock API functions
export const fetchRooms = async (filters: RoomFilters): Promise<RoomWithSchedule[]> => {
  // Simulate API loading
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock rooms with schedules
  const mockRooms: RoomWithSchedule[] = [
    {
      id: "1",
      roomNumber: "A1-301",
      building: "A1",
      type: "Lecture Hall",
      capacity: 100,
      schedules: [
        {
          id: "s1",
          roomId: "1",
          startTime: "7:30",
          endTime: "9:00",
          day: format(new Date(), "yyyy-MM-dd"),
          lecturerId: "l1",
          subject: "Computer Science",
          lecturer: { id: "l1", name: "Dr. Nguyen Van A", department: "CS" }
        },
        {
          id: "s2",
          roomId: "1",
          startTime: "9:10",
          endTime: "10:40",
          day: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          lecturerId: "l2",
          subject: "Algorithms",
          lecturer: { id: "l2", name: "Dr. Tran Thi B", department: "CS" }
        }
      ]
    },
    {
      id: "2",
      roomNumber: "B1-202",
      building: "B1",
      type: "Laboratory",
      capacity: 50,
      schedules: [
        {
          id: "s3",
          roomId: "2",
          startTime: "12:50",
          endTime: "14:20",
          day: format(new Date(), "yyyy-MM-dd"),
          lecturerId: "l3",
          subject: "Chemistry Lab",
          lecturer: { id: "l3", name: "Dr. Le Van C", department: "Chemistry" }
        }
      ]
    },
    {
      id: "3",
      roomNumber: "C1-101",
      building: "C1",
      type: "Seminar Room",
      capacity: 30,
      schedules: []
    }
  ];
  
  // Apply filters
  let filteredRooms = [...mockRooms];
  
  if (filters.building && filters.building !== "all") {
    filteredRooms = filteredRooms.filter(room => room.building === filters.building);
  }
  
  if (filters.type && filters.type !== "all") {
    filteredRooms = filteredRooms.filter(room => room.type === filters.type);
  }
  
  if (filters.roomNumber) {
    filteredRooms = filteredRooms.filter(room => 
      room.roomNumber.toLowerCase().includes(filters.roomNumber.toLowerCase())
    );
  }
  
  if (filters.lecturerId) {
    filteredRooms = filteredRooms.filter(room => 
      room.schedules.some(schedule => schedule.lecturerId === filters.lecturerId)
    );
  }
  
  return filteredRooms;
};