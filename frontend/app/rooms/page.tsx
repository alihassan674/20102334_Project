"use client";
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Rooms() {
    const searchParams = useSearchParams();
    const hostelId = searchParams.get("hostelId");
    const [rooms, setRooms] = useState([]);
    const router = useRouter();
    const [roomNumber, setRoomNumber] = useState("");
    const [floorNumber, setFloorNumber] = useState("");
    const [capacity, setCapacity] = useState("");


    // this function is used to fetch all rooms of specific hostel 
    async function fetchRooms() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/hostels/${hostelId}/rooms`);
        if (!response.ok) return;
        const data = await response.json();
        setRooms(data.rooms);
        console.log("All rooms: ", data.rooms);
    }

    // this function is used to delete room 
    async function handleDeleteRoom(roomId: number) {
        console.log("delete handler");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/rooms/${roomId}`, { method: "DELETE" });
        if (!response.ok) return;
        console.log("fetching after deleting");
        fetchRooms();
    }

    // this function is used when add room form send data to create room in that hostel  
    const handleAddRoom = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/hostels/${hostelId}/rooms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomNumber,
                floorNumber: Number(floorNumber),
                capacity: Number(capacity),
            }),
        });

    };

    // This effect w'll fetch all room inside that hostel WITH THAT HOSTEL ID
    useEffect(() => {
        if (hostelId) {
            fetchRooms();
        }
    }, [hostelId]);

    return (
        <div className="mt-8 w-1/2 mx-auto">
            <form className="flex flex-col gap-2 w-1/2 mx-auto" onSubmit={handleAddRoom}>
                <input
                    type="text"
                    placeholder="Enter Room Number"
                    className="border rounded-md p-2 text-black"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Enter Floor Number"
                    className="border rounded-md p-2 text-black"
                    required
                    min={1}
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Enter Room Capacity"
                    className="border rounded-md p-2 text-black"
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                />

                <button
                    className="bg-green-700 text-white font-medium border rounded-md p-2"
                    type="submit"
                >
                    Add Room
                </button>
            </form>

            <h2 className="text-xl font-bold mb-4 text-black">All Rooms</h2>

            {/* this map will show all rooms inside that hostel  */}
            {rooms && rooms.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {rooms.map((room: any) => (
                        <div
                            key={room.id}
                            className="border rounded-md p-4 bg-white shadow-sm flex flex-col gap-2 text-black"
                            onClick={() => router.push(`/students?roomId=${room.id}&hostelId=${hostelId}`)}
                        >
                            <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                            <p className="text-sm text-gray-600">Floor: {room.floorNumber}</p>
                            <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                            <p className="text-sm text-gray-600">Students: {room.students.length} / {room.capacity}</p>
                            <div className="flex justify-end">
                                <button className="bg-red-700 text-white font-medium border rounded-md p-2" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id) }}>
                                    Delete Room
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No rooms found.</p>
            )}
        </div>
    )
}