"use client"; // Client component — uses React state and browser hooks

// ─────────────────────────────────────────────────────────────
// Lodgely — Rooms Page (app/rooms/page.tsx)
//
// URL: /rooms  OR  /rooms?hostelId=abc&hostelName=Block%20A
//
// This page shows a grid of rooms.
// It can work in two modes:
//   1. GLOBAL view — shows ALL rooms across all hostels
//      URL: /rooms
//   2. FILTERED view — shows rooms in ONE specific hostel
//      URL: /rooms?hostelId=abc123&hostelName=Block%20A
//      (You get here by clicking a hostel card on the homepage)
//
// Clicking a room card navigates to that room's students list.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DoorOpen, Plus, AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";

import { fetchRooms, createRoom, updateRoom, deleteRoom, fetchHostels } from "@/lib/api";
import type { Room, Hostel } from "@/lib/types";
import { RoomCard } from "@/components/RoomCard";
import { Modal } from "@/components/Modal";
import { RoomForm } from "@/components/RoomForm";

// ── Inner component (needs Suspense wrapper for useSearchParams) ──
function RoomsPageInner() {
  const router       = useRouter();

  // useSearchParams reads URL query parameters.
  // e.g. if URL is /rooms?hostelId=abc, then searchParams.get("hostelId") = "abc"
  const searchParams = useSearchParams();
  const hostelIdFilter   = searchParams.get("hostelId")   || ""; // Filter rooms by this hostel
  const hostelNameFilter = searchParams.get("hostelName") || ""; // Used for breadcrumb display

  // ── React State ───────────────────────────────────────────
  const [rooms,        setRooms]       = useState<Room[]>([]);
  const [hostels,      setHostels]     = useState<Hostel[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState<string | null>(null);
  const [isAddOpen,    setIsAddOpen]   = useState(false);
  const [isEditOpen,   setIsEditOpen]  = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // ── Data Loading ──────────────────────────────────────────
  // Loads rooms AND hostels in parallel using Promise.all().
  // We need hostels to populate the "select hostel" dropdown in the Add Room form.
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [roomsData, hostelsData] = await Promise.all([
        // If a hostelId filter exists, only fetch rooms for that hostel
        fetchRooms(hostelIdFilter ? { hostelId: hostelIdFilter } : undefined),
        fetchHostels(), // Always fetch all hostels (needed for the form dropdown)
      ]);
      setRooms(roomsData);
      setHostels(hostelsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run loadData whenever the hostelId filter changes (i.e. user navigates to a different hostel)
  useEffect(() => { loadData(); }, [hostelIdFilter]);

  // ── Create Handler ────────────────────────────────────────
  const handleCreate = async (data: {
    roomNumber: string; floor: number; capacity: number;
    type: string; pricePerMonth: number; hostelId: string;
  }) => {
    await createRoom(data);  // POST to backend
    setIsAddOpen(false);
    loadData();              // Refresh room list
  };

  // ── Update Handler ────────────────────────────────────────
  const handleUpdate = async (data: {
    roomNumber?: string; floor?: number; capacity?: number;
    type?: string; pricePerMonth?: number; status?: string;
  }) => {
    if (!selectedRoom) return;
    await updateRoom(selectedRoom.id, data); // PUT to backend
    setIsEditOpen(false);
    setSelectedRoom(null);
    loadData();
  };

  // ── Delete Handler ────────────────────────────────────────
  const handleDelete = async (id: string, roomNumber: string) => {
    if (!window.confirm(`Delete room ${roomNumber}?`)) return;
    try {
      await deleteRoom(id); // DELETE to backend (fails if students are inside)
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete room.");
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb: shows "← Hostels > [Hostel Name]" when filtered by hostel */}
          {hostelNameFilter && (
            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-1">
              <button onClick={() => router.push("/")} className="flex items-center gap-1 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Hostels
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{hostelNameFilter}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-indigo-400" />
            {/* Dynamic title: show hostel name if filtered, otherwise "All Rooms" */}
            {hostelNameFilter ? `${hostelNameFilter} — Rooms` : "All Rooms"}
          </h1>
          <p className="text-sm text-indigo-300 mt-1">
            {rooms.length} room{rooms.length !== 1 ? "s" : ""} · Click a room to view its students
          </p>
        </div>
        {/* Show "Add Room" button only if at least one hostel exists */}
        {hostels.length > 0 && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        )}
      </div>

      {/* ── Loading + Error States ────────────────────────── */}
      {loading && <p className="text-indigo-300">Loading rooms...</p>}
      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {/* Warning: no hostels exist yet (rooms need a hostel first) */}
      {!loading && hostels.length === 0 && (
        <div className="text-center py-12 border border-dashed border-indigo-700 rounded-lg">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <p className="text-indigo-300">Please add a hostel first before adding rooms.</p>
          <button onClick={() => router.push("/")} className="mt-2 text-sm text-indigo-400 hover:underline">Go to Hostels</button>
        </div>
      )}

      {/* Empty state: hostels exist but no rooms yet */}
      {!loading && !error && hostels.length > 0 && rooms.length === 0 && (
        <div className="text-center py-16 border border-dashed border-indigo-700 rounded-lg">
          <DoorOpen className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-300">No rooms yet.</p>
          <button onClick={() => setIsAddOpen(true)} className="mt-2 text-sm text-indigo-400 hover:underline">Add the first room</button>
        </div>
      )}

      {/* ── Rooms Grid ───────────────────────────────────── */}
      {/* Responsive grid: 1 col mobile → 2 sm → 3 lg → 4 xl */}
      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              // Clicking navigates to that room's students page
              // Passes hostel info in the URL so the breadcrumb works on the students page
              onClick={() =>
                router.push(
                  `/students?roomId=${room.id}&roomNumber=${encodeURIComponent(room.roomNumber)}${hostelNameFilter ? `&hostelName=${encodeURIComponent(hostelNameFilter)}&hostelId=${hostelIdFilter}` : ""}`
                )
              }
              className="cursor-pointer"
            >
              {/* RoomCard renders the visual room card UI */}
              <RoomCard
                room={room}
                onEdit={(e) => { e?.stopPropagation(); setSelectedRoom(room); setIsEditOpen(true); }}
                onDelete={(e) => { e?.stopPropagation(); handleDelete(room.id, room.roomNumber); }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {/* Add Room Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Room">
        <RoomForm
          hostels={hostels}
          defaultHostelId={hostelIdFilter || undefined} // Pre-select the current hostel if filtered
          onSubmit={handleCreate}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedRoom(null); }}
        title="Edit Room"
      >
        {selectedRoom && (
          <RoomForm
            initialData={selectedRoom} // Pre-fills form with current room values
            hostels={hostels}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelectedRoom(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

// ── Suspense Wrapper ──────────────────────────────────────────
// useSearchParams() requires the component to be wrapped in <Suspense>.
// This is a Next.js requirement for components that read URL params.
// The fallback is shown while the page is loading.
export default function RoomsPage() {
  return (
    <Suspense fallback={<p className="text-indigo-300 p-6">Loading rooms...</p>}>
      <RoomsPageInner />
    </Suspense>
  );
}
