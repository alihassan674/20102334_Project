import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Lodgely — Hostel Management System",
  description: "A platform for managing student hostels, room allocations, and occupancy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <div className="p-6 max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
