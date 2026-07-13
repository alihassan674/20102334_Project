"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Hostels() {
    const router = useRouter();

    // states to hold new hostel form data
    const [hostelName, setHostelName] = useState("");
    const [hostelFloors, setHostelFloors] = useState("");
    const [hostelAddress, setHostelAddress] = useState("");
    // state to hold all hostels from database
    const [allHostels, setAllHostels] = useState([]);
    // state to hold edit form hostel data
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editHostelName, setEditHostelName] = useState("");
    const [editHostelFloors, setEditHostelFloors] = useState("");
    const [editHostelAddress, setEditHostelAddress] = useState("");


    // function called when we wanna add hostel 
    async function handleAddHostel(e: React.FormEvent) {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        const response = await fetch(`${backendUrl}/addhostel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hostelName,
                hostelFloors,
                hostelAddress,
            }),
        });
        const data = await response.json();
        console.log(data);
        fetchHostels();
    }

    // when i click delete button on hostel, this function del the hostel 
    async function handleDeleteHostel(id: number) {
        console.log("delete handler")
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/deletehostel/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) return;
        console.log("fetching after deleting");
        fetchHostels();
    }

    // hostel data getting api function 
    async function fetchHostels() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/hostels`);
        if (!response.ok) return;
        const data = await response.json();
        setAllHostels(data.hostels);
    }

    // This effecct is called when application starts and save data comming from database to allHostels state and show below
    useEffect(() => {
        fetchHostels();
    }, []);

    // this is handler function which called when we click edit button
    const handleEditClick = (hostel: any) => {
        setEditingId(hostel.id);
        setEditHostelName(hostel.hostelName);
        setEditHostelFloors(hostel.hostelFloors);
        setEditHostelAddress(hostel.hostelAddress);
    };

    // this is form submit handler mean this function work when edit hostel form submits
    const handleUpdateHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(
            `${backendUrl}/updatehostel/${editingId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    hostelName: editHostelName,
                    hostelFloors: Number(editHostelFloors),
                    hostelAddress: editHostelAddress,
                }),
            }
        );

        if (response.ok) {
            await fetchHostels(); // reload hostels
            setEditingId(null);
        }
    };

    return (
        <div className="p-8">
            {/* Add Hostel section */}
            <form className="flex flex-col gap-2 w-1/2 mx-auto" onSubmit={handleAddHostel}>
                <input
                    type="text"
                    placeholder="Enter Hostel Name"
                    className="border rounded-md p-2 text-black"
                    required
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Enter Total Floors"
                    className="border rounded-md p-2 text-black"
                    required
                    min={1}
                    value={hostelFloors}
                    onChange={(e) => setHostelFloors(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter Address"
                    className="border rounded-md p-2 text-black"
                    required
                    value={hostelAddress}
                    onChange={(e) => setHostelAddress(e.target.value)}
                />
                <button className="bg-green-700 text-white font-medium border rounded-md p-2" type="submit">
                    Add Hostel
                </button>
            </form>

            {/* Hostel Card are shown here */}
            <div className="mt-8 w-1/2 mx-auto">
                <h2 className="text-xl font-bold mb-4 text-black">All Hostels</h2>
                {/* map to show all hostel below  */}
                {allHostels.map((hostel: any) => (
                    <div
                        key={hostel.id}
                        className="border rounded-md p-4 bg-white shadow-sm text-black"
                        onClick={() => {
                            if (editingId === null) {
                                router.push(`/rooms?hostelId=${hostel.id}`);
                            }
                        }}
                    >
                        {editingId === hostel.id ? (
                            <form
                                className="flex flex-col gap-2"
                                onSubmit={handleUpdateHostel}
                            >
                                <input
                                    type="text"
                                    value={editHostelName}
                                    onChange={(e) => setEditHostelName(e.target.value)}
                                    className="border p-2 rounded"
                                />

                                <input
                                    type="number"
                                    value={editHostelFloors}
                                    onChange={(e) => setEditHostelFloors(e.target.value)}
                                    className="border p-2 rounded"
                                />

                                <input
                                    type="text"
                                    value={editHostelAddress}
                                    onChange={(e) => setEditHostelAddress(e.target.value)}
                                    className="border p-2 rounded"
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold">
                                    {hostel.hostelName}
                                </h3>

                                <p className="text-sm text-gray-600">
                                    Floors: {hostel.hostelFloors}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Address: {hostel.hostelAddress}
                                </p>

                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        className="bg-blue-600 text-white rounded-md px-4 py-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(hostel);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="bg-red-700 text-white rounded-md px-4 py-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteHostel(hostel.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}