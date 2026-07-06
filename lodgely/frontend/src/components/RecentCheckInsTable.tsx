import type { RecentCheckIn } from "@/lib/types";
import { Clock, MapPin } from "lucide-react";

interface RecentCheckInsTableProps {
  checkIns: RecentCheckIn[];
}

export function RecentCheckInsTable({ checkIns }: RecentCheckInsTableProps) {
  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-48">
        <p className="text-surface-500 text-sm">No recent check-ins</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Check-ins</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Latest student arrivals
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-[11px] font-semibold">
            <Clock className="w-3 h-3" />
            Live
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-800/30">
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                Roll No.
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                Hostel
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                Check-in Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/20">
            {checkIns.map((student, idx) => (
              <tr
                key={student.id}
                className="hover:bg-surface-800/20 transition-colors duration-150 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-surface-500">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-sm text-surface-300 font-mono">
                    {student.rollNumber}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-surface-300 font-semibold">
                      {student.room.roomNumber}
                    </span>
                    <span className="text-[10px] text-surface-500">
                      F{student.room.floor}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-surface-400">
                    <MapPin className="w-3 h-3 text-surface-500" />
                    {student.room.hostelName}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-sm text-surface-400">
                    {new Date(student.checkInDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
