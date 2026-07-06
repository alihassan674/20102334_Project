// ─────────────────────────────────────────────────────────────
// Lodgely — API Client
// Centralized fetch utilities for backend communication
// ─────────────────────────────────────────────────────────────

import type {
  ApiResponse,
  DashboardData,
  Hostel,
  Room,
  Student,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Generic fetch wrapper with error handling */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || `API Error: ${res.status}`);
  }

  return json as ApiResponse<T>;
}

// ── Analytics ────────────────────────────────────────────────
export async function fetchDashboardAnalytics(): Promise<DashboardData> {
  const res = await apiFetch<DashboardData>("/api/analytics/dashboard");
  return res.data;
}

// ── Hostels ──────────────────────────────────────────────────
export async function fetchHostels(): Promise<Hostel[]> {
  const res = await apiFetch<Hostel[]>("/api/hostels");
  return res.data;
}

export async function fetchHostel(id: string): Promise<Hostel> {
  const res = await apiFetch<Hostel>(`/api/hostels/${id}`);
  return res.data;
}

export async function createHostel(data: {
  name: string;
  totalFloors: number;
  address: string;
}): Promise<Hostel> {
  const res = await apiFetch<Hostel>("/api/hostels", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ── Rooms ────────────────────────────────────────────────────
export async function fetchRooms(params?: {
  status?: string;
  hostelId?: string;
  type?: string;
}): Promise<Room[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.hostelId) query.set("hostelId", params.hostelId);
  if (params?.type) query.set("type", params.type);

  const qs = query.toString();
  const res = await apiFetch<Room[]>(`/api/rooms${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function fetchRoom(id: string): Promise<Room> {
  const res = await apiFetch<Room>(`/api/rooms/${id}`);
  return res.data;
}

export async function createRoom(data: {
  roomNumber: string;
  floor: number;
  capacity: number;
  type: string;
  pricePerMonth: number;
  hostelId: string;
}): Promise<Room> {
  const res = await apiFetch<Room>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ── Students ─────────────────────────────────────────────────
export async function fetchStudents(params?: {
  hostelId?: string;
  roomId?: string;
  search?: string;
}): Promise<Student[]> {
  const query = new URLSearchParams();
  if (params?.hostelId) query.set("hostelId", params.hostelId);
  if (params?.roomId) query.set("roomId", params.roomId);
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  const res = await apiFetch<Student[]>(`/api/students${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function createStudent(data: {
  name: string;
  email: string;
  rollNumber: string;
  phone: string;
  roomId: string;
}): Promise<Student> {
  const res = await apiFetch<Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiFetch(`/api/students/${id}`, { method: "DELETE" });
}

export async function updateHostel(id: string, data: {
  name?: string;
  totalFloors?: number;
  address?: string;
}): Promise<Hostel> {
  const res = await apiFetch<Hostel>(`/api/hostels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteHostel(id: string): Promise<void> {
  await apiFetch(`/api/hostels/${id}`, { method: "DELETE" });
}

export async function updateRoom(id: string, data: {
  roomNumber?: string;
  floor?: number;
  capacity?: number;
  type?: string;
  pricePerMonth?: number;
  status?: string;
}): Promise<Room> {
  const res = await apiFetch<Room>(`/api/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteRoom(id: string): Promise<void> {
  await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
}

export async function updateStudent(id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<Student> {
  const res = await apiFetch<Student>(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

