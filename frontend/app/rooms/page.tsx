"use client";
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Rooms() {
    const searchParams = useSearchParams();
    const hostelId = searchParams.get("hostelId");
    const [rooms, setRooms] = useState([]);


    async function fetchRooms() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/hostels/${hostelId}/rooms`);
        if (!response.ok) return;
        const data = await response.json();
        setRooms(data.rooms);
        console.log("All rooms: ", data.rooms);
    }

    // This effect w'll fetch all room inside that hostel WITH THAT HOSTEL ID
    useEffect(() => {
        if (hostelId) {
            fetchRooms();
        }
    }, [hostelId]);

    return (
        <div className="mt-8 w-1/2 mx-auto">
            <h2 className="text-xl font-bold mb-4 text-black">All Rooms</h2>

            {/* this map will show all rooms inside that hostel  */}
            {rooms && rooms.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {rooms.map((room: any) => (
                        <div
                            key={room.id}
                            className="border rounded-md p-4 bg-white shadow-sm flex flex-col gap-2 text-black"
                        >
                            <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                            <p className="text-sm text-gray-600">Floor: {room.floorNumber}</p>
                            <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                            <p className="text-sm text-gray-600">Students: {room.students.length} / {room.capacity}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No rooms found.</p>
            )}
        </div>
    )
}