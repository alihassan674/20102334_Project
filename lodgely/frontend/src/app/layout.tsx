// ─────────────────────────────────────────────────────────────
// Lodgely — Root Layout (app/layout.tsx)
//
// In Next.js, layout.tsx is the WRAPPER that wraps every page.
// Whatever you put here appears on ALL pages.
//
// This layout does two things:
//   1. Adds the <Sidebar> navigation on the left side of every page
//   2. Wraps page content in a main area with proper padding
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import "./globals.css";            // Global CSS styles
import { Sidebar } from "@/components/Sidebar"; // Our left navigation bar

// Metadata is used for SEO — this sets the browser tab title and
// the description shown in Google search results.
export const metadata: Metadata = {
  title:       "Lodgely — Hostel Management System",
  description: "A platform for managing student hostels, room allocations, and occupancy.",
};

// RootLayout wraps every page in the application.
// `children` is the content of whichever page the user is currently on.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Flex container: Sidebar on the left, main content on the right */}
        <div className="flex min-h-screen">

          {/* Fixed left sidebar — always visible on every page */}
          <Sidebar />

          {/* Main content area — offset by sidebar width (ml-64 = 256px) */}
          <main className="flex-1 ml-64 min-h-screen">
            {/* Centered, padded container for page content */}
            <div className="p-6 max-w-6xl mx-auto">
              {children} {/* This renders the current page component */}
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}
