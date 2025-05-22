export type Room = {
  id: string;
  roomNumber: string;
  building: string;
  type: string;
  capacity: number;
};

export type Lecturer = {
  id: string;
  name: string;
  department: string;
};

export type Schedule = {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  day: string;
  lecturerId: string;
  subject: string;
  courseCode: string;
  notes?: string;
};

export type RoomWithSchedule = Room & {
  schedules: (Schedule & { lecturer: Lecturer })[];
};

export type RoomFilters = {
  building: string;
  type: string;
  roomNumber: string;
  date: string;
  period: 'day' | 'week';
  session: 'all' | 'morning' | 'afternoon';
  lecturerId: string;
};