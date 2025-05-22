import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { RoomFilters } from "@/types/rooms"; 
import { filterRoomSchedules, transformBackendData } from "@/lib/api-module";
import { FiltersPanel } from "@/components/rooms/filters-panel";
import { ScheduleTable } from "@/components/rooms/schedule-table";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  // Existing state and hooks
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  const [filters, setFilters] = useState<RoomFilters>({
    building: "all",
    type: "all",
    roomNumber: "",
    date: format(new Date(), "yyyy-MM-dd"),
    period: "week", 
    session: "all", 
    lecturerId: ""
  });
  
  const [showMySchedules, setShowMySchedules] = useState(false);
  
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Convert frontend filters to backend API filters
  const prepareApiFilters = () => {
    const apiFilters: any = {};
    
    if (filters.building && filters.building !== "all") {
      apiFilters.building = filters.building;
    }
    
    if (filters.type && filters.type !== "all") {
      apiFilters.campus = filters.type; // Map type to campus as per backend
    }
    
    if (filters.roomNumber) {
      apiFilters.roomNumber = filters.roomNumber;
    }
    
    if (filters.lecturerId) {
      apiFilters.lecturerId = filters.lecturerId;
    }

    apiFilters.page = 0;
    apiFilters.size = 100;
    
    // Handle dates based on period
    if (filters.period === "day") {
      apiFilters.startDate = filters.date;
      apiFilters.endDate = filters.date;
      
      // Handle session filters
      if (filters.session === "morning") {
        apiFilters.startSession = 1;
        apiFilters.endSession = 6;
      } else if (filters.session === "afternoon") {
        apiFilters.startSession = 7;
        apiFilters.endSession = 17;
      }
    } else {
      // For week view
      apiFilters.startDate = format(weekStart, "yyyy-MM-dd");
      apiFilters.endDate = format(weekEnd, "yyyy-MM-dd");
    }
    
    return apiFilters;
  };
  
  // Query for room data using the API
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms", filters, weekStart],
    queryFn: async () => {
      try {
        // Call the API with prepared filters
        const result = await filterRoomSchedules(prepareApiFilters());
        
        // Transform the backend data to match frontend format
        return transformBackendData(result);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        return [];
      }
    },
  });
  
  // Existing handlers remain the same
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === "period" && value === "day") {
      setFilters(prev => ({ 
        ...prev, 
        [key]: value,
        session: prev.session || "all" 
      }));
    }
  };
  
  const handleMySchedulesToggle = (checked: boolean) => {
    setShowMySchedules(checked);
    if (checked && user?.id) {
      const userId = String(user.id);
      setFilters(prev => ({ ...prev, lecturerId: userId }));
    } else {
      setFilters(prev => ({ ...prev, lecturerId: "" }));
    }
  };
  
  const handleBookRoom = (roomId?: string, date?: string) => {
    if (roomId && date) {
      setLocation(`/booking?roomId=${roomId}&date=${date}`);
    } else {
      setLocation("/booking");
    }
  };
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    setCurrentWeek(prevDate => addDays(prevDate, days));
  };

  // Component rendering stays the same
  return (
    // Existing JSX
    <>
    <Navbar />
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold ml-4">Room Schedules</h1>
          {user?.role=='lecturer' && (
            <Button onClick={() => handleBookRoom()} className="flex items-center gap-2 mr-4">
              <PlusCircle className="h-4 w-4" />
              Book a Room
            </Button>
          )}
        </div>
        
        <FiltersPanel
          filters={filters}
          showMySchedules={showMySchedules}
          user={user}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onFilterChange={handleFilterChange}
          onMySchedulesToggle={handleMySchedulesToggle}
          onNavigateWeek={navigateWeek}
        />
        
        <ScheduleTable
          rooms={rooms}
          isLoading={isLoading}
          filters={filters}
          weekDates={weekDates}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onBookRoom={handleBookRoom}
        />
      </div>
    </div>
    </>
  );
}