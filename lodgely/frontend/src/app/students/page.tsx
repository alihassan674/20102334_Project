"use client"; // Client component — uses React hooks and browser APIs

// ─────────────────────────────────────────────────────────────
// Lodgely — Students Page (app/students/page.tsx)
//
// URL: /students  OR  /students?roomId=abc&roomNumber=101&hostelName=Block%20A
//
// This page shows a grid of student cards.
// It works in two modes:
//   1. GLOBAL view — shows ALL students across all rooms
//      URL: /students
//   2. FILTERED view — shows students in ONE specific room
//      URL: /students?roomId=abc&roomNumber=101&hostelName=Block+A
//      (You get here by clicking a room card on the Rooms page)
//
// Each student card shows name, roll number, email, phone, check-in date.
// You can Register a new student, Edit their info, or Check them out.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap, Mail, Phone, Calendar, DoorOpen,
  AlertTriangle, Plus, Edit2, Trash2, ArrowLeft, ChevronRight,
} from "lucide-react";

import { fetchStudents, createStudent, updateStudent, deleteStudent, fetchRooms } from "@/lib/api";
import type { Student, Room } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { StudentForm } from "@/components/StudentForm";

// ── Inner component (needs Suspense for useSearchParams) ──────
function StudentsPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams(); // Read URL query parameters

  // Read context from URL — these are passed when navigating from the Rooms page
  const roomIdFilter     = searchParams.get("roomId")     || ""; // Filter by room
  const roomNumberFilter = searchParams.get("roomNumber") || ""; // For breadcrumb display
  const hostelNameFilter = searchParams.get("hostelName") || ""; // For breadcrumb display
  const hostelIdFilter   = searchParams.get("hostelId")   || ""; // For breadcrumb navigation

  // ── React State ───────────────────────────────────────────
  const [students,        setStudents]       = useState<Student[]>([]);
  const [rooms,           setRooms]          = useState<Room[]>([]);   // All rooms (for the register form dropdown)
  const [loading,         setLoading]        = useState(true);
  const [error,           setError]          = useState<string | null>(null);
  const [isAddOpen,       setIsAddOpen]      = useState(false);
  const [isEditOpen,      setIsEditOpen]     = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // Student being edited

  // ── Data Loading ──────────────────────────────────────────
  // Fetches students and all rooms in parallel.
  // Rooms are needed to populate the room dropdown in the Register Student form.
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, roomsData] = await Promise.all([
        // If roomId filter exists, only fetch students in that room
        fetchStudents(roomIdFilter ? { roomId: roomIdFilter } : undefined),
        fetchRooms(), // All rooms (for the form dropdown)
      ]);
      setStudents(studentsData);
      setRooms(roomsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run loadData whenever the roomId filter changes
  useEffect(() => { loadData(); }, [roomIdFilter]);

  // ── Register Handler ──────────────────────────────────────
  // Called when the user submits the "Register Student" form.
  const handleRegister = async (data: {
    name: string; email: string; rollNumber?: string; phone: string; roomId?: string;
  }) => {
    if (!data.rollNumber || !data.roomId) return; // Both are required for student registration
    await createStudent({
      name: data.name, email: data.email,
      rollNumber: data.rollNumber, phone: data.phone, roomId: data.roomId,
    });
    setIsAddOpen(false);
    loadData(); // Refresh to show the new student
  };

  // ── Update Handler ────────────────────────────────────────
  // Called when the user submits the "Edit Student" form.
  // Only name, email, and phone can be changed.
  const handleUpdate = async (data: { name: string; email: string; phone: string }) => {
    if (!selectedStudent) return;
    await updateStudent(selectedStudent.id, data); // PUT to backend
    setIsEditOpen(false);
    setSelectedStudent(null);
    loadData();
  };

  // ── Check-out Handler ─────────────────────────────────────
  // Called when the user clicks the trash icon on a student card.
  // "Check out" = remove the student from the system and free their bed.
  const handleCheckout = async (id: string, name: string) => {
    if (!window.confirm(`Check out "${name}"? This will free their bed.`)) return;
    try {
      await deleteStudent(id); // DELETE to backend
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to checkout student.");
    }
  };

  // Check if there is at least one available room with free beds.
  // If no rooms are available, the "Register Student" button is hidden.
  const hasAvailableRoom = rooms.some(
    (r) => r.status === "AVAILABLE" && (r.currentOccupants ?? r._count?.students ?? r.occupants ?? 0) < r.capacity
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb navigation: shows path like "← Hostels > Block A > Room 101" */}
          {(roomNumberFilter || hostelNameFilter) && (
            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-1 flex-wrap">
              {hostelNameFilter && (
                <>
                  {/* Back to Hostels */}
                  <button onClick={() => router.push("/")} className="flex items-center gap-1 hover:text-white">
                    <ArrowLeft className="w-3.5 h-3.5" /> Hostels
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  {/* Back to this hostel's rooms */}
                  <button
                    onClick={() => router.push(`/rooms?hostelId=${hostelIdFilter}&hostelName=${encodeURIComponent(hostelNameFilter)}`)}
                    className="hover:text-white"
                  >
                    {hostelNameFilter}
                  </button>
                </>
              )}
              {/* Room number at end of breadcrumb */}
              {roomNumberFilter && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-white font-medium">Room {roomNumberFilter}</span>
                </>
              )}
            </div>
          )}

          {/* Dynamic page title */}
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            {roomNumberFilter ? `Room ${roomNumberFilter} — Students` : "All Students"}
          </h1>
          <p className="text-sm text-indigo-300 mt-1">
            {students.length} registered resident{students.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* "Register Student" button — only shown if a room with free beds exists */}
        {hasAvailableRoom && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" /> Register Student
          </button>
        )}
      </div>

      {/* ── Loading + Error States ────────────────────────── */}
      {loading && <p className="text-indigo-300">Loading students...</p>}
      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {/* Warning shown when all rooms are full or under maintenance */}
      {!loading && !error && rooms.length > 0 && !hasAvailableRoom && (
        <div className="flex items-center gap-3 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">All rooms are currently full or under maintenance.</p>
        </div>
      )}

      {/* Empty state: no students found */}
      {!loading && !error && students.length === 0 && (
        <div className="text-center py-16 border border-dashed border-indigo-700 rounded-lg">
          <GraduationCap className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-300">
            {roomNumberFilter ? "No students in this room." : "No students registered yet."}
          </p>
        </div>
      )}

      {/* ── Student Cards Grid ────────────────────────────── */}
      {!loading && !error && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="rounded-lg p-5 border border-indigo-700/50 group"
              style={{ backgroundColor: "#1e1b4b" }}
            >
              {/* ── Student Card Header: Avatar + Name + Actions ── */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar: generated from initials (first letter of each name word) */}
                  <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{student.name}</h3>
                    <p className="text-xs text-indigo-400 font-mono">{student.rollNumber}</p>
                  </div>
                </div>

                {/* Edit + Checkout buttons (visible on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => { setSelectedStudent(student); setIsEditOpen(true); }}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCheckout(student.id, student.name)}
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Student Details: email, phone, check-in date ── */}
              <div className="space-y-2 text-sm text-indigo-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {/* Format the ISO date string as a human-readable date */}
                  <span>
                    {new Date(student.checkInDate).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* ── Room Info footer ──────────────────────────── */}
              {student.room && (
                <div className="mt-3 pt-3 border-t border-indigo-700/50 flex items-center gap-2 text-sm text-indigo-400">
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>Room {student.room.roomNumber}</span>
                  {(student.room.hostelName || student.room.hostel?.name) && (
                    <span>· {student.room.hostelName || student.room.hostel?.name}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {/* Register Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
        <StudentForm rooms={rooms} onSubmit={handleRegister} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedStudent(null); }}
        title="Edit Student Info"
      >
        {selectedStudent && (
          <StudentForm
            initialData={selectedStudent} // Pre-fill form with current student values
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelectedStudent(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

// ── Suspense Wrapper ──────────────────────────────────────────
// Required by Next.js when using useSearchParams() inside a component.
export default function StudentsPage() {
  return (
    <Suspense fallback={<p className="text-indigo-300 p-6">Loading students...</p>}>
      <StudentsPageInner />
    </Suspense>
  );
}
