// DTO types that match your Spring Boot backend
export interface RoomScheduleDto {
    id: number;
    roomId: number;
    roomNumber: string;
    building: string;
    campus?: string;
    floor?: number;
    capacity?: number;
    lecturerId?: number;
    lecturerName?: string;
    subjectId?: number;
    subjectName?: string;
    subjectCode?: string;
    date: string;
    startSession: number;
    endSession: number;
    department?: string;
  }
  
  export interface BookRoomScheduleDto {
    roomId: number;
    lecturerId: number;
    subjectId: number;
    date: string;
    startSession: number;
    endSession: number;
    notes?: string;
  }