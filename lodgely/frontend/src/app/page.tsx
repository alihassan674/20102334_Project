"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Edit2, Trash2, MapPin, ChevronRight } from "lucide-react";
import { fetchHostels, createHostel, updateHostel, deleteHostel } from "@/lib/api";
import type { Hostel } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { HostelForm } from "@/components/HostelForm";

export default function HostelsPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  const loadHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHostels();
      setHostels(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hostels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHostels(); }, []);

  const handleCreate = async (data: { name: string; totalFloors: number; address: string }) => {
    await createHostel(data);
    setIsAddOpen(false);
    loadHostels();
  };

  const handleUpdate = async (data: { name: string; totalFloors: number; address: string }) => {
    if (!selectedHostel) return;
    await updateHostel(selectedHostel.id, data);
    setIsEditOpen(false);
    setSelectedHostel(null);
    loadHostels();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This will also delete all its rooms and students.`)) return;
    try {
      await deleteHostel(id);
      loadHostels();
    } catch (err: any) {
      alert(err.message || "Failed to delete hostel.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Hostels
          </h1>
          <p className="text-sm text-indigo-300 mt-1">Click a hostel card to view its rooms</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Add Hostel
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-indigo-300">Loading hostels...</p>}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hostels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-indigo-700 rounded-lg">
          <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-300">No hostels yet.</p>
          <button onClick={() => setIsAddOpen(true)} className="mt-2 text-sm text-indigo-400 hover:underline">
            Add your first hostel
          </button>
        </div>
      )}

      {/* Hostel cards */}
      {!loading && !error && hostels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostels.map((hostel) => (
            <div
              key={hostel.id}
              onClick={() => router.push(`/rooms?hostelId=${hostel.id}&hostelName=${encodeURIComponent(hostel.name)}`)}
              className="rounded-lg p-5 cursor-pointer border border-indigo-700/50 hover:border-indigo-500 group"
              style={{ backgroundColor: "#1e1b4b" }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">{hostel.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedHostel(hostel); setIsEditOpen(true); }}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(hostel.id, hostel.name); }}
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-indigo-300 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {hostel.address}
              </div>

              <div className="flex items-center justify-between text-sm text-indigo-300 border-t border-indigo-700/50 pt-3">
                <span>{hostel.totalFloors} floors · {hostel._count?.rooms ?? 0} rooms</span>
                <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:text-indigo-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Hostel">
        <HostelForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedHostel(null); }}
        title="Edit Hostel"
      >
        {selectedHostel && (
          <HostelForm
            initialData={selectedHostel}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelectedHostel(null); }}
          />
        )}
      </Modal>
    </div>
  );
}
