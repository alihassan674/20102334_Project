"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Students() {
    const searchParams = useSearchParams();
    const hostelId = searchParams.get("hostelId");
    const roomId = searchParams.get("roomId");
    const [students, setStudents] = useState([]);

    // This function fetch all student data based on hostelId and roomId
    async function fetchStudents() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/hostels/${hostelId}/rooms/${roomId}/students`);
        if (!response.ok) return;
        const data = await response.json();
        setStudents(data.students);
        console.log("All students: ", data.students);
    }

    // This effect w'll fetch all room inside that hostel WITH THAT HOSTEL ID
    useEffect(() => {
        if (roomId) {
            fetchStudents();
        }
    }, [roomId]);


    return (
        <div>
            Students
        </div>
    )
}