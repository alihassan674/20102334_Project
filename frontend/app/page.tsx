
import Hostels from "./components/Hostels";

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div className="text-center bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold">Lodgely</h1>
        <p>Hostel Management System</p>
      </div>

      <Hostels />
    </div>
  );
}
