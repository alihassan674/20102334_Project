// ─────────────────────────────────────────────────────────────
// Lodgely — Shared TypeScript Types (lib/types.ts)
//
// TypeScript is a typed superset of JavaScript.
// "Types" let us define the exact shape of our data objects.
// This means if we try to access a property that doesn't exist,
// TypeScript will warn us BEFORE we even run the code.
//
// These types mirror what the backend API returns as JSON.
// ─────────────────────────────────────────────────────────────

// ── Enum-like string unions ───────────────────────────────────
// These restrict a variable to ONLY one of these string values.
// e.g. a Room's type can ONLY be "SINGLE", "DOUBLE", or "TRIPLE"
export type RoomType   = "SINGLE" | "DOUBLE" | "TRIPLE";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

// ── Entity Types ──────────────────────────────────────────────
// These match the database models defined in prisma/schema.prisma

// Represents one hostel building
export interface Hostel {
  id:          string;  // UUID primary key
  name:        string;  // e.g. "Block A"
  totalFloors: number;  // e.g. 5
  address:     string;  // Physical address
  createdAt:   string;  // ISO date string from the API
  _count?: { rooms: number }; // Optional: how many rooms this hostel has
}

// Represents one room inside a hostel
export interface Room {
  id:            string;
  roomNumber:    string;     // e.g. "101", "A-204"
  floor:         number;
  capacity:      number;     // Max number of students allowed
  occupants:     number;     // Current count (stored in DB)
  type:          RoomType;   // SINGLE / DOUBLE / TRIPLE
  pricePerMonth: number;     // Monthly rent in rupees/currency
  status:        RoomStatus; // AVAILABLE / OCCUPIED / MAINTENANCE
  hostelId:      string;     // Foreign key linking to a Hostel
  createdAt:     string;
  hostel?:       { id: string; name: string };  // Included when fetched with relation
  students?:     Student[];                     // Included when fetched with relation
  _count?:       { students: number };          // Included when using Prisma _count
  // These are COMPUTED on the backend — not stored in DB
  currentOccupants?:    number; // Live student count
  availableBeds?:       number; // capacity - currentOccupants
  occupancyPercentage?: number; // e.g. 75 = 75% full
}

// Represents one student (resident)
export interface Student {
  id:          string;
  name:        string;
  email:       string;     // Unique — no two students share an email
  rollNumber:  string;     // University roll number, also unique
  phone:       string;
  checkInDate: string;     // ISO date of when they moved in
  roomId:      string;     // Foreign key linking to a Room
  createdAt:   string;
  room?: {                 // Included when fetched with relation
    id:         string;
    roomNumber: string;
    floor:      number;
    type:       RoomType;
    hostel?:    { id: string; name: string };
    hostelName?: string;   // Sometimes returned as a flat field
  };
}

// ── Dashboard / Analytics Types ───────────────────────────────
// These types describe the response from GET /api/analytics/dashboard

// Summary statistics for the top stat cards
export interface DashboardOverview {
  totalHostels:    number;
  totalRooms:      number;
  totalCapacity:   number;
  occupiedBeds:    number;
  vacantBeds:      number;
  occupancyRate:   number; // Percentage (0-100)
  vacancyRate:     number; // Percentage (0-100)
  activeResidents: number;
  availableRooms:  number;
  monthlyRevenue:  number; // Total monthly revenue in rupees
}

// One data point for the revenue bar chart
export interface MonthlyRevenue {
  month:   string; // e.g. "Jan 2026"
  revenue: number;
}

// One data point for the status distribution chart
export interface StatusDistribution {
  status: RoomStatus;
  count:  number;
}

// One data point for the type distribution chart
export interface TypeDistribution {
  type:  RoomType;
  count: number;
}

// One row in the "Recent Check-ins" table
export interface RecentCheckIn {
  id:          string;
  name:        string;
  rollNumber:  string;
  email:       string;
  checkInDate: string;
  room: {
    roomNumber: string;
    floor:      number;
    type:       RoomType;
    hostelName: string;
  };
}

// The full response object from the analytics endpoint
export interface DashboardData {
  overview:                DashboardOverview;
  monthlyRevenueBreakdown: MonthlyRevenue[];
  statusDistribution:      StatusDistribution[];
  typeDistribution:        TypeDistribution[];
  recentCheckIns:          RecentCheckIn[];
}

// ── API Response Wrapper ──────────────────────────────────────
// Every response from our backend is wrapped in this structure:
// { success: true, data: [...], count: 10 }
// or
// { success: false, error: { message: "..." } }
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  count?:  number;
  error?:  { message: string };
}
