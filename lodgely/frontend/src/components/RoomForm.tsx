"use client";

import { useState, useEffect } from "react";
import type { Room, Hostel } from "@/lib/types";

interface RoomFormProps {
  initialData?: Room;
  hostels: Hostel[];
  defaultHostelId?: string;
  onSubmit: (data: {
    roomNumber: string; floor: number; capacity: number;
    type: string; pricePerMonth: number; hostelId: string; status?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white border border-indigo-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50";
const labelClass = "block text-sm font-medium text-indigo-200 mb-1";
const inputBg = { backgroundColor: "#0f0e2e" };
const selectBg = { backgroundColor: "#0f0e2e" };

export function RoomForm({ initialData, hostels, defaultHostelId, onSubmit, onCancel }: RoomFormProps) {
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || "");
  const [hostelId, setHostelId] = useState(initialData?.hostelId || defaultHostelId || hostels[0]?.id || "");
  const [floorStr, setFloorStr] = useState(String(initialData?.floor ?? 1));
  const [capacityStr, setCapacityStr] = useState(String(initialData?.capacity ?? 1));
  const [priceStr, setPriceStr] = useState(String(initialData?.pricePerMonth ?? 2500));
  const [type, setType] = useState(initialData?.type || "SINGLE");
  const [status, setStatus] = useState(initialData?.status || "AVAILABLE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedHostel = hostels.find((h) => h.id === hostelId);
  const maxFloors = selectedHostel?.totalFloors ?? 100;

  useEffect(() => {
    if (!initialData) {
      if (type === "SINGLE") { setCapacityStr("1"); setPriceStr("5000"); }
      if (type === "DOUBLE") { setCapacityStr("2"); setPriceStr("3500"); }
      if (type === "TRIPLE") { setCapacityStr("3"); setPriceStr("2500"); }
    }
  }, [type, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const floor = parseInt(floorStr);
    const capacity = parseInt(capacityStr);
    const pricePerMonth = parseInt(priceStr);
    if (!roomNumber.trim() || !hostelId || isNaN(floor) || floor < 1 || isNaN(capacity) || capacity < 1 || isNaN(pricePerMonth) || pricePerMonth < 0) {
      setError("Please fill in all fields correctly.");
      return;
    }
    if (floor > maxFloors) {
      setError(`Floor cannot exceed hostel's total floors (${maxFloors}).`);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({ roomNumber, floor, capacity, type, pricePerMonth, hostelId, status });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Floor (max: {maxFloors})</label>
          <input type="number" min={1} max={maxFloors} value={floorStr}
            onChange={(e) => setFloorStr(e.target.value)} disabled={loading} className={inputClass} style={inputBg} />
        </div>
        <div>
          <label className={labelClass}>Room Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            disabled={loading} className={inputClass} style={selectBg}>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="TRIPLE">Triple</option>
          </select>
        </div>
      </div>

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

      {initialData && (
        <div>
          <label className={labelClass}>Room Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            disabled={loading} className={inputClass} style={selectBg}>
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OCCUPIED" disabled>Occupied (Set via student allocation)</option>
          </select>
        </div>
      )}

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
