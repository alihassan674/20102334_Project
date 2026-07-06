import type { Room } from "@/lib/types";
import { Users, Edit2, Trash2 } from "lucide-react";

interface RoomCardProps {
  room: Room;
  onEdit?: (e?: React.MouseEvent) => void;
  onDelete?: (e?: React.MouseEvent) => void;
}

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const currentOccupants = room.currentOccupants ?? room._count?.students ?? room.occupants ?? 0;
  const availableBeds = room.capacity - currentOccupants;

  let statusText = "Available";
  let statusClass = "bg-emerald-500/20 text-emerald-300";
  if (room.status === "MAINTENANCE") {
    statusText = "Maintenance";
    statusClass = "bg-yellow-500/20 text-yellow-300";
  } else if (currentOccupants >= room.capacity) {
    statusText = "Full";
    statusClass = "bg-red-500/20 text-red-300";
  } else if (currentOccupants > 0) {
    statusText = "Partial";
    statusClass = "bg-blue-500/20 text-blue-300";
  }

  const typeLabels: Record<string, string> = { SINGLE: "Single", DOUBLE: "Double", TRIPLE: "Triple" };

  return (
    <div
      className="rounded-lg p-4 border border-indigo-700/50 hover:border-indigo-500 group"
      style={{ backgroundColor: "#1e1b4b" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">{room.roomNumber}</h3>
          <p className="text-xs text-indigo-300">Floor {room.floor} · {typeLabels[room.type] || room.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>{statusText}</span>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-1">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                  className="p-1 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                  className="p-1 text-red-400 hover:text-white hover:bg-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Occupancy */}
      <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
        <Users className="w-3.5 h-3.5 text-indigo-400" />
        <span>{currentOccupants}/{room.capacity} occupied · {availableBeds} beds free</span>
      </div>

      {/* Price */}
      <p className="text-sm text-indigo-300">${room.pricePerMonth.toLocaleString()}/month</p>

      {/* Hostel name */}
      {room.hostel && (
        <p className="text-xs text-indigo-500 mt-2 border-t border-indigo-700/50 pt-2">{room.hostel.name}</p>
      )}
    </div>
  );
}
