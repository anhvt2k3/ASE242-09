// import { useState, useEffect } from "react";
// import { useSearchParams } from "wouter";
// import { DatePicker, Modal, AutoComplete, Select } from "antd";
// import { useAuth } from "@/hooks/use-auth";
// import { Navbar } from "@/components/layout/navbar";
// import type { Dayjs } from "dayjs";
// import dayjs from "dayjs";
// import "antd/dist/reset.css";
// // import { getAuthToken } from "./auth"; // Adjust path if needed
// import { apiRequest } from "@/lib/queryClient";
// import { DatabaseZap } from "lucide-react";

// const { Option } = Select;

// export default function BookingPage() {
//   const { user } = useAuth();
//   const [searchParams] = useSearchParams();
//   const dateParam = searchParams.get("date");
//   // const token = getAuthToken();

//   const [campus, setCampus] = useState("");
//   const [building, setBuilding] = useState("");
//   const [room, setRoom] = useState(() => {
//     const roomId = searchParams.get("roomId");

//     if (roomId) {
//       (async () => {
//         try {
//           const res = await apiRequest("GET", `/api/rooms/${roomId}`);
//           const data = await res.json() as {
//             name: string;
//             number: number;
//             floor: number;
//             building: string;
//             campus: string;
//           };
//           setRoom(data.name); // asynchronously update
//         } catch (err) {
//           console.error("Room fetch failed", err);
//         }
//       })();
//     }

//     return ""; // initial value
//   });

//   const [date, setDate] = useState<Dayjs | null>(dateParam ? dayjs(dateParam) : null);
//   const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
//   const [courseCode, setCourseCode] = useState("");
//   const [courseName, setCourseName] = useState("");
//   const [description, setDescription] = useState("");
//   const [autoToggle, setAutoToggle] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [suggestions, setSuggestions] = useState<{ value: string }[]>([]);

//   const locations: { [campus: string]: { [building: string]: string[] } } = {
//     "Campus 1": {
//       "Building A": ["A101", "A102", "A103"],
//       "Building B": ["B101", "B102", "B103"],
//     },
//     "Campus 2": {
//       "Building C": ["C101", "C102", "C103"],
//       "Building D": ["D101", "D102", "D103"],
//     },
//   };

//   const unavailableSlotsByDateAndRoom: {
//     [date: string]: {
//       [room: string]: number[];
//     };
//   } = {
//     "2025-05-01": {
//       A101: [3, 4, 10],
//       B101: [1, 2],
//     },
//     "2025-05-02": {
//       A101: [1, 2, 5],
//       C101: [3, 4],
//     },
//     "2025-05-03": {
//       B101: [6, 7, 8],
//       D101: [1, 2, 3],
//     },
//   };

//   const handleSlotClick = (slot: number) => {
//     if (!date || !room) return;
//     const formattedDate = date.format("YYYY-MM-DD");
//     const unavailableSlots = unavailableSlotsByDateAndRoom[formattedDate]?.[room] || [];
//     if (unavailableSlots.includes(slot)) return;
//     setSelectedSlots((prev) =>
//       prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
//     );
//   };

//   const handleConfirmClick = async () => {
//     if (!campus || !building || !room || !date || selectedSlots.length === 0 || !courseCode.trim() || !courseName.trim()) {
//       alert("Please fill in all required fields.");
//       return;
//     }

//     const formattedDate = date.format("YYYY-MM-DD");
//     const startSession = Math.min(...selectedSlots);
//     const endSession = Math.max(...selectedSlots);

//     try {
//       // const url = `https://dcc8-116-110-42-167.ngrok-free.app/api/roomschedules/isAvailable?date=${encodeURIComponent(formattedDate)}&startSession=${startSession}&endSession=${endSession}&campus=${encodeURIComponent(campus)}&building=${encodeURIComponent(building)}&name=${encodeURIComponent(room)}`;

//       // const response = await fetch(url, {
//       //   method: "GET",
//       //   headers: {
//       //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       //     "ngrok-skip-browser-warning": "true",
//       //   },
//       // });
//       const response = await apiRequest("GET", "/api/roomschedules/isAvailable?date=" + encodeURIComponent(formattedDate) + "&startSession=" + startSession + "&endSession=" + endSession + "&campus=" + encodeURIComponent(campus) + "&building=" + encodeURIComponent(building) + "&name=" + encodeURIComponent(room));

//       if (!response.ok) {
//         throw new Error("Failed to check availability");
//       }

