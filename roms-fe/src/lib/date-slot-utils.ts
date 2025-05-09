// Helper to map time slots to period number (tiết học)
export const getSlotNumber = (timeSlot: string): number => {
  const hour = parseInt(timeSlot.split(':')[0]);
  const minute = parseInt(timeSlot.split(':')[1]);
  
  // Map hours to slot numbers (tiết học)
    if (hour === 6) return 1;
    if (hour === 7) return 2;
    if (hour === 8) return 3;
    if (hour === 9) return 4;
    if (hour === 10) return 5;
    if (hour === 11) return 6;
    if (hour === 12) return 7;
    if (hour === 13) return 8;
    if (hour === 14) return 9;
    if (hour === 15) return 10;
    if (hour === 16) return 11;
    if (hour === 17) return 12;
    if (hour === 18) return 13;
    if (hour === 19) return 14;
    if (hour === 20) return 15;
    if (hour === 21) return 16;
    if (hour === 22) return 17;    
    return 0; // Invalid slot
};

// Helper to get slot range for display
export const getSlotLabel = (slotNumber: number): string => {
  const slotTimes: Record<number, string> = {
    1: "6:00 - 6:50",
    2: "7:00 - 7:50",
    3: "8:00 - 8:50",
    4: "9:00 - 9:50",
    5: "10:00 - 10:50",
    6: "11:00 - 11:50",
    7: "12:00 - 12:50",
    8: "13:00 - 13:50",
    9: "14:00 - 14:50",
    10: "15:00 - 15:50",
    11: "16:00 - 16:50",
    12: "17:00 - 17:50",
    13: "18:00 - 18:50",
    14: "19:00 - 19:50",
    15: "20:00 - 20:50",
    16: "21:00 - 21:50",
    17: "22:00 - 22:50"
  };
  
  return slotTimes[slotNumber] || `Slot ${slotNumber}`;
};

export const TIME_SLOT_MAPPINGS = {
  morning: [1, 2, 3, 4, 5, 6],
  afternoon: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] 
};