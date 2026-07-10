"use client"; // This component uses browser-only features (usePathname hook)

// ─────────────────────────────────────────────────────────────
// Lodgely — Sidebar Navigation (components/Sidebar.tsx)
//
// The sidebar is a fixed left-side navigation panel that appears
// on every page (it's included in the root layout).
//
// It shows the app name/logo at the top and a list of navigation
// links. The currently active link is highlighted automatically.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";         // Next.js Link = client-side navigation (no full page reload)
import { usePathname } from "next/navigation"; // Hook that tells us the current URL path
import { Building2, DoorOpen, GraduationCap } from "lucide-react"; // Icon components

// ── Navigation Items ──────────────────────────────────────────
// This array defines all the links that appear in the sidebar.
// Each entry has a label (text), href (URL), and an icon component.
// To add a new page to the nav, just add an entry here.
const navItems = [
  { label: "Hostels",  href: "/",         icon: Building2      }, // Homepage = hostel list
  { label: "Rooms",    href: "/rooms",    icon: DoorOpen       }, // All rooms
  { label: "Students", href: "/students", icon: GraduationCap  }, // All students
];

export function Sidebar() {
  // usePathname() returns the current URL path, e.g. "/rooms" or "/students"
  // We use this to highlight which nav link is currently active.
  const pathname = usePathname();

  return (
    // The sidebar is fixed — it stays on screen even when you scroll the main content
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-indigo-800"
      style={{ backgroundColor: "#1a1740" }}
    >
      {/* ── Brand / Logo Area ────────────────────────────── */}
      <div className="px-6 py-5 border-b border-indigo-800">
        <h1 className="text-lg font-bold text-white">Lodgely</h1>
        <p className="text-xs text-indigo-300 mt-0.5">Hostel Management System</p>
      </div>

      {/* ── Navigation Links ─────────────────────────────── */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          // A link is "active" if:
          //   - It's the homepage ("/") and we're exactly at "/"
          //   - Or it's not the homepage and the path STARTS WITH the link's href
          // This correctly highlights "Rooms" when you're on /rooms?hostelId=abc
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"              // Active: bright indigo background
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white" // Inactive: dimmer, hover effect
              }`}
            >
              {/* Render the icon component dynamically */}
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
