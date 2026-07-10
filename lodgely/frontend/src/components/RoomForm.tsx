"use client"; // Marks this as a Client Component (runs in the browser, uses React state)

// ─────────────────────────────────────────────────────────────
// Lodgely — Room Form Component (components/RoomForm.tsx)
//
// This component displays the form to Add a new Room or Edit an existing one.
// It is embedded inside a Modal component on the /rooms page.
//
// Form behavior:
//   - When "Room Type" changes (Single, Double, Triple), the capacity
//     and price default to standard amounts automatically.
//   - Validates that the selected floor is not higher than the hostel's total floors.
//   - Disables editing the capacity or hostel of an already created room.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import type { Room, Hostel, RoomType, RoomStatus } from "@/lib/types"; // Import database types

interface RoomFormProps {
  initialData?: Room;       // If editing, this is the current room data; undefined if adding
  hostels: Hostel[];        // List of all hostels for the dropdown selection
  defaultHostelId?: string; // Pre-selected hostel ID if already inside a hostel view
  onSubmit: (data: {        // Callback when form is valid and submitted
    roomNumber: string; floor: number; capacity: number;
    type: string; pricePerMonth: number; hostelId: string; status?: string;
  }) => Promise<void>;
  onCancel: () => void;     // Callback to close the modal
}

// Styling classes for consistent input appearance (Tailwind CSS)
const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white border border-indigo-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50";
const labelClass = "block text-sm font-medium text-indigo-200 mb-1";
const inputBg = { backgroundColor: "#0f0e2e" };
const selectBg = { backgroundColor: "#0f0e2e" };

export function RoomForm({ initialData, hostels, defaultHostelId, onSubmit, onCancel }: RoomFormProps) {
  // ── Form State ─────────────────────────────────────────────
  // These variables hold the value of each input field
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || "");
  const [hostelId, setHostelId]     = useState(initialData?.hostelId || defaultHostelId || hostels[0]?.id || "");
  const [floorStr, setFloorStr]     = useState(String(initialData?.floor ?? 1));
  const [capacityStr, setCapacityStr] = useState(String(initialData?.capacity ?? 1));
  const [priceStr, setPriceStr]     = useState(String(initialData?.pricePerMonth ?? 2500));
  
  // Explicitly type `type` and `status` states as they use union string types
  const [type, setType]             = useState<RoomType>((initialData?.type as RoomType) || "SINGLE");
  const [status, setStatus]         = useState<RoomStatus>((initialData?.status as RoomStatus) || "AVAILABLE");
  
  const [loading, setLoading]       = useState(false);             // True while calling the API
  const [error, setError]           = useState<string | null>(null); // Error messages to show

  // Find the selected hostel to validate the floor count limit
  const selectedHostel = hostels.find((h) => h.id === hostelId);
  const maxFloors = selectedHostel?.totalFloors ?? 100;

  // ── Auto-fill effect based on room type ────────────────────
  // Only runs when creating a new room. Sets logical defaults.
  useEffect(() => {
    if (!initialData) {
      if (type === "SINGLE") { setCapacityStr("1"); setPriceStr("5000"); }
      if (type === "DOUBLE") { setCapacityStr("2"); setPriceStr("3500"); }
      if (type === "TRIPLE") { setCapacityStr("3"); setPriceStr("2500"); }
    }
  }, [type, initialData]);

  // ── Submit Handler ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload

    // Parse string inputs into numbers
    const floor         = parseInt(floorStr);
    const capacity      = parseInt(capacityStr);
    const pricePerMonth = parseInt(priceStr);

    // Validate inputs
    if (!roomNumber.trim() || !hostelId || isNaN(floor) || floor < 1 || isNaN(capacity) || capacity < 1 || isNaN(pricePerMonth) || pricePerMonth < 0) {
      setError("Please fill in all fields correctly.");
      return;
    }
    // Floor must exist within the physical hostel floors
    if (floor > maxFloors) {
      setError(`Floor cannot exceed hostel's total floors (${maxFloors}).`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Trigger parent callback (sends data to backend)
      await onSubmit({ roomNumber, floor, capacity, type, pricePerMonth, hostelId, status });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Show validation errors if any */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      {/* Hostel Selection + Room Number */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hostel</label>
          <select value={hostelId} onChange={(e) => setHostelId(e.target.value)}
            disabled={loading || !!initialData} className={inputClass} style={selectBg}>
            {hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Room Number</label>
          <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. A101" disabled={loading} className={inputClass} style={inputBg} />
        </div>
      </div>

      {/* Floor selection + Room type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Floor (max: {maxFloors})</label>
          <input type="number" min={1} max={maxFloors} value={floorStr}
            onChange={(e) => setFloorStr(e.target.value)} disabled={loading} className={inputClass} style={inputBg} />
        </div>
        <div>
          <label className={labelClass}>Room Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as RoomType)}
            disabled={loading} className={inputClass} style={selectBg}>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="TRIPLE">Triple</option>
          </select>
        </div>
      </div>

      {/* Bed capacity + Price per month */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Bed Capacity</label>
          <input type="number" min={1} max={10} value={capacityStr}
            onChange={(e) => setCapacityStr(e.target.value)} disabled={loading || !!initialData} className={inputClass} style={inputBg} />
        </div>
        <div>
          <label className={labelClass}>Price per Month ($)</label>
          <input type="number" min={0} value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)} disabled={loading} className={inputClass} style={inputBg} />
        </div>
      </div>

      {/* Room status (Only visible when EDITING an existing room) */}
      {initialData && (
        <div>
          <label className={labelClass}>Room Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as RoomStatus)}
            disabled={loading} className={inputClass} style={selectBg}>
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            {/* Occupied status is calculated by backend based on student list; cannot set manually */}
            <option value="OCCUPIED" disabled>Occupied (Set via student allocation)</option>
          </select>
        </div>
      )}

      {/* Form buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t border-indigo-700">
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 text-sm border border-indigo-600 rounded-lg text-indigo-300 hover:bg-indigo-800">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          {loading ? "Saving..." : initialData ? "Update Room" : "Add Room"}
        </button>
      </div>
    </form>
  );
}
