"use client"; // Marks this as a Client Component (uses React state and browser APIs)

// ─────────────────────────────────────────────────────────────
// Lodgely — Hostels Page (app/page.tsx)
//
// This is the HOMEPAGE of the application — the first page users see.
// URL: http://localhost:3000/
//
// What it does:
//   1. Fetches all hostels from the backend on page load
//   2. Displays them as clickable cards in a grid
//   3. Clicking a hostel card navigates to that hostel's rooms page
//   4. Provides Add, Edit, and Delete functionality via modals
//
// State Management:
//   - `hostels`       — the list of hostels fetched from the API
//   - `loading`       — true while the fetch is in progress
//   - `error`         — holds an error message if the fetch fails
//   - `isAddOpen`     — controls whether the "Add Hostel" modal is open
//   - `isEditOpen`    — controls whether the "Edit Hostel" modal is open
//   - `selectedHostel`— the hostel being edited (used to pre-fill the form)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js hook for programmatic navigation
import { Building2, Plus, Edit2, Trash2, MapPin, ChevronRight } from "lucide-react"; // Icons

// API functions from our centralized API client
import { fetchHostels, createHostel, updateHostel, deleteHostel } from "@/lib/api";
import type { Hostel } from "@/lib/types"; // TypeScript type for a hostel object

// Reusable UI components
import { Modal } from "@/components/Modal";
import { HostelForm } from "@/components/HostelForm";

export default function HostelsPage() {
  const router = useRouter(); // Used to navigate to /rooms when a hostel card is clicked

  // ── React State ───────────────────────────────────────────
  // useState creates a piece of state and a setter function.
  // Whenever state changes, React re-renders the component.
  const [hostels,        setHostels]       = useState<Hostel[]>([]); // Array of hostel objects
  const [loading,        setLoading]       = useState(true);          // Is data loading?
  const [error,          setError]         = useState<string | null>(null); // Error message
  const [isAddOpen,      setIsAddOpen]     = useState(false);         // Add modal open?
  const [isEditOpen,     setIsEditOpen]    = useState(false);         // Edit modal open?
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null); // Hostel being edited

  // ── Data Loading ──────────────────────────────────────────
  // Calls the backend GET /api/hostels and stores the result in state.
  const loadHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHostels(); // Calls backend, returns Hostel[]
      setHostels(data);
    } catch (err: any) {
      setError(err.message || "Failed to load hostels.");
    } finally {
      setLoading(false); // Always stop showing the loading indicator
    }
  };

  // ── useEffect: run loadHostels when the component first mounts ──
  // The empty [] dependency array means this runs ONCE when the page loads.
  useEffect(() => { loadHostels(); }, []);

  // ── Create Handler ────────────────────────────────────────
  // Called when the user submits the "Add Hostel" form.
  // Sends a POST request and then refreshes the hostel list.
  const handleCreate = async (data: { name: string; totalFloors: number; address: string }) => {
    await createHostel(data); // POST to backend
    setIsAddOpen(false);      // Close the modal
    loadHostels();            // Refresh the list to show the new hostel
  };

  // ── Update Handler ────────────────────────────────────────
  // Called when the user submits the "Edit Hostel" form.
  // Sends a PUT request and then refreshes the list.
  const handleUpdate = async (data: { name: string; totalFloors: number; address: string }) => {
    if (!selectedHostel) return;
    await updateHostel(selectedHostel.id, data); // PUT to backend
    setIsEditOpen(false);
    setSelectedHostel(null);
    loadHostels();
  };

  // ── Delete Handler ────────────────────────────────────────
  // Called when the user clicks the trash icon on a hostel card.
  // Shows a browser confirm dialog before actually deleting.
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This will also delete all its rooms and students.`)) return;
    try {
      await deleteHostel(id); // DELETE to backend
      loadHostels();          // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to delete hostel.");
    }
  };

  // ── JSX (what gets rendered on screen) ───────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header + Add Button ─────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Hostels
          </h1>
          <p className="text-sm text-indigo-300 mt-1">Click a hostel card to view its rooms</p>
        </div>
        {/* Button opens the Add Hostel modal */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Add Hostel
        </button>
      </div>

      {/* ── Loading State ────────────────────────────────── */}
      {loading && <p className="text-indigo-300">Loading hostels...</p>}

      {/* ── Error State ──────────────────────────────────── */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ── Empty State (no hostels yet) ─────────────────── */}
      {!loading && !error && hostels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-indigo-700 rounded-lg">
          <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-300">No hostels yet.</p>
          <button onClick={() => setIsAddOpen(true)} className="mt-2 text-sm text-indigo-400 hover:underline">
            Add your first hostel
          </button>
        </div>
      )}

      {/* ── Hostel Cards Grid ─────────────────────────────── */}
      {/* Renders a responsive grid of hostel cards (1 col on mobile, 3 on desktop) */}
      {!loading && !error && hostels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostels.map((hostel) => (
            <div
              key={hostel.id} // React requires a unique key for each list item
              // Navigate to the rooms page for this hostel when card is clicked
              onClick={() => router.push(`/rooms?hostelId=${hostel.id}&hostelName=${encodeURIComponent(hostel.name)}`)}
              className="rounded-lg p-5 cursor-pointer border border-indigo-700/50 hover:border-indigo-500 group"
              style={{ backgroundColor: "#1e1b4b" }}
            >
              {/* Top row: hostel name + edit/delete buttons (only visible on hover) */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">{hostel.name}</h3>
                </div>
                {/* Action buttons appear on hover (opacity-0 by default, opacity-100 on group-hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  {/* Edit button — stops click from propagating to the card (which would navigate) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedHostel(hostel); setIsEditOpen(true); }}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(hostel.id, hostel.name); }}
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1 text-sm text-indigo-300 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {hostel.address}
              </div>

              {/* Bottom row: floor count + room count + arrow icon */}
              <div className="flex items-center justify-between text-sm text-indigo-300 border-t border-indigo-700/50 pt-3">
                <span>{hostel.totalFloors} floors · {hostel._count?.rooms ?? 0} rooms</span>
                <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:text-indigo-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {/* Add Hostel Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Hostel">
        <HostelForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Hostel Modal — only renders the form if a hostel is selected */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedHostel(null); }}
        title="Edit Hostel"
      >
        {selectedHostel && (
          <HostelForm
            initialData={selectedHostel} // Pre-fills the form with current values
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelectedHostel(null); }}
          />
        )}
      </Modal>
    </div>
  );
}
