"use client";

import { useState } from "react";
import type { Student, Room } from "@/lib/types";

interface StudentFormProps {
  initialData?: Student;
  rooms?: Room[];
  onSubmit: (data: {
    name: string; email: string; rollNumber?: string; phone: string; roomId?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white border border-indigo-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50";
const labelClass = "block text-sm font-medium text-indigo-200 mb-1";
const inputBg = { backgroundColor: "#0f0e2e" };

export function StudentForm({ initialData, rooms = [], onSubmit, onCancel }: StudentFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [rollNumber, setRollNumber] = useState(initialData?.rollNumber || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRooms = rooms.filter((r) => {
    const occupants = r.currentOccupants ?? r._count?.students ?? r.occupants ?? 0;
    return r.status === "AVAILABLE" && occupants < r.capacity;
  });

  const [roomId, setRoomId] = useState(initialData?.roomId || availableRooms[0]?.id || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!initialData && (!rollNumber.trim() || !roomId)) {
      setError("Roll number and room assignment are required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({ name, email, phone, ...(!initialData && { rollNumber, roomId }) });
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

      <div>
        <label className={labelClass}>Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe" disabled={loading} className={inputClass} style={inputBg} />
      </div>

      <div>
        <label className={labelClass}>Email Address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. john@university.edu" disabled={loading} className={inputClass} style={inputBg} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210" disabled={loading} className={inputClass} style={inputBg} />
        </div>
        {!initialData && (
          <div>
            <label className={labelClass}>Roll Number</label>
            <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 20240042" disabled={loading} className={inputClass} style={inputBg} />
          </div>
        )}
      </div>

      {!initialData && (
        <div>
          <label className={labelClass}>Room Assignment</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
            disabled={loading} className={inputClass} style={inputBg}>
            {availableRooms.length === 0 ? (
              <option value="" disabled>No rooms with available beds</option>
            ) : (
              availableRooms.map((r) => {
                const occupants = r.currentOccupants ?? r._count?.students ?? r.occupants ?? 0;
                return (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} ({r.hostel?.name || "Hostel"}) — {r.capacity - occupants} beds left [${r.pricePerMonth}/mo]
                  </option>
                );
              })
            )}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-indigo-700">
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 text-sm border border-indigo-600 rounded-lg text-indigo-300 hover:bg-indigo-800">
          Cancel
        </button>
        <button type="submit" disabled={loading || (!initialData && availableRooms.length === 0)}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50">
          {loading ? "Saving..." : initialData ? "Update Student" : "Register Student"}
        </button>
      </div>
    </form>
  );
}
