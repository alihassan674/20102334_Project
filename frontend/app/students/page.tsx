"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Students() {
    const searchParams = useSearchParams();
    const hostelId = searchParams.get("hostelId");
    const roomId = searchParams.get("roomId");
    const [students, setStudents] = useState([]);
    const router = useRouter();

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

    async function handleDeleteStudent(studentId) {
        console.log("delete handler");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/students/${studentId}`, { method: "DELETE" });
        if (!response.ok) return;
        console.log("fetching after deleting");
        fetchStudents();

    }


    return (
        <div className="mt-8 w-1/2 mx-auto">
            <h2 className="text-xl font-bold mb-4 text-black">
                All Students
            </h2>

            {students && students.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="border rounded-md p-4 bg-white shadow-sm flex flex-col gap-2 cursor-pointer hover:shadow-md transition"
                        >
                            <h3 className="text-lg font-semibold text-black">
                                {student.firstName} {student.lastName}
                            </h3>

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Registration No:</span>{" "}
                                {student.registrationNo}
                            </p>

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Department:</span>{" "}
                                {student.department}
                            </p>

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span>{" "}
                                {student.email}
                            </p>

                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Phone:</span>{" "}
                                {student.phone}
                            </p>

                            <div className="flex justify-end">
                                <button className="bg-red-700 text-white font-medium border rounded-md p-2" onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id) }}>
                                    Delete Student
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No students found.</p>
            )}
        </div>
    )
}