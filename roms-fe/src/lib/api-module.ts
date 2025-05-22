import axios from "axios";
import { API_BASE_URL, ALLOW_INSECURE } from "./api-config";
import { RoomScheduleDto } from "@/types/api-types";
import { RoomWithSchedule } from "@/types/rooms";
// import https from 'node:https';
// import { Agent } from 'https';

if (process.env.NODE_ENV !== "production" && !localStorage.getItem("token")) {
  const fakeJwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikd1ZXN0IFVzZXIiLCJyb2xlIjoiTEVDVFVSRVIiLCJpYXQiOjE1MTYyMzkwMjJ9.fake_signature";
  localStorage.setItem("token", fakeJwt);
  console.log("Development token initialized");
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL+"/api",
  headers: 
      {
        "Content-Type": "application/json",
        "X-Custom-Header": "force-preflight",
        "ngrok-skip-browser-warning": "true",
      },
  withCredentials: true,
  // httpsAgent: new Agent({ rejectUnauthorized: false }),
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Function to get all room schedules
export const getAllRoomSchedules = async () => {
  const response = await api.get("/roomschedules");
  return response.data;
};

// Function to filter room schedules
export const filterRoomSchedules = async (filters: any) => {
  const params = new URLSearchParams();

  if (filters.roomId) params.append("roomId", filters.roomId);
  if (filters.lecturerId) params.append("lecturerId", filters.lecturerId);
  if (filters.building && filters.building !== "all")
    params.append("building", filters.building);
  if (filters.campus) params.append("campus", filters.campus); // Maps to 'type' in frontend
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.startSession)
    params.append("startSession", filters.startSession.toString());
  if (filters.endSession)
    params.append("endSession", filters.endSession.toString());

  try {
    const response = await api.get("/roomschedules/filter", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

// Function to transform backend data to frontend format
export const transformBackendData = (
  backendData: RoomScheduleDto[]
): RoomWithSchedule[] => {
  // Create a map to group schedules by room
  const roomsMap = new Map<string, RoomWithSchedule>();

  backendData.forEach((schedule) => {
    const roomId = schedule.roomId.toString();

    if (!roomsMap.has(roomId)) {
      roomsMap.set(roomId, {
        id: roomId,
        roomNumber: schedule.roomNumber || "Unknown",
        building: schedule.building || "Unknown",
        type: schedule.campus || "Lecture Hall", // Map campus to type
        capacity: schedule.capacity || 0,
        schedules: [],
      });
    }

    // Convert session numbers to time strings
    const startTime = formatSessionToTime(schedule.startSession);
    const endTime = formatSessionToTime(schedule.endSession + 1); // End time is exclusive

    // Add this schedule to the room
    roomsMap.get(roomId)?.schedules.push({
      id: schedule.id.toString(),
      roomId: roomId,
      startTime: startTime,
      endTime: endTime,
      day: schedule.date,
      lecturerId: schedule.lecturerId ? schedule.lecturerId.toString() : "",
      subject: schedule.subjectName || "Unknown Subject",
      courseCode: schedule.subjectCode || "N/A",
      lecturer: {
        id: schedule.lecturerId ? schedule.lecturerId.toString() : "",
        name: schedule.lecturerName || "Unknown",
        department: schedule.department || "Unknown",
      },
    });
  });

  // Convert map to array
  return Array.from(roomsMap.values());
};

// Helper to convert session numbers to time strings
export const formatSessionToTime = (session: number): string => {
  // Mapping sessions to times (adjust according to your system)
  const sessionToTime: Record<number, string> = {
    1: "6:00",
    2: "7:00",
    3: "8:00",
    4: "9:00",
    5: "10:00",
    6: "11:00",
    7: "12:00",
    8: "13:00",
    9: "14:00",
    10: "15:00",
    11: "16:00",
    12: "17:00",
    13: "18:00",
    14: "19:00",
    15: "20:00",
    16: "21:00",
    17: "22:00",
    18: "23:00",
  };

  return sessionToTime[session] || `${session}:00`;
};

// Quick filter (today, tomorrow, this-week, next-week)
export const quickFilterRoomSchedules = async (filterType: string) => {
  const response = await api.get(
    `/roomschedules/quick-filter?filterType=${filterType}`
  );
  return transformBackendData(response.data);
};
