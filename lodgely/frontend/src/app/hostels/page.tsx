"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Edit2, Trash2, MapPin, Layers, DoorOpen, AlertTriangle } from "lucide-react";
import { fetchHostels, createHostel, updateHostel, deleteHostel } from "@/lib/api";
import type { Hostel } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { HostelForm } from "@/components/HostelForm";

export default function HostelsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  const loadHostels = async () => {
    try {
      setLoading(true);
      const data = await fetchHostels();
      setHostels(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hostels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  const handleCreateHostel = async (data: { name: string; totalFloors: number; address: string }) => {
    await createHostel(data);
    setIsAddOpen(false);
    loadHostels();
  };

  const handleUpdateHostel = async (data: { name: string; totalFloors: number; address: string }) => {
    if (!selectedHostel) return;
    await updateHostel(selectedHostel.id, data);
    setIsEditOpen(false);
    setSelectedHostel(null);
    loadHostels();
  };

  const handleDeleteHostel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will delete all rooms and student allocations associated with it.`)) {
      return;
    }
    try {
      await deleteHostel(id);
      loadHostels();
    } catch (err: any) {
      alert(err.message || "Failed to delete hostel.");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-brand-400" />
            Hostels
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage your physical campus residence structures
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Hostel
        </button>
      </div>

      {/* Loading & Errors */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-surface-800/20"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-amber-400">{error}</p>
        </div>
      )}

      {/* Hostels List */}
      {!loading && !error && (
        <>
          {hostels.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Building2 className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No hostels managed yet</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Add your first hostel structure
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hostels.map((hostel, idx) => (
                <div
                  key={hostel.id}
                  className="glass-card rounded-2xl p-5 stat-card relative group animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Actions (visible on hover) */}
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => {
                        setSelectedHostel(hostel);
                        setIsEditOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHostel(hostel.id, hostel.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display">
                        {hostel.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-surface-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {hostel.address}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-800/40">
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <Layers className="w-4 h-4 text-surface-500" />
                      <span>{hostel.totalFloors} floors</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <DoorOpen className="w-4 h-4 text-surface-500" />
                      <span>{hostel._count?.rooms || 0} rooms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Hostel Structure"
      >
        <HostelForm
          onSubmit={handleCreateHostel}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedHostel(null);
        }}
        title="Edit Hostel Details"
      >
        {selectedHostel && (
          <HostelForm
            initialData={selectedHostel}
            onSubmit={handleUpdateHostel}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedHostel(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
