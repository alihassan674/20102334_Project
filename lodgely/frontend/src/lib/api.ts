// ─────────────────────────────────────────────────────────────
// Lodgely — API Client (lib/api.ts)
//
// This file is the ONLY place in the frontend that talks to
// the backend. All pages import functions from here.
//
// HOW IT WORKS:
//   1. Each exported function (e.g. fetchHostels) calls the
//      private `apiFetch` helper.
//   2. `apiFetch` sends an HTTP request to our Express backend
//      and parses the JSON response.
//   3. If the server returns an error (status >= 400), it throws
//      an Error so the calling page can show it to the user.
//   4. On success, it returns the `data` field from the response.
//
// The backend URL is set in frontend/.env as NEXT_PUBLIC_API_URL.
// On Google Cloud Machine, this will point to the backend VM IP.
// ─────────────────────────────────────────────────────────────

import type {
  ApiResponse,
  DashboardData,
  Hostel,
  Room,
  Student,
} from "./types";

// ── Base URL ──────────────────────────────────────────────────
// Reads the API URL from the environment variable.
// Default: http://localhost:5000 (local development).
// On GCM: set NEXT_PUBLIC_API_URL=http://<backend-vm-ip>:5000
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Generic Fetch Helper ──────────────────────────────────────
// A reusable function that wraps the browser's native `fetch`.
// Every API call goes through this to ensure consistent:
//   - Content-Type header (so backend knows we're sending JSON)
//   - Error handling (throw on non-2xx responses)
//   - Response parsing (always parse as JSON)
//
// The <T> is a TypeScript "generic" — it lets us tell the
// function what type of data it should return. e.g.
//   apiFetch<Hostel[]>("/api/hostels") returns Promise<ApiResponse<Hostel[]>>
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`; // Full URL: http://localhost:5000/api/hostels

  // Make the HTTP request
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json", // Tell the backend we're sending JSON
      ...options?.headers,               // Merge in any extra headers (e.g. auth)
    },
    ...options, // Merge in method, body, etc.
  });

  // Parse the response body as JSON
  const json = await res.json();

  // If the status code is not 2xx, the request failed
  // Throw an error with the backend's error message
  if (!res.ok) {
    throw new Error(json.error?.message || `API Error: ${res.status}`);
  }

  return json as ApiResponse<T>;
}

// ═════════════════════════════════════════════════════════════
// ── Analytics ────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════

// Fetches all dashboard statistics from the backend analytics endpoint.
// Used by the main dashboard page to populate stat cards and charts.
export async function fetchDashboardAnalytics(): Promise<DashboardData> {
  const res = await apiFetch<DashboardData>("/api/analytics/dashboard");
  return res.data; // Unwrap the `data` field from { success, data }
}

// ═════════════════════════════════════════════════════════════
// ── Hostels ──────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════

// Fetches all hostels (with room counts). Used on the Hostels page.
export async function fetchHostels(): Promise<Hostel[]> {
  const res = await apiFetch<Hostel[]>("/api/hostels");
  return res.data;
}

// Fetches a single hostel by ID (with its rooms). Not currently used on a page
// but available for future detail views.
export async function fetchHostel(id: string): Promise<Hostel> {
  const res = await apiFetch<Hostel>(`/api/hostels/${id}`);
  return res.data;
}

// Creates a new hostel. Sends a POST request with hostel data in the body.
export async function createHostel(data: {
  name:        string;
  totalFloors: number;
  address:     string;
}): Promise<Hostel> {
  const res = await apiFetch<Hostel>("/api/hostels", {
    method: "POST",
    body:   JSON.stringify(data), // Convert the JS object to a JSON string
  });
  return res.data;
}

// Updates an existing hostel's details. Sends only the changed fields.
export async function updateHostel(id: string, data: {
  name?:        string;
  totalFloors?: number;
  address?:     string;
}): Promise<Hostel> {
  const res = await apiFetch<Hostel>(`/api/hostels/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
  return res.data;
}

// Deletes a hostel by ID. Also deletes all its rooms and students (cascade).
export async function deleteHostel(id: string): Promise<void> {
  await apiFetch(`/api/hostels/${id}`, { method: "DELETE" });
}

// ═════════════════════════════════════════════════════════════
// ── Rooms ────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════

// Fetches rooms, optionally filtered by hostel, status, or type.
// Example: fetchRooms({ hostelId: "abc", status: "AVAILABLE" })
export async function fetchRooms(params?: {
  status?:   string;
  hostelId?: string;
  type?:     string;
}): Promise<Room[]> {
  // Build the URL query string from the params object
  const query = new URLSearchParams();
  if (params?.status)   query.set("status",   params.status);
  if (params?.hostelId) query.set("hostelId", params.hostelId);
  if (params?.type)     query.set("type",     params.type);

  const qs  = query.toString(); // e.g. "hostelId=abc&status=AVAILABLE"
  const res = await apiFetch<Room[]>(`/api/rooms${qs ? `?${qs}` : ""}`);
  return res.data;
}

// Fetches a single room by ID (with its students list).
export async function fetchRoom(id: string): Promise<Room> {
  const res = await apiFetch<Room>(`/api/rooms/${id}`);
  return res.data;
}

// Creates a new room inside a hostel.
export async function createRoom(data: {
  roomNumber:    string;
  floor:         number;
  capacity:      number;
  type:          string;
  pricePerMonth: number;
  hostelId:      string;
}): Promise<Room> {
  const res = await apiFetch<Room>("/api/rooms", {
    method: "POST",
    body:   JSON.stringify(data),
  });
  return res.data;
}

// Updates an existing room's details or status.
export async function updateRoom(id: string, data: {
  roomNumber?:    string;
  floor?:         number;
  capacity?:      number;
  type?:          string;
  pricePerMonth?: number;
  status?:        string;
}): Promise<Room> {
  const res = await apiFetch<Room>(`/api/rooms/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
  return res.data;
}

// Deletes a room (backend will reject if students are still inside).
export async function deleteRoom(id: string): Promise<void> {
  await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
}

// ═════════════════════════════════════════════════════════════
// ── Students ─────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════

// Fetches students, optionally filtered by hostel, room, or search text.
export async function fetchStudents(params?: {
  hostelId?: string;
  roomId?:   string;
  search?:   string;
}): Promise<Student[]> {
  const query = new URLSearchParams();
  if (params?.hostelId) query.set("hostelId", params.hostelId);
  if (params?.roomId)   query.set("roomId",   params.roomId);
  if (params?.search)   query.set("search",   params.search);

  const qs  = query.toString();
  const res = await apiFetch<Student[]>(`/api/students${qs ? `?${qs}` : ""}`);
  return res.data;
}

// Registers a new student and assigns them to a room.
export async function createStudent(data: {
  name:       string;
  email:      string;
  rollNumber: string;
  phone:      string;
  roomId:     string;
}): Promise<Student> {
  const res = await apiFetch<Student>("/api/students", {
    method: "POST",
    body:   JSON.stringify(data),
  });
  return res.data;
}

// Updates a student's personal info.
export async function updateStudent(id: string, data: {
  name?:  string;
  email?: string;
  phone?: string;
}): Promise<Student> {
  const res = await apiFetch<Student>(`/api/students/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
  return res.data;
}

// Checks out a student — removes them from the DB and frees their bed.
export async function deleteStudent(id: string): Promise<void> {
  await apiFetch(`/api/students/${id}`, { method: "DELETE" });
}
