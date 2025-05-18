import { useState, useEffect } from "react";
import { DatePicker, Modal, AutoComplete, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "antd/dist/reset.css";

const campuses = [
  { value: "campus1", label: "Campus 1" },
  { value: "campus2", label: "Campus 2" },
];

const buildingsByCampus: Record<string, { value: string; label: string }[]> = {
  campus1: [
    { value: "buildingA", label: "Building A" },
    { value: "buildingB", label: "Building B" },
  ],
  campus2: [
    { value: "buildingC", label: "Building C" },
    { value: "buildingD", label: "Building D" },
  ],
};

const roomsByBuilding: Record<string, { value: string; label: string }[]> = {
  buildingA: [
    { value: "A101", label: "Room A101" },
    { value: "A102", label: "Room A102" },
  ],
  buildingB: [
    { value: "B201", label: "Room B201" },
    { value: "B202", label: "Room B202" },
  ],
  buildingC: [
    { value: "C301", label: "Room C301" },
    { value: "C302", label: "Room C302" },
  ],
  buildingD: [
    { value: "D401", label: "Room D401" },
    { value: "D402", label: "Room D402" },
  ],
};

export default function BookingPage() {
  const [campus, setCampus] = useState<string>("campus1");
  const [building, setBuilding] = useState<string>("buildingA");
  const [room, setRoom] = useState<string>("A101");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [autoToggle, setAutoToggle] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<{ value: string }[]>([]);

  // gia bo cho dat r
  const unavailableSlotsByDate: Record<string, number[]> = {
    "2025-05-01": [3, 4, 10],
    "2025-05-02": [1, 2, 5],
    "2025-05-03": [6, 7, 8],
  };

  const handleSlotClick = (slot: number) => {
    if (!date) return;
    const formattedDate = date.format("YYYY-MM-DD");
    const unavailableSlots = unavailableSlotsByDate[formattedDate] || [];
    if (unavailableSlots.includes(slot)) return;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleConfirmClick = () => {
    if (
      !date ||
      selectedSlots.length === 0 ||
      !courseCode.trim() ||
      !courseName.trim() ||
      !room ||
      !building ||
      !campus
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsModalVisible(true);
  };

  const handleFinalConfirm = () => {
    setIsModalVisible(false);
    alert("Room booking successful!");
    resetForm();
  };

  const resetForm = () => {
    setCampus("campus1");
    setBuilding("buildingA");
    setRoom("A101");
    setDate(null);
    setSelectedSlots([]);
    setCourseCode("");
    setCourseName("");
    setDescription("");
    setAutoToggle(false);
  };

  // Suggestion logic
  useEffect(() => {
    if (courseCode.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = ["CO2001", "CO2002", "CO3001", "CO3002", "IM1013"]
      .filter((code) => code.toLowerCase().includes(courseCode.toLowerCase()))
      .map((code) => ({ value: code }));
    setSuggestions(filteredSuggestions);
  }, [courseCode]);

  const getUnavailableSlots = () => {
    if (!date) return [];
    const formattedDate = date.format("YYYY-MM-DD");
    return unavailableSlotsByDate[formattedDate] || [];
  };

  // Update building and room when campus changes
  useEffect(() => {
    const buildings = buildingsByCampus[campus];
    if (buildings && buildings.length > 0) {
      setBuilding(buildings[0].value);
    }
  }, [campus]);

  useEffect(() => {
    const rooms = roomsByBuilding[building];
    if (rooms && rooms.length > 0) {
      setRoom(rooms[0].value);
    }
  }, [building]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600">
          Room Booking
        </h1>

        {/* Select campus, building, room */}
        <div className="border p-4 rounded-lg bg-blue-50 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Information</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">Campus</label>
              <Select
                className="w-full"
                value={campus}
                options={campuses}
                onChange={setCampus}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">Building</label>
              <Select
                className="w-full"
                value={building}
                options={buildingsByCampus[campus]}
                onChange={setBuilding}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">Room</label>
              <Select
                className="w-full"
                value={room}
                options={roomsByBuilding[building]}
                onChange={setRoom}
              />
            </div>
          </div>
        </div>

        {/* chon date */}
        <div className="border p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Booking Date</h2>
          <DatePicker className="w-full" value={date} onChange={setDate} />
        </div>

        {/* chon slot */}
        <div className="border p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Select Slots</h2>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 17 }, (_, i) => i + 1).map((slot) => (
              <button
                key={slot}
                className={`px-3 py-2 rounded-md text-sm font-semibold ${
                  getUnavailableSlots().includes(slot)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : selectedSlots.includes(slot)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                }`}
                onClick={() => handleSlotClick(slot)}
                disabled={getUnavailableSlots().includes(slot)}
              >
                Tiết {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Course Info */}
        <div className="border p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Course Details</h2>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Course Code</label>
            <AutoComplete
              className="w-full"
              options={suggestions}
              value={courseCode}
              onChange={(value) => setCourseCode(value)}
              placeholder="e.g., CO2001"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Introduction to Programming"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Lesson Content</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter content for this session"
              rows={3}
            />
          </div>
        </div>

        {/* Auto Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto-toggle"
            className="mr-2"
            checked={autoToggle}
            onChange={(e) => setAutoToggle(e.target.checked)}
          />
          <label htmlFor="auto-toggle" className="text-sm text-gray-700">
            Automatically turn on devices when entering the room
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
            onClick={resetForm}
          >
            CANCEL
          </button>
          <button
            className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            onClick={handleConfirmClick}
          >
            CONFIRM
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Booking"
        visible={isModalVisible}
        onOk={handleFinalConfirm}
        onCancel={() => setIsModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <div className="space-y-2 text-gray-800">
          <p>
            <strong>Campus:</strong> {campuses.find((c) => c.value === campus)?.label}
          </p>
          <p>
            <strong>Building:</strong> {buildingsByCampus[campus].find((b) => b.value === building)?.label}
          </p>
          <p>
            <strong>Room:</strong> {roomsByBuilding[building].find((r) => r.value === room)?.label}
          </p>
          <p>
            <strong>Date:</strong> {date?.format("DD/MM/YYYY")}
          </p>
          <p>
            <strong>Slots:</strong> {selectedSlots.join(", ")}
          </p>
          <p>
            <strong>Course Code:</strong> {courseCode}
          </p>
          <p>
            <strong>Course Name:</strong> {courseName}
          </p>
          {description && (
            <p>
              <strong>Content:</strong> {description}
            </p>
          )}
          <p>
            <strong>Auto Device Toggle:</strong> {autoToggle ? "Yes" : "No"}
          </p>
        </div>
      </Modal>
    </div>
  );
}