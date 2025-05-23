import { useState, useEffect, useRef } from "react";
import { Redirect, useLocation } from "wouter";
import { DatePicker, Modal, AutoComplete, Select } from "antd";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import { apiRequest } from "@/lib/queryClient";
import { DatabaseZap } from "lucide-react";
import { getAuthToken } from "./auth"; // Adjust path if needed
import { InputValidationService } from "@/lib/inputValidator";
import { start } from "repl";
import { toast } from "@/hooks/use-toast";

const { Option } = Select;

export default function BookingPage() {
  const { user } = useAuth();

  const [campus, setCampus] = useState("1");
  const [building, setBuilding] = useState("");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [subjectCodes, setSubjectCodes] = useState<string[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [autoToggle, setAutoToggle] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<{ value: string }[]>([]);
  const [initialBuilding, setInitialBuilding] = useState<string | null>(null);
  const [initialRoomId, setInitialRoomId] = useState<string | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [startSession, setStartSession] = useState<number | null>(null);
  const [endSession, setEndSession] = useState<number | null>(null);

  const [buildings, setBuildings] = useState<string[]>([]);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

  const [loadingCourseName, setLoadingCourseName] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const campusList = [
    { id: "1", name: "Campus 1" },
    { id: "2", name: "Campus 2" },
  ];

//  # fetch buildings having campus changes
  useEffect(() => {
    if (!campus) return;

    const fetchBuildings = async () => {
      try {
        const res = await apiRequest(
          "GET",
          `/api/roomschedules/buildingByCampus?campus=${campus}`
        );
        const data = await res.json();
        setBuildings(data.filter((b: string) => b != null && b !== ""));
        setBuilding("");
        setRooms([]);
        setName("");
        setRoomId(null);
      } catch (error) {
        console.error("Failed to fetch buildings", error);
      }
    };

    fetchBuildings();
  }, [campus]);

  // # fetch rooms having campus and buildings change
  useEffect(() => {
    if (!building || !campus) return;

    const fetchRooms = async () => {
      try {
        const res = await apiRequest(
          "GET",
          `/api/roomschedules/nameByBuilding?building=${building}&campus=${campus}`
        );
        const data = await res.json();
        //console.log("Fetched rooms:", data);

        if (Array.isArray(data) && typeof data[0] === "string") {
          // Convert string array to objects with ids
          setRooms(data.map((name, idx) => ({ id: idx, name })));
        } else {
          setRooms(Array.isArray(data) ? data : data.rooms || []);
        }

        setName("");
        setRoomId(null);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      }
    };

    fetchRooms();
  }, [building, campus]);


  const handleSlotClick = (slot: number) => {
    if (!date || !roomId) return;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleConfirmClick = async () => {
    if (
      !campus ||
      !building ||
      !name ||
      !roomId ||
      !date ||
      selectedSlots.length === 0 ||
      !courseCode.trim() ||
      !courseName.trim()
    ) {
      // alert("Please fill in all required fields.");
      toast({
        title: "Invalid Booking",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = date.format("YYYY-MM-DD");

    try {
      setDescription(InputValidationService.cleanseInput(description));
      // 2. Check lecturer (user) availability
      const lecturerRes = await apiRequest(
        "GET",
        `/api/roomschedules/isAvailable?date=${formattedDate}&startSession=${startSession}&endSession=${endSession}`
      );
      const lecturerData = await lecturerRes.json();
      const isLecturerAvailable = lecturerData.available ?? true;

      if (!isLecturerAvailable) {
        // alert(
        //   "You are already booked during these sessions. Please choose different slots."
        // );
        toast({
          title: "Booking Conflict",
          description: "You are already booked during these sessions. Please choose different time slots.",
          variant: "destructive",
        });
        return;
      }

      setIsModalVisible(true); // All checks passed, show confirmation modal
    } catch (err) {
      console.error(err);
      alert("Error checking your booking informations. Please try again.");
    }
  };

  useEffect(() => {
    setStartSession(selectedSlots.length > 0 ? Math.min(...selectedSlots) : null );
    setEndSession(selectedSlots.length > 0 ? Math.max(...selectedSlots) : null );
  }, [selectedSlots]);

  useEffect(() => {
  if (startSession && endSession) {
    const invalidSlots = Array.from({ length: 16 }, (_, i) => i + 1).filter(
      (slot) => !availableSlots.includes(slot) && slot >= startSession && slot <= endSession
    );

    if (invalidSlots.length > 0) {
      setSelectedSlots([]);
      toast({
        title: "Invalid Slot Selection",
        description: `The selected slots are not available. Please choose different slots.`,
        variant: "destructive",
      });
    }
  }
}, [startSession, endSession, availableSlots]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const dateParam = searchParams.get("date");
    const buildingParam = searchParams.get("building");
    const roomParam = searchParams.get("roomId");

    if (dateParam) {
      console.log("Date param:", dateParam);
      const parsedDate = dayjs(dateParam, "YYYY-MM-DD");
      if (parsedDate.isValid()) setDate(parsedDate);
    }

    if (buildingParam) setInitialBuilding(buildingParam);
    if (roomParam) {
      setInitialRoomId(roomParam);
    }
    
    const fetchSubjectCodes = async () => {
      try {
        const res = await apiRequest("GET", "/api/roomschedules/getsubjectcodes");
        const data = await res.json();
        setSubjectCodes(data.subjectCodes || []);
      } catch (error) {
        console.error("Failed to fetch subject codes", error);
        setSubjectCodes(["CO2001", "CO1005", "CO3001", "CO3002", "IM1013"]);
      }
    };

    fetchSubjectCodes();
  }, []);

  useEffect(() => {
    if (initialBuilding && buildings.includes(initialBuilding)) {
      setBuilding(initialBuilding);
      setInitialBuilding(null);
    }
  }, [buildings, initialBuilding]);

  useEffect(() => {
    if (
      initialRoomId !== null &&
      rooms.length > 0 &&
      rooms.some((r) => r.name === initialRoomId)
    ) {
      setRoomId(initialRoomId);
      const found = rooms.find((r) => r.name === initialRoomId);
      if (found) setName(found.name);
      setInitialRoomId(null);
    }
  }, [rooms, initialRoomId]);

  useEffect(() => {
    if (!date || !name || !campus) return;

    const fetchAvailableSlots = async () => {
      try {
        const formattedDate = date.format("YYYY-MM-DD");
        const res = await apiRequest(
          "GET",
          `/api/roomschedules/available/${formattedDate}?campus=${campus}&name=${encodeURIComponent(
            name
          )}`
        );
        const data = await res.json();
        console.log("Room availability response:", data);
        const slots = Array.isArray(data) ? data : [];
        setAvailableSlots(slots);
        console.log("Fetched available slots:", slots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [date, name, campus]);

  useEffect(() => {
    if (!courseCode.trim()) {
      setCourseName("");
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setLoadingCourseName(true);
      try {
        const res = await apiRequest(
          "GET",
          `/api/roomschedules/getsubject/${encodeURIComponent(
            courseCode.trim()
          )}`
        );
        if (!res.ok) {
          setCourseName("");
          setLoadingCourseName(false);
          return;
        }

        const data = await res.json();
        setCourseName(data.subjectName || "");
      } catch (error) {
        console.error("Error fetching course name:", error);
        setCourseName("");
      } finally {
        setLoadingCourseName(false);
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [courseCode]);

  const handleFinalConfirm = async () => {
    setIsModalVisible(false);

    if (!date || selectedSlots.length === 0 || !roomId) {
      // alert("Invalid booking data.");
      toast({
        title: "Invalid Booking",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const formattedDate = date.format("YYYY-MM-DD");
    const startSession = Math.min(...selectedSlots);
    const endSession = Math.max(...selectedSlots);

    try {
      await apiRequest("POST", "/api/roomschedules/booking", {
        date: formattedDate,
        name,
        building,
        campus,
        subjectCode: courseCode,
        startSession,
        endSession,
      });

      alert("Room booking successful!");
      resetForm();
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      alert("Failed to book room.");
    }
  };

  const resetForm = () => {
    setCampus("1");
    setBuilding("");
    setName("");
    setRoomId(null);
    setDate(null);
    setSelectedSlots([]);
    setCourseCode("");
    setCourseName("");
    setDescription("");
    setAutoToggle(false);
  };

  useEffect(() => {
    if (courseCode.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = subjectCodes
      .filter((code) => code.toLowerCase().includes(courseCode.toLowerCase()))
      .map((code) => ({ value: code }));
    setSuggestions(filtered);
  }, [courseCode]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600">
            Room Booking
          </h1>
          {user && (
            <div className="mb-4 text-right text-sm text-gray-600">
              Logged in as{" "}
              <span className="font-semibold">{user.username}</span>
            </div>
          )}

          <div className="border p-4 rounded-lg bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Room Selection
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Campus
                </label>
                <Select
                  className="w-full"
                  value={campus}
                  onChange={(value) => setCampus(value)}
                  placeholder="Select campus"
                >
                  {campusList.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Building
                </label>
                <Select
                  className="w-full"
                  value={building}
                  onChange={(value) => setBuilding(value)}
                  placeholder="Select building"
                  disabled={!campus}
                >
                  {buildings
                    .filter((b) => b != null && b !== "")
                    .map((b) => (
                      <Option key={b} value={b}>
                        {b}
                      </Option>
                    ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Room</label>
                <Select
                  className="w-full"
                  value={name}
                  onChange={(value) => {
                    setName(value);
                    const selected = rooms.find((r) => r.name === value);
                    setRoomId(selected?.name || null);
                  }}
                  placeholder="Select room"
                  disabled={!building}
                >
                  {rooms
                    .filter((r) => r.name != null && r.name !== "")
                    .map((r) => (
                      <Option key={r.id} value={r.name}>
                        {r.name}
                      </Option>
                    ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Booking Date
            </h2>
            <DatePicker className="w-full" value={date} onChange={setDate} />
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Select Slots
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {/* # reset selection state button */}
              <button
                className="col-span-4 px-3 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 ml-auto"
                onClick={() => setSelectedSlots([])}
              >
                Reset
              </button>
              {/* # render slots */}
              {Array.from({ length: 16 }, (_, i) => i + 1).map((slot) => {
                const isAvailable = availableSlots.includes(slot);
                const isSelected = (startSession && endSession) ? (slot >= startSession && slot <= endSession) : false;

                return (
                  <button
                    key={slot}
                    disabled={!isAvailable}
                    className={`px-3 py-2 rounded-md text-sm font-semibold ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isAvailable
                          ? "bg-gray-200 text-gray-700 hover:bg-blue-100"
                          : "bg-red-100 text-red-400 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (!isAvailable) return;
                      handleSlotClick(slot);
                    }}
                  >
                    Session {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Course Details
            </h2>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Course Code
              </label>
              <AutoComplete
                className="w-full"
                options={suggestions}
                value={courseCode}
                onChange={
                  (value) => {
                    try {
                      const cleasedValue = InputValidationService.cleanseInput(value);
                      setCourseCode(cleasedValue);
                    } catch {
                      toast({
                        title: "Invalid Input",
                        description: "Please enter a valid course code.",
                        variant: "destructive",
                      })
                    }
                  }}
                placeholder="e.g., CO2001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1 mt-4">
                Course Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Course Name"
                value={courseName}
                readOnly
              />
              {loadingCourseName && (
                <p className="text-sm text-gray-500 mt-1">
                  Loading course name...
                </p>
              )}
            </div>
          </div>

          <div className="border p-4 rounded-lg">
            <label className="block text-sm text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details"
            />
          </div>

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

        <Modal
          title="Confirm Booking"
          open={isModalVisible}
          onOk={handleFinalConfirm}
          onCancel={() => setIsModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <div className="space-y-2 text-gray-800">
            <p>
              <strong>Campus:</strong> {campus}
            </p>
            <p>
              <strong>Building:</strong> {building}
            </p>
            <p>
              <strong>Room:</strong> {name}
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
    </>
  );
}
