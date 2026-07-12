import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Lodgely Hostel Mangement System",
  description: "Web based hostel mangement system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Header */}
        <div className="text-center bg-blue-900 text-white p-4">
          <h1 className="text-2xl font-bold">Lodgely</h1>
          <p>Hostel Management System</p>
        </div>
        {children}
      </body>
    </html>
  );
}