//       const data = await response.json();
//       if (!data.isAvailable) {
//         alert("Selected slots are not available. Please choose different slots or date.");
//         return;
//       }

//       setIsModalVisible(true);
//     } catch (err) {
//       alert("Error checking availability. Please try again.");
//       console.error(err);
//     }
//   };

//   const handleFinalConfirm = async () => {
//     setIsModalVisible(false);

//     if (!date || selectedSlots.length === 0) {
//       alert("Invalid booking data.");
//       return;
//     }

//     const formattedDate = date.format("YYYY-MM-DD");
//     const startSession = Math.min(...selectedSlots);
//     const endSession = Math.max(...selectedSlots);
//     // const token = getAuthToken();

//     try {
//       await apiRequest("POST", "/api/roomschedules", {
//         campus,
//         building,
//         room,
//         date: formattedDate,
//         startSession,
//         endSession,
//         courseCode,
//         courseName,
//         description,
//         autoToggle,
//       });
//       // await fetch(`https://dcc8-116-110-42-167.ngrok-free.app/api/roomschedules`, {
//       //   method: "POST",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       //     "ngrok-skip-browser-warning": "true",
//       //   },
//       //   body: JSON.stringify({
//       //     campus,
//       //     building,
//       //     room,
//       //     date: formattedDate,
//       //     slots: selectedSlots,
//       //     courseCode,
//       //     courseName,
//       //     description,
//       //     autoToggle,
//       //   }),
//       // });

//       alert("Room booking successful!");
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to book room.");
//     }
//   };

//   const resetForm = () => {
//     setCampus("");
//     setBuilding("");
//     setRoom("");
//     setDate(null);
//     setSelectedSlots([]);
//     setCourseCode("");
//     setCourseName("");
//     setDescription("");
//     setAutoToggle(false);
//   };

//   useEffect(() => {
//     if (courseCode.trim() === "") {
//       setSuggestions([]);
//       return;
//     }
//     const filteredSuggestions = ["CO2001", "CO2002", "CO3001", "CO3002", "IM1013"]
//       .filter((code) => code.toLowerCase().includes(courseCode.toLowerCase()))
//       .map((code) => ({ value: code }));
//     setSuggestions(filteredSuggestions);
//   }, [courseCode]);

//   const getUnavailableSlots = () => {
//     if (!date || !room) return [];
//     const formattedDate = date.format("YYYY-MM-DD");
//     return unavailableSlotsByDateAndRoom[formattedDate]?.[room] || [];
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 flex items-center justify-center">
//         <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600">Room Booking</h1>

//           {user && (
//             <div className="mb-4 text-right text-sm text-gray-600">
//               Logged in as <span className="font-semibold">{user.username}</span>
//             </div>
//           )}

//           {/* Room selection */}
//           <div className="border p-4 rounded-lg bg-blue-50">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Selection</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">Campus</label>
//                 <Select
//                   className="w-full"
//                   value={campus}
//                   onChange={(value) => {
//                     setCampus(value);
//                     setBuilding("");
//                     setRoom("");
//                   }}
//                   placeholder="Select campus"
//                 >
//                   {Object.keys(locations).map((c) => (
//                     <Option key={c} value={c}>
//                       {c}
//                     </Option>
//                   ))}
//                 </Select>
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">Building</label>
//                 <Select
//                   className="w-full"
//                   value={building}
//                   onChange={(value) => {
//                     setBuilding(value);
//                     setRoom("");
//                   }}
//                   placeholder="Select building"
//                   disabled={!campus}
//                 >
//                   {campus &&
//                     Object.keys(locations[campus]).map((b) => (
//                       <Option key={b} value={b}>
//                         {b}
//                       </Option>
//                     ))}
//                 </Select>
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-700 mb-1">Room</label>
//                 <Select
//                   className="w-full"
//                   value={room}
//                   onChange={setRoom}
//                   placeholder="Select room"
//                   disabled={!building}
//                 >
//                   {campus &&
//                     building &&
//                     locations[campus][building].map((r) => (
//                       <Option key={r} value={r}>
//                         {r}
//                       </Option>
//                     ))}
//                 </Select>
//               </div>
//             </div>
//           </div>

//           {/* Choose date */}
//           <div className="border p-4 rounded-lg space-y-4">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Booking Date</h2>
//             <DatePicker className="w-full" value={date} onChange={setDate} />
//           </div>

