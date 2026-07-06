// ─────────────────────────────────────────────────────────────
// Lodgely — Shared Type Definitions
// ─────────────────────────────────────────────────────────────

export type RoomType = "SINGLE" | "DOUBLE" | "TRIPLE";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

// ── Entity Types ─────────────────────────────────────────────
export interface Hostel {
  id: string;
  name: string;
  totalFloors: number;
  address: string;
  createdAt: string;
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupants: number;
  type: RoomType;
  pricePerMonth: number;
  status: RoomStatus;
  hostelId: string;
  createdAt: string;
  hostel?: { id: string; name: string };
  students?: Student[];
  _count?: { students: number };
  // Computed fields from API
  currentOccupants?: number;
  availableBeds?: number;
  occupancyPercentage?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  phone: string;
  checkInDate: string;
  roomId: string;
  createdAt: string;
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
    type: RoomType;
    hostel?: { id: string; name: string };
    hostelName?: string;
  };
}

// ── Dashboard Analytics ──────────────────────────────────────
export interface DashboardOverview {
  totalHostels: number;
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyRate: number;
  vacancyRate: number;
  activeResidents: number;
  availableRooms: number;
  monthlyRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface StatusDistribution {
  status: RoomStatus;
  count: number;
}

export interface TypeDistribution {
  type: RoomType;
  count: number;
}

export interface RecentCheckIn {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  checkInDate: string;
  room: {
    roomNumber: string;
    floor: number;
    type: RoomType;
    hostelName: string;
  };
}

export interface DashboardData {
  overview: DashboardOverview;
  monthlyRevenueBreakdown: MonthlyRevenue[];
  statusDistribution: StatusDistribution[];
  typeDistribution: TypeDistribution[];
  recentCheckIns: RecentCheckIn[];
}

// ── API Response Wrapper ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: { message: string };
}
