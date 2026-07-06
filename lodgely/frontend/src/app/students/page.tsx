"use client";

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

function StudentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFilter = searchParams.get("roomId") || "";
  const roomNumberFilter = searchParams.get("roomNumber") || "";
  const hostelNameFilter = searchParams.get("hostelName") || "";
  const hostelIdFilter = searchParams.get("hostelId") || "";

  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentsData, roomsData] = await Promise.all([
        fetchStudents(roomIdFilter ? { roomId: roomIdFilter } : undefined),
        fetchRooms(),
      ]);
      setStudents(studentsData);
      setRooms(roomsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [roomIdFilter]);

  const handleRegister = async (data: {
    name: string; email: string; rollNumber?: string; phone: string; roomId?: string;
  }) => {
    if (!data.rollNumber || !data.roomId) return;
    await createStudent({
      name: data.name, email: data.email,
      rollNumber: data.rollNumber, phone: data.phone, roomId: data.roomId,
    });
    setIsAddOpen(false);
    loadData();
  };

  const handleUpdate = async (data: { name: string; email: string; phone: string }) => {
    if (!selectedStudent) return;
    await updateStudent(selectedStudent.id, data);
    setIsEditOpen(false);
    setSelectedStudent(null);
    loadData();
  };

  const handleCheckout = async (id: string, name: string) => {
    if (!window.confirm(`Check out "${name}"? This will free their bed.`)) return;
    try {
      await deleteStudent(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to checkout student.");
    }
  };

  const hasAvailableRoom = rooms.some(
    (r) => r.status === "AVAILABLE" && (r.currentOccupants ?? r._count?.students ?? r.occupants ?? 0) < r.capacity
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {(roomNumberFilter || hostelNameFilter) && (
            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-1 flex-wrap">
              {hostelNameFilter && (
                <>
                  <button onClick={() => router.push("/")} className="flex items-center gap-1 hover:text-white">
                    <ArrowLeft className="w-3.5 h-3.5" /> Hostels
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <button
                    onClick={() => router.push(`/rooms?hostelId=${hostelIdFilter}&hostelName=${encodeURIComponent(hostelNameFilter)}`)}
                    className="hover:text-white"
                  >
                    {hostelNameFilter}
                  </button>
                </>
              )}
              {roomNumberFilter && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-white font-medium">Room {roomNumberFilter}</span>
                </>
              )}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            {roomNumberFilter ? `Room ${roomNumberFilter} — Students` : "All Students"}
          </h1>
          <p className="text-sm text-indigo-300 mt-1">
            {students.length} registered resident{students.length !== 1 ? "s" : ""}
          </p>
        </div>
        {hasAvailableRoom && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" /> Register Student
          </button>
        )}
      </div>

      {loading && <p className="text-indigo-300">Loading students...</p>}
      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {!loading && !error && rooms.length > 0 && !hasAvailableRoom && (
        <div className="flex items-center gap-3 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">All rooms are currently full or under maintenance.</p>
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="text-center py-16 border border-dashed border-indigo-700 rounded-lg">
          <GraduationCap className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-300">
            {roomNumberFilter ? "No students in this room." : "No students registered yet."}
          </p>
        </div>
      )}

      {!loading && !error && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="rounded-lg p-5 border border-indigo-700/50 group"
              style={{ backgroundColor: "#1e1b4b" }}
            >
              {/* Name + actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{student.name}</h3>
                    <p className="text-xs text-indigo-400 font-mono">{student.rollNumber}</p>
                  </div>
                </div>
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
                  <span>
                    {new Date(student.checkInDate).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
        <StudentForm rooms={rooms} onSubmit={handleRegister} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedStudent(null); }}
        title="Edit Student Info"
      >
        {selectedStudent && (
          <StudentForm
            initialData={selectedStudent}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelectedStudent(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<p className="text-indigo-300 p-6">Loading students...</p>}>
      <StudentsPageInner />
    </Suspense>
  );
}
