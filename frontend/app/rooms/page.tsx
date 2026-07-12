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
        <div>
            Hello rooms
        </div>
    )
}