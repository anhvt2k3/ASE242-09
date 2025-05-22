import { format, addDays } from "date-fns";
import { RoomWithSchedule, RoomFilters } from "@/types/rooms";
import { API_BASE_URL } from "./api-config";
import { apiRequest } from "./queryClient";

export const fetchRooms = async (
  filters: RoomFilters
): Promise<RoomWithSchedule[]> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.building && filters.building !== "all") {
      queryParams.append("building", filters.building);
    }

    if (filters.type && filters.type !== "all") {
      queryParams.append("type", filters.type);
    }

    if (filters.roomNumber) {
      queryParams.append("roomNumber", filters.roomNumber);
    }

    if (filters.date) {
      queryParams.append("date", filters.date);
    }

    if (filters.period) {
      queryParams.append("period", filters.period);
    }

    if (filters.session && filters.session !== "all") {
      queryParams.append("session", filters.session);
    }

    if (filters.lecturerId) {
      queryParams.append("lecturerId", filters.lecturerId);
    }

    const url = `${API_BASE_URL}/rooms?${queryParams.toString()}`;
    const response = await apiRequest("GET", url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching rooms:", error);

    return [];
  }
};

// Mock API functions
export const fetchMockRooms = async (
  filters: RoomFilters
): Promise<RoomWithSchedule[]> => {
  // Simulate API loading
  await new Promise((resolve) => setTimeout(resolve, 500));

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
          startTime: "7:00",
          endTime: "8:50",
          day: format(new Date(), "yyyy-MM-dd"),
          lecturerId: "l1",
          subject: "Computer Science",
          courseCode: "CO1011",
          lecturer: { id: "l1", name: "Dr. Nguyen Van A", department: "CS" },
        },
        {
          id: "s2",
          roomId: "1",
          startTime: "9:00",
          endTime: "10:50",
          day: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          lecturerId: "l2",
          subject: "Algorithms",
          courseCode: "SP1012",
          lecturer: { id: "l2", name: "Dr. Tran Thi B", department: "CS" },
        },
      ],
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
          startTime: "13:00",
          endTime: "14:50",
          day: format(new Date(), "yyyy-MM-dd"),
          lecturerId: "l3",
          subject: "Chemistry Lab",
          courseCode: "CH1003",
          lecturer: { id: "l3", name: "Dr. Le Van C", department: "Chemistry" },
        },
      ],
    },
    {
      id: "3",
      roomNumber: "C1-101",
      building: "C1",
      type: "Seminar Room",
      capacity: 30,
      schedules: [],
    },
  ];

  // Apply filters
  let filteredRooms = [...mockRooms];

  if (filters.building && filters.building !== "all") {
    filteredRooms = filteredRooms.filter(
      (room) => room.building === filters.building
    );
  }

  if (filters.type && filters.type !== "all") {
    filteredRooms = filteredRooms.filter((room) => room.type === filters.type);
  }

  if (filters.roomNumber) {
    filteredRooms = filteredRooms.filter((room) =>
      room.roomNumber.toLowerCase().includes(filters.roomNumber.toLowerCase())
    );
  }

  if (filters.lecturerId) {
    filteredRooms = filteredRooms.filter((room) =>
      room.schedules.some(
        (schedule) => schedule.lecturerId === filters.lecturerId
      )
    );
  }

  return filteredRooms;
};

import { z } from 'zod';
import { StringValidationConfig, StringValidationResult } from '../types/validation';

// Regex to block special characters used in XSS, SQL injection, or coding attacks
const dangerousCharsRegex = /[<>;"'()`\\|&]/;

// Validate a single string input
export const validateStringInput = (
  input: string,
  config: StringValidationConfig = {}
): StringValidationResult => {
  try {
    // Base validation: block dangerous characters
    let schema = z.string().refine(
      (value) => !dangerousCharsRegex.test(value),
      'Input contains forbidden characters (e.g., <, >, ;, ", \', (, ), `, \\, |, &)'
    );

    // Apply custom configurations
    if (config.required !== false) {
      schema = schema.min(1, 'Input is required');
    }
    if (config.maxLength) {
      schema = schema.max(config.maxLength, `Input cannot exceed ${config.maxLength} characters`);
    }
    if (config.minLength) {
      schema = schema.min(config.minLength, `Input must be at least ${config.minLength} characters`);
    }
    if (config.customRegex) {
      schema = schema.refine(
        (value) => config.customRegex!.test(value),
        config.customRegexMessage || 'Input does not match required pattern'
      );
    }

    schema.parse(input);
    return { isValid: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { isValid: false, error: err.errors[0].message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};  