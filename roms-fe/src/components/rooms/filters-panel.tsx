import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

import { BUILDINGS, ROOM_TYPES } from "@/lib/constants";
import { RoomFilters } from "@/types/rooms";

interface FiltersPanelProps {
  filters: RoomFilters;
  showMySchedules: boolean;
  user: any;
  weekStart: Date;
  weekEnd: Date;
  onFilterChange: (key: string, value: string) => void;
  onMySchedulesToggle: (checked: boolean) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

export function FiltersPanel({
  filters,
  showMySchedules,
  user,
  weekStart,
  weekEnd,
  onFilterChange,
  onMySchedulesToggle,
  onNavigateWeek
}: FiltersPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Building Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Building</label>
            <Select
              value={filters.building}
              onValueChange={(value) => onFilterChange("building", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {BUILDINGS.map((building) => (
                  <SelectItem key={building} value={building}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Room Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Type</label>
            <Select
              value={filters.type}
              onValueChange={(value) => onFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Room Number Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Number</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room number..."
                className="pl-8"
                value={filters.roomNumber}
                onChange={(e) => onFilterChange("roomNumber", e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Second row of filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {/* View Type (Day/Week) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">View</label>
            <Tabs 
              value={filters.period}
              onValueChange={(value) => onFilterChange("period", value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Session Filter (Morning/Afternoon) - Show only in Day view */}
          {filters.period === "day" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
              <Select
                value={filters.session}
                onValueChange={(value) => onFilterChange("session", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Day</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            {filters.period === "day" ? (
              <div className="relative">
                <Input
                  type="date"
                  className="pl-2"
                  value={filters.date}
                  onChange={(e) => onFilterChange("date", e.target.value)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onNavigateWeek('prev')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke-width="1.5" 
                    stroke="currentColor" 
                    className="size-6"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      d="M15.75 19.5 8.25 12l7.5-7.5" 
                    />
                  </svg>
                </Button>
                
                <div className="px-2 py-2 border rounded-md flex-1 text-center text-sm">
                  {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
                </div>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onNavigateWeek('next')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke-width="1.5" 
                    stroke="currentColor" 
                    className="size-6"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      d="m8.25 4.5 7.5 7.5-7.5 7.5" 
                    />
                  </svg>
                </Button>
              </div>
            )}
          </div>
          
          {/* My schedules filter (only for lecturers) */}
          {user && (
            <div className="space-y-2 flex items-end ml-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mySchedules" 
                  checked={showMySchedules}
                  onCheckedChange={onMySchedulesToggle}
                />
                <Label htmlFor="mySchedules">Show only my schedules</Label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}