"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, DoorOpen, GraduationCap } from "lucide-react";

const navItems = [
  { label: "Hostels", href: "/", icon: Building2 },
  { label: "Rooms", href: "/rooms", icon: DoorOpen },
  { label: "Students", href: "/students", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-indigo-800" style={{ backgroundColor: "#1a1740" }}>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-indigo-800">
        <h1 className="text-lg font-bold text-white">Lodgely</h1>
        <p className="text-xs text-indigo-300 mt-0.5">Hostel Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