//           {/* Choose slots */}
//           <div className="border p-4 rounded-lg space-y-4">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">Select Slots</h2>
//             <div className="grid grid-cols-4 gap-2">
//               {Array.from({ length: 16 }, (_, i) => i + 1).map((slot) => (
//                 <button
//                   key={slot}
//                   className={`px-3 py-2 rounded-md text-sm font-semibold ${
//                     getUnavailableSlots().includes(slot)
//                       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                       : selectedSlots.includes(slot)
//                       ? "bg-blue-500 text-white"
//                       : "bg-gray-200 text-gray-700 hover:bg-blue-100"
//                   }`}
//                   onClick={() => handleSlotClick(slot)}
//                   disabled={getUnavailableSlots().includes(slot)}
//                 >
//                   Session {slot}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Course Info */}
//           <div className="border p-4 rounded-lg space-y-4">
//             <h2 className="text-lg font-semibold text-gray-800">Course Details</h2>
//             <div>
//               <label className="block text-sm text-gray-700 mb-1">Course Code</label>
//               <AutoComplete
//                 className="w-full"
//                 options={suggestions}
//                 value={courseCode}
//                 onChange={(value) => setCourseCode(value)}
//                 placeholder="e.g., CO2001"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-700 mb-1">Course Name</label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={courseName}
//                 onChange={(e) => setCourseName(e.target.value)}
//                 placeholder="e.g., Introduction to Programming"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-700 mb-1">Lesson Content</label>
//               <textarea
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Enter content for this session"
//                 rows={3}
//               />
//             </div>
//           </div>

//           {/* Auto Toggle */}
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="auto-toggle"
//               className="mr-2"
//               checked={autoToggle}
//               onChange={(e) => setAutoToggle(e.target.checked)}
//             />
//             <label htmlFor="auto-toggle" className="text-sm text-gray-700">
//               Automatically turn on devices when entering the room
//             </label>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3">
//             <button
//               className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
//               onClick={resetForm}
//             >
//               CANCEL
//             </button>
//             <button
//               className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
//               onClick={handleConfirmClick}
//             >
//               CONFIRM
//             </button>
//           </div>
//         </div>

//         {/* Confirmation Modal */}
//         <Modal
//           title="Confirm Booking"
//           open={isModalVisible}
//           onOk={handleFinalConfirm}
//           onCancel={() => setIsModalVisible(false)}
//           okText="Confirm"
//           cancelText="Cancel"
//         >
//           <div className="space-y-2 text-gray-800">
//             <p><strong>Campus:</strong> {campus}</p>
//             <p><strong>Building:</strong> {building}</p>
//             <p><strong>Room:</strong> {room}</p>
//             <p><strong>Date:</strong> {date?.format("DD/MM/YYYY")}</p>
//             <p><strong>Slots:</strong> {selectedSlots.join(", ")}</p>
//             <p><strong>Course Code:</strong> {courseCode}</p>
//             <p><strong>Course Name:</strong> {courseName}</p>
//             {description && <p><strong>Content:</strong> {description}</p>}
//             <p><strong>Auto Device Toggle:</strong> {autoToggle ? "Yes" : "No"}</p>
//           </div>
//         </Modal>
//       </div>
//     </>
//   );
// }




import { useState, useEffect } from "react";
import { DatePicker, Modal, AutoComplete, Select } from "antd";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "antd/dist/reset.css";

const { Option } = Select;

