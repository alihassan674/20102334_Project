"use client";
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Rooms() {
    const router = useRouter();
    // gettting url queryis to know which hostel rooms we have to fetch 
    const searchParams = useSearchParams();
    // getting targeted hostel id 
    const hostelId = searchParams.get("hostelId");
    // states to manage room create form 
    const [rooms, setRooms] = useState([]);
    const [roomNumber, setRoomNumber] = useState("");
    const [floorNumber, setFloorNumber] = useState("");
    const [capacity, setCapacity] = useState("");
    // states to managae edit form 
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [editRoomNumber, setEditRoomNumber] = useState("");
    const [editFloorNumber, setEditFloorNumber] = useState("");
    const [editCapacity, setEditCapacity] = useState("");



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
        if (!response.ok) return;
        // clear form fields after successful submit
        setRoomNumber("");
        setFloorNumber("");
        setCapacity("");
        // refresh rooms list
        fetchRooms();
    };

    // this function opens the edit form for a room and fills it with current values
    const handleEditRoom = (room: any) => {
        setEditingRoomId(room.id);
        setEditRoomNumber(room.roomNumber);
        setEditFloorNumber(room.floorNumber.toString());
        setEditCapacity(room.capacity.toString());
    };

    // this function sends the updated room data to the backend
    const handleUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/rooms/${editingRoomId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomNumber: editRoomNumber,
                floorNumber: Number(editFloorNumber),
                capacity: Number(editCapacity),
            }),
        });
        if (response.ok) {
            await fetchRooms();
            setEditingRoomId(null);
        }
    };


    // This effect w'll fetch all room inside that hostel WITH THAT HOSTEL ID
    useEffect(() => {
        if (hostelId) {
            fetchRooms();
        }
    }, [hostelId]);

    return (
        <div className="mt-8 w-1/2 mx-auto">
            {/* This form is used to create new room  */}
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
                            className="border rounded-md p-4 bg-white shadow-sm text-black"
                            onClick={() => {
                                if (editingRoomId === null) {
                                    router.push(`/students?roomId=${room.id}&hostelId=${hostelId}`);
                                }
                            }}
                        >
                            {editingRoomId === room.id ? (
                                <form className="flex flex-col gap-2" onSubmit={handleUpdateRoom}>
                                    <input
                                        type="text"
                                        value={editRoomNumber}
                                        onChange={(e) => setEditRoomNumber(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Room Number"
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={editFloorNumber}
                                        onChange={(e) => setEditFloorNumber(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Floor Number"
                                        min={1}
                                        required
                                    />
                                    <input
                                        type="number"
                                        value={editCapacity}
                                        onChange={(e) => setEditCapacity(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Capacity"
                                        min={1}
                                        required
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="submit"
                                            className="bg-green-700 text-white px-4 py-2 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-500 text-white px-4 py-2 rounded"
                                            onClick={(e) => { e.stopPropagation(); setEditingRoomId(null); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                                    <p className="text-sm text-gray-600">Floor: {room.floorNumber}</p>
                                    <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                                    <p className="text-sm text-gray-600">Students: {room.students.length} / {room.capacity}</p>
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            className="bg-blue-600 text-white rounded-md px-4 py-2"
                                            onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-700 text-white rounded-md px-4 py-2"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No rooms found.</p>
            )}
        </div>
    )
}