"use client";

import { useState } from "react";
import type { Hostel } from "@/lib/types";

interface HostelFormProps {
  initialData?: Hostel;
  onSubmit: (data: { name: string; totalFloors: number; address: string }) => Promise<void>;
  onCancel: () => void;
}

const inputClass = "w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 border border-indigo-700 disabled:opacity-50";
const labelClass = "block text-sm font-medium text-indigo-200 mb-1";

export function HostelForm({ initialData, onSubmit, onCancel }: HostelFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [totalFloorsStr, setTotalFloorsStr] = useState(String(initialData?.totalFloors ?? 1));
  const [address, setAddress] = useState(initialData?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalFloors = parseInt(totalFloorsStr);
    if (!name.trim() || !address.trim() || isNaN(totalFloors) || totalFloors < 1) {
      setError("Please fill in all fields correctly.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({ name, totalFloors, address });
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
        <label className={labelClass}>Hostel Name</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Block A Hostel" disabled={loading}
          className={inputClass} style={{ backgroundColor: "#0f0e2e" }}
        />
      </div>

      <div>
        <label className={labelClass}>Total Floors</label>
        <input
          type="number" min={1} max={100} value={totalFloorsStr}
          onChange={(e) => setTotalFloorsStr(e.target.value)} disabled={loading}
          className={inputClass} style={{ backgroundColor: "#0f0e2e" }}
        />
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <textarea
          value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 12 University Road" rows={3} disabled={loading}
          className={`${inputClass} resize-none`} style={{ backgroundColor: "#0f0e2e" }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-indigo-700">
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 text-sm border border-indigo-600 rounded-lg text-indigo-300 hover:bg-indigo-800">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          {loading ? "Saving..." : initialData ? "Update Hostel" : "Add Hostel"}
        </button>
      </div>
    </form>
  );
}