export default function BookingPage() {
  const { user } = useAuth();

  const [campus, setCampus] = useState("");
  const [building, setBuilding] = useState("");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [autoToggle, setAutoToggle] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<{ value: string }[]>([]);
  const [locations, setLocations] = useState<{ [campus: string]: { [building: string]: { id: number, name: string }[] } }>({});
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
  const fetchBuildingsAndRooms = async () => {
    try {
      const campusIds = [1]; // Extend this list if needed
      const newLocations: typeof locations = {};

      for (const campusId of campusIds) {
        const campusKey = String(campusId); // Always use string keys
        const buildingsRes = await apiRequest("GET", `/api/roomschedules/buildingByCampus?campus=${campusId}`);
        const buildings = await buildingsRes.json();

        newLocations[campusKey] = {};

        for (const building of buildings) {
          const roomsRes = await apiRequest("GET", `/api/roomschedules/nameByBuilding?building=${building}&campus=${campusId}`);
          const rooms = await roomsRes.json();
          newLocations[campusKey][building] = rooms.map((room: { id: number; name: string }) => room);
        }
      }

      setLocations(newLocations);
    } catch (error) {
      console.error("Failed to load locations", error);
      alert(error);
    } finally {
      setLoadingLocations(false);
    }
  };

  fetchBuildingsAndRooms();
}, []);


  const handleSlotClick = (slot: number) => {
    if (!date || !roomId) return;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleConfirmClick = async () => {
    if (!campus || !building || !name || !roomId || !date || selectedSlots.length === 0 || !courseCode.trim() || !courseName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const formattedDate = date.format("YYYY-MM-DD");

    try {
      const response = await apiRequest("GET", `/api/roomschedules/available/${formattedDate}?id=${roomId}`);
      const data = await response.json();

      const availableSlots: number[] = data.sessions || [];
      const isAvailable = selectedSlots.every((s) => availableSlots.includes(s));

      if (!isAvailable) {
        alert("Selected slots are not available. Please choose different slots.");
        return;
      }

      setIsModalVisible(true);
    } catch (err) {
      console.error(err);
      alert("Error checking availability. Please try again.");
    }
  };

  const handleFinalConfirm = async () => {
    setIsModalVisible(false);

    if (!date || selectedSlots.length === 0 || !roomId) {
      alert("Invalid booking data.");
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
    subjectId: 1, // or use courseCode/courseName if needed
    courseCode,
    courseName,
    description,
    startSession,
    endSession,
    autoToggle,
  });

      alert("Room booking successful!");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to book room.");
    }
  };

  const resetForm = () => {
    setCampus("");
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

    const filtered = ["CO2001", "CO2002", "CO3001", "CO3002", "IM1013"]
      .filter((code) => code.toLowerCase().includes(courseCode.toLowerCase()))
      .map((code) => ({ value: code }));
    setSuggestions(filtered);
  }, [courseCode]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-600">Room Booking</h1>

          {user && (
            <div className="mb-4 text-right text-sm text-gray-600">
              Logged in as <span className="font-semibold">{user.username}</span>
            </div>
          )}

          <div className="border p-4 rounded-lg bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Selection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Campus</label>
                <Select
                  className="w-full"
                  value={campus}
                  onChange={(value) => {
                    setCampus(value);
                    setBuilding("");
                    setName("");
                    setRoomId(null);
                  }}
                  placeholder="Select campus"
                  loading={loadingLocations}
                >
                  {Object.keys(locations).map((c) => (
                    <Option key={c} value={c}>{c}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Building</label>
                <Select
                  className="w-full"
                  value={building}
                  onChange={(value) => {
                    setBuilding(value);
                    setName("");
                    setRoomId(null);
                  }}
                  placeholder="Select building"
                  disabled={!campus}
                >
                  {campus &&
                    Object.keys(locations[campus] || {}).map((b) => (
                      <Option key={b} value={b}>{b}</Option>
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
                    const selected = (locations[campus]?.[building] || []).find(r => r.name === value);
                    setRoomId(selected?.id || null);
                  }}
                  placeholder="Select room"
                  disabled={!building}
                >
                  {(locations[campus]?.[building] || []).map((r) => (
                    <Option key={r.id} value={r.name}>{r.name}</Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Booking Date</h2>
            <DatePicker className="w-full" value={date} onChange={setDate} />
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Select Slots</h2>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((slot) => (
                <button
                  key={slot}
                  className={`px-3 py-2 rounded-md text-sm font-semibold ${
                    selectedSlots.includes(slot)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                  }`}
                  onClick={() => handleSlotClick(slot)}
                >
                  Session {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="border p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Course Details</h2>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Course Code</label>
              <AutoComplete
                className="w-full"
                options={suggestions}
                value={courseCode}
                onChange={setCourseCode}
                placeholder="e.g., CO2001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Lesson Content</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
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
            <p><strong>Campus:</strong> {campus}</p>
            <p><strong>Building:</strong> {building}</p>
            <p><strong>Room:</strong> {name}</p>
            <p><strong>Date:</strong> {date?.format("DD/MM/YYYY")}</p>
            <p><strong>Slots:</strong> {selectedSlots.join(", ")}</p>
            <p><strong>Course Code:</strong> {courseCode}</p>
            <p><strong>Course Name:</strong> {courseName}</p>
            {description && <p><strong>Content:</strong> {description}</p>}
            <p><strong>Auto Device Toggle:</strong> {autoToggle ? "Yes" : "No"}</p>
          </div>
        </Modal>
      </div>
    </>
  );
}