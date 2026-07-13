"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function StudentsContent() {
    // values comming from url 
    const searchParams = useSearchParams();
    const hostelId = searchParams.get("hostelId");
    const roomId = searchParams.get("roomId");
    const router = useRouter();
    // state for create student form 
    const [students, setStudents] = useState([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [registrationNo, setRegistrationNo] = useState("");
    const [department, setDepartment] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    // state to manage student edit form
    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editRegistrationNo, setEditRegistrationNo] = useState("");
    const [editDepartment, setEditDepartment] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");

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

    // This function will delete student from databas 
    async function handleDeleteStudent(studentId: number) {
        console.log("delete handler");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/students/${studentId}`, { method: "DELETE" });
        if (!response.ok) return;
        console.log("fetching after deleting");
        fetchStudents();

    }

    // This handle function is used to create studnet 
    const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(
            `${backendUrl}/api/hostels/${hostelId}/rooms/${roomId}/students`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    registrationNo,
                    department,
                    phone,
                    email,
                }),
            }
        );
        if (!response.ok) return;
        fetchStudents();
    };

    // this function opens editing form for a student and sets its current values
    const handleEditStudent = (student: any) => {
        setEditingStudentId(student.id);
        setEditFirstName(student.firstName);
        setEditLastName(student.lastName);
        setEditRegistrationNo(student.registrationNo);
        setEditDepartment(student.department);
        setEditPhone(student.phone || "");
        setEditEmail(student.email || "");
    };

    // this function submits edited data to backend
    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/students/${editingStudentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: editFirstName,
                lastName: editLastName,
                registrationNo: editRegistrationNo,
                department: editDepartment,
                phone: editPhone || null,
                email: editEmail || null,
            }),
        });
        if (response.ok) {
            await fetchStudents();
            setEditingStudentId(null);
        }
    };


    return (
        <div className="mt-8 w-1/2 mx-auto">

            <form className="flex flex-col gap-2 w-1/2 mx-auto" onSubmit={handleAddStudent}>
                <input
                    type="text"
                    placeholder="Enter First Name"
                    className="border rounded-md p-2 text-black"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Enter Last Name"
                    className="border rounded-md p-2 text-black"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Enter Registration Number"
                    className="border rounded-md p-2 text-black"
                    required
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Enter Department"
                    className="border rounded-md p-2 text-black"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                />

                <input
                    type="tel"
                    placeholder="Enter Phone Number (Optional)"
                    className="border rounded-md p-2 text-black"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Enter Email (Optional)"
                    className="border rounded-md p-2 text-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    className="bg-green-700 text-white font-medium border rounded-md p-2"
                    type="submit"
                >
                    Add Student
                </button>
            </form>


            <h2 className="text-xl font-bold mb-4 text-black">
                All Students
            </h2>

            {students && students.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {students.map((student: any) => (
                        <div
                            key={student.id}
                            className="border rounded-md p-4 bg-white shadow-sm text-black"
                        >
                            {editingStudentId === student.id ? (
                                <form className="flex flex-col gap-2" onSubmit={handleUpdateStudent}>
                                    <input
                                        type="text"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="First Name"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Last Name"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={editRegistrationNo}
                                        onChange={(e) => setEditRegistrationNo(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Registration Number"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={editDepartment}
                                        onChange={(e) => setEditDepartment(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Department"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Phone (Optional)"
                                    />
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="border p-2 rounded text-black"
                                        placeholder="Email (Optional)"
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
                                            onClick={(e) => { e.stopPropagation(); setEditingStudentId(null); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
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
                                        {student.email || "N/A"}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Phone:</span>{" "}
                                        {student.phone || "N/A"}
                                    </p>

                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            className="bg-blue-600 text-white rounded-md px-4 py-2"
                                            onClick={(e) => { e.stopPropagation(); handleEditStudent(student); }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-700 text-white rounded-md px-4 py-2"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
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
                <p className="text-gray-500">No students found.</p>
            )}
        </div>
    )
}

export default function Students() {
    return (
        <Suspense fallback={<p className="text-gray-500 text-center mt-8">Loading...</p>}>
            <StudentsContent />
        </Suspense>
    );
}